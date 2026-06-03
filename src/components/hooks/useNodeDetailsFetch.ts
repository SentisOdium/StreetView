import { useEffect, useRef } from "react";
import { useLocation } from "../../context/LocationContext";

export default function useNodeDetailsFetch(name: string) {
    const { 
        nodeDetails, 
        nodeDetailsLoading, 
        nodeDetailsError, 
        fetchNodeDetails, 
        preloadAdjacentNodes 
    } = useLocation();

    const preloadedForRef = useRef<{ name: string; nodeId: number | null } | null>(null);

    const details = nodeDetails[name] || null;
    const loading = nodeDetailsLoading[name] || false;
    const error = nodeDetailsError[name] || null;
    const currentNodeId = details?.Current?.id ?? null;

    useEffect(() => {
        if (name.trim()) {
            fetchNodeDetails(name);
        }
    }, [name, fetchNodeDetails]);

    useEffect(() => {
        if (!name.trim() || !details || currentNodeId == null) return;

        const alreadyPreloaded =
            preloadedForRef.current?.name === name &&
            preloadedForRef.current?.nodeId === currentNodeId;

        if (alreadyPreloaded) return;

        preloadedForRef.current = { name, nodeId: currentNodeId };
        preloadAdjacentNodes(name);
    }, [name, details, currentNodeId, preloadAdjacentNodes]);

    const refetch = () => {
        if (name.trim()) {
            preloadedForRef.current = null;
            fetchNodeDetails(name);
        }
    };

    return { details, loading, error, refetch };
}
