import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNodeRoute } from "../api/fetchRouteDetails";
import type { NodeRoute, RouteReq, RouteOption } from "../api/types/types_api";
import { debounce } from "../utils/debounce";

export default function useRouteDirection({ src, dest }: RouteReq) {
    const [debouncedSrc, setDebouncedSrc] = useState(src);
    const [debouncedDest, setDebouncedDest] = useState(dest);

    const updateDebounced = useMemo(
        () => debounce((s: string, d: string) => {
            setDebouncedSrc(s);
            setDebouncedDest(d);
        }, 300),
        []
    );

    useEffect(() => {
        updateDebounced(src, dest);
    }, [src, dest, updateDebounced]);

    const query = useQuery({
        queryKey: ["route", debouncedSrc, debouncedDest],
        queryFn: ({ signal }) => fetchNodeRoute({ src: debouncedSrc, dest: debouncedDest, signal }),
        enabled: Boolean(debouncedSrc && debouncedDest),
    });

    const [overrideRoute, setOverrideRoute] = useState<NodeRoute[] | null>(null);
    const [overrideRoutes, setOverrideRoutes] = useState<RouteOption[] | null>(null);

    useEffect(() => {
        setOverrideRoute(null);
        setOverrideRoutes(null);
    }, [debouncedSrc, debouncedDest]);

    const route = overrideRoute ?? query.data?.path ?? null;
    const routes = overrideRoutes ?? query.data?.paths ?? null;
    const loading = query.isPending && Boolean(debouncedSrc && debouncedDest);
    const error = query.error?.message ?? null;

    const setRoute = (r: NodeRoute[] | null) => setOverrideRoute(r);
    const setRoutes = (rs: RouteOption[] | null) => setOverrideRoutes(rs);
    const refetch = () => query.refetch();

    return { route, routes, loading, error, setRoute, setRoutes, refetch };
}