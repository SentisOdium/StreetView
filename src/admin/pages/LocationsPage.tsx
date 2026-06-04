import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import type { AdminHotspot, AdminLocation } from "../api/types";
import { useAdminStore } from "../store/adminStore";
import { panoramaImageUrl } from "../../components/utils/imageUrl";
import PageHeader, {
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  LoadingSpinner,
  ErrorBanner,
} from "../components/shared/AdminUI";

const emptyForm: Partial<AdminLocation> = {
  node_name: "",
  coordinates: "",
  panorama_image: "",
  floor: "",
  description: "",
};

export default function LocationsPage() {
  const [searchParams] = useSearchParams();
  const { locations, loading, error, fetchLocations } = useAdminStore();
  const [floors, setFloors] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [selected, setSelected] = useState<AdminLocation | null>(null);
  const [form, setForm] = useState<Partial<AdminLocation>>(emptyForm);
  const [hotspots, setHotspots] = useState<AdminHotspot[]>([]);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchLocations({ floor: floorFilter || undefined, search: search || undefined });
    adminApi.getFloors().then(setFloors).catch(() => {});
  }, [fetchLocations, floorFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id && locations.length) {
      const loc = locations.find((l) => l.id === Number(id));
      if (loc) openEdit(loc);
    }
  }, [searchParams, locations]);

  async function openEdit(loc: AdminLocation) {
    setSelected(loc);
    setForm({ ...loc, description: loc.floor });
    setMode("edit");
    try {
      const detail = await adminApi.getLocation(loc.id);
      setHotspots(detail.hotspots || []);
    } catch {
      setHotspots([]);
    }
  }

  function openCreate() {
    setSelected(null);
    setForm(emptyForm);
    setHotspots([]);
    setMode("create");
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      if (mode === "create") {
        await adminApi.createLocation(form);
        setMsg("Location created successfully");
      } else if (selected) {
        await adminApi.updateLocation(selected.id, form);
        setMsg("Location updated successfully");
      }
      setMode("list");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected || !confirm(`Delete "${selected.node_name}"?`)) return;
    try {
      await adminApi.deleteLocation(selected.id);
      setMode("list");
      setSelected(null);
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await adminApi.uploadFile(file);
      setForm((f) => ({ ...f, panorama_image: result.filename }));
    } catch {
      setMsg("Upload failed");
    }
  }

  const previewUrl = panoramaImageUrl(form.panorama_image);

  return (
    <div className="p-8">
      <PageHeader
        title="Location Management"
        subtitle="Create, edit, and manage panorama locations"
        actions={
          mode === "list" ? (
            <AdminButton onClick={openCreate}>+ Create Location</AdminButton>
          ) : (
            <AdminButton variant="secondary" onClick={() => setMode("list")}>
              Back to List
            </AdminButton>
          )
        }
      />

      {error && <ErrorBanner message={error} />}
      {msg && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {msg}
        </div>
      )}

      {mode === "list" ? (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <AdminInput
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <AdminSelect
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="max-w-xs"
            >
              <option value="">All Floors</option>
              {floors.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </AdminSelect>
            <AdminButton variant="secondary" onClick={load}>Search</AdminButton>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="admin-card overflow-hidden rounded-xl border shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="admin-card border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Floor</th>
                    <th className="px-4 py-3 font-medium">Coordinates</th>
                    <th className="px-4 py-3 font-medium">Panorama</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.id} className="border-b border-inherit last:border-0">
                      <td className="px-4 py-3 font-medium">{loc.node_name}</td>
                      <td className="px-4 py-3 opacity-70">{loc.floor || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs opacity-70">{loc.coordinates || "—"}</td>
                      <td className="px-4 py-3 text-xs opacity-70 truncate max-w-32">{loc.panorama_image || "—"}</td>
                      <td className="px-4 py-3">
                        <AdminButton variant="ghost" onClick={() => openEdit(loc)}>Edit</AdminButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="admin-card space-y-4 rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold">
              {mode === "create" ? "Create Location" : "Edit Location"}
            </h2>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Location Name</span>
              <AdminInput
                value={form.node_name || ""}
                onChange={(e) => setForm({ ...form, node_name: e.target.value })}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Floor</span>
              <AdminInput
                value={form.floor || ""}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                placeholder="Ground Floor"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Coordinates</span>
              <AdminInput
                value={form.coordinates || ""}
                onChange={(e) => setForm({ ...form, coordinates: e.target.value })}
                placeholder="1,1"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Description</span>
              <AdminTextarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Panorama Image</span>
              <AdminInput
                value={form.panorama_image || ""}
                onChange={(e) => setForm({ ...form, panorama_image: e.target.value })}
                placeholder="GRNDS_ENTRANCE-EXIT.webp"
              />
              <input type="file" accept="image/*" onChange={handleUpload} className="mt-2 text-xs" />
            </label>

            <div className="flex gap-2 pt-2">
              <AdminButton onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Location"}
              </AdminButton>
              {mode === "edit" && (
                <AdminButton variant="danger" onClick={handleDelete}>Delete</AdminButton>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="admin-card rounded-xl border p-6 shadow-sm">
              <h3 className="mb-3 font-semibold">Panorama Preview</h3>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={form.node_name || "Preview"}
                  className="h-48 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg bg-slate-200 text-sm opacity-50 dark:bg-slate-800">
                  No panorama image
                </div>
              )}
            </div>

            {mode === "edit" && (
              <div className="admin-card rounded-xl border p-6 shadow-sm">
                <h3 className="mb-3 font-semibold">Connected Hotspots</h3>
                {hotspots.length === 0 ? (
                  <p className="text-sm opacity-50">No hotspots connected</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {hotspots.map((h) => (
                      <li key={h.id} className="flex justify-between rounded-lg border px-3 py-2">
                        <span className="font-medium">{h.hotspot_label}</span>
                        <span className="opacity-60">→ {h.destination_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
