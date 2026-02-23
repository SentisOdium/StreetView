import { useState, useEffect  } from "react";
import useLoadingError from "./useLoadingError";
import { fetchNodeDetails } from "../api/fetchNodeDetails";
import type { NodeDetails } from "../api/types/types_api";

export default function useNodeDetailsFetch(name: string){
    const [details, setDetails] = useState<NodeDetails | null>(null);
    const {setError, setLoading} = useLoadingError();

    const fetchData = async() => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchNodeDetails(name);
            setDetails(data);
        } catch (err: unknown) {
            if (err instanceof Error){
                setError(err.message)
            }else{
                setError("Unknown Error Occured")
            }
        } finally {
            setLoading(false);
        }
        
    }

    useEffect(() => {
            if (name) fetchData();
        }, [name]);

    return { details, setDetails, refetch: fetchData }
}