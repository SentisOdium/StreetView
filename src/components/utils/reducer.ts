import type { NodeRoute } from "../api/types/types_api";

type Panel =
  | { type: "search" }
  | { type: "location"; nodeId: number; nodeName: string; nodeType?: string }
  | { type: "directions"; from: string | null };

type State = {
  stack: Panel[];
  activeNodeName: string;
  activeNodeId: number | null;
  lastMainNodeId: number | null;
  lastMainNodeName: string;
  directionsState: {
    locationA: string;
    locationB: string;
    route: NodeRoute[];
    activeRouteIndex: number;
  };
};

type Action =
  | { type: "SELECT_NODE"; payload: { id: number; name: string; type?: string } }
  | { type: "NAVIGATE_NODE"; payload: { id: number; name: string; type?: string } }
  | { type: "SHOW_DIRECTIONS" }
  | { type: "RESET_TO_SEARCH" }
  | { type: "GO_BACK" }
  | {
      type: "UPDATE_DIRECTIONS_STATE";
      payload: Partial<State["directionsState"]>;
    }
  | { type: "SET_ACTIVE_NODE"; payload: { id: number; name: string } };

export const initialState: State = {
  stack: [{ type: "search" }],
  activeNodeName: "",
  activeNodeId: null,
  lastMainNodeId: null,
  lastMainNodeName: "",
  directionsState: {
    locationA: "",
    locationB: "",
    route: [],
    activeRouteIndex: 0,
  },
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_NODE": {
      const isTransitional = action.payload.type === "transitional";
      const locationPanel = {
        type: "location" as const,
        nodeId: action.payload.id,
        nodeName: action.payload.name,
        nodeType: action.payload.type,
      };
      const top = state.stack[state.stack.length - 1];
      const stack =
        top?.type === "location"
          ? [...state.stack.slice(0, -1), locationPanel]
          : [...state.stack, locationPanel];

      return {
        ...state,
        activeNodeName: action.payload.name,
        activeNodeId: action.payload.id,
        lastMainNodeId: isTransitional ? state.lastMainNodeId : action.payload.id,
        lastMainNodeName: isTransitional ? state.lastMainNodeName : action.payload.name,
        stack,
      };
    }

    case "NAVIGATE_NODE": {
      const isTransitional = action.payload.type === "transitional";
      const locationPanel = {
        type: "location" as const,
        nodeId: action.payload.id,
        nodeName: action.payload.name,
        nodeType: action.payload.type,
      };
      const top = state.stack[state.stack.length - 1];
      const stack =
        top?.type === "location"
          ? [...state.stack.slice(0, -1), locationPanel]
          : [...state.stack, locationPanel];

      return {
        ...state,
        activeNodeName: action.payload.name,
        activeNodeId: action.payload.id,
        lastMainNodeId: isTransitional ? state.lastMainNodeId : action.payload.id,
        lastMainNodeName: isTransitional ? state.lastMainNodeName : action.payload.name,
        stack,
      };
    }

    case "SHOW_DIRECTIONS": {
      const current = state.stack[state.stack.length - 1];
      
      let locationA = "";
      let locationB = "";

      if (current.type === "location") {
        // If looking at a location different from active node, route from active node to looked-at location
        if (state.activeNodeId !== null && current.nodeId !== state.activeNodeId) {
          locationA = "Current Location";
          locationB = current.nodeName;
        } else {
          const isTransitional = current.nodeType === "transitional";
          locationA = isTransitional ? "Current Location" : current.nodeName;
          locationB = "";
        }
      } else {
        locationA = state.activeNodeId !== null ? "Current Location" : "";
        locationB = "";
      }

      return {
        ...state,
        stack: [
          ...state.stack,
          {
            type: "directions",
            from: locationA || null,
          },
        ],
        directionsState: {
          ...state.directionsState,
          locationA,
          locationB,
          route: [],
          activeRouteIndex: 0,
        },
      };
    }    case "GO_BACK": {
      if (state.stack.length === 1) return state;

      const poppingPanel = state.stack[state.stack.length - 1];
      let nextStack = state.stack.slice(0, -1);
      let top = nextStack[nextStack.length - 1];

      if (poppingPanel.type === "directions" && state.activeNodeId !== null && top?.type === "location") {
        top = {
          ...top,
          nodeId: state.activeNodeId,
          nodeName: state.activeNodeName,
        };
        nextStack = [...nextStack.slice(0, -1), top];
      }

      let lastMainNodeId: number | null = null;
      let lastMainNodeName = "";

      for (let i = nextStack.length - 1; i >= 0; i--) {
        const p = nextStack[i];
        if (p.type === "location" && p.nodeType !== "transitional") {
          lastMainNodeId = p.nodeId;
          lastMainNodeName = p.nodeName;
          break;
        }
      }

      return {
        ...state,
        stack: nextStack,
        activeNodeName: top.type === "location" ? top.nodeName : (top.type === "directions" ? state.activeNodeName : ""),
        activeNodeId: top.type === "location" ? top.nodeId : (top.type === "directions" ? state.activeNodeId : null),
        lastMainNodeId,
        lastMainNodeName,
      };
    }
    case "UPDATE_DIRECTIONS_STATE": {
      const resetRouteIndex = action.payload.locationA !== undefined || action.payload.locationB !== undefined;
      return {
        ...state,
        directionsState: {
          ...state.directionsState,
          ...action.payload,
          activeRouteIndex: resetRouteIndex ? 0 : (action.payload.activeRouteIndex !== undefined ? action.payload.activeRouteIndex : state.directionsState.activeRouteIndex),
        },
      };
    }

    case "RESET_TO_SEARCH":
      return {
        ...state,
        activeNodeName: "",
        activeNodeId: null,
        lastMainNodeId: null,
        lastMainNodeName: "",
        stack: [{ type: "search" }],
        directionsState: {
          locationA: "",
          locationB: "",
          route: [],
          activeRouteIndex: 0,
        },
      };

    case "SET_ACTIVE_NODE":
      return {
        ...state,
        activeNodeId: action.payload.id,
        activeNodeName: action.payload.name,
      };

    default:
      return state;
  }
}
