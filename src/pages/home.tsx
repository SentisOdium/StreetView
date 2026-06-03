import { useReducer, useState, useEffect } from "react"
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails"
import Panorma from "../components/ui/Panorama_Assests/Panorma"
import NodeDirections from "../components/ui/Side_Panel/child_Panel/nodeDirections"
import SearchUI2 from "../components/ui/Side_Panel/child_Panel/searchUI2"
import useAutoCompleteFetch from "../components/hooks/useAutocomplete"
import LandingPage from "./landing"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import RedPanel from "../components/ui/Side_Panel/child_Panel/redPanel"
import { reducer, initialState } from "../components/utils/reducer"
import type { MapNode } from "../components/api/types/types_api"

    
export default function HomePage(){
    const {list, loading, error} = useAutoCompleteFetch()
   
    const [state, dispatch] = useReducer(reducer, initialState);
    const { stack, activeNodeName, directionsState } = state;
    const [isCollapsed, setIsCollapsed] = useState(false);



    const currentPanel = stack.at(-1);
    
    // Automatically expand the panel on navigation
    useEffect(() => {
        setIsCollapsed(false);
    }, [currentPanel?.type]);

    if (!currentPanel) return null;

    const hasDirectionsPanel = stack.some(p => p.type === "directions");

    return(
        <>
            <RedPanel />
            {/* Unified Sliding Container */}
            <div className={`absolute top-0 left-0 h-screen z-10 w-120 transition-transform duration-500 ease-in-out ${isCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
                {/* Search Bar Panel (z-20) */}
                
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

                {/* Content Side Panels (z-10) */}
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

                {/* Slide Toggle Collapse Button */}
                {currentPanel.type !== "search" && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            absolute top-1/2 -right-10 -translate-y-1/2
                            p-2.5 rounded-r-2xl shadow-2xl border border-l-0
                            active:scale-95 transition-all duration-300
                            flex items-center justify-center cursor-pointer z-30
                            ${isCollapsed
                                ? "translate-x-full bg-white text-[#800000] "
                                : "bg-[#800000] text-white border-white/10 hover:bg-[#660000]"
                            }
                        `}
                        style={{ height: "50px", width: "40px" }}
                        aria-label={isCollapsed ? "Show side panel" : "Hide side panel"}
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon sx={{ fontSize: 24 }} />
                        ) : (
                            <ChevronLeftIcon sx={{ fontSize: 24 }} />
                        )}
                    </button>
                )}

            </div>
                
           

            <div className="absolute inset-0 z-0">
                {activeNodeName ? (
                    <Panorma
                        nodeName={activeNodeName}
                        onNavigate={(nodeId, destinationName) => {
                            const fromList = list.find((n) => n.id === nodeId);
                            const name = fromList?.node_name ?? destinationName;
                            if (!name || name === activeNodeName) {
                                return;
                            }

                            dispatch({
                                type: "SELECT_NODE",
                                payload: {
                                    id: fromList?.id ?? nodeId,
                                    name,
                                },
                            });
                        }}
                    />
                ) : (
                    <LandingPage />
                )}
            </div>

        </>
    )
}
