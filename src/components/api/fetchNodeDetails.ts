import axios, { isAxiosError } from "axios";
import type { NodeDetails, NodeDetailsResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";
import { queryClient } from "../../queryClient";

export const fetchNodeDetails = async (
    id: number,
    signal?: AbortSignal,
    forceRefresh: boolean = false
): Promise<NodeDetails> => {
    try {
        const cacheBuster = forceRefresh ? `?_t=${Date.now()}` : "";
        const response = await axios.get<NodeDetailsResponse>(
            `${BaseUrl}/hotspots/${id}${cacheBuster}`,
            { signal }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data;
    } catch (err: unknown) {
        console.error("Failed to fetch node details:", err);

        if (isAxiosError(err)) {
            throw new Error(err.response?.data.message || err.message);
        }
        throw err;
    }
};

/**
 * Clear cached node details via TanStack Query invalidation engine.
 */
export const clearNodeDetailsCache = (id?: number): void => {
    if (id !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["nodeDetails", id] });
    } else {
        queryClient.invalidateQueries({ queryKey: ["nodeDetails"] });
    }
};