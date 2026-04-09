import { useState, useEffect } from "react";
import { fetchNodeList } from "../api/fetchNodeList";
import type { NodeList } from "../api/types/types_api";

// useAutocomplete.ts
export default function useAutoCompleteFetch() {
    const [list, setList] = useState<NodeList[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNodeList();
            setList(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Return the states here so SearchUi can use them
    return { list, loading, error, refetch: fetchData };
}