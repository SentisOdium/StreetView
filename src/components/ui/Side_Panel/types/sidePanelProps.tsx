import type { NodeList } from "../../../api/types/types_api";
export type SearchUiProps = {
    currentNode: (id: number | null) => void;
    currentNodeName: (name: string ) => void;
    renderLocationPanel: (render: boolean) => void;
    renderDirectionsPanel: (render: boolean) => void;
    setShowSearchUI: (render: boolean) => void;
    list: NodeList[];
    loading?: boolean;     
    error?: string | null; 
}

export type NodeLocationDetailsProps =  {
    selectedNodeName: string | null;
}

export type NodeDirectionsProps = Pick<SearchUiProps, "renderDirectionsPanel" | "setShowSearchUI" | "list"> 

