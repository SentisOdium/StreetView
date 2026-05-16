import { useReducer } from "react"
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails"
import Panorma from "../components/ui/Panorama_Assests/Panorma"
import NodeDirections from "../components/ui/Side_Panel/child_Panel/nodeDirections"
import SearchUI2 from "../components/ui/Side_Panel/child_Panel/searchUI2"
import useAutoCompleteFetch from "../components/hooks/useAutocomplete"

import { reducer, initialState } from "../components/utils/reducer"
import type { MapNode } from "../components/api/types/types_api"

    
export default function HomePage(){
    const {list, loading, error} = useAutoCompleteFetch()
   
    const [state, dispatch] = useReducer(reducer, initialState);
    const { stack, directionsState } = state;

    const currentPanel = stack.at(-1);
    if (!currentPanel) return null;

    const locationPanels = stack.filter(p => p.type === "location");
    const latestLocationPanel = locationPanels.at(-1);

    const hasDirectionsPanel = stack.some(p => p.type === "directions");

    return(
        <>
            <div className="absolute top-0 left-0 z-20">
  
                {currentPanel.type !== "directions" && (
                    <SearchUI2
                        list={list}
                        loading={loading}
                        error={error}
                        onClear={() => dispatch({ type: "RESET_TO_SEARCH"})}
                        onSelect={(node: MapNode) =>
                            dispatch({
                            type: "SELECT_NODE",
                            payload: {
                                id: node.id,
                                name: node.node_name,
                            },
                            })
                        }
                        onDirections={() =>
                            dispatch({ type: "SHOW_DIRECTIONS" })
                        }
                    />
                )}
            </div>
            <div className="absolute top-0 left-0 z-10">
                {currentPanel.type === "location" && (
                    <NodeLocationDetails
                        selectedNodeName={currentPanel.nodeName}
                        hasDirectionsPanel={hasDirectionsPanel}
                        onDirections={() =>
                            dispatch({ type: "SHOW_DIRECTIONS" })
                        }
                        onBack={() =>
                            dispatch({ type: "GO_BACK" })
                        }
                    />
                )}

                {currentPanel.type === "directions" && (
                    <NodeDirections
                        list={list}
                        directionsState={directionsState}
                        onBack={() =>
                            dispatch({ type: "GO_BACK" })
                        }
                        onSelectedRouteNode={(node) =>
                            dispatch({
                            type: "SELECT_NODE",
                            payload: {
                                id: node.id,
                                name: node.name,
                            },
                            })
                        }
                        onUpdate={(data) =>
                            dispatch({
                            type: "UPDATE_DIRECTIONS_STATE",
                            payload: data,
                            })
                        }
                    />
                )}
            </div>
                
           

            <div className="absolute inset-0 z-0">
                <Panorma
                    nodeName={latestLocationPanel?.nodeName || ""}
                    onNavigate={(nodeName) => {
                        if (nodeName === latestLocationPanel?.nodeName) {
                            return;
                        }

                        dispatch({
                            type: "SELECT_NODE",
                            payload: {
                                id: -1,
                                name: nodeName,
                            },
                        });
                    }}
                />   
            </div>

        </>
    )
}
