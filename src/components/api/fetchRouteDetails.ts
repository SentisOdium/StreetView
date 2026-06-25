import axios, { isAxiosError } from "axios";
import type { NodeRoute, NodeRouteResponse, RouteReq, RouteOption } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

export const fetchNodeRoute = async ({ src, dest, signal }: RouteReq): Promise<{ path: NodeRoute[], paths: RouteOption[] }> => {
    try {
        const response = await axios.get<NodeRouteResponse>(`${BaseUrl}/route?source=${src}&destination=${dest}`, 
            { signal }
        );

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data;
    } catch (err: unknown) {
        console.error("Failed to fetch route details:", err);

        if (isAxiosError(err)) {
           throw new Error(err.response?.data.message || err.message);
        }
        throw err;
    }
};