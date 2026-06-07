import axios, { isAxiosError } from "axios";
import type {  NodeDetails, NodeDetailsResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

const detailsCache = new Map<string,  NodeDetails>();

export const fetchNodeDetails = async (
    name: string,
    signal?: AbortSignal,
    forceRefresh: boolean = false
): Promise<NodeDetails> => {
    const cacheKey = `node-details-${name}`;
    
    if (detailsCache.has(cacheKey) && !forceRefresh) {
        return detailsCache.get(cacheKey)!;
    }

    try {
        const cacheBuster = forceRefresh ? `&_t=${Date.now()}` : "";
        const response = await axios.get<NodeDetailsResponse>(
            `${BaseUrl}/search?location=${name}${cacheBuster}`,
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
 * @param name - Optional location name to clear specific entry. If omitted, clears all cached details.
 */
export const clearNodeDetailsCache = (name?: string): void => {
    if (name) {
        const cacheKey = `node-details-${name}`;
        detailsCache.delete(cacheKey);
    } else {
        detailsCache.clear();
    }
};