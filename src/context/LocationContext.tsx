import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MapNode, NodeDetails } from "../components/api/types/types_api";
import { fetchNodeList as apiFetchNodeList } from "../components/api/fetchNodeList";
import { fetchNodeDetails as apiFetchNodeDetails } from "../components/api/fetchNodeDetails";
import { queryClient } from "../queryClient";

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
  const listQuery = useQuery({
    queryKey: ["nodeList"],
    queryFn: () => apiFetchNodeList(),
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const nodeList = listQuery.data ?? [];
  const mainNodeList = useMemo(() => nodeList.filter((n) => n.type !== "transitional"), [nodeList]);
  const nodeListLoading = listQuery.isPending;
  const nodeListError = listQuery.error?.message ?? null;

  const [nodeDetails, setNodeDetails] = useState<Record<number, NodeDetails>>({});
  const [nodeDetailsLoading, setNodeDetailsLoading] = useState<Record<number, boolean>>({});
  const [nodeDetailsError, setNodeDetailsError] = useState<Record<number, string | null>>({});
  const preloadGenerationRef = useRef(0);

  const fetchNodeList = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["nodeList"] });
  }, []);

  const fetchNodeDetails = useCallback(
    async (id: number, signal?: AbortSignal, forceRefresh = false): Promise<NodeDetails | null> => {
      if (!id) return null;

      if (forceRefresh) {
        await queryClient.invalidateQueries({ queryKey: ["nodeDetails", id] });
      }

      const existing = queryClient.getQueryData<NodeDetails>(["nodeDetails", id]);
      if (existing && !forceRefresh) {
        setNodeDetails((prev) => ({ ...prev, [id]: existing }));
        return existing;
      }

      setNodeDetailsLoading((prev) => ({ ...prev, [id]: true }));
      setNodeDetailsError((prev) => ({ ...prev, [id]: null }));

      try {
        let currentList = nodeList;
        if (currentList.length === 0) {
          currentList = await queryClient.fetchQuery({ queryKey: ["nodeList"], queryFn: () => apiFetchNodeList() });
        }
        const node = currentList.find((n) => n.id === id);
        if (!node) {
          throw new Error(`Node with ID ${id} not found in nodeList`);
        }

        const data = await queryClient.fetchQuery({
          queryKey: ["nodeDetails", id],
          queryFn: () => apiFetchNodeDetails(id, signal, forceRefresh),
        });

        setNodeDetails((prev) => ({ ...prev, [id]: data }));
        return data;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setNodeDetailsError((prev) => ({ ...prev, [id]: msg }));
        return null;
      } finally {
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
          if (generation !== preloadGenerationRef.current) return Promise.resolve();
          const adjId = hotspot.destination_id;
          const cached = queryClient.getQueryData(["nodeDetails", adjId]);
          if (cached) return Promise.resolve();
          return fetchNodeDetails(adjId);
        })
      );
    },
    [fetchNodeDetails]
  );

  const clearCacheRef = useCallback((id?: number) => {
    if (id !== undefined) {
      queryClient.invalidateQueries({ queryKey: ["nodeDetails", id] });
      setNodeDetails((prev) => { const next = { ...prev }; delete next[id]; return next; });
      setNodeDetailsLoading((prev) => { const next = { ...prev }; delete next[id]; return next; });
      setNodeDetailsError((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } else {
      queryClient.invalidateQueries({ queryKey: ["nodeDetails"] });
      queryClient.invalidateQueries({ queryKey: ["nodeList"] });
      setNodeDetails({});
      setNodeDetailsLoading({});
      setNodeDetailsError({});
    }
  }, []);

  // Listen for admin panel changes via storage event (cross-tab)
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
            clearCacheRef();
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

  // Same-tab listener for CustomEvent broadcast
  useEffect(() => {
    const handleCustom = (e: CustomEvent) => {
      const change = e.detail;
      if (change?.type === "hotspot" && typeof change.nodeId === "number") {
        clearCacheRef(change.nodeId);
        fetchNodeDetails(change.nodeId, undefined, true);
      }
      if (change?.type === "list") {
        clearCacheRef();
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
