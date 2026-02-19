//should this be placed in api folder or hooks?
import { fetchNodeList } from "../api/fetchNodeList";
import type { NodeList } from "../api/types/types_api";
import { useState, useEffect } from "react";
export default  function useAutoCompleteFetch(){
    const [list, setList] = useState<NodeList[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] =  useState<string | null>(null);

    useEffect(()  =>  {
        const fetchData = async() => {
            setLoading(true);

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
        };
        fetchData();
    }, []);

    return { list, setList, error, setError, loading, setLoading}
}