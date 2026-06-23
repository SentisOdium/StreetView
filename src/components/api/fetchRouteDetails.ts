import axios, { isAxiosError } from "axios";
import type { NodeRoute, NodeRouteResponse, RouteReq, RouteOption } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

const routeCache = new Map<string, { path: NodeRoute[], paths: RouteOption[] }>();

export const fetchNodeRoute = async({src,  dest, signal}: RouteReq): Promise<{ path: NodeRoute[], paths: RouteOption[] }> => {
    const cacheKey = `${src}->${dest}`

    if (routeCache.has(cacheKey)){
        return routeCache.get(cacheKey)!;
    }

    try {
        const response = await axios.get<NodeRouteResponse>(`${BaseUrl}/route?source=${src}&destination=${dest}`, 
            { signal }
        )

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        const data = response.data.data;
        routeCache.set(cacheKey, data)
        return data;

    } catch (err: unknown) {
        console.error("Failed to fetch node details:", err);

        if(isAxiosError(err)){
           throw new Error (err.response?.data.message || err.message);
        } 
        throw err;
    }
}