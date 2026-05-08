import axios, { isAxiosError } from "axios";
import type { MapNode, NodeListResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

export const fetchNodeList =  async (signal?: AbortSignal): Promise<MapNode[]> => {
    try {
        const response = await axios.get<NodeListResponse>(`${BaseUrl}/list`, {signal});

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data;
    } catch (err: unknown) {
        console.error("Failed to fetch list:", err);
                
        if(isAxiosError(err)){
           throw new Error (err.response?.data.message || err.message);
        }
        throw err;
    }
    
}