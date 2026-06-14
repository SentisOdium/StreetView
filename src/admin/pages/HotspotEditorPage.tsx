import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FaMapMarkerAlt, FaLink, FaCompass, FaPlus } from "react-icons/fa";
import MainNode from "../../components/ui/Panorama_Assests/mainNode";
import HotspotMarker from "../../components/ui/Panorama_Assests/components/HotspotMarker";
import HotspotArrow from "../../components/ui/Panorama_Assests/components/HotspotArrow";
import { adminApi } from "../api/adminApi";
import {
  useHotspotEditorStore,
  saveHotspotEditorChanges,
  type EditorHotspot,
} from "../store/adminStore";
import { panoramaImageUrl } from "../../components/utils/imageUrl";
import PageHeader, {
  AdminButton,
  AdminSelect,
  AdminInput,
  LoadingSpinner,
  ErrorBanner,
  CustomSelect,
} from "../components/shared/AdminUI";
import type { AdminLocation } from "../api/types";
import { useLocationCache } from "../../context/LocationContext";

const PANORAMA_RADIUS = 60;

function PreviewHotspot({
  hotspot,
  selected,
  onSelect,
  index,
}: {
  hotspot: EditorHotspot;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const getDirectionPos = (label: string): [number, number, number] => {
    const d = label.trim().toUpperCase();
    const r = 25;
    const diag = r * Math.SQRT1_2;
    const positions: Record<string, [number, number, number]> = {
      N: [0, 0, -r],
      S: [0, 0, r],
      E: [r, 0, 0],
      W: [-r, 0, 0],
      NE: [diag, 0, -diag],
      NW: [-diag, 0, -diag],
      SE: [diag, 0, diag],
      SW: [-diag, 0, diag],
    };
    return positions[d] ?? [0, 0, -r];
  };

  const pos = getDirectionPos(hotspot.hotspot_label);
  const arrowScale = (25 + 15) / 25;
  const arrowPos: [number, number, number] = [
    pos[0] * arrowScale,
    pos[1],
    pos[2] * arrowScale,
  ];

  const labelNode = (
    <div className="text-center font-bold text-xs">
      {hotspot.hotspot_label}
      <div className="text-[9px] font-normal opacity-85 mt-0.5 border-t border-white/20 pt-0.5 whitespace-nowrap">
        → {hotspot.destination_name}
      </div>
    </div>
  );

  return (
    <group>
      <HotspotMarker
        position={pos}
        label={labelNode}
        onClick={onSelect}
        onSingleClick={onSelect}
        disabled={false}
        selected={selected}
        isEditor={true}
        index={index}
      />
      <HotspotArrow
        position={arrowPos}
        label={hotspot.hotspot_label}
        onClick={onSelect}
        disabled={false}
      />
    </group>
  );
}

function HotspotEditorCanvas({
  panoramaUrl,
  hotspots,
  selectedId,
  rotationOffset,
  rotationOffsetX,
  rotationOffsetZ,
  onSelect,
}: {
  panoramaUrl: string;
  hotspots: EditorHotspot[];
  selectedId: number | string | null;
  rotationOffset: number;
  rotationOffsetX: number;
  rotationOffsetZ: number;
  onSelect: (id: number | string) => void;
}) {
  const geometry = useMemo(
    () => new THREE.SphereGeometry(PANORAMA_RADIUS, 64, 32),
    []
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <div className="relative w-full h-full">
      {/* COMPASS UI OVERLAY (TOP RIGHT) */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-md shadow-lg z-10">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Compass Reference
        </div>

        <img
          src="/logo/compassForDumbass.png"
          alt="Compass Guide"
          className="w-32 object-contain opacity-70"
        />
      </div>

      <Canvas camera={{ position: [0.3, 0, 0], fov: 75, near: 0.1, far: 2000 }}>
        <ambientLight intensity={1} />
        <OrbitControls enableZoom enablePan maxDistance={55} />

        <Suspense fallback={null}>
          <MainNode
            radius={PANORAMA_RADIUS}
            geometry={geometry}
            textureUrl={panoramaUrl}
            position={[0, 0, 0]}
            opacity={1}
            rotationOffset={rotationOffset}
            rotationOffsetX={rotationOffsetX}
            rotationOffsetZ={rotationOffsetZ}
          />

          {hotspots.map((h, idx) => {
            const id = h.id ?? h.tempId!;
            return (
              <PreviewHotspot
                key={id}
                hotspot={h}
                selected={selectedId === id}
                onSelect={() => onSelect(id)}
                index={idx}
              />
            );
          })}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function HotspotEditorPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [originalHotspots, setOriginalHotspots] = useState<EditorHotspot[]>([]);
  const [newDestId, setNewDestId] = useState<number | "">("");
  const [newLabel, setNewLabel] = useState("E");
  const [rotationOffset, setRotationOffset] = useState<number>(81);
  const [rotationOffsetX, setRotationOffsetX] = useState<number>(0);
  const [rotationOffsetZ, setRotationOffsetZ] = useState<number>(0);
  const [showHotspots, setShowHotspots] = useState(true);

  const store = useHotspotEditorStore();
  const { clearCacheRef } = useLocationCache();

  useEffect(() => {
    adminApi.getLocations().then(setLocations).catch(() => { });
  }, []);

  const loadNode = useCallback(async (nodeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await adminApi.getLocation(nodeId);
      const url = panoramaImageUrl(detail.panorama_image);
      if (!url) throw new Error("No panorama image for this location");

      const hs: EditorHotspot[] = (detail.hotspots || []).map((h) => ({
        ...h,
        yaw: h.yaw ?? 90,
        pitch: h.pitch ?? 0,
      }));

      setRotationOffset(detail.rotation_offset ?? 81);
      setRotationOffsetX(detail.rotation_offset_x ?? 0);
      setRotationOffsetZ(detail.rotation_offset_z ?? 0);
      setOriginalHotspots(hs);
      store.init(nodeId, detail.node_name, url, hs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedNodeId) loadNode(selectedNodeId);
  }, [selectedNodeId, loadNode]);

  const selectedHotspot = store.hotspots.find(
    (h) => h.id === store.selectedId || h.tempId === store.selectedId
  );

  function handleAddHotspot() {
    if (!newDestId) return;
    const dest = locations.find((l) => l.id === newDestId);
    if (!dest) return;

    store.addHotspot({
      tempId: `temp-${Date.now()}`,
      destination_id: dest.id,
      destination_name: dest.node_name,
      hotspot_label: newLabel || "E",
      yaw: 0,
      pitch: 0,
      path_weight: 1,
    });
  }

  async function handleSave() {
    if (!store.nodeId) return;
    setSaving(true);
    try {
      await saveHotspotEditorChanges(store.nodeId, store.hotspots, originalHotspots, store.nodeName);
      await adminApi.updateLocation(store.nodeId, {
        rotation_offset: rotationOffset,
        rotation_offset_x: rotationOffsetX,
        rotation_offset_z: rotationOffsetZ
      });

      // Clear context-level cache refs after successful save
      clearCacheRef(store.nodeId);
      store.markClean();
      await loadNode(store.nodeId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-6">
        <PageHeader
          title="Hotspot Editor"
          subtitle="Configure dynamic rotation and add directional hotspots"
          actions={
            <>
              <AdminButton variant="secondary" onClick={store.undo} disabled={store.historyIndex <= 0}>
                Undo
              </AdminButton>
              <AdminButton
                variant="secondary"
                onClick={store.redo}
                disabled={store.historyIndex >= store.history.length - 1}
              >
                Redo
              </AdminButton>
              <AdminButton variant="secondary" onClick={() => store.reset(originalHotspots)}>
                Reset
              </AdminButton>
              <AdminButton
                variant="secondary"
                onClick={() => setShowHotspots(!showHotspots)}
              >
                {showHotspots ? "Hide Hotspots" : "Show Hotspots"}
              </AdminButton>
              <AdminButton onClick={handleSave} disabled={!store.dirty || saving}>
                {saving ? "Saving..." : "Save Changes"}
              </AdminButton>
            </>
          }
        />

        <div className="mt-5 p-6 bg-white border border-[#800000]/20 border-t-4 border-t-[#800000] rounded-2xl shadow-lg shadow-slate-100/50 w-full animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-end gap-5">

            {/* Active Location Dropdown */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-[#800000] uppercase tracking-wider mb-2">
                Active Location
              </label>
              <CustomSelect
                value={selectedNodeId}
                onChange={(val) => setSelectedNodeId(val || "")}
                options={locations.map((l) => ({ value: l.id, label: l.node_name }))}
                placeholder="Select location..."
                icon={<FaMapMarkerAlt className="w-4 h-4" />}
              />
            </div>

            {/* Visual Divider (Dynamic) */}
            <div className="hidden lg:block h-12 w-[1px] bg-gradient-to-b from-transparent via-[#800000]/25 to-transparent self-end mb-1.5" />
            <div className="lg:hidden h-[1px] w-full bg-slate-200/60 my-1" />

            {/* Hotspot Creator Controls */}
            <div className="flex-[2] flex flex-col md:flex-row items-end gap-4 w-full">

              {/* Destination Selector */}
              <div className="flex-[2] w-full min-w-[200px]">
                <label className="block text-xs font-bold text-[#800000] uppercase tracking-wider mb-2">
                  New Hotspot Destination
                </label>
                <CustomSelect
                  value={newDestId}
                  onChange={(val) => setNewDestId(val || "")}
                  options={locations
                    .filter((l) => l.id !== selectedNodeId)
                    .map((l) => ({ value: l.id, label: l.node_name }))}
                  placeholder="Select destination..."
                  icon={<FaLink className="w-4 h-4" />}
                  disabled={!selectedNodeId}
                />
              </div>

              {/* Direction Selector */}
              <div className="flex-1 w-full min-w-[180px]">
                <label className="block text-xs font-bold text-[#800000] uppercase tracking-wider mb-2">
                  Direction
                </label>
                <CustomSelect
                  value={newLabel}
                  onChange={(val) => setNewLabel(val)}
                  options={[
                    { value: "N", label: "North (N)" },
                    { value: "NE", label: "North-East (NE)" },
                    { value: "E", label: "East (E)" },
                    { value: "SE", label: "South-East (SE)" },
                    { value: "S", label: "South (S)" },
                    { value: "SW", label: "South-West (SW)" },
                    { value: "W", label: "West (W)" },
                    { value: "NW", label: "North-West (NW)" },
                  ]}
                  placeholder="Select direction..."
                  icon={<FaCompass className="w-4 h-4" />}
                  disabled={!selectedNodeId}
                />
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddHotspot}
                disabled={!newDestId}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#800000] hover:bg-[#680000] active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 shadow-md shadow-[#800000]/10 hover:shadow-lg hover:shadow-[#800000]/25 flex items-center justify-center gap-2 h-[42px] shrink-0"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Add Hotspot</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {error && <div className="px-6"><ErrorBanner message={error} /></div>}

      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : store.panoramaUrl ? (
            <HotspotEditorCanvas
              panoramaUrl={store.panoramaUrl}
              hotspots={showHotspots ? store.hotspots : []}
              selectedId={store.selectedId}
              rotationOffset={rotationOffset}
              rotationOffsetX={rotationOffsetX}
              rotationOffsetZ={rotationOffsetZ}
              onSelect={store.selectHotspot}
            />
          ) : (
            <div className="flex h-full items-center justify-center opacity-50">
              Select a location to begin editing hotspots
            </div>
          )}
        </div>

        <aside className="admin-card w-80 shrink-0 overflow-y-auto border-l p-4">
          <h3 className="mb-3 font-semibold">Hotspot Properties</h3>
          {selectedHotspot ? (
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="opacity-70">Direction (Label)</span>
                <AdminSelect
                  value={selectedHotspot.hotspot_label}
                  onChange={(e) =>
                    store.updateHotspot(store.selectedId!, { hotspot_label: e.target.value })
                  }
                >
                  <option value="N">North (N)</option>
                  <option value="NE">North-East (NE)</option>
                  <option value="E">East (E)</option>
                  <option value="SE">South-East (SE)</option>
                  <option value="S">South (S)</option>
                  <option value="SW">South-West (SW)</option>
                  <option value="W">West (W)</option>
                  <option value="NW">North-West (NW)</option>
                </AdminSelect>
              </label>
              <label className="block">
                <span className="opacity-70">Destination</span>
                <AdminSelect
                  value={selectedHotspot.destination_id}
                  onChange={(e) => {
                    const dest = locations.find((l) => l.id === Number(e.target.value));
                    store.updateHotspot(store.selectedId!, {
                      destination_id: Number(e.target.value),
                      destination_name: dest?.node_name || "",
                    });
                  }}
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.node_name}</option>
                  ))}
                </AdminSelect>
              </label>
              <label className="block">
                <span className="opacity-70">Distance from the main location</span>
                <AdminInput
                  type="number"
                  min="1"
                  step="1"
                  value={selectedHotspot.path_weight ?? 1}
                  onChange={(e) =>
                    store.updateHotspot(store.selectedId!, { path_weight: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </label>
              <AdminButton
                variant="danger"
                onClick={() => store.removeHotspot(store.selectedId!)}
              >
                Delete Hotspot
              </AdminButton>
            </div>
          ) : (
            <p className="text-sm opacity-50">
              Select a hotspot to edit properties, or configure the destination and label above to add a new one.
            </p>
          )}

          {selectedNodeId !== "" && (
            <div className="mt-6 border-t pt-4 space-y-4">
              <h3 className="font-semibold text-sm">Panorama Rotation</h3>
              <div className="space-y-3">
                <label className="block text-xs">
                  <span className="mb-1 block opacity-70 font-semibold">Pitch (X): {rotationOffsetX}°</span>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotationOffsetX}
                    onChange={(e) => {
                      setRotationOffsetX(Number(e.target.value));
                      useHotspotEditorStore.setState({ dirty: true });
                    }}
                    className="w-full accent-[#800000]"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block opacity-70 font-semibold">Yaw (Y): {rotationOffset}°</span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotationOffset}
                    onChange={(e) => {
                      setRotationOffset(Number(e.target.value));
                      useHotspotEditorStore.setState({ dirty: true });
                    }}
                    className="w-full accent-[#800000]"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block opacity-70 font-semibold">Roll (Z): {rotationOffsetZ}°</span>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotationOffsetZ}
                    onChange={(e) => {
                      setRotationOffsetZ(Number(e.target.value));
                      useHotspotEditorStore.setState({ dirty: true });
                    }}
                    className="w-full accent-[#800000]"
                  />
                </label>
              </div>
            </div>
          )}

          <h3 className="mb-2 mt-6 font-semibold">All Hotspots ({store.hotspots.length})</h3>
          <ul className="space-y-1 text-xs">
            {store.hotspots.map((h) => {
              const id = h.id ?? h.tempId!;
              return (
                <li
                  key={id}
                  className={`cursor-pointer rounded px-2 py-1 ${store.selectedId === id ? "bg-[#800000] text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  onClick={() => store.selectHotspot(id)}
                >
                  {h.hotspot_label} → {h.destination_name}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
