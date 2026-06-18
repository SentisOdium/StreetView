import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import useLoadingError from "./useLoadingError";
import { fetchNodeRoute } from "../api/fetchRouteDetails";
import type { NodeRoute, RouteReq } from "../api/types/types_api";
import { debounce } from "../utils/debounce";

export default function useRouteDirection({ src, dest }: RouteReq) {
    const { error, setError, loading, setLoading } = useLoadingError();
    const [route, setRoute] = useState<NodeRoute[] | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const [debouncedSrc, setDebouncedSrc] = useState(src);
    const [debouncedDest, setDebouncedDest] = useState(dest);

    const updateDebounced = useMemo(
        () => debounce((s: string, d: string) => {
            setDebouncedSrc(s);
            setDebouncedDest(d);
        }, 2000),
        []
    );

    useEffect(() => {
        updateDebounced(src, dest);
    }, [src, dest, updateDebounced]);

    const fetchData = useCallback(async () => {
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        setLoading(true)
        setError(null)

        try {
            const data = await fetchNodeRoute({ src: debouncedSrc, dest: debouncedDest, signal: controller.signal })
            setRoute(data)
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name === "AbortError" || err.message === "canceled") return;
                setError(err.message);
            } else {
                setError("Unknown Error Occurred");
            }
        } finally {
            if (!controller.signal?.aborted) {
                setLoading(false);
            }
        }
    }, [debouncedSrc, debouncedDest, setError, setLoading])

    useEffect(() => {

        if (debouncedSrc && debouncedDest) {
            fetchData()
        }
        return () => {
            controllerRef.current?.abort();
        }

    }, [fetchData, debouncedSrc, debouncedDest])

    const refetch = () => {
        fetchData();
    }

    return { route, loading, error, setRoute, refetch };
}