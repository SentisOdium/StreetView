export type MapNode = {
    id: number;
    node_name: string;
    type: string;
}

export type Hotspot = {
    destination_id: number;
    destination_name: string;
    hotspot_label: string;
    coordinates: {
        node_Coordinates: string;
        node_Direction: string;
    };
};

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

    Hotspots: Hotspot[];

    Room_Sprite?: {
        room_number: number;
        room_type: string;
        room_img: string;
        room_description: string;
    }[]
}

export type NodeRoute ={ 
    id: number;
    dist: number;
    name: string;
    type: string;
};

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type NodeListResponse = ApiResponse<MapNode[]>;

export type NodeDetailsResponse = ApiResponse<NodeDetails>;

export type NodeRouteResponse = ApiResponse<{
    path: NodeRoute[]
}>;

export type RouteReq= {
    src: string;
    dest: string;
    signal?: AbortSignal;

}
