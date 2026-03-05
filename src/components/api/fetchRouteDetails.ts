import axios, { isAxiosError } from "axios";
import type { NodeRoute, NodeRouteResponse, RouteReq } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";


export const fetchNodeRoute = async({src,  dest}: RouteReq): Promise<NodeRoute> => {
    try {
        const response = await axios.get<NodeRouteResponse>(`${BaseUrl}/route?source=${src}&destination=${dest}`)
        return {path: response.data.data.path }
    } catch (err: unknown) {
        console.error("Failed to fetch node details:", err);

        if(isAxiosError(err)){
           throw new Error (err.response?.data.message || err.message);
        }  else {
            console.error("Unexpected error:", err);
        }
        throw err;
    }
}