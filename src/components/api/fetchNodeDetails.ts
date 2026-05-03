import axios, { isAxiosError } from "axios";
import type {  NodeDetails, NodeDetailsResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

export const fetchNodeDetails = async(name: string, signal?: AbortSignal): Promise<NodeDetails> =>{
    try {
        const response = await axios.get<NodeDetailsResponse>(`${BaseUrl}/search?location=${name}`, { signal });    
        // console.log("API response:", response.data);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        return response.data.data;

    } catch (err: unknown) {
        console.error("Failed to fetch node details:", err);

        if(isAxiosError(err)){
            throw new Error (err.response?.data.message || err.message);
        } 
        throw err;
    }
}