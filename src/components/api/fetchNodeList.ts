import axios, { isAxiosError } from "axios";
import type { NodeList, NodeListResponse } from "./types/types_api";

const BaseUrl = import.meta.env.VITE_API_BASE_URL;

export const fetchNodeList =  async (): Promise<NodeList[]> => {
    try {
        const response = await axios.get<NodeListResponse>(`${BaseUrl}/list`);
        return response.data.data.list
    } catch (err: unknown) {
        console.error("Failed to fetch list:", err);
                
        if(isAxiosError(err)){
           throw new Error (err.response?.data.message || err.message);
        } 
        throw new Error("Unknown error occurred");
    }
    
}