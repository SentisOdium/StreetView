import type { MapNode, NodeRoute} from "../../../api/types/types_api";
export type SearchUiProps = {
    list: MapNode[];
    loading?: boolean;     
    error?: unknown; 
    onSelect: (node: MapNode) => void;
    onDirections: () => void;
    onClear: () => void;
}

export type NodeLocationDetailsProps = Pick<SearchUiProps, "onDirections"> & {
    selectedNodeName: string | null;
    onBack: () => void;
    hasDirectionsPanel?: boolean;
}

export type NodeDirectionsProps = {
  list: MapNode[];
  directionsState: {
    locationA: string;
    locationB: string;
    route?: NodeRoute[];
  };

  onUpdate: (data: Partial<NodeDirectionsProps["directionsState"]>) => void;
  onSelectedRouteNode: (node: NodeRoute) => void;
  onBack: () => void;
};

