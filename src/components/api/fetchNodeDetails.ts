import axios, { isAxiosError } from "axios";
import type {  NodeDetails, NodeDetailsResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

const detailsCache = new Map<string,  NodeDetails>();

export const fetchNodeDetails = async(name: string, signal?: AbortSignal): Promise<NodeDetails> =>{
    const cacheKey = `node-details-${name}`
    
    if(detailsCache.has(cacheKey)){
        return detailsCache.get(cacheKey)!;
    }

    try {
        const response = await axios.get<NodeDetailsResponse>(`${BaseUrl}/search?location=${name}`, { signal });    
        // console.log("API response:", response.data);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        const data = response.data.data;
        detailsCache.set(cacheKey, data)
        return data

    } catch (err: unknown) {
        console.error("Failed to fetch node details:", err);

        if(isAxiosError(err)){
            throw new Error (err.response?.data.message || err.message);
        } 
        throw err;
    }
}