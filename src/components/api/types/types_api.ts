export type NodeList = {
    id: number;
    node_name: string;
    type: string;
}

export type NodeDetails = {
    Current?: {
        id: number;
        node_name: string;
        coordinates: string;
        img: {
            src: string;
            alt: string;
        }
    }

    Hotspots: {
        node_id: number;
        currentNode_id: number;
        hotspot_name: string;
        coordinates: {
            node_Coordinates: string;
            node_Direction: string;
        }
    }[]

    Room_Sprite?: {
        room_number: number;
        room_type: string;
        room_img: string;
        room_description: string;
    }[]
}

export type NodeRoute ={
    path: 
    {
        id: number, 
        dist: number
    }[]
}

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type NodeListResponse = ApiResponse<{
    list: NodeList[];
}>;

export type NodeDetailsResponse = ApiResponse<{
    Node: NodeDetails; 
}>;

export type NodeRouteResponse = ApiResponse<{
    route: NodeRoute
}>;

export type RouteReq= {
    src: string,
    dest: string
}