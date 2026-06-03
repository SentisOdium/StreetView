import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { MapNode, NodeDetails } from "../components/api/types/types_api";
import { fetchNodeList as apiFetchNodeList } from "../components/api/fetchNodeList";
import { fetchNodeDetails as apiFetchNodeDetails } from "../components/api/fetchNodeDetails";

interface LocationContextProps {
  nodeList: MapNode[];
  nodeListLoading: boolean;
  nodeListError: string | null;
  nodeDetails: Record<string, NodeDetails>;
  nodeDetailsLoading: Record<string, boolean>;
  nodeDetailsError: Record<string, string | null>;
  fetchNodeList: () => Promise<void>;
  fetchNodeDetails: (name: string) => Promise<void>;
  preloadAdjacentNodes: (nodeName: string) => Promise<void>;
}

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  // State for node list
  const [nodeList, setNodeList] = useState<MapNode[]>([]);
  const [nodeListLoading, setNodeListLoading] = useState<boolean>(false);
  const [nodeListError, setNodeListError] = useState<string | null>(null);

  // State for node details (per node)
  const [nodeDetails, setNodeDetails] = useState<Record<string, NodeDetails>>({});
  const [nodeDetailsLoading, setNodeDetailsLoading] = useState<Record<string, boolean>>({});
  const [nodeDetailsError, setNodeDetailsError] = useState<Record<string, string | null>>({});

  // Refs for caching (to avoid refetching on re-renders)
  const listCacheRef = useRef<Map<string, MapNode[]>>(new Map());
  const detailsCacheRef = useRef<Map<string, NodeDetails>>(new Map());

  // Fetch node list
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
      const data = await apiFetchNodeList(undefined); // No signal for now, we can add if needed
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

  // Fetch node details for a specific node name
  const fetchNodeDetails = useCallback(async (name: string) => {
    if (!name.trim()) return;

    setNodeDetailsLoading(prev => ({ ...prev, [name]: true }));
    setNodeDetailsError(prev => ({ ...prev, [name]: null }));

    try {
      const cacheKey = `node-details-${name}`;
      if (detailsCacheRef.current.has(cacheKey)) {
        const cachedDetails = detailsCacheRef.current.get(cacheKey);
        if (cachedDetails) {
          setNodeDetails(prev => ({ ...prev, [name]: cachedDetails }));
          setNodeDetailsLoading(prev => ({ ...prev, [name]: false }));
          return;
        }
      }
      const data = await apiFetchNodeDetails(name, undefined); // No signal for now
      detailsCacheRef.current.set(cacheKey, data);
      setNodeDetails(prev => ({ ...prev, [name]: data }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNodeDetailsError(prev => ({ ...prev, [name]: err.message }));
      } else {
        setNodeDetailsError(prev => ({ ...prev, [name]: "Unknown error" }));
      }
    } finally {
      setNodeDetailsLoading(prev => ({ ...prev, [name]: false }));
    }
  }, []);

  // Preload adjacent nodes for a given node name
  const preloadAdjacentNodes = useCallback(async (mainNodeName: string) => {
    // First, ensure the main node details are loaded
    await fetchNodeDetails(mainNodeName);

    // Get the main node details from state (after fetch)
    const mainDetails = nodeDetails[mainNodeName];
    if (!mainDetails || !mainDetails.Hotspots) return;

    // Create a map from node_id to node_name for quick lookup
    const nodeIdToNameMap: Record<number, string> = {};
    nodeList.forEach(node => {
      nodeIdToNameMap[node.id] = node.node_name;
    });

    // For each hotspot, get the adjacent node id and fetch its details if not already cached/loading
    const adjacentNodeNames: string[] = [];
    mainDetails.Hotspots.forEach(hotspot => {
      const adjacentNodeId = hotspot.node_id; // `node.id` of the destination
      const adjacentNodeName = nodeIdToNameMap[adjacentNodeId];
      if (adjacentNodeName) {
        adjacentNodeNames.push(adjacentNodeName);
      }
    });

    // Fetch details for each adjacent node (if not already cached or loading)
    await Promise.all(
      adjacentNodeNames.map(name => {
        // Skip if we already have the details or if it's currently loading
        if (nodeDetails[name] || nodeDetailsLoading[name]) {
          return Promise.resolve();
        }
        return fetchNodeDetails(name);
      })
    );
  }, [fetchNodeDetails, nodeDetails, nodeDetailsLoading, nodeList]);

  // Initial fetch of node list
  useEffect(() => {
    fetchNodeList();
  }, [fetchNodeList]);

  const value = {
    nodeList,
    nodeListLoading,
    nodeListError,
    nodeDetails,
    nodeDetailsLoading,
    nodeDetailsError,
    fetchNodeList,
    fetchNodeDetails,
    preloadAdjacentNodes,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};