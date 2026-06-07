import { useEffect, useRef } from "react";
import { useLocation } from "../../context/LocationContext";

export default function useNodeDetailsFetch(id: number | null) {
    const { 
        nodeDetails, 
        nodeDetailsLoading, 
        nodeDetailsError, 
        fetchNodeDetails, 
        preloadAdjacentNodes,
        clearCacheRef,
    } = useLocation();

    const preloadedForRef = useRef<number | null>(null);

    const details = id != null ? nodeDetails[id] || null : null;
    const loading = id != null ? nodeDetailsLoading[id] || false : false;
    const error = id != null ? nodeDetailsError[id] || null : null;
    const currentNodeId = details?.Current?.id ?? null;

    // Listen for admin panel changes and force refresh from backend
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "admin_data_changed" && e.newValue) {
                try {
                    const change = JSON.parse(e.newValue);
                    // If current node was modified, force refresh by clearing cache and fetching fresh data
                    if (id != null && (change.nodeId === id || change.type === "hotspot")) {
                        clearCacheRef(id);
                        fetchNodeDetails(id, undefined, true);
                    }
                } catch (err) {
                    console.warn("Error processing admin data change:", err);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [id, clearCacheRef, fetchNodeDetails]);

    useEffect(() => {
        if (id != null) {
            fetchNodeDetails(id);
        }
    }, [id, fetchNodeDetails]);

    useEffect(() => {
        if (id == null || !details || currentNodeId == null) return;

        const alreadyPreloaded = preloadedForRef.current === id;

        if (alreadyPreloaded) return;

        preloadedForRef.current = id;
        preloadAdjacentNodes(id);
    }, [id, details, currentNodeId, preloadAdjacentNodes]);

    const refetch = () => {
        if (id != null) {
            preloadedForRef.current = null;
            fetchNodeDetails(id);
        }
    };

    return { details, loading, error, refetch };
}
