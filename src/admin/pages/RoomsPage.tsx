import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import type { AdminLocation, AdminRoom } from "../api/types";
import PageHeader, {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  LoadingSpinner,
  ErrorBanner,
} from "../components/shared/AdminUI";

const emptyRoom: Partial<AdminRoom> = {
  room_number: 1,
  room_type: "grounds",
  room_img: "",
  room_description: "",
};

export default function RoomsPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | "">("");
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [form, setForm] = useState<Partial<AdminRoom>>(emptyRoom);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getLocations().then(setLocations).catch(() => {});
  }, []);

  const loadRooms = useCallback(async (nodeId: number) => {
    setLoading(true);
    try {
      const data = await adminApi.getRooms(nodeId);
      setRooms(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedNodeId) loadRooms(selectedNodeId);
  }, [selectedNodeId, loadRooms]);

  async function handleSave() {
    if (!selectedNodeId) return;
    try {
      if (editingId) {
        await adminApi.updateRoom(editingId, form);
      } else {
        await adminApi.createRoom(selectedNodeId, form);
      }
      setForm(emptyRoom);
      setEditingId(null);
      loadRooms(selectedNodeId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this room?")) return;
    await adminApi.deleteRoom(id);
    if (selectedNodeId) loadRooms(selectedNodeId);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await adminApi.uploadFile(file);
    setForm((f) => ({ ...f, room_img: result.filename }));
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Room Information"
        subtitle="Manage room data attached to locations"
      />

      {error && <ErrorBanner message={error} />}

      <div className="mb-6">
        <label className="text-sm">
          <span className="mb-1 block opacity-70">Location</span>
          <AdminSelect
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(Number(e.target.value) || "")}
            className="max-w-md"
          >
            <option value="">Select location...</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.node_name}</option>
            ))}
          </AdminSelect>
        </label>
      </div>

      {selectedNodeId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="admin-card space-y-4 rounded-xl border p-6 shadow-sm">
            <h2 className="font-semibold">{editingId ? "Edit Room" : "Add Room"}</h2>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Room Number</span>
              <AdminInput
                type="number"
                value={form.room_number ?? ""}
                onChange={(e) => setForm({ ...form, room_number: Number(e.target.value) })}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Room Type</span>
              <AdminInput
                value={form.room_type || ""}
                onChange={(e) => setForm({ ...form, room_type: e.target.value })}
                placeholder="grounds, office, lab..."
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Room Image</span>
              <AdminInput
                value={form.room_img || ""}
                onChange={(e) => setForm({ ...form, room_img: e.target.value })}
              />
              <input type="file" accept="image/*" onChange={handleUpload} className="mt-2 text-xs" />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Description</span>
              <AdminTextarea
                value={form.room_description || ""}
                onChange={(e) => setForm({ ...form, room_description: e.target.value })}
                placeholder="Rich description of the room..."
              />
            </label>

            <div className="flex gap-2">
              <AdminButton onClick={handleSave}>
                {editingId ? "Update Room" : "Add Room"}
              </AdminButton>
              {editingId && (
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyRoom);
                  }}
                >
                  Cancel
                </AdminButton>
              )}
            </div>
          </div>

          <div className="admin-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Rooms at Location</h2>
            {loading ? (
              <LoadingSpinner />
            ) : rooms.length === 0 ? (
              <p className="text-sm opacity-50">No rooms for this location</p>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div key={room.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Room {room.room_number}</p>
                        <p className="text-xs opacity-60">{room.room_type}</p>
                      </div>
                      <div className="flex gap-1">
                        <AdminButton
                          variant="ghost"
                          onClick={() => {
                            setEditingId(room.id!);
                            setForm(room);
                          }}
                        >
                          Edit
                        </AdminButton>
                        <AdminButton variant="danger" onClick={() => handleDelete(room.id!)}>
                          Delete
                        </AdminButton>
                      </div>
                    </div>
                    <p className="mt-2 text-sm opacity-80">{room.room_description}</p>
                    {room.room_img && (
                      <p className="mt-1 font-mono text-xs opacity-50">{room.room_img}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
