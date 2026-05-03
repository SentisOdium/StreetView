export function reducer(state: State, action: Action): State {
    switch (action.type) {

        case "SELECT_NODE":
            return {
                ...state,
                selectedNodeId: action.payload.id,
                selectedNodeName: action.payload.name,
                mode: "location",
            };

        case "SHOW_LOCATION":
            return { ...state, mode: "location" };

        case "SHOW_DIRECTIONS":
            return { ...state, mode: "directions" };

        case "RESET_TO_SEARCH":
            return {
                mode: "search",
                selectedNodeId: null,
                selectedNodeName: null,
            };

        default:
            return state;
    }
}