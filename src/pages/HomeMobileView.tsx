import React, { useState, useRef } from "react";
import SearchUI2 from "../components/ui/Side_Panel/child_Panel/searchUI2";
import NodeLocationDetails from "../components/ui/Side_Panel/child_Panel/nodeLocationDetails";
import NodeDirections from "../components/ui/Side_Panel/child_Panel/nodeDirections";
import PanoramaViewer from "../components/ui/Panorama_Assests/PanoramaViewer";
import MapOverlay from "../components/ui/Map_Assets/MapOverlay";
import type { HomeViewProps } from "./HomeDesktopView";
import type { MapNode } from "../components/api/types/types_api";

export default function HomeMobileView({
  state,
  dispatch,
  list,
  fullList,
  loading,
  error,
  isCollapsed,
  mobileHeight,
  setMobileHeight,
  viewMode,
  setViewMode,
  handleNavigate,
  isTransitional,
  handleSelectedRouteNode,
  handleUpdateDirections,
  windowDimensions,
}: HomeViewProps) {
  const { stack, activeNodeId, activeNodeName, lastMainNodeId, lastMainNodeName, directionsState } = state;
  const currentPanel = stack.at(-1);

  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  if (!currentPanel) return null;

  const isDirections = currentPanel.type === "directions";
  const hasActivePano = activeNodeId != null;
  const hasDirectionsPanel = stack.some((p: any) => p.type === "directions");

  const isCarouselMinimized = directionsState.isCarouselMinimized ?? false;
  const mapTopOffset = "80px";
  
  let mapBottomOffset = "160px";
  if (isDirections && directionsState.locationA && directionsState.locationB) {
    mapBottomOffset = isCarouselMinimized ? "80px" : "280px";
  } else if (mobileHeight === "mid") {
    mapBottomOffset = "calc(45vh + 16px)";
  }

  const getTargetTranslation = (st: 'hidden' | 'mid' | 'expanded', height: number) => {
    const maxHeight = height;
    const midHeight = height * 0.45;
    if (st === 'expanded') return 0;
    if (st === 'mid') return maxHeight - midHeight;

    const currentType = stack.at(-1)?.type;
    const hasBothLocations = !!directionsState.locationA && !!directionsState.locationB;
    if (st === 'hidden' && currentType === 'directions' && hasBothLocations) {
      return maxHeight;
    }
    return maxHeight - 32;
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
    const constrained = Math.max(0, Math.min(maxHeight - 32, nextTranslation));
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
      setMobileHeight((prev) => {
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

  const renderMainLayout = () => {
    if (isDirections) {
      if (hasActivePano) {
        return (
          <div className="absolute inset-0 flex flex-col z-0">
            <div className="w-full h-[60vh] relative bg-black">
              <PanoramaViewer nodeId={activeNodeId!} onNavigate={handleNavigate} />
            </div>
            <div className="w-full h-[40vh] relative bg-slate-100">
              <MapOverlay
                activeNodeId={activeNodeId}
                fullList={fullList || []}
                onNavigate={handleNavigate}
                directionsState={directionsState}
                isMinimized={false}
                onUpdateDirectionsState={handleUpdateDirections}
                showRoute={isDirections}
                topOffset={mapTopOffset}
                bottomOffset={mapBottomOffset}
              />
            </div>
          </div>
        );
      } else {
        return (
          <div className="absolute inset-0 transition-all duration-300 z-0">
            <MapOverlay
              activeNodeId={activeNodeId}
              fullList={fullList || []}
              onNavigate={handleNavigate}
              directionsState={directionsState}
              isMinimized={false}
              onUpdateDirectionsState={handleUpdateDirections}
              showRoute={isDirections}
              topOffset={mapTopOffset}
              bottomOffset={mapBottomOffset}
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
              topOffset={mapTopOffset}
              bottomOffset={mapBottomOffset}
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
                topOffset={mapTopOffset}
                bottomOffset={mapBottomOffset}
              />
            )}
          </div>

          {mobileHeight !== "expanded" && (
            <div
              onClick={() => setViewMode(isStreetviewMain ? "map" : "streetview")}
              className="fixed z-40 transition-all duration-300 cursor-pointer rounded-2xl shadow-2xl border-2 border-white hover:scale-105 overflow-hidden group w-40 h-28"
              style={{
                bottom: mobileHeight === "mid" ? "calc(45vh + 16px)" : "24px",
                right: "16px",
              }}
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
                    topOffset={mapTopOffset}
                    bottomOffset={mapBottomOffset}
                  />
                ) : (
                  <PanoramaViewer nodeId={activeNodeId!} onNavigate={handleNavigate} />
                )}
                <div className="absolute inset-0 z-20 bg-transparent" />
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div id="mobile-directions-input-portal" className="absolute top-0 left-0 w-full z-10" />

      {currentPanel.type !== "directions" && (
        <div className={`absolute top-0 left-0 z-20 w-full transition-transform duration-500 ease-in-out ${isCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
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
        <div
          className={`absolute z-20 bottom-0 left-0 w-full rounded-t-[32px] bg-white shadow-2xl flex flex-col h-screen ${isDragging ? "transition-none" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translateY(${
              isDragging
                ? getTargetTranslation(mobileHeight, windowDimensions.height) + dragOffset
                : getTargetTranslation(mobileHeight, windowDimensions.height)
            }px)`,
          }}
        >
          <div className="w-full h-full overflow-hidden flex flex-col rounded-t-[32px] relative">
            <div
              className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center z-30 cursor-grab active:cursor-grabbing select-none touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mt-2.5 hover:bg-slate-400 transition-colors" />
            </div>

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
                  isMobile={true}
                  onBack={() => dispatch({ type: "GO_BACK" })}
                  onSelectedRouteNode={handleSelectedRouteNode}
                  onUpdate={(data: any) =>
                    dispatch({ type: "UPDATE_DIRECTIONS_STATE", payload: data })
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}

      {renderMainLayout()}
    </>
  );
}
