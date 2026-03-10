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
        dist: number,
        name: string,
        type: string
    }[]
}

export type NodeListResponse= {
    success: boolean;
    message: string;
    list: NodeList[];

}

export type NodeDetailsResponse = {
    success: boolean;
    message: string;
    node: NodeDetails; 

}

export type NodeRouteResponse = {
    success: boolean;
    message: string;
    data: NodeRoute

}

export type RouteReq= {
    src: string,
    dest: string
}