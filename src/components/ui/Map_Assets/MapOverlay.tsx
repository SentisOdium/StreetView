import { useState, useEffect, useRef, useMemo } from "react";
import useRouteDirection from "../../hooks/useRouteDirection";
import type { MapNode } from "../../api/types/types_api";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface MapOverlayProps {
  activeNodeId: number | null;
  fullList: MapNode[];
  onNavigate: (nodeId: number) => void;
  directionsState: {
    locationA: string;
    locationB: string;
    activeRouteIndex?: number;
  };
  isMinimized?: boolean;
  onUpdateDirectionsState?: (data: Partial<MapOverlayProps["directionsState"]>) => void;
  showRoute?: boolean;
  topOffset?: string | number;
  bottomOffset?: string | number;
}

// Absolute coordinate system mapped directly to 1536x1024 dimensions of 1st Floor.png
const COORDINATES_MAP: Record<number, { x: number; y: number; name: string }> = {
  1: { x: 1421, y: 783, name: "Entrance" },
  2: { x: 1421, y: 650, name: "Exit Driveway" },
  3: { x: 1421, y: 492, name: "Itech Center" },
  4: { x: 399, y: 696, name: "M.Driveway" },
  5: { x: 1167, y: 696, name: "Driveway_1" },
  6: { x: 860, y: 696, name: "Driveway_3" },
  8: { x: 806, y: 102, name: "Dean's Office" },
  39: { x: 1167, y: 563, name: "GRNDS_MID_RIGHT" },
  45: { x: 730, y: 220, name: "CENTER-STAIRS" },
  48: { x: 637, y: 102, name: "IT - Computer Laboratory 104" },
  49: { x: 545, y: 102, name: "IT  - Computer Laboratory 105" },
  50: { x: 730, y: 102, name: "Stairs to Second Floor" },
  51: { x: 280, y: 102, name: "STAIRS-GREEN_TO_FLR2-1" },
  52: { x: 1306, y: 492, name: "INNER DRIVEWAY 1" },
  53: { x: 1152, y: 492, name: "INNER DRIVEWAY 2" },
  54: { x: 998, y: 492, name: "INNER DRIVEWAY 3" },
  55: { x: 845, y: 492, name: "INNER DRIVEWAY 4" },
  56: { x: 691, y: 492, name: "INNER DRIVEWAY 5" },
  57: { x: 538, y: 492, name: "INNER DRIVEWAY 6" },
  58: { x: 384, y: 492, name: "INNER DRIVEWAY 7" },
  59: { x: 230, y: 492, name: "INNER DRIVEWAY 8" },
  60: { x: 399, y: 563, name: "GRNDS MID LEFT" },
  62: { x: 438, y: 102, name: "Chairpersons Office" },
  63: { x: 353, y: 102, name: "Medical Clinic " },
  65: { x: 207, y: 102, name: "Female Restroom ( 1st Floor ) " },
  66: { x: 77, y: 102, name: "Motor Parking" },
  67: { x: 77, y: 307, name: "Transportation and Motorpool Section" },
  68: { x: 77, y: 492, name: "MOTORPOOL MECHLAB View" },
  69: { x: 77, y: 614, name: "Mechanical Laboratory" },
  70: { x: 1226, y: 102, name: "Male Restroom (1st Floor)" },
  71: { x: 1078, y: 102, name: "Dental Clinic" },
  72: { x: 880, y: 102, name: "IT - 102 " },
  73: { x: 986, y: 102, name: "Speech Laboratory" },
  75: { x: 1152, y: 102, name: "Right Stairs ( to 2nd Floor ) " },
  76: { x: 1367, y: 922, name: "Motor Parking ( near Entrance )" },
  77: { x: 1226, y: 922, name: "MOTORPARKING 2 " },
  78: { x: 1100, y: 922, name: "MOTORPARKING 3" },
  79: { x: 980, y: 922, name: "MOTORPARKING 4" },
  80: { x: 860, y: 922, name: "MOTORPARKING 5" },
  81: { x: 1367, y: 164, name: "Green Benches " },
  82: { x: 1367, y: 492, name: "Itech | Shed View" },
  83: { x: 1367, y: 328, name: "Shed" },
  85: { x: 1367, y: 328, name: "Inner Shed " },
};

