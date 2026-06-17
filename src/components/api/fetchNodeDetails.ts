import axios, { isAxiosError } from "axios";
import type {  NodeDetails, NodeDetailsResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

const detailsCache = new Map<number,  NodeDetails>();

export const fetchNodeDetails = async (
    id: number,
    signal?: AbortSignal,
    forceRefresh: boolean = false
): Promise<NodeDetails> => {
    const cacheKey = id;
    
    if (detailsCache.has(cacheKey) && !forceRefresh) {
        return detailsCache.get(cacheKey)!;
    }

    try {
        const cacheBuster = forceRefresh ? `?_t=${Date.now()}` : "";
        const response = await axios.get<NodeDetailsResponse>(
            `${BaseUrl}/hotspots/${id}${cacheBuster}`,
            { signal }
        );    
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

/**
 * Clear cached node details from the module-level cache.
 * @param id - Optional node ID to clear specific entry. If omitted, clears all cached details.
 */
export const clearNodeDetailsCache = (id?: number): void => {
    if (id !== undefined) {
        detailsCache.delete(id);
    } else {
        detailsCache.clear();
    }
};