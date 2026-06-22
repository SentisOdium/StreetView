export type MapNode = {
    id: number;
    node_name: string;
    type: string;
    coordinates?: string;
    coordinate_floor?: string;
}

export type Hotspot = {
    destination_id: number;
    destination_name: string;
    hotspot_label: string;
    yaw?: number | null;
    pitch?: number | null;
};

export type NodeDetails = {
    Current?: {
        id: number;
        node_name: string;
        img: {
            src: string;
            alt: string;
            rotation_offset?: number;
            rotation_offset_x?: number;
            rotation_offset_z?: number;
        }
    }

    Hotspots: Hotspot[];

    Room_Sprite?: {
        room_number: number;
        room_type: string;
        room_img: string;
        room_description: string;
        phone?: string;
        hours?: string;
    }[]
}

export type NodeRoute = {
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

export type RouteReq = {
    src: string;
    dest: string;
    signal?: AbortSignal;

}