// Fallback search map using normalized names (lowercase, no symbols/spaces)
const NAME_COORDINATES_MAP: Record<string, { x: number; y: number }> = {
  "entrance": { x: 1421, y: 783 },
  "exitdriveway": { x: 1421, y: 650 },
  "itechcenter": { x: 1421, y: 492 },
  "mdriveway": { x: 399, y: 696 },
  "driveway1": { x: 1167, y: 696 },
  "driveway3": { x: 860, y: 696 },
  "deansoffice": { x: 806, y: 102 },
  "grndsmidright": { x: 1167, y: 563 },
  "centerstairs": { x: 730, y: 220 },
  "itcomputerlaboratory104": { x: 637, y: 102 },
  "itcomputerlaboratory105": { x: 545, y: 102 },
  "stairstosecondfloor": { x: 730, y: 102 },
  "stairsgreentoflr21": { x: 280, y: 102 },
  "innerdriveway1": { x: 1306, y: 492 },
  "innerdriveway2": { x: 1152, y: 492 },
  "innerdriveway3": { x: 998, y: 492 },
  "innerdriveway4": { x: 845, y: 492 },
  "innerdriveway5": { x: 691, y: 492 },
  "innerdriveway6": { x: 538, y: 492 },
  "innerdriveway7": { x: 384, y: 492 },
  "innerdriveway8": { x: 230, y: 492 },
  "grndsmidleft": { x: 399, y: 563 },
  "chairpersonsoffice": { x: 438, y: 102 },
  "medicalclinic": { x: 353, y: 102 },
  "femalerestroom1stfloor": { x: 207, y: 102 },
  "motorparking": { x: 77, y: 102 },
  "transportationandmotorpoolsection": { x: 77, y: 307 },
  "mechanicallaboratory": { x: 77, y: 614 },
  "malerestroom1stfloor": { x: 1226, y: 102 },
  "dentalclinic": { x: 1078, y: 102 },
  "it102": { x: 880, y: 102 },
  "speechlaboratory": { x: 986, y: 102 },
  "rightstairsto2ndfloor": { x: 1152, y: 102 },
  "motorparkingnearentrance": { x: 1367, y: 922 },
  "motorparking2": { x: 1226, y: 922 },
  "motorparking3": { x: 1100, y: 922 },
  "motorparking4": { x: 980, y: 922 },
  "motorparking5": { x: 860, y: 922 },
  "greenbenches": { x: 1367, y: 164 },
  "shed": { x: 1367, y: 328 },
  "innershed": { x: 1367, y: 328 },
};

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseCoords(coordinatesString?: string): { x: number; y: number } | null {
  if (!coordinatesString) return null;
  const parts = coordinatesString.split(",");
  if (parts.length !== 2) return null;
  const x = parseFloat(parts[0]);
  const y = parseFloat(parts[1]);
  if (isNaN(x) || isNaN(y)) return null;
  if (x === 0 && y === 0) return null; // Treat 0,0 as unplaced
  return { x, y };
}

function getNodeCoords(node: MapNode): { x: number; y: number } | null {
  if (node.coordinates) {
    const parsed = parseCoords(node.coordinates);
    if (parsed) return parsed;
  }
  if (COORDINATES_MAP[node.id]) {
    return { x: COORDINATES_MAP[node.id].x, y: COORDINATES_MAP[node.id].y };
  }
  if (node.node_name) {
    const normalized = normalizeName(node.node_name);
    if (NAME_COORDINATES_MAP[normalized]) {
      return NAME_COORDINATES_MAP[normalized];
    }
  }
  return null;
}

