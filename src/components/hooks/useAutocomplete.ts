import { useState, useEffect } from "react";
import useLoadingError from "./useLoadingError";
import { fetchNodeList } from "../api/fetchNodeList";
import type { NodeList } from "../api/types/types_api";

export default  function useAutoCompleteFetch(){
    const [list, setList] = useState<NodeList[]>([]);
    const {setError,  setLoading} = useLoadingError();

    const fetchData = async() => {
        
        setLoading(true);
        setError(null);

        try {
            const data = await fetchNodeList();
            setList(data);  
        } catch (err: unknown) {
            console.error("Failed to fetch list:", err);
            
            if (err instanceof Error){
                setError(err.message)
            }else{
                setError("Unknown Error Occured")
            }

        } finally{
            setLoading(false)
        }
    }
  

    useEffect(()  =>  {
        fetchData();
    }, []);

    return { list, setList, refetch: fetchData }
}