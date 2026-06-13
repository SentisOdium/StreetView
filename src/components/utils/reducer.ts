import type { NodeRoute } from "../api/types/types_api";

type Panel =
  | { type: "search" }
  | { type: "location"; nodeId: number; nodeName: string }
  | { type: "directions"; from: string | null };

type State = {
  stack: Panel[];
  activeNodeName: string;
  activeNodeId: number | null;
  directionsState: {
    locationA: string;
    locationB: string;
    route: NodeRoute[];
  };
};

type Action =
  | { type: "SELECT_NODE"; payload: { id: number; name: string } }
  | { type: "NAVIGATE_NODE"; payload: { id: number; name: string } }
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
  directionsState: {
    locationA: "",
    locationB: "",
    route: [],
  },
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_NODE": {
      const locationPanel = {
        type: "location" as const,
        nodeId: action.payload.id,
        nodeName: action.payload.name,
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
        stack,
      };
    }

    case "NAVIGATE_NODE": {
      const locationPanel = {
        type: "location" as const,
        nodeId: action.payload.id,
        nodeName: action.payload.name,
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
        stack,
      };
    }

    case "SHOW_DIRECTIONS": {
      const current = state.stack[state.stack.length - 1];
      const from = current.type === "location" ? current.nodeName : "";

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
    }

    case "GO_BACK": {
      if (state.stack.length === 1) return state;

      const nextStack = state.stack.slice(0, -1);
      const top = nextStack[nextStack.length - 1];

      return {
        ...state,
        stack: nextStack,
        activeNodeName: top.type === "location" ? top.nodeName : "",
        activeNodeId: top.type === "location" ? top.nodeId : null,
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
        stack: [{ type: "search" }],
      };

    default:
      return state;
  }
}
