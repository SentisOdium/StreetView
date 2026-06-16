import type { MapNode, NodeRoute} from "../../../api/types/types_api";
export type SearchUiProps = {
    list: MapNode[];
    activeNodeName?: string;
    loading?: boolean;     
    error?: unknown; 
    onSelect: (node: MapNode) => void;
    onDirections: () => void;
    onClear: () => void;
}

export type NodeLocationDetailsProps = Pick<SearchUiProps, "onDirections"> & {
    selectedNodeId: number | null;
    selectedNodeName?: string | null;
    onBack: () => void;
    hasDirectionsPanel?: boolean;
    canGoBack?: boolean;
    mobileHeight?: 'hidden' | 'mid' | 'expanded';
}

export type NodeDirectionsProps = {
  list: MapNode[];
  fullList: MapNode[];
  activeNodeId: number | null;
  directionsState: {
    locationA: string;
    locationB: string;
    route?: NodeRoute[];
  };

  onUpdate: (data: Partial<NodeDirectionsProps["directionsState"]>) => void;
  onSelectedRouteNode: (node: NodeRoute) => void;
  onBack: () => void;
  mobileHeight?: 'hidden' | 'mid' | 'expanded';
};

