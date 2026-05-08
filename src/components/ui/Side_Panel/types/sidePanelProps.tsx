import type { MapNode, NodeRoute} from "../../../api/types/types_api";
export type SearchUiProps = {
    list: MapNode[];
    loading?: boolean;     
    error?: unknown; 
    dispatch?: React.Dispatch<any>;
    onSelect: (node: MapNode) => void;
    onDirections: () => void;
}

export type NodeLocationDetailsProps = Pick<SearchUiProps, "onDirections"> & {
    selectedNodeName: string | null;
    onBack: () => void;
}

export type NodeDirectionsProps = Pick<SearchUiProps, "list"> & {
    onBack: () => void;
    onSelectedRouteNode: (node: NodeRoute) => void;
}

