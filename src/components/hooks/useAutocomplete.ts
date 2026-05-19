import { useState, useEffect, useRef, useCallback } from "react";
import { fetchNodeList } from "../api/fetchNodeList";
import type { MapNode } from "../api/types/types_api";

// useAutocomplete.ts
export default function useAutoCompleteFetch() {
    const [list, setList] = useState<MapNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const controllerRef = useRef<AbortController | null>(null);

        const fetchData = useCallback(async () => {
            
            const controller = new AbortController();
            controllerRef.current = controller;

            setLoading(true);
            setError(null);
            
            try {
                const data = await fetchNodeList(controller.signal);
                setList(data);
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err.message);
                }   
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        },[]);   

        useEffect(() =>{
            fetchData();
            return () => {
                controllerRef.current?.abort();
            }
        }, [fetchData]);

    // Return the states here so SearchUi can use them
    return { list, loading, error, fetchData };
}