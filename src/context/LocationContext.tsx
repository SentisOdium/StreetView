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
  fetchNodeDetails: (name: string) => Promise<NodeDetails | null>;
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
  const [nodeList, setNodeList] = useState<MapNode[]>([]);
  const [nodeListLoading, setNodeListLoading] = useState<boolean>(false);
  const [nodeListError, setNodeListError] = useState<string | null>(null);

  const [nodeDetails, setNodeDetails] = useState<Record<string, NodeDetails>>({});
  const [nodeDetailsLoading, setNodeDetailsLoading] = useState<Record<string, boolean>>({});
  const [nodeDetailsError, setNodeDetailsError] = useState<Record<string, string | null>>({});

  const listCacheRef = useRef<Map<string, MapNode[]>>(new Map());
  const detailsCacheRef = useRef<Map<string, NodeDetails>>(new Map());
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

  const fetchNodeDetails = useCallback(async (name: string): Promise<NodeDetails | null> => {
    if (!name.trim()) return null;

    const cacheKey = `node-details-${name}`;
    const cached = detailsCacheRef.current.get(cacheKey);
    if (cached) {
      setNodeDetails((prev) => ({ ...prev, [name]: cached }));
      return cached;
    }

    setNodeDetailsLoading((prev) => ({ ...prev, [name]: true }));
    setNodeDetailsError((prev) => ({ ...prev, [name]: null }));

    try {
      const data = await apiFetchNodeDetails(name, undefined);
      detailsCacheRef.current.set(cacheKey, data);
      setNodeDetails((prev) => ({ ...prev, [name]: data }));
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setNodeDetailsError((prev) => ({ ...prev, [name]: err.message }));
      } else {
        setNodeDetailsError((prev) => ({ ...prev, [name]: "Unknown error" }));
      }
      return null;
    } finally {
      setNodeDetailsLoading((prev) => ({ ...prev, [name]: false }));
    }
  }, []);

  const preloadAdjacentNodes = useCallback(
    async (mainNodeName: string) => {
      const generation = ++preloadGenerationRef.current;

      const mainDetails = await fetchNodeDetails(mainNodeName);
      if (!mainDetails?.Hotspots?.length || generation !== preloadGenerationRef.current) {
        return;
      }

      const nodeIdToName = new Map(nodeList.map((node) => [node.id, node.node_name]));

      const adjacentNames = new Set<string>();
      for (const hotspot of mainDetails.Hotspots) {
        const name =
          nodeIdToName.get(hotspot.destination_id) ?? hotspot.destination_name;
        if (name?.trim()) {
          adjacentNames.add(name);
        }
      }

      await Promise.all(
        [...adjacentNames].map((name) => {
          if (generation !== preloadGenerationRef.current) {
            return Promise.resolve();
          }
          if (detailsCacheRef.current.has(`node-details-${name}`)) {
            return Promise.resolve();
          }
          return fetchNodeDetails(name);
        })
      );
    },
    [fetchNodeDetails, nodeList]
  );

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
