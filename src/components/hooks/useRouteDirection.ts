import { useState, useEffect } from "react";
import useLoadingError from "./useLoadingError";
import { fetchNodeRoute } from "../api/fetchRouteDetails";
import type { NodeRoute, RouteReq } from "../api/types/types_api";

export default function useRouteDirection({src,  dest}: RouteReq){
    const { setError, setLoading} = useLoadingError();
    const [route, setRoute] = useState<NodeRoute | null>(null);

    const fetchData = async() =>{
        setLoading(true)
        setError(null)
        try {
            const data = await fetchNodeRoute({src, dest})
            setRoute(data)
        } catch (err: unknown) {
            if (err instanceof Error){
                setError(err.message)
            }else{
                setError("Unknown Error Occured")
            }
        }finally{
            setLoading(false)
        }
    }

    useEffect(() => {
        if(!src || !dest) return;
        if(src === dest) return;
        fetchData()
    }, [src, dest])

    
    return{ route, setRoute, refetch: fetchData}
}