import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import MainNode from "../../components/ui/Panorama_Assests/mainNode";
import { adminApi } from "../api/adminApi";
import {
  useHotspotEditorStore,
  saveHotspotEditorChanges,
  type EditorHotspot,
} from "../store/adminStore";
import { yawPitchToPosition, positionToYawPitch, snapAngle, displayXYZFromYawPitch } from "../utils/hotspotMath";
import { panoramaImageUrl } from "../../components/utils/imageUrl";
import PageHeader, {
  AdminButton,
  AdminInput,
  AdminSelect,
  LoadingSpinner,
  ErrorBanner,
} from "../components/shared/AdminUI";
import type { AdminLocation } from "../api/types";
import { useLocationCache } from "../../context/LocationContext";

const PANORAMA_RADIUS = 60;

function DraggableHotspot({
  hotspot,
  selected,
  onSelect,
  onDrag,
}: {
  hotspot: EditorHotspot;
  selected: boolean;
  onSelect: () => void;
  onDrag: (yaw: number, pitch: number) => void;
}) {
  const pos = yawPitchToPosition(hotspot.yaw, hotspot.pitch);
  const dragging = useRef(false);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    dragging.current = true;
    onSelect();
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return;
    e.stopPropagation();
    const p = e.point;
    const { yaw, pitch } = positionToYawPitch(p.x, p.y, p.z);
    onDrag(yaw, pitch);
  };

  return (
    <group position={pos}>
      <mesh
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshStandardMaterial
          color={selected ? "#ffd700" : "#800000"}
          emissive={selected ? "#ffd700" : "#800000"}
          emissiveIntensity={selected ? 0.5 : 0.2}
        />
      </mesh>
      <Html center distanceFactor={80}>
        <div
          className={`pointer-events-none rounded px-2 py-0.5 text-xs font-bold text-white shadow-lg ${selected ? "bg-yellow-600" : "bg-[#800000]"
            }`}
        >
          {hotspot.hotspot_label}
          <div className="text-[10px] font-normal opacity-80">
            → {hotspot.destination_name}
          </div>
        </div>
      </Html>
      {selected && (
        <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -4]}>
          <coneGeometry args={[0.8, 2, 8]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
      )}
    </group>
  );
}

function PanoramaClickHandler({ onClick }: { onClick: (yaw: number, pitch: number) => void }) {
  const { camera } = useThree();
  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        const dir = e.point.clone().sub(camera.position).normalize();
        const yaw = (Math.atan2(dir.x, -dir.z) * 180) / Math.PI;
        const pitch = (Math.asin(dir.y) * 180) / Math.PI;
        onClick(yaw, pitch);
      }}
    >
      <sphereGeometry args={[PANORAMA_RADIUS - 1, 64, 32]} />
      <meshBasicMaterial visible={false} side={THREE.BackSide} />
    </mesh>
  );
}

function HotspotEditorCanvas({
  panoramaUrl,
  hotspots,
  selectedId,
  snapToGrid,
  onSelect,
  onDrag,
  onPanoramaClick,
}: {
  panoramaUrl: string;
  hotspots: EditorHotspot[];
  selectedId: number | string | null;
  snapToGrid: boolean;
  onSelect: (id: number | string) => void;
  onDrag: (id: number | string, yaw: number, pitch: number) => void;
  onPanoramaClick: (yaw: number, pitch: number) => void;
}) {
  const geometry = useMemo(
    () => new THREE.SphereGeometry(PANORAMA_RADIUS, 64, 32),
    []
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const applySnap = (yaw: number, pitch: number) =>
    snapToGrid
      ? { yaw: snapAngle(yaw), pitch: snapAngle(pitch, 5) }
      : { yaw, pitch };

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
          />

          <PanoramaClickHandler
            onClick={(yaw, pitch) => {
              const s = applySnap(yaw, pitch);
              onPanoramaClick(s.yaw, s.pitch);
            }}
          />

          {hotspots.map((h) => {
            const id = h.id ?? h.tempId!;
            return (
              <DraggableHotspot
                key={id}
                hotspot={h}
                selected={selectedId === id}
                onSelect={() => onSelect(id)}
                onDrag={(yaw, pitch) => {
                  const s = applySnap(yaw, pitch);
                  onDrag(id, s.yaw, s.pitch);
                }}
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

  function handlePanoramaClick(yaw: number, pitch: number) {
    if (!newDestId) return;
    const dest = locations.find((l) => l.id === newDestId);
    if (!dest) return;

    store.addHotspot({
      tempId: `temp-${Date.now()}`,
      destination_id: dest.id,
      destination_name: dest.node_name,
      hotspot_label: newLabel || "E",
      yaw,
      pitch,
    });
  }

  async function handleSave() {
    if (!store.nodeId) return;
    setSaving(true);
    try {
      await saveHotspotEditorChanges(store.nodeId, store.hotspots, originalHotspots, store.nodeName);
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
          subtitle="Click panorama to place hotspots, drag to reposition"
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
              <AdminButton onClick={handleSave} disabled={!store.dirty || saving}>
                {saving ? "Saving..." : "Save Changes"}
              </AdminButton>
            </>
          }
        />

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block opacity-70">Location</span>
            <AdminSelect
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(Number(e.target.value) || "")}
              className="min-w-48"
            >
              <option value="">Select location...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.node_name}</option>
              ))}
            </AdminSelect>
          </label>
          <label className="text-sm">
            <span className="mb-1 block opacity-70">New hotspot destination</span>
            <AdminSelect
              value={newDestId}
              onChange={(e) => setNewDestId(Number(e.target.value) || "")}
              className="min-w-48"
            >
              <option value="">Select destination...</option>
              {locations.filter((l) => l.id !== selectedNodeId).map((l) => (
                <option key={l.id} value={l.id}>{l.node_name}</option>
              ))}
            </AdminSelect>
          </label>
          <label className="text-sm">
            <span className="mb-1 block opacity-70">Label</span>
            <AdminInput
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-20"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={store.snapToGrid}
              onChange={(e) => store.setSnapToGrid(e.target.checked)}
            />
            Snap to position
          </label>
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
              hotspots={store.hotspots}
              selectedId={store.selectedId}
              snapToGrid={store.snapToGrid}
              onSelect={store.selectHotspot}
              onDrag={(id, yaw, pitch) => store.updateHotspot(id, { yaw, pitch })}
              onPanoramaClick={handlePanoramaClick}
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
                <span className="opacity-70">Label</span>
                <AdminInput
                  value={selectedHotspot.hotspot_label}
                  onChange={(e) =>
                    store.updateHotspot(store.selectedId!, { hotspot_label: e.target.value })
                  }
                />
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
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="opacity-70">Yaw</span>
                  <AdminInput
                    type="number"
                    value={selectedHotspot.yaw}
                    onChange={(e) =>
                      store.updateHotspot(store.selectedId!, { yaw: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="block">
                  <span className="opacity-70">Pitch</span>
                  <AdminInput
                    type="number"
                    value={selectedHotspot.pitch}
                    onChange={(e) =>
                      store.updateHotspot(store.selectedId!, { pitch: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3D Coordinates
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {displayXYZFromYawPitch(selectedHotspot.yaw, selectedHotspot.pitch)}
                </span>
              </div>
              <AdminButton
                variant="danger"
                onClick={() => store.removeHotspot(store.selectedId!)}
              >
                Delete Hotspot
              </AdminButton>
            </div>
          ) : (
            <p className="text-sm opacity-50">
              Select a hotspot or click the panorama to create one (choose destination first)
            </p>
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
