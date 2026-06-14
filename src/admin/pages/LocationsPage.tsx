import { useCallback, useEffect, useState, useMemo } from "react";
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
import { uploadFileToS3 } from "../utils/uploadFileToS3";
import S3AssetBrowser from "../components/S3AssetBrowser";
import { generateThumbnail } from "../utils/thumbnailGenerator";
import { debounce } from "../../components/utils/debounce";

const emptyForm: Partial<AdminLocation> = {
  node_name: "",
  panorama_image: "",
  floor: "main",
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
  const [localError, setLocalError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isS3BrowserOpen, setIsS3BrowserOpen] = useState(false);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const updateDebouncedSearch = useMemo(
    () => debounce((val: string) => setDebouncedSearchQuery(val), 300),
    []
  );

  useEffect(() => {
    updateDebouncedSearch(search);
  }, [search, updateDebouncedSearch]);

  const load = useCallback(() => {
    fetchLocations({ floor: floorFilter || undefined, search: debouncedSearchQuery || undefined });
    adminApi.getFloors().then(setFloors).catch(() => { });
  }, [fetchLocations, floorFilter, debouncedSearchQuery]);

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
    setPendingFile(null);
    setLocalPreview(null);
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
    setPendingFile(null);
    setLocalPreview(null);
    setSelected(null);
    setForm(emptyForm);
    setHotspots([]);
    setMode("create");
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    setLocalError(null);
    try {
      let finalForm = { ...form };
      if (pendingFile) {
        const uniqueKey = await uploadFileToS3(pendingFile);
        finalForm.panorama_image = uniqueKey;

        // Generate and upload thumbnail
        try {
          const thumbnailFile = await generateThumbnail(pendingFile);
          const extIndex = uniqueKey.lastIndexOf(".");
          const thumbKey = extIndex !== -1 
            ? `${uniqueKey.substring(0, extIndex)}_thumb.webp` 
            : `${uniqueKey}_thumb.webp`;
          await uploadFileToS3(thumbnailFile, thumbKey);
        } catch (thumbErr) {
          console.warn("Failed to generate or upload thumbnail, proceeding without it", thumbErr);
        }
      }

      if (mode === "create") {
        await adminApi.createLocation(finalForm);
        setMsg("Location created successfully");
      } else if (selected) {
        await adminApi.updateLocation(selected.id, finalForm);
        setMsg("Location updated successfully");
      }
      setPendingFile(null);
      setLocalPreview(null);
      setMode("list");
      load();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected || !confirm(`Delete "${selected.node_name}"?`)) return;
    setMsg(null);
    setLocalError(null);
    try {
      await adminApi.deleteLocation(selected.id);
      setMode("list");
      setSelected(null);
      load();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    setLocalError(null);
    
    setPendingFile(file);
    const localUrl = URL.createObjectURL(file);
    setLocalPreview(localUrl);
    setForm((f) => ({ ...f, panorama_image: file.name }));
  }

  const previewUrl = localPreview || panoramaImageUrl(form.panorama_image);

  return (
    <div className="p-8">
      <PageHeader
        title="Location Management"
        subtitle="Create, edit, and manage panorama locations"
        actions={
          mode === "list" ? (
            <AdminButton onClick={openCreate}>+ Create Location</AdminButton>
          ) : (
            <AdminButton variant="secondary" onClick={() => {
              setPendingFile(null);
              setLocalPreview(null);
              setMode("list");
            }}>
              Back to List
            </AdminButton>
          )
        }
      />

      {error && <ErrorBanner message={error} />}
      {localError && <ErrorBanner message={localError} />}
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
              <option value="">All Types</option>
              {floors.map((f) => (
                <option key={f} value={f} className="capitalize">{f}</option>
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
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Panorama</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.id} className="border-b border-inherit last:border-0">
                      <td className="px-4 py-3 font-medium">{loc.node_name}</td>
                      <td className="px-4 py-3 opacity-70 capitalize">{loc.floor || "—"}</td>
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
              <span className="mb-1 block opacity-70">Location Type</span>
              <AdminSelect
                value={form.floor || "main"}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
              >
                <option value="main">Main</option>
                <option value="transitional">Transitional</option>
              </AdminSelect>
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
              <div className="flex gap-2">
                <AdminInput
                  value={form.panorama_image || ""}
                  onChange={(e) => setForm({ ...form, panorama_image: e.target.value })}
                  placeholder="GRNDS_ENTRANCE-EXIT.webp"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setIsS3BrowserOpen(true)}
                  className="rounded-lg bg-[#800000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#a30000] disabled:opacity-50 shrink-0"
                >
                  Browse S3 Assets
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[#800000]/30 bg-[#800000]/5 px-4 py-2 text-xs font-semibold text-[#800000] transition-colors hover:bg-[#800000]/10 active:scale-[0.98]"
                >
                  Choose Local Image File
                </label>
                {pendingFile ? (
                  <span className="text-xs font-medium text-slate-600 truncate max-w-xs">
                    Selected: {pendingFile.name}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    No local file chosen
                  </span>
                )}
              </div>
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

      {isS3BrowserOpen && (
        <S3AssetBrowser
          isOpen={isS3BrowserOpen}
          onClose={() => setIsS3BrowserOpen(false)}
          onSelect={(key) => {
            setPendingFile(null);
            setLocalPreview(null);
            setForm((f) => ({ ...f, panorama_image: key }));
          }}
        />
      )}
    </div>
  );
}
