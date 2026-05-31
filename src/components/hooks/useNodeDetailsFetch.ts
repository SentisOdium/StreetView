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

    const preloadedForRef = useRef<string | null>(null);

    const details = nodeDetails[name] || null;
    const loading = nodeDetailsLoading[name] || false;
    const error = nodeDetailsError[name] || null;

    useEffect(() => {
        if (name.trim()) {
            fetchNodeDetails(name);
        }
    }, [name, fetchNodeDetails]);

    // Preload adjacent nodes in the background for instant transitions!
    useEffect(() => {
        if (name.trim() && details && preloadedForRef.current !== name) {
            preloadedForRef.current = name;
            preloadAdjacentNodes(name);
        }
    }, [name, details, preloadAdjacentNodes]);

    const refetch = () => {
        if (name.trim()) {
            fetchNodeDetails(name);
        }
    };

    return { details, loading, error, refetch };
}