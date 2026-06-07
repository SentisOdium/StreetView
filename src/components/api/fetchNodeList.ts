import axios, { isAxiosError } from "axios";
import type { MapNode, NodeListResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

const listCache = new Map<string, MapNode[]>();

export const fetchNodeList =  async (signal?: AbortSignal): Promise<MapNode[]> => {
    const cacheKey = `node-list`

    if(listCache.has(cacheKey)){
        return listCache.get(cacheKey)!;
    }

    try {
        const response = await axios.get<NodeListResponse>(`${BaseUrl}/list`, {signal});

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        const data = response.data.data;
        listCache.set(cacheKey, data)
        return data
    } catch (err: unknown) {
        console.error("Failed to fetch list:", err);
                
        if(isAxiosError(err)){
           throw new Error (err.response?.data.message || err.message);
        }
        throw err;
    }
    
}

/**
 * Clear the cached node list from the module-level cache.
 */
export const clearNodeListCache = (): void => {
    listCache.clear();
};