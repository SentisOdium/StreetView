import { create } from "zustand";
import type { AdminHotspot, AdminLocation } from "../api/types";
import { adminApi } from "../api/adminApi";

type AdminState = {
  locations: AdminLocation[];
  loading: boolean;
  error: string | null;
  fetchLocations: (params?: { floor?: string; search?: string }) => Promise<void>;
  selectedLocation: AdminLocation | null;
  setSelectedLocation: (loc: AdminLocation | null) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  locations: [],
  loading: false,
  error: null,
  selectedLocation: null,
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),
  fetchLocations: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await adminApi.getLocations(params);
      set({ locations: data, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load locations",
      });
    }
  },
}));

export type EditorHotspot = AdminHotspot & { tempId?: string };

type HotspotEditorState = {
  nodeId: number | null;
  nodeName: string;
  panoramaUrl: string;
  hotspots: EditorHotspot[];
  selectedId: number | string | null;
  snapToGrid: boolean;
  history: EditorHotspot[][];
  historyIndex: number;
  dirty: boolean;

  init: (nodeId: number, nodeName: string, panoramaUrl: string, hotspots: EditorHotspot[]) => void;
  addHotspot: (hotspot: EditorHotspot) => void;
  updateHotspot: (id: number | string, patch: Partial<EditorHotspot>) => void;
  removeHotspot: (id: number | string) => void;
  selectHotspot: (id: number | string | null) => void;
  setSnapToGrid: (v: boolean) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: (original: EditorHotspot[]) => void;
  markClean: () => void;
};

function cloneHotspots(h: EditorHotspot[]) {
  return h.map((x) => ({ ...x }));
}

export const useHotspotEditorStore = create<HotspotEditorState>((set, get) => ({
  nodeId: null,
  nodeName: "",
  panoramaUrl: "",
  hotspots: [],
  selectedId: null,
  snapToGrid: true,
  history: [[]],
  historyIndex: 0,
  dirty: false,

  init: (nodeId, nodeName, panoramaUrl, hotspots) =>
    set({
      nodeId,
      nodeName,
      panoramaUrl,
      hotspots: cloneHotspots(hotspots),
      history: [cloneHotspots(hotspots)],
      historyIndex: 0,
      selectedId: null,
      dirty: false,
    }),

  addHotspot: (hotspot) => {
    const state = get();
    const next = [...state.hotspots, hotspot];
    set({ hotspots: next, dirty: true, selectedId: hotspot.id ?? hotspot.tempId ?? null });
    get().pushHistory();
  },

  updateHotspot: (id, patch) => {
    set((s) => ({
      hotspots: s.hotspots.map((h) =>
        h.id === id || h.tempId === id ? { ...h, ...patch } : h
      ),
      dirty: true,
    }));
  },

  removeHotspot: (id) => {
    set((s) => ({
      hotspots: s.hotspots.filter((h) => h.id !== id && h.tempId !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      dirty: true,
    }));
    get().pushHistory();
  },

  selectHotspot: (id) => set({ selectedId: id }),
  setSnapToGrid: (v) => set({ snapToGrid: v }),

  pushHistory: () => {
    const { hotspots, history, historyIndex } = get();
    const trimmed = history.slice(0, historyIndex + 1);
    trimmed.push(cloneHotspots(hotspots));
    set({ history: trimmed.slice(-30), historyIndex: trimmed.length - 1 });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    set({ hotspots: cloneHotspots(history[idx]), historyIndex: idx, dirty: true });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    set({ hotspots: cloneHotspots(history[idx]), historyIndex: idx, dirty: true });
  },

  reset: (original) =>
    set({
      hotspots: cloneHotspots(original),
      history: [cloneHotspots(original)],
      historyIndex: 0,
      dirty: false,
      selectedId: null,
    }),

  markClean: () => set({ dirty: false }),
}));

export async function saveHotspotEditorChanges(
  nodeId: number,
  current: EditorHotspot[],
  original: EditorHotspot[]
) {
  const originalIds = new Set(original.filter((h) => h.id).map((h) => h.id!));
  const currentIds = new Set(current.filter((h) => h.id).map((h) => h.id!));

  for (const id of originalIds) {
    if (!currentIds.has(id!)) {
      await adminApi.deleteHotspot(id!);
    }
  }

  for (const h of current) {
    const payload = {
      destination_id: h.destination_id,
      hotspot_label: h.hotspot_label,
      yaw: h.yaw,
      pitch: h.pitch,
    };
    if (h.id) {
      const orig = original.find((o) => o.id === h.id);
      await adminApi.updateHotspot(h.id, { ...payload, _old: orig } as never);
    } else {
      await adminApi.createHotspot(nodeId, payload);
    }
  }
}
