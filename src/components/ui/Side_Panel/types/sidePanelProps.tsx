export type SearchUiProps = {
    currentNode: (id: number | null) => void;
    currentNodeName: (name: string ) => void;
    renderLocationPanel: (render: boolean) => void;
}

export type NodeLocationDetailsProps =  {
    selectedNodeName: string | null;
}

