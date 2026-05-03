import { useState, useEffect, useCallback, useRef } from "react";
import useLoadingError from "./useLoadingError";
import { fetchNodeRoute } from "../api/fetchRouteDetails";
import type { NodeRoute, RouteReq } from "../api/types/types_api";

export default function useRouteDirection({src,  dest, signal}: RouteReq){
    const { setError, setLoading} = useLoadingError();
    const [route, setRoute] = useState<NodeRoute[] | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async() =>{
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;
        
        setLoading(true)
        setError(null)
        
        try {
            const data = await fetchNodeRoute({src, dest, signal:controller.signal})
            setRoute(data)
            console.log("Fetched route data: ", data)
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name === "AbortError") return; 
                setError(err.message);
            } else {
                setError("Unknown Error Occurred");
            }
        }finally {
            if (!controller.signal?.aborted) {
                setLoading(false);
            }
        }
    }, [src, dest, setError, setLoading])

    useEffect(() => {

        if(src && dest){
            fetchData()
        }
        return () =>{
            controllerRef.current?.abort();
        }
        
    },[fetchData])

    const refetch = () => {
        fetchData();
    }

    return{ route, setRoute, refetch}
}