export default function MapOverlay({ activeNodeId, fullList, onNavigate, directionsState, isMinimized = false, onUpdateDirectionsState, showRoute = false, topOffset, bottomOffset }: MapOverlayProps) {
  const [selectedFloor, setSelectedFloor] = useState<"1" | "2" | "3">("1");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Track if floor image fails to load, so we display the blueprint grid
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve current active node name if "Current Location" is selected
  const activeNode = fullList.find(n => n.id === activeNodeId);
  const activeNodeName = activeNode?.node_name ?? "";

  const resolvedLocA = directionsState.locationA === "Current Location" ? activeNodeName : directionsState.locationA;
  const resolvedLocB = directionsState.locationB === "Current Location" ? activeNodeName : directionsState.locationB;

  // Query route direction using existing hook
  const hasRoute = showRoute && !!resolvedLocA && !!resolvedLocB;
  const { routes } = useRouteDirection({
    src: hasRoute ? resolvedLocA : "",
    dest: hasRoute ? resolvedLocB : "",
  });

  // Automatically reset map view when minimized state changes
  useEffect(() => {
    if (isMinimized) {
      setScale(0.85);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isMinimized]);

  // Automatically switch floor on the user side to match the active node's floor
  useEffect(() => {
    if (activeNode) {
      if (activeNode.coordinate_floor) {
        setSelectedFloor(activeNode.coordinate_floor as "1" | "2" | "3");
      } else {
        const nodeFloor = activeNode.type?.toLowerCase() || "";
        const nodeNameLower = activeNode.node_name?.toLowerCase() || "";
        
        let detectedFloor: "1" | "2" | "3" | null = null;
        if (nodeFloor.includes("second") || nodeFloor.includes("2") || nodeNameLower.includes("flr2") || nodeNameLower.includes("floor 2") || nodeNameLower.includes("2nd")) {
          detectedFloor = "2";
        } else if (nodeFloor.includes("third") || nodeFloor.includes("3") || nodeNameLower.includes("flr3") || nodeNameLower.includes("floor 3") || nodeNameLower.includes("3rd")) {
          detectedFloor = "3";
        } else if (nodeFloor.includes("first") || nodeFloor.includes("1") || nodeFloor.includes("ground") || nodeNameLower.includes("flr1") || nodeNameLower.includes("floor 1") || nodeNameLower.includes("1st")) {
          detectedFloor = "1";
        }
        
        if (detectedFloor) {
          setSelectedFloor(detectedFloor);
        }
      }
    }
  }, [activeNode]);

  const pointerCache = useRef<{ id: number; x: number; y: number }[]>([]);
  const prevDiff = useRef<number>(-1);

  // Handle Drag / Pan / Zoom mechanics (using PointerEvents for touch/mobile support)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return; // Only left click for mouse
    
    // Check if click is on an interactive marker or control before starting drag
    const target = e.target as Element;
    if (target && typeof target.closest === "function" && target.closest(".pointer-events-auto")) {
      return;
    }

    pointerCache.current.push({ id: e.pointerId, x: e.clientX, y: e.clientY });

    if (pointerCache.current.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Update pointer in cache
    const index = pointerCache.current.findIndex(p => p.id === e.pointerId);
    if (index !== -1) {
      pointerCache.current[index] = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }

    // Pinch-to-zoom logic
    if (pointerCache.current.length === 2) {
      const p1 = pointerCache.current[0];
      const p2 = pointerCache.current[1];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const curDiff = Math.sqrt(dx * dx + dy * dy);

      if (prevDiff.current > 0) {
        const zoomDelta = curDiff - prevDiff.current;
        const zoomFactor = 1 + (zoomDelta * 0.005);
        setScale(prev => Math.min(Math.max(prev * zoomFactor, 0.8), 4));
      }
      prevDiff.current = curDiff;
      return; // Skip panning while zooming
    }

    // Single touch drag
    if (!isDragging || pointerCache.current.length > 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const index = pointerCache.current.findIndex(p => p.id === e.pointerId);
    if (index !== -1) {
      pointerCache.current.splice(index, 1);
    }
    
    if (pointerCache.current.length < 2) {
      prevDiff.current = -1;
    }
    
    if (pointerCache.current.length === 1) {
       // Reset drag start for the remaining pointer to avoid jumps
       const p = pointerCache.current[0];
       setDragStart({ x: p.x - position.x, y: p.y - position.y });
       setIsDragging(true);
    } else if (pointerCache.current.length === 0) {
       setIsDragging(false);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if pointer capture already lost
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let nextScale = scale;
    if (e.deltaY < 0) {
      nextScale = Math.min(scale * zoomFactor, 4);
    } else {
      nextScale = Math.max(scale / zoomFactor, 0.8);
    }
    setScale(nextScale);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.8));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Filter full node list for nodes located on the selected floor
  const visibleNodes = useMemo(() => {
    return fullList.map(node => {
      const coords = getNodeCoords(node);
      if (!coords) return null;
      return {
        ...node,
        ...coords
      };
    }).filter((n): n is MapNode & { x: number; y: number } => {
      if (n === null) return false;
      let floorId = "1";
      if (n.coordinate_floor) {
        floorId = n.coordinate_floor;
      } else {
        const nodeFloor = n.type?.toLowerCase() || "";
        if (nodeFloor.includes("second") || nodeFloor.includes("2")) {
          floorId = "2";
        } else if (nodeFloor.includes("third") || nodeFloor.includes("3")) {
          floorId = "3";
        }
      }
      if (floorId !== selectedFloor) return false;

      // Smart transitional filtering:
      // Hide transitional node markers unless they are the currently active node
      if (n.type === "transitional") {
        return n.id === activeNodeId;
      }

      return true;
    });
  }, [fullList, selectedFloor, activeNodeId]);

  const activeRouteIndex = directionsState.activeRouteIndex ?? 0;

  // Extract path connections from the current active routes on the selected floor
  const allRoutesPoints = useMemo(() => {
    if (!routes || routes.length === 0) return [];
    return routes.map(routeOpt => {
      return routeOpt.path.map(step => {
        const matchingNode = fullList.find(n => n.id === step.id);
        if (!matchingNode) return null;
        const coords = getNodeCoords(matchingNode);
        if (!coords) return null;

        // Filter route points to match the current floor, so we don't draw lines between floors
        let floorId = "1";
        if (matchingNode.coordinate_floor) {
          floorId = matchingNode.coordinate_floor;
        } else {
          const nodeFloor = matchingNode.type?.toLowerCase() || "";
          if (nodeFloor.includes("second") || nodeFloor.includes("2")) {
            floorId = "2";
          } else if (nodeFloor.includes("third") || nodeFloor.includes("3")) {
            floorId = "3";
          }
        }
        if (floorId !== selectedFloor) return null;

        return { x: coords.x, y: coords.y };
      }).filter((p): p is { x: number; y: number } => p !== null);
    });
  }, [routes, fullList, selectedFloor]);

  const activeRoutePoints = allRoutesPoints[activeRouteIndex] || [];

  const showGridFallback = !!imageError[selectedFloor];

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden relative">


      {/* Floor Selection Vertical Stack (Floating on top right) */}
      {!isMinimized && (
        <div 
          className="absolute right-4 z-30 flex flex-col gap-1.5 bg-white/95 border border-slate-200/80 rounded-xl p-1 shadow-lg backdrop-blur transition-all duration-300"
          style={{ top: topOffset ?? '1rem' }}
        >
          <button
            onClick={() => setSelectedFloor("3")}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
              selectedFloor === "3"
                ? "bg-[#800000] text-white shadow-sm"
                : "text-[#800000] hover:bg-[#800000]/10"
            }`}
          >
            3F
          </button>
          <button
            onClick={() => setSelectedFloor("2")}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
              selectedFloor === "2"
                ? "bg-[#800000] text-white shadow-sm"
                : "text-[#800000] hover:bg-[#800000]/10"
            }`}
          >
            2F
          </button>
          <button
            onClick={() => setSelectedFloor("1")}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
              selectedFloor === "1"
                ? "bg-[#800000] text-white shadow-sm"
                : "text-[#800000] hover:bg-[#800000]/10"
            }`}
          >
            1F
          </button>
        </div>
      )}

      {/* Map Viewer Sandbox */}
      <div className="flex-1 relative bg-white overflow-hidden flex items-center justify-center">
        <div
          ref={containerRef}
          className={`w-full h-full relative touch-none ${isMinimized ? "" : "cursor-grab active:cursor-grabbing select-none"}`}
          onPointerDown={isMinimized ? undefined : handlePointerDown}
          onPointerMove={isMinimized ? undefined : handlePointerMove}
          onPointerUp={isMinimized ? undefined : handlePointerUp}
          onPointerCancel={isMinimized ? undefined : handlePointerUp}
          onWheel={isMinimized ? undefined : handleWheel}
        >
          {/* Scaled/Translated Content Wrapper */}
          <div
            className="absolute origin-center transition-transform duration-100 ease-out flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              width: "100%",
              height: "100%",
            }}
          >
            {/* SVG Drawing Layer containing the image and overlays together */}
            <svg
              viewBox="0 0 1536 1024"
              className="max-w-full max-h-full pointer-events-none select-none"
              style={{ zIndex: 10 }}
            >
              <defs>
                <linearGradient id="activePinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#b30000" />
                  <stop offset="100%" stopColor="#800000" />
                </linearGradient>
                <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
                </filter>
              </defs>
              {/* Floor Plan Image Layer inside the SVG */}
              {!showGridFallback ? (
                <image
                  href={`/map/${selectedFloor === "1" ? "1st Floor Map" : selectedFloor === "2" ? "2nd Floor Map" : "3rd Floor Map"}.png`}
                  x="0"
                  y="0"
                  width="1536"
                  height="1024"
                  className="pointer-events-none"
                  onError={() => {
                    setImageError(prev => ({ ...prev, [selectedFloor]: true }));
                  }}
                />
              ) : (
                <>
                  {/* Technical Blueprint Grid Fallback */}
                  <defs>
                    <pattern id="user-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="1536" height="1024" fill="#ffffff" />
                  <rect width="1536" height="1024" fill="url(#user-grid)" />
                  <text
                    x="768"
                    y="490"
                    fill="rgba(128, 0, 0, 0.2)"
                    fontFamily="sans-serif"
                    fontSize="32"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    FLOOR {selectedFloor} MAP
                  </text>
                  <text
                    x="768"
                    y="525"
                    fill="rgba(0, 0, 0, 0.3)"
                    fontFamily="sans-serif"
                    fontSize="14"
                    textAnchor="middle"
                  >
                    Floor plan layout image will load once uploaded in the admin panel
                  </text>
                </>
              )}

              {/* Draw Alternative Route Directions Paths */}
              {allRoutesPoints.map((pts, idx) => {
                if (idx === activeRouteIndex || pts.length <= 1) return null;
                const pathD = `M ${pts.map(p => `${p.x} ${p.y}`).join(" L ")}`;
                return (
                  <g key={`alt-route-${idx}`} className="pointer-events-auto cursor-pointer group" onClick={(e) => {
                    e.stopPropagation();
                    onUpdateDirectionsState?.({ activeRouteIndex: idx });
                  }}>
                    {/* Broad hit area for mobile/mouse */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="28"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Outer shadow border */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.4)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-colors duration-200 group-hover:stroke-slate-500/60"
                    />
                    {/* Inner dash line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-colors duration-200 group-hover:stroke-slate-400"
                    />
                  </g>
                );
              })}

              {/* Draw Active Route Directions Path */}
              {activeRoutePoints.length > 1 && (
                <g className="pointer-events-none">
                  {/* Static Path Shadow */}
                  <path
                    d={`M ${activeRoutePoints.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                    fill="none"
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Active Marching Route */}
                  <path
                    d={`M ${activeRoutePoints.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                    fill="none"
                    stroke="#ffcc00"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="24, 24"
                    className="animated-flow-line"
                  />
                </g>
              )}

              {/* Render Interactive Nodes */}
              {visibleNodes.map(node => {
                const isActive = node.id === activeNodeId;
                const activeRoute = routes?.[activeRouteIndex]?.path;
                const isInRoute = activeRoute && activeRoute.some(step => step.id === node.id);
                const isHovered = hoveredNode === node.node_name;
                const hasActiveRoute = activeRoute && activeRoute.length > 0;

                let opacity = 1;
                if (hasActiveRoute) {
                  opacity = isInRoute ? 1 : (isHovered ? 0.8 : 0.2);
                } else {
                  opacity = isActive ? 1 : (isHovered ? 0.9 : 0.45);
                }
                
                return (
                  <g
                    key={node.id}
                    className={`pointer-events-auto ${isMinimized ? "" : "cursor-pointer"} group`}
                    onClick={isMinimized ? undefined : (e) => {
                      e.stopPropagation();
                      onNavigate(node.id);
                    }}
                    onMouseEnter={isMinimized ? undefined : () => setHoveredNode(node.node_name)}
                    onMouseLeave={isMinimized ? undefined : () => setHoveredNode(null)}
                    style={{
                      opacity,
                      transition: "opacity 0.25s ease-in-out"
                    }}
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    {isActive ? (
                      <>
                        {/* Pin Base Shadow */}
                        <ellipse
                          cx="0"
                          cy="2"
                          rx="8"
                          ry="3"
                          fill="rgba(0,0,0,0.2)"
                        />
                        {/* Location Pin Icon (Native path rendering to prevent SVG inheritance sizing bugs) */}
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                          fill="#800000"
                          transform="scale(1.6) translate(-12, -22)"
                          filter="url(#shadowFilter)"
                        />
                      </>
                    ) : isInRoute ? (
                      <>
                        {/* Base shadow */}
                        <circle
                          cx="0"
                          cy="1"
                          r="8.5"
                          fill="rgba(0,0,0,0.2)"
                        />
                        {/* Main circle */}
                        <circle
                          cx="0"
                          cy="0"
                          r="7.5"
                          fill="#800000"
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      </>
                    ) : (
                      <>
                        {/* Base shadow */}
                        <circle
                          cx="0"
                          cy="1"
                          r="7"
                          fill="rgba(0,0,0,0.15)"
                        />
                        {/* Solid circle marker */}
                        <circle
                          cx="0"
                          cy="0"
                          r="6.5"
                          fill="#800000"
                          className="transition-transform duration-300 group-hover:scale-125"
                        />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Floating Map Zoom Tooltip */}
          {!isMinimized && hoveredNode && (
            <div className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs border border-slate-800 shadow-md backdrop-blur pointer-events-none select-none">
              {hoveredNode}
            </div>
          )}
        </div>

        {/* Scale controls */}
        {!isMinimized && (
          <div 
            className="absolute right-4 z-30 flex items-center gap-1.5 bg-white/95 border border-slate-200/80 rounded-xl p-1 shadow-lg backdrop-blur transition-all duration-300"
            style={{ bottom: bottomOffset ?? '1rem' }}
          >
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-[#800000] hover:bg-[#800000]/10 cursor-pointer"
              title="Zoom In"
            >
              <ZoomInIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-[#800000] hover:bg-[#800000]/10 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOutIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-[#800000] hover:bg-[#800000]/10 cursor-pointer"
              title="Reset Map"
            >
              <RestartAltIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Styled Marching line and marker animations */}
      <style>{`
        .animated-flow-line {
          animation: marchingAnts 0.8s linear infinite;
        }
        @keyframes marchingAnts {
          0% { stroke-dashoffset: 48; }
          to { stroke-dashoffset: 0; }
        }
        .animate-marker-pulse {
          animation: markerPulse 1.8s cubic-bezier(0.25, 0, 0, 1) infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
        @keyframes markerPulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
