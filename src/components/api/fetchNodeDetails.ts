import axios, { isAxiosError } from "axios";
import type {  NodeDetails, NodeDetailsResponse } from "./types/types_api";
import { BaseUrl } from "../objects/baseUrl";

export const fetchNodeDetails = async(name: string): Promise<NodeDetails> =>{
    try {
        const response = await axios.get<NodeDetailsResponse>(`${BaseUrl}/search?location=${name}`)
        return response.data.node;
    } catch (err: unknown) {
        console.error("Failed to fetch node details:", err);

        if(isAxiosError(err)){
            throw new Error (err.response?.data.message || err.message);
        } else {
            console.error("Unexpected error:", err);
        }
        throw err;
    }
}