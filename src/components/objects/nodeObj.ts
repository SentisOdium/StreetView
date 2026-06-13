interface Node_img {
    src: string,
    alt: string
}

interface Curr_node {
    id: number,
    currentNode_name: string,
    img: Node_img
}

interface hotspot {
    destination_id: number,
    destination_name: string,
    hotspot_label: string,
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
