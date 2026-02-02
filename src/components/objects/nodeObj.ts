interface Node_img {
    src: string,
    alt: string
}

interface Curr_node {
    id: number,
    currentNode_name: string,
    coordinates: string,
    img: Node_img
}

interface hotspot_coordinates {
    node_coordinates: string,
    node_direction: string
}

interface hotspot {
    node_id: number,
    hotspot_name: string,
    hotspot_coordinates:hotspot_coordinates 
}

interface room_sprite {
    room_number: number;
    room_type: string;
    room_img: string;
    room_description: string;
}

export interface NodeObj {
    current_node: Curr_node,
    hotspots: hotspot[],
    room_sprites: room_sprite[]
}