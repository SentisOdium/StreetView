import { useReducer, useState, useEffect, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails"
import PanoramaViewer from "../components/ui/Panorama_Assests/PanoramaViewer"
import NodeDirections from "../components/ui/Side_Panel/child_Panel/nodeDirections"
import SearchUI2 from "../components/ui/Side_Panel/child_Panel/searchUI2"
import useAutoCompleteFetch from "../components/hooks/useAutocomplete"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import MapOverlay from "../components/ui/Map_Assets/MapOverlay"

import { reducer, initialState } from "../components/utils/reducer"
import type { MapNode } from "../components/api/types/types_api"


export default function HomePage() {
    const { list, fullList, loading, error } = useAutoCompleteFetch()
    const location = useLocation()

    const [state, dispatch] = useReducer(reducer, initialState);
    const { stack, activeNodeId, activeNodeName, lastMainNodeId, lastMainNodeName, directionsState } = state;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileHeight, setMobileHeight] = useState<'hidden' | 'mid' | 'expanded'>('mid');
    const [viewMode, setViewMode] = useState<'streetview' | 'map'>('map');

    useEffect(() => {
        if (activeNodeId != null) {
            setViewMode('streetview');
        } else {
            setViewMode('map');
        }
    }, [activeNodeId]);

    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 768,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [dragOffset, setDragOffset] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const startYRef = useRef<number>(0);
    const startOffsetRef = useRef<number>(0);
    const hasDraggedRef = useRef<boolean>(false);

    const getTargetTranslation = (state: 'hidden' | 'mid' | 'expanded', height: number) => {
        const maxHeight = height;
        const midHeight = height * 0.45;
        const handleHeight = 32;
        if (state === 'expanded') {
            return 0;
        }
        if (state === 'mid') return maxHeight - midHeight;
        
        const currentType = stack.at(-1)?.type;
        const hasBothLocations = !!directionsState.locationA && !!directionsState.locationB;
        if (state === 'hidden' && currentType === 'directions' && hasBothLocations) {
            return maxHeight;
        }
        
        return maxHeight - handleHeight;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        setIsDragging(true);
        hasDraggedRef.current = false;
        startYRef.current = e.clientY;
        startOffsetRef.current = getTargetTranslation(mobileHeight, windowDimensions.height);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startYRef.current;
        if (Math.abs(deltaY) > 5) {
            hasDraggedRef.current = true;
        }
        const nextTranslation = startOffsetRef.current + deltaY;

        const maxHeight = windowDimensions.height;
        const handleHeight = 32;
        const minTranslation = 0;
        const maxTranslation = maxHeight - handleHeight;

        const constrained = Math.max(minTranslation, Math.min(maxTranslation, nextTranslation));
        setDragOffset(constrained - startOffsetRef.current);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);

        const currentTargetTranslation = getTargetTranslation(mobileHeight, windowDimensions.height);
        const finalTranslation = currentTargetTranslation + dragOffset;
        setDragOffset(0);

        if (!hasDraggedRef.current) {
            setMobileHeight(prev => {
                if (prev === 'hidden') return 'mid';
                if (prev === 'mid') return 'expanded';
                return 'hidden';
            });
            return;
        }

        const tExpanded = getTargetTranslation('expanded', windowDimensions.height);
        const tMid = getTargetTranslation('mid', windowDimensions.height);
        const tHidden = getTargetTranslation('hidden', windowDimensions.height);

        const dExpanded = Math.abs(finalTranslation - tExpanded);
        const dMid = Math.abs(finalTranslation - tMid);
        const dHidden = Math.abs(finalTranslation - tHidden);

        const minDist = Math.min(dExpanded, dMid, dHidden);
        if (minDist === dExpanded) {
            setMobileHeight('expanded');
        } else if (minDist === dMid) {
            setMobileHeight('mid');
        } else {
            setMobileHeight('hidden');
        }
    };

    const isTransitional = (nodeId: number | null) => {
        if (nodeId == null || !fullList) return false;
        const node = fullList.find((n) => n.id === nodeId);
        return node?.type === "transitional";
    };

    const handleNavigate = (destinationId: number) => {
        const resolvedNode = fullList?.find((n) => n.id === destinationId);
        if (!resolvedNode) return;

        if (stack.at(-1)?.type === "directions") {
            dispatch({
                type: "SET_ACTIVE_NODE",
                payload: {
                    id: resolvedNode.id,
                    name: resolvedNode.node_name,
                },
            });
        } else {
            dispatch({
                type: "NAVIGATE_NODE",
                payload: {
                    id: resolvedNode.id,
                    name: resolvedNode.node_name,
                    type: resolvedNode.type,
                },
            });
        }
    };

    const handleSelectedRouteNode = useCallback((node: any) => {
        dispatch({
            type: "SET_ACTIVE_NODE",
            payload: {
                id: node.id,
                name: node.name,
            },
        });
    }, [dispatch]);

    const handleUpdateDirections = useCallback((data: any) => {
        dispatch({
            type: "UPDATE_DIRECTIONS_STATE",
            payload: data,
        });
    }, [dispatch]);

    useEffect(() => {
        if (location.state?.targetNode) {
            const targetNode = location.state.targetNode;
            dispatch({
                type: "SELECT_NODE",
                payload: {
                    id: targetNode.id,
                    name: targetNode.node_name,
                    type: targetNode.type,
                },
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        if (fullList && fullList.length > 0) {
            const queryParams = new URLSearchParams(window.location.search);
            const nodeIdParam = queryParams.get("nodeId");
            if (nodeIdParam) {
                const node = fullList.find((item) => String(item.id) === nodeIdParam);
                if (node) {
                    dispatch({
                        type: "SELECT_NODE",
                        payload: {
                            id: node.id,
                            name: node.node_name,
                            type: node.type,
                        },
                    });
                }
                // Silently clear the query params from the URL address bar
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }, [fullList]);

    const currentPanel = stack.at(-1);

    // Automatically expand the panel on navigation
    useEffect(() => {
        setIsCollapsed(false);
        setMobileHeight('mid');
    }, [currentPanel?.type]);

    if (!currentPanel) return null;

    const isDirections = currentPanel.type === "directions";
    const hasActivePano = activeNodeId != null;
    const isMobile = windowDimensions.width < 768;
    const hasDirectionsPanel = stack.some(p => p.type === "directions");

    // Determine the offset class for desktop when side panel is open
    const desktopOffsetClass = isCollapsed ? "left-0 w-full" : "left-0 md:left-120 md:w-[calc(100vw-30rem)]";

    const renderMainLayout = () => {
        if (isDirections) {
            if (hasActivePano) {
                // Split Screen Layout
                if (isMobile) {
                    return (
                        <div className="absolute inset-0 flex flex-col z-0">
                            {/* Top Half: Street View */}
                            <div className="w-full h-[60vh] relative bg-black">
                                <PanoramaViewer
                                    nodeId={activeNodeId!}
                                    onNavigate={handleNavigate}
                                />
                            </div>
                            {/* Bottom Half: 2D Map */}
                            <div className="w-full h-[40vh] relative bg-slate-100">
                                <MapOverlay
                                    activeNodeId={activeNodeId}
                                    fullList={fullList || []}
                                    onNavigate={handleNavigate}
                                    directionsState={directionsState}
                                    isMinimized={false}
                                    onUpdateDirectionsState={handleUpdateDirections}
                                    showRoute={isDirections}
                                />
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className={`absolute top-0 bottom-0 right-0 ${desktopOffsetClass} transition-all duration-300 flex flex-row z-0`}>
                            {/* Left Half: Street View */}
                            <div className="w-3/5 h-full relative bg-black border-r border-slate-200 dark:border-slate-800">
                                <PanoramaViewer
                                    nodeId={activeNodeId!}
                                    onNavigate={handleNavigate}
                                />
                            </div>
                            {/* Right Half: 2D Map */}
                            <div className="w-2/5 h-full relative bg-slate-100">
                                <MapOverlay
                                    activeNodeId={activeNodeId}
                                    fullList={fullList || []}
                                    onNavigate={handleNavigate}
                                    directionsState={directionsState}
                                    isMinimized={false}
                                    onUpdateDirectionsState={handleUpdateDirections}
                                    showRoute={isDirections}
                                />
                            </div>
                        </div>
                    );
                }
            } else {
                // Directions open but no active panorama node: show map fullscreen/offset
                return (
                    <div className={`absolute top-0 bottom-0 right-0 ${isMobile ? "inset-0" : desktopOffsetClass} transition-all duration-300 z-0`}>
                        <MapOverlay
                            activeNodeId={activeNodeId}
                            fullList={fullList || []}
                            onNavigate={handleNavigate}
                            directionsState={directionsState}
                            isMinimized={false}
                            onUpdateDirectionsState={handleUpdateDirections}
                            showRoute={isDirections}
                        />
                    </div>
                );
            }
        } else {
            // Non-Directions Layout (Google Maps Mode with Mini-box Swap)
            if (!hasActivePano) {
                // Just Map fullscreen
                return (
                    <div className="absolute inset-0 z-0">
                        <MapOverlay
                            activeNodeId={activeNodeId}
                            fullList={fullList || []}
                            onNavigate={handleNavigate}
                            directionsState={directionsState}
                            isMinimized={false}
                            onUpdateDirectionsState={handleUpdateDirections}
                            showRoute={isDirections}
                        />
                    </div>
                );
            }

            // We have a panorama. Main view and small box are determined by viewMode
            const isStreetviewMain = viewMode === "streetview";

            return (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {/* Fullscreen Base Layer (Streetview or Map) */}
                    <div className="absolute inset-0 z-0">
                        {isStreetviewMain ? (
                            <PanoramaViewer
                                nodeId={activeNodeId!}
                                onNavigate={handleNavigate}
                            />
                        ) : (
                            <MapOverlay
                                activeNodeId={activeNodeId}
                                fullList={fullList || []}
                                onNavigate={handleNavigate}
                                directionsState={directionsState}
                                isMinimized={false}
                                onUpdateDirectionsState={handleUpdateDirections}
                                showRoute={isDirections}
                            />
                        )}
                    </div>

                    {/* Bottom Right Small Box for Swapping */}
                    {mobileHeight !== "expanded" && (
                        <div
                            onClick={() => setViewMode(isStreetviewMain ? "map" : "streetview")}
                            className="fixed z-40 transition-all duration-300 cursor-pointer rounded-2xl shadow-2xl border-2 border-white hover:scale-105 hover:shadow-cyan-500/20 overflow-hidden group w-64 h-44 max-md:w-40 max-md:h-28"
                            style={{
                                bottom: isMobile
                                    ? (mobileHeight === "mid"
                                        ? "calc(45vh + 16px)"
                                        : "24px")
                                    : "24px",
                                right: isMobile ? "16px" : "24px"
                            }}
                        >
                            {/* Inner Component for Small Box */}
                            <div className="w-full h-full relative pointer-events-none">
                                {isStreetviewMain ? (
                                    <MapOverlay
                                        activeNodeId={activeNodeId}
                                        fullList={fullList || []}
                                        onNavigate={handleNavigate}
                                        directionsState={directionsState}
                                        isMinimized={true}
                                        onUpdateDirectionsState={handleUpdateDirections}
                                        showRoute={isDirections}
                                    />
                                ) : (
                                    <PanoramaViewer
                                        nodeId={activeNodeId!}
                                        onNavigate={handleNavigate}
                                    />
                                )}
                                {/* Transparent Click Interceptor */}
                                <div className="absolute inset-0 z-20 bg-transparent" />
                                {/* Label Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-semibold select-none z-30">
                                    {isStreetviewMain ? "Expand Map" : "Expand Street View"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <>
            <div id="mobile-directions-input-portal" className="absolute top-0 left-0 w-full z-10 md:hidden" />
            {/* Search Bar Panel (z-20) */}
            {currentPanel.type !== "directions" && (
                <div className={`absolute top-0 left-0 z-20 w-full md:w-120 transition-transform duration-500 ease-in-out
                    ${isCollapsed ? "md:-translate-x-full" : "md:translate-x-0"}`}>
                    <SearchUI2
                        list={list}
                        activeNodeName={
                            activeNodeId && isTransitional(activeNodeId)
                                ? (lastMainNodeName || "")
                                : (activeNodeName || "")
                        }
                        loading={loading}
                        error={error}
                        onClear={() => dispatch({ type: "RESET_TO_SEARCH" })}
                        onSelect={(node: MapNode) =>
                            dispatch({
                                type: "SELECT_NODE",
                                payload: {
                                    id: node.id,
                                    name: node.node_name,
                                    type: node.type,
                                },
                            })
                        }
                        onDirections={() =>
                            dispatch({ type: "SHOW_DIRECTIONS" })
                        }
                    />
                </div>
            )}

            {/* Unified Sliding Container */}
            {currentPanel.type !== "search" && (
                <div className={`absolute z-20 md:z-10 
                    bottom-0 left-0 w-full md:top-0 md:bottom-auto md:w-120 
                    rounded-t-[32px] md:rounded-t-none md:rounded-r-[32px] 
                    bg-white shadow-2xl flex flex-col 
                    h-screen md:h-screen
                    ${isCollapsed 
                        ? "md:-translate-x-full" 
                        : "md:translate-x-0"
                    } 
                    ${isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'}`}
                    style={{
                        transform: windowDimensions.width < 768
                            ? `translateY(${
                                isDragging 
                                    ? getTargetTranslation(mobileHeight, windowDimensions.height) + dragOffset 
                                    : getTargetTranslation(mobileHeight, windowDimensions.height)
                              }px)`
                            : undefined
                    }}
                >
                    {/* Inner Content Wrapper (for rounding and scroll clipping) */}
                    <div className="w-full h-full overflow-hidden flex flex-col rounded-t-[32px] md:rounded-t-none md:rounded-r-[32px] relative">
                        {/* Mobile Drag/Tap Handle */}
                        <div 
                            className="md:hidden absolute top-0 left-0 right-0 h-8 flex items-center justify-center z-30 cursor-grab active:cursor-grabbing select-none touch-none"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            <div className="w-12 h-1.5 bg-slate-300 rounded-full mt-2.5 hover:bg-slate-400 transition-colors" />
                        </div>

                        {/* Content Side Panels (z-10) */}
                        <div className="absolute top-0 left-0 z-10 w-full h-full">
                            {currentPanel.type === "location" && (
                                <NodeLocationDetails
                                    selectedNodeId={
                                        isTransitional(currentPanel.nodeId)
                                            ? (lastMainNodeId ?? currentPanel.nodeId)
                                            : currentPanel.nodeId
                                    }
                                    hasDirectionsPanel={hasDirectionsPanel}
                                    canGoBack={stack.length > 2}
                                    mobileHeight={mobileHeight}
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
                                    fullList={fullList || []}
                                    activeNodeId={activeNodeId}
                                    directionsState={directionsState}
                                    mobileHeight={mobileHeight}
                                    setMobileHeight={setMobileHeight}
                                    isMobile={windowDimensions.width < 768}
                                    onBack={() =>
                                        dispatch({ type: "GO_BACK" })
                                    }
                                    onSelectedRouteNode={handleSelectedRouteNode}
                                    onUpdate={(data) =>
                                        dispatch({
                                            type: "UPDATE_DIRECTIONS_STATE",
                                            payload: data,
                                        })
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Slide Toggle Collapse Button (Desktop Only) - Rendered outside overflow-hidden wrapper */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            hidden md:flex absolute top-1/2 -right-10 -translate-y-1/2
                            p-2.5 rounded-r-2xl shadow-2xl border border-l-0
                            active:scale-95 transition-all duration-300
                            items-center justify-center cursor-pointer z-30
                            ${isCollapsed
                                ? "bg-[#800000] text-white border-white/10 hover:bg-[#660000]"
                                : "bg-white text-[#800000] border-gray-200 hover:bg-gray-50"
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

                </div>
            )}
            {renderMainLayout()}

        </>
    )
}
