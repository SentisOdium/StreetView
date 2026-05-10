type Mode = "search" | "location" | "directions";

type StateSnapshot = {
    mode: Mode;
    selectedNodeId: number | null;
    selectedNodeName: string | null;
    locationA?: string | null;
}

type State =  {
    past: StateSnapshot[];
    present: StateSnapshot;
}

type Action =
    | { type: "SELECT_NODE"; payload: { id: number; name: string } }
    | { type: "SHOW_DIRECTIONS" }
    | { type: "RESET_TO_SEARCH" }
    | { type: "GO_BACK" };

export const initialState: State = {
    past: [],
    present:{
        mode: "search",
        selectedNodeId: null,
        selectedNodeName: null,
    }
}

export function reducer(state: State, action: Action): State {
    const { past, present } = state;

    switch (action.type){

        case "SELECT_NODE": {
            const newPresent: StateSnapshot = {
                mode: "location",
                selectedNodeId: action.payload.id,
                selectedNodeName: action.payload.name,
            }

            return {
                past: [...past, present],
                present: newPresent,
            }
        }

        case "SHOW_DIRECTIONS": {
            const newPresent: StateSnapshot = {
                ...present,
                mode: "directions",
                locationA: present.selectedNodeName
            }

            return {
                past: [...past, present],
                present: newPresent,
            }
        }

        case "RESET_TO_SEARCH": {
            const newPresent: StateSnapshot = {
                mode: "search",
                selectedNodeId: null,
                selectedNodeName: null,
            }

            return {
                past: [...past, present],
                present: newPresent,
            }
        }

         case "GO_BACK": {
            if (past.length === 0) return state;

            const previous = past[past.length - 1];

            return {
                past: past.slice(0, -1), 
                present: previous,
            };
        }

        default: return state;
    }
 }
