import { useState, useEffect, useRef, useMemo } from "react";
import useRouteDirection from "../../hooks/useRouteDirection";
import type { MapNode } from "../../api/types/types_api";
import MapIcon from "@mui/icons-material/Map";
import CloseIcon from "@mui/icons-material/Close";
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
  };
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

export default function MapOverlay({ activeNodeId, fullList, onNavigate, directionsState }: MapOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
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
  const hasRoute = !!resolvedLocA && !!resolvedLocB;
  const { route } = useRouteDirection({
    src: hasRoute ? resolvedLocA : "",
    dest: hasRoute ? resolvedLocB : "",
  });

  // Automatically reset map view when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Automatically switch floor on the user side to match the active node's floor
  useEffect(() => {
    if (activeNode) {
      let floorId = "1";
      if (activeNode.coordinate_floor) {
        floorId = activeNode.coordinate_floor;
      } else {
        const nodeFloor = activeNode.type?.toLowerCase() || "";
        if (nodeFloor.includes("second") || nodeFloor.includes("2")) {
          floorId = "2";
        } else if (nodeFloor.includes("third") || nodeFloor.includes("3")) {
          floorId = "3";
        }
      }
      setSelectedFloor(floorId as "1" | "2" | "3");
    }
  }, [activeNode]);

  // Handle Drag / Pan mechanics
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
      return floorId === selectedFloor;
    });
  }, [fullList, selectedFloor]);

  // Extract path connections from the current active route on the selected floor
  const routePoints = useMemo(() => {
    if (!route || route.length === 0) return [];
    return route.map(step => {
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
  }, [route, fullList, selectedFloor]);

  const showGridFallback = !!imageError[selectedFloor];

  return (
    <>
      {/* Floating Map Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 md:right-8 z-40 p-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 shadow-2xl hover:scale-105 active:scale-95 transition-all text-[#800000] dark:text-[#ffcc00] flex items-center justify-center gap-2 group cursor-pointer"
        title="Open 2D Floor Plan"
      >
        <MapIcon className="w-6 h-6 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap">
          2D Map
        </span>
      </button>

      {/* Map Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 w-full md:w-[600px] h-full md:h-[500px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md md:rounded-3xl shadow-2xl z-50 border border-slate-200/80 dark:border-slate-800/85 flex flex-col overflow-hidden animate-slideDown">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
                <MapIcon className="text-[#800000] dark:text-[#ffcc00]" />
                Interactive Floor Map
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                Click nodes to teleport 3D Panorama
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Floor Selection Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-900 shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
            <button
              onClick={() => setSelectedFloor("1")}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                selectedFloor === "1"
                  ? "border-[#800000] dark:border-[#ffcc00] text-[#800000] dark:text-[#ffcc00]"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Ground & Floor 1
            </button>
            <button
              onClick={() => setSelectedFloor("2")}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                selectedFloor === "2"
                  ? "border-[#800000] dark:border-[#ffcc00] text-[#800000] dark:text-[#ffcc00]"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Floor 2
            </button>
            <button
              onClick={() => setSelectedFloor("3")}
              className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                selectedFloor === "3"
                  ? "border-[#800000] dark:border-[#ffcc00] text-[#800000] dark:text-[#ffcc00]"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Floor 3
            </button>
          </div>

          {/* Map Viewer Sandbox */}
          <div className="flex-1 relative bg-slate-900/5 dark:bg-black/20 overflow-hidden flex items-center justify-center">
            <div
              ref={containerRef}
              className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
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
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="1536" height="1024" fill="#0f172a" />
                      <rect width="1536" height="1024" fill="url(#user-grid)" />
                      <text
                        x="768"
                        y="490"
                        fill="rgba(255, 255, 255, 0.15)"
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
                        fill="rgba(255, 255, 255, 0.06)"
                        fontFamily="sans-serif"
                        fontSize="14"
                        textAnchor="middle"
                      >
                        Floor plan layout image will load once uploaded in the admin panel
                      </text>
                    </>
                  )}

                  {/* Draw Route Directions Path */}
                  {routePoints.length > 1 && (
                    <>
                      {/* Static Path Shadow */}
                      <path
                        d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                        fill="none"
                        stroke="rgba(0,0,0,0.25)"
                        strokeWidth="20"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Active Marching Route */}
                      <path
                        d={`M ${routePoints.map(p => `${p.x} ${p.y}`).join(" L ")}`}
                        fill="none"
                        stroke="#ffcc00"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="24, 24"
                        className="animated-flow-line"
                      />
                    </>
                  )}

                  {/* Render Interactive Nodes */}
                  {visibleNodes.map(node => {
                    const isActive = node.id === activeNodeId;
                    const isInRoute = route && route.some(step => step.id === node.id);
                    const isHovered = hoveredNode === node.node_name;
                    const hasActiveRoute = route && route.length > 0;

                    let opacity = 1;
                    if (hasActiveRoute) {
                      opacity = isInRoute ? 1 : (isHovered ? 0.8 : 0.2);
                    } else {
                      opacity = isActive ? 1 : (isHovered ? 0.9 : 0.45);
                    }
                    
                    return (
                      <g
                        key={node.id}
                        className="pointer-events-auto cursor-pointer group"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(node.id);
                        }}
                        onMouseEnter={() => setHoveredNode(node.node_name)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{
                          opacity,
                          transition: "opacity 0.25s ease-in-out"
                        }}
                      >
                        {/* Pulsing Active Ring */}
                        {isActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="35"
                            fill="#ffcc00"
                            className="animate-ping opacity-60"
                            style={{
                              transformOrigin: "center",
                              transformBox: "fill-box"
                            }}
                          />
                        )}
                        
                        {/* Main node pin */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isActive ? "18" : "11"}
                          fill={isActive ? "#800000" : "#ffcc00"}
                          stroke={isActive ? "#ffcc00" : "#800000"}
                          strokeWidth="3.5"
                          className="transition-colors duration-300"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Floating Map Zoom Tooltip */}
              {hoveredNode && (
                <div className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs border border-slate-800 shadow-md backdrop-blur pointer-events-none select-none">
                  {hoveredNode}
                </div>
              )}
            </div>

            {/* Scale controls */}
            <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 bg-white/80 dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-1 shadow-lg backdrop-blur">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                title="Zoom In"
              >
                <ZoomInIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOutIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                title="Reset Map"
              >
                <RestartAltIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Marching line overlay script */}
      <style>{`
        .animated-flow-line {
          animation: marchingAnts 0.8s linear infinite;
        }
        @keyframes marchingAnts {
          0% { stroke-dashoffset: 48; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </>
  );
}
