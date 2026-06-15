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
    };

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
      const isTransitional = current.type === "location" && current.nodeType === "transitional";
      const from = current.type === "location" ? (isTransitional ? "Current Location" : current.nodeName) : "";

      return {
        ...state,
        stack: [
          ...state.stack,
          {
            type: "directions",
            from: from || null,
          },
        ],
        directionsState: {
          ...state.directionsState,
          locationA: from,
          locationB: "",
          route: [],
        },
      };
    }    case "GO_BACK": {
      if (state.stack.length === 1) return state;

      const nextStack = state.stack.slice(0, -1);
      const top = nextStack[nextStack.length - 1];

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
    case "UPDATE_DIRECTIONS_STATE":
      return {
        ...state,
        directionsState: {
          ...state.directionsState,
          ...action.payload,
        },
      };

    case "RESET_TO_SEARCH":
      return {
        ...state,
        activeNodeName: "",
        activeNodeId: null,
        lastMainNodeId: null,
        lastMainNodeName: "",
        stack: [{ type: "search" }],
      };

    default:
      return state;
  }
}
