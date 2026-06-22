import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { MapNode, NodeDetails } from "../components/api/types/types_api";
import { fetchNodeList as apiFetchNodeList, clearNodeListCache } from "../components/api/fetchNodeList";
import { fetchNodeDetails as apiFetchNodeDetails } from "../components/api/fetchNodeDetails";

interface LocationContextProps {
  nodeList: MapNode[];
  mainNodeList: MapNode[];
  nodeListLoading: boolean;
  nodeListError: string | null;
  nodeDetails: Record<number, NodeDetails>;
  nodeDetailsLoading: Record<number, boolean>;
  nodeDetailsError: Record<number, string | null>;
  fetchNodeList: () => Promise<void>;
  fetchNodeDetails: (id: number, signal?: AbortSignal, forceRefresh?: boolean) => Promise<NodeDetails | null>;
  preloadAdjacentNodes: (id: number) => Promise<void>;
  clearCacheRef: (id?: number) => void;
}

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

/**
 * Hook to access cache clearing functions.
 * Use this to invalidate cached node details when external updates occur (e.g., admin panel edits).
 */
export const useLocationCache = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationCache must be used within a LocationProvider");
  }
  return {
    clearCacheRef: context.clearCacheRef,
  };
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [nodeList, setNodeList] = useState<MapNode[]>([]);
  const mainNodeList = useMemo(() => nodeList.filter((n) => n.type !== "transitional"), [nodeList]);
  const [nodeListLoading, setNodeListLoading] = useState<boolean>(false);
  const [nodeListError, setNodeListError] = useState<string | null>(null);

  const [nodeDetails, setNodeDetails] = useState<Record<number, NodeDetails>>({});
  const [nodeDetailsLoading, setNodeDetailsLoading] = useState<Record<number, boolean>>({});
  const [nodeDetailsError, setNodeDetailsError] = useState<Record<number, string | null>>({});
  const listCacheRef = useRef<Map<string, MapNode[]>>(new Map());
  const detailsCacheRef = useRef<Map<number, NodeDetails>>(new Map());
  const activeFetchesRef = useRef<Map<number, Promise<NodeDetails>>>(new Map());
  const preloadGenerationRef = useRef(0);


  const fetchNodeList = useCallback(async () => {
    setNodeListLoading(true);
    setNodeListError(null);
    try {
      const cacheKey = "node-list";
      if (listCacheRef.current.has(cacheKey)) {
        const cachedList = listCacheRef.current.get(cacheKey);
        if (cachedList) {
          setNodeList(cachedList);
          setNodeListLoading(false);
          return;
        }
      }
      const data = await apiFetchNodeList(undefined);
      listCacheRef.current.set(cacheKey, data);
      setNodeList(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNodeListError(err.message);
      } else {
        setNodeListError("Unknown error");
      }
    } finally {
      setNodeListLoading(false);
    }
  }, []);

  const fetchNodeDetails = useCallback(
    async (id: number, signal?: AbortSignal, forceRefresh = false): Promise<NodeDetails | null> => {
      if (!id) return null;

      const cached = detailsCacheRef.current.get(id);
      if (cached && !forceRefresh) {
        setNodeDetails((prev) => ({ ...prev, [id]: cached }));
        return cached;
      }

      setNodeDetailsLoading((prev) => ({ ...prev, [id]: true }));
      setNodeDetailsError((prev) => ({ ...prev, [id]: null }));

      try {
        let currentList = nodeList;
        if (currentList.length === 0) {
          currentList = await apiFetchNodeList(undefined);
          setNodeList(currentList);
        }
        const node = currentList.find((n) => n.id === id);
        if (!node) {
          throw new Error(`Node with ID ${id} not found in nodeList`);
        }
        
        let promise = activeFetchesRef.current.get(id);
        if (!promise || forceRefresh) {
          promise = apiFetchNodeDetails(id, signal, forceRefresh);
          activeFetchesRef.current.set(id, promise);
        }

        const data = await promise;
        detailsCacheRef.current.set(id, data);
        setNodeDetails((prev) => ({ ...prev, [id]: data }));
        return data;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setNodeDetailsError((prev) => ({ ...prev, [id]: err.message }));
        } else {
          setNodeDetailsError((prev) => ({ ...prev, [id]: "Unknown error" }));
        }
        return null;
      } finally {
        activeFetchesRef.current.delete(id);
        setNodeDetailsLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [nodeList]
  );

  const preloadAdjacentNodes = useCallback(
    async (mainNodeId: number) => {
      const generation = ++preloadGenerationRef.current;

      const mainDetails = await fetchNodeDetails(mainNodeId);
      if (!mainDetails?.Hotspots?.length || generation !== preloadGenerationRef.current) {
        return;
      }

      await Promise.all(
        mainDetails.Hotspots.map((hotspot) => {
          if (generation !== preloadGenerationRef.current) {
            return Promise.resolve();
          }
          const adjId = hotspot.destination_id;
          if (detailsCacheRef.current.has(adjId)) {
            return Promise.resolve();
          }
          return fetchNodeDetails(adjId);
        })
      );
    },
    [fetchNodeDetails]
  );

  const clearCacheRef = useCallback((id?: number) => {
    if (id !== undefined) {
      // Clear specific node
      detailsCacheRef.current.delete(id);
      setNodeDetails((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNodeDetailsLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNodeDetailsError((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      // Clear all
      detailsCacheRef.current.clear();
      listCacheRef.current.clear();
      setNodeDetails({});
      setNodeDetailsLoading({});
      setNodeDetailsError({});
    }
  }, []);

  useEffect(() => {
    fetchNodeList();
  }, [fetchNodeList]);

  // Listen for admin panel changes via storage event (cross‑tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin_data_changed" && e.newValue) {
        try {
          const change = JSON.parse(e.newValue);
          if (change.type === "hotspot" && typeof change.nodeId === "number") {
            clearCacheRef(change.nodeId);
            fetchNodeDetails(change.nodeId, undefined, true);
          }
          if (change.type === "list") {
            clearNodeListCache();
            listCacheRef.current.clear();
            fetchNodeList();
          }
        } catch (err) {
          console.warn("Error processing admin data change event:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [clearCacheRef, fetchNodeDetails, fetchNodeList]);

  // Same‑tab listener for CustomEvent broadcast
  useEffect(() => {
    const handleCustom = (e: CustomEvent) => {
      const change = e.detail;
      if (change?.type === "hotspot" && typeof change.nodeId === "number") {
        clearCacheRef(change.nodeId);
        fetchNodeDetails(change.nodeId, undefined, true);
      }
      if (change?.type === "list") {
        clearNodeListCache();
        listCacheRef.current.clear();
        fetchNodeList();
      }
    };
    window.addEventListener("admin_data_changed", handleCustom as EventListener);
    return () => window.removeEventListener("admin_data_changed", handleCustom as EventListener);
  }, [clearCacheRef, fetchNodeDetails, fetchNodeList]);

  const value = {
    nodeList,
    mainNodeList,
    nodeListLoading,
    nodeListError,
    nodeDetails,
    nodeDetailsLoading,
    nodeDetailsError,
    fetchNodeList,
    fetchNodeDetails,
    preloadAdjacentNodes,
    clearCacheRef,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
