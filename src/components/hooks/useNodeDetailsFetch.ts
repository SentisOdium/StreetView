import { useState, useEffect, useCallback, useRef  } from "react";
import useLoadingError from "./useLoadingError";
import { fetchNodeDetails } from "../api/fetchNodeDetails";
import type { NodeDetails } from "../api/types/types_api";

export default function useNodeDetailsFetch(name: string){
    const [details, setDetails] = useState<NodeDetails | null>(null);
    const {setError, setLoading} = useLoadingError();
    const controllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async() =>{ 
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const data = await fetchNodeDetails(name, controller.signal);
            
            setDetails(data);
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
    }, [name, setError, setLoading])
        
    useEffect(() => {
        if(name.trim()){
            fetchData();
        }
    }, [ fetchData])

    const refetch = () => {
        fetchData();
    };

    return { details, setDetails, refetch}
}