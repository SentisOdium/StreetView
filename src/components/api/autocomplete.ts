import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";

type Node = {
    id: number;
    node_name: string;
}

type ApiResponse = {
    success: boolean;
    message: string;
    data: {
        list: Node[];
    };
};

export default  function useAutoCompleteFetch(){
    const [list, setList] = useState<Node[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] =  useState<string | null>(null);

    useEffect(()  =>  {
        const fetchData = async() => {
            setLoading(true);

            try {
                const response = await axios.get<ApiResponse>(
                "http://localhost:5000/api/list" //change to deployed url
                );
                setList(response.data.data.list);
            } catch (err: unknown) {
                console.error("Failed to fetch list:", err);
                
                if(isAxiosError(err)){
                    setError(err.response?.data.message || err.message);
                } else if (err instanceof Error){
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