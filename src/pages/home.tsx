import { useReducer } from "react"
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails"
import Panorma from "../components/ui/Panorama_Assests/Panorma"
import NodeDirections from "../components/ui/Side_Panel/child_Panel/nodeDirections"
import SearchUI2 from "../components/ui/Side_Panel/child_Panel/searchUI2"
import useAutoCompleteFetch from "../components/hooks/useAutocomplete"

import { initialState, reducer } from "../components/utils/reducer"
import type { MapNode } from "../components/api/types/types_api"

    
export default function HomePage(){

    const [state, dispatch] = useReducer(reducer, initialState)
    const { present } = state
    
    const {list, loading, error} = useAutoCompleteFetch()

    return(
        <>
            <div >
                <div className="absolute top-0 left-0  z-10">
                    
                    <div className="absolute top-0 left-0  z-10">

                        {present.mode !== "directions" && (
                            <SearchUI2
                                list={list}
                                loading={loading}
                                error={error}
                                dispatch={dispatch}
                                onSelect={(node: MapNode) => 
                                    dispatch({
                                        type: "SELECT_NODE",
                                        payload: {
                                            id: node.id,
                                            name: node.node_name
                                        }
                                    })
                                }

                                onDirections={() => dispatch({ type: "SHOW_DIRECTIONS" })}
                                />
                                
                        )}
                        
                    </div>
                        
                    {present.mode === "location" && (
                        <NodeLocationDetails
                            selectedNodeName={present.selectedNodeName}
                            onDirections={() =>
                                dispatch({ type: "SHOW_DIRECTIONS" })
                            }
                            onBack={() =>
                                dispatch({ type: "GO_BACK" })
                            }
                        />
                    )}

                    {present.mode === "directions" && (
                        <NodeDirections
                            list={list}
                            onBack={() =>
                                dispatch({ type: "GO_BACK" })
                            }
                        />
                    )}

            
                </div>

            </div>
            
            <div className="absolute inset-0 z-0">
                <Panorma nodeName={present.selectedNodeName || ""}/>   
            </div>

        </>
    )
}