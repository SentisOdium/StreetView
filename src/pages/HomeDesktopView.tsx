import React from "react";
import SearchUI2 from "../components/ui/Side_Panel/child_Panel/searchUI2";
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails";
import NodeDirections from "../components/ui/Side_Panel/child_Panel/nodeDirections";
import PanoramaViewer from "../components/ui/Panorama_Assests/PanoramaViewer";
import MapOverlay from "../components/ui/Map_Assets/MapOverlay";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { MapNode } from "../components/api/types/types_api";

export interface HomeViewProps {
  state: any;
  dispatch: any;
  list: MapNode[];
  fullList: MapNode[];
  loading: boolean;
  error: string | null;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean | ((prev: boolean) => boolean)) => void;
  mobileHeight: 'hidden' | 'mid' | 'expanded';
  setMobileHeight: React.Dispatch<React.SetStateAction<'hidden' | 'mid' | 'expanded'>>;
  viewMode: 'streetview' | 'map';
  setViewMode: (v: 'streetview' | 'map') => void;
  handleNavigate: (id: number) => void;
  isTransitional: (id: number | null) => boolean;
  handleSelectedRouteNode: (node: any) => void;
  handleUpdateDirections: (data: any) => void;
  windowDimensions: { width: number; height: number };
}

export default function HomeDesktopView({
  state,
  dispatch,
  list,
  fullList,
  loading,
  error,
  isCollapsed,
  setIsCollapsed,
  mobileHeight,
  setMobileHeight,
  viewMode,
  setViewMode,
  handleNavigate,
  isTransitional,
  handleSelectedRouteNode,
  handleUpdateDirections,
}: HomeViewProps) {
  const { stack, activeNodeId, activeNodeName, lastMainNodeId, lastMainNodeName, directionsState } = state;
  const currentPanel = stack.at(-1);

  if (!currentPanel) return null;

  const isDirections = currentPanel.type === "directions";
  const hasActivePano = activeNodeId != null;
  const hasDirectionsPanel = stack.some((p: any) => p.type === "directions");
  const desktopOffsetClass = isCollapsed ? "left-0 w-full" : "left-0 left-120 w-[calc(100vw-30rem)]";

  const renderMainLayout = () => {
    if (isDirections) {
      if (hasActivePano) {
        return (
          <div className={`absolute top-0 bottom-0 right-0 ${desktopOffsetClass} transition-all duration-300 flex flex-row z-0`}>
            <div className="w-3/5 h-full relative bg-black border-r border-slate-200 dark:border-slate-800">
              <PanoramaViewer nodeId={activeNodeId!} onNavigate={handleNavigate} />
            </div>
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
      } else {
        return (
          <div className={`absolute top-0 bottom-0 right-0 ${desktopOffsetClass} transition-all duration-300 z-0`}>
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
      if (!hasActivePano) {
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

      const isStreetviewMain = viewMode === "streetview";

      return (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 z-0">
            {isStreetviewMain ? (
              <PanoramaViewer nodeId={activeNodeId!} onNavigate={handleNavigate} />
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

          <div
            onClick={() => setViewMode(isStreetviewMain ? "map" : "streetview")}
            className="fixed z-40 transition-all duration-300 cursor-pointer rounded-2xl shadow-2xl border-2 border-white hover:scale-105 hover:shadow-cyan-500/20 overflow-hidden group w-64 h-44 bottom-6 right-6"
          >
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
                <PanoramaViewer nodeId={activeNodeId!} onNavigate={handleNavigate} />
              )}
              <div className="absolute inset-0 z-20 bg-transparent" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-semibold select-none z-30">
                {isStreetviewMain ? "Expand Map" : "Expand Street View"}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {currentPanel.type !== "directions" && (
        <div className={`absolute top-0 left-0 z-20 w-120 transition-transform duration-500 ease-in-out ${isCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
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
                payload: { id: node.id, name: node.node_name, type: node.type },
              })
            }
            onDirections={() => dispatch({ type: "SHOW_DIRECTIONS" })}
          />
        </div>
      )}

      {currentPanel.type !== "search" && (
        <div className={`absolute top-0 bottom-auto z-10 w-120 rounded-r-[32px] bg-white shadow-2xl flex flex-col h-screen transition-transform duration-300 ease-out ${isCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
          <div className="w-full h-full overflow-hidden flex flex-col rounded-r-[32px] relative">
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
                  onDirections={() => dispatch({ type: "SHOW_DIRECTIONS" })}
                  onBack={() => dispatch({ type: "GO_BACK" })}
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
                  isMobile={false}
                  onBack={() => dispatch({ type: "GO_BACK" })}
                  onSelectedRouteNode={handleSelectedRouteNode}
                  onUpdate={(data: any) =>
                    dispatch({ type: "UPDATE_DIRECTIONS_STATE", payload: data })
                  }
                />
              )}
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex absolute top-1/2 -right-10 -translate-y-1/2 p-2.5 rounded-r-2xl shadow-2xl border border-l-0 active:scale-95 transition-all duration-300 items-center justify-center cursor-pointer z-30 ${
              isCollapsed
                ? "bg-[#800000] text-white border-white/10 hover:bg-[#660000]"
                : "bg-white text-[#800000] border-gray-200 hover:bg-gray-50"
            }`}
            style={{ height: "50px", width: "40px" }}
            aria-label={isCollapsed ? "Show side panel" : "Hide side panel"}
          >
            {isCollapsed ? <ChevronRightIcon sx={{ fontSize: 24 }} /> : <ChevronLeftIcon sx={{ fontSize: 24 }} />}
          </button>
        </div>
      )}

      {renderMainLayout()}
    </>
  );
}
