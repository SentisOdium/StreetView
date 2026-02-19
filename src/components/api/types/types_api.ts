export type NodeList = {
    id: number;
    node_name: string;
}

export type NodeListResponse = {
    success: boolean;
    message: string;
    data: {
        list: NodeList[];
    };
};
