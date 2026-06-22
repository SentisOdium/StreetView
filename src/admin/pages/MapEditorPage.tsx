import React, { useState, useEffect, useRef, useMemo } from "react";
import { adminApi } from "../api/adminApi";
import type { AdminLocation } from "../api/types";
import PageHeader, {
  AdminButton,
  AdminInput,
  LoadingSpinner,
  ErrorBanner,
} from "../components/shared/AdminUI";
import PlaceIcon from "@mui/icons-material/Place";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import { broadcastAdminChange } from "../../utils/cacheInvalidation";

// Normalize names for comparison
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Convert string coordinate "x,y" to object
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

// Determine active Floor "1" | "2" | "3" from floor name
function getFloorNumber(floorStr?: string): "1" | "2" | "3" {
  if (!floorStr) return "1";
  const str = floorStr.toLowerCase();
  if (str.includes("second") || str.includes("floor 2") || str.includes("level 2") || str.includes("floor2") || str.includes("2")) {
    return "2";
  }
  if (str.includes("third") || str.includes("floor 3") || str.includes("level 3") || str.includes("floor3") || str.includes("3")) {
    return "3";
  }
  return "1"; // default
}

function getNodeFloor(loc: AdminLocation): "1" | "2" | "3" {
  if (loc.coordinate_floor) {
    return loc.coordinate_floor as "1" | "2" | "3";
  }
  return getFloorNumber(loc.floor);
}

export default function MapEditorPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Search states
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "placed" | "unplaced">("all");
  const [floorFilter, setFloorFilter] = useState<"all" | "1" | "2" | "3">("all");

  // Selection & Editing states
  const [selectedNode, setSelectedNode] = useState<AdminLocation | null>(null);
  const [tempCoords, setTempCoords] = useState<{ x: number; y: number } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Zoom & Pan states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Map canvas active floor display
  const [canvasFloor, setCanvasFloor] = useState<"1" | "2" | "3">("1");

  // Dragging pin states
  const [isDraggingPin, setIsDraggingPin] = useState(false);

  // Track if floor image fails to load, so we display the blueprint grid fallback
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Auto-hide success message
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  // Load Locations from API
  const loadLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getLocations();
      setLocations(data);
    } catch (e: any) {
      setError(e.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Set coordinate state when selected node changes
  const handleSelectNode = (node: AdminLocation) => {
    setSelectedNode(node);
    const parsed = parseCoords(node.coordinates);
    if (parsed) {
      setTempCoords(parsed);
    } else {
      setTempCoords(null);
    }
    setHasChanges(false);

    // Auto-switch canvas floor to match node's floor
    const nodeFloor = getNodeFloor(node);
    setCanvasFloor(nodeFloor);
  };

  // Convert client coordinate events into internal SVG viewBox pixels (1536 x 1024)
  const getSVGPoint = (e: React.MouseEvent | MouseEvent, svgElement: SVGSVGElement) => {
    const point = svgElement.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const invertedMatrix = svgElement.getScreenCTM()?.inverse();
    if (invertedMatrix) {
      const transformedPoint = point.matrixTransform(invertedMatrix);
      return {
        x: Math.min(Math.max(0, Math.round(transformedPoint.x)), 1536),
        y: Math.min(Math.max(0, Math.round(transformedPoint.y)), 1024),
      };
    }
    return null;
  };

  // Pan / Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isDraggingPin) return; // Only left click and not dragging pin
    setIsPanning(true);
    setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingPin && selectedNode && svgRef.current) {
      const point = getSVGPoint(e, svgRef.current);
      if (point) {
        setTempCoords(point);
        setHasChanges(true);
      }
      return;
    }
    if (!isPanning) return;
    setPosition({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingPin(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let nextScale = scale;
    if (e.deltaY < 0) {
      nextScale = Math.min(scale * zoomFactor, 5);
    } else {
      nextScale = Math.max(scale / zoomFactor, 0.5);
    }
    setScale(nextScale);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev / 1.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double click map to place selected node
  const handleMapDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedNode || !svgRef.current) return;
    const point = getSVGPoint(e, svgRef.current);
    if (point) {
      setTempCoords(point);
      setHasChanges(true);
    }
  };

  // Handle precision inputs changes
  const handleXChange = (val: number) => {
    const x = Math.min(Math.max(0, Math.round(val)), 1536);
    setTempCoords((prev) => ({ x, y: prev?.y ?? 512 }));
    setHasChanges(true);
  };

  const handleYChange = (val: number) => {
    const y = Math.min(Math.max(0, Math.round(val)), 1024);
    setTempCoords((prev) => ({ x: prev?.x ?? 768, y }));
    setHasChanges(true);
  };

  // Save changes to API
  const handleSave = async () => {
    if (!selectedNode || !tempCoords) return;
    setSaving(true);
    setError(null);
    try {
      const coordString = `${tempCoords.x},${tempCoords.y}`;
      await adminApi.updateCoordinates(selectedNode.id, coordString, canvasFloor);
      
      // Trigger cache invalidation across all tabs
      try {
        broadcastAdminChange({ nodeId: selectedNode.id, type: "list", timestamp: Date.now() });
      } catch (err) {
        console.warn("Failed to broadcast cache invalidation:", err);
      }

      setMsg("Coordinates and floor updated successfully!");
      setHasChanges(false);
      
      // Update local state list
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === selectedNode.id ? { ...loc, coordinates: coordString, coordinate_floor: canvasFloor } : loc
        )
      );
      // Update selected node coordinates locally
      setSelectedNode((prev) => (prev ? { ...prev, coordinates: coordString, coordinate_floor: canvasFloor } : null));
    } catch (e: any) {
      setError(e.message || "Failed to save coordinates");
    } finally {
      setSaving(false);
    }
  };

  // Clear node coordinates
  const handleClearPlacement = async () => {
    if (!selectedNode) return;
    if (!window.confirm(`Are you sure you want to clear the coordinates for "${selectedNode.node_name}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateCoordinates(selectedNode.id, "0,0", "1");
      setMsg("Coordinates cleared successfully!");
      setTempCoords(null);
      setHasChanges(false);

      // Update local state list
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === selectedNode.id ? { ...loc, coordinates: "0,0", coordinate_floor: "1" } : loc
        )
      );
      // Update selected node coordinates locally
      setSelectedNode((prev) => (prev ? { ...prev, coordinates: "0,0", coordinate_floor: "1" } : null));
    } catch (e: any) {
      setError(e.message || "Failed to clear coordinates");
    } finally {
      setSaving(false);
    }
  };

  // Reset unsaved adjustments
  const handleResetAdjustments = () => {
    if (!selectedNode) return;
    const parsed = parseCoords(selectedNode.coordinates);
    if (parsed) {
      setTempCoords(parsed);
    } else {
      setTempCoords(null);
    }
    setHasChanges(false);
  };

  // Filter locations for list display
  const filteredNodes = useMemo(() => {
    return locations.filter((loc) => {
      // Search filter
      if (search && !normalizeName(loc.node_name).includes(normalizeName(search))) {
        return false;
      }
      // Floor filter
      if (floorFilter !== "all" && getNodeFloor(loc) !== floorFilter) {
        return false;
      }
      // Placement status filter
      const parsed = parseCoords(loc.coordinates);
      const isPlaced = !!parsed;
      if (filterTab === "placed" && !isPlaced) return false;
      if (filterTab === "unplaced" && isPlaced) return false;
      
      return true;
    });
  }, [locations, search, filterTab, floorFilter]);

  // Nodes currently placed and visible on the active floor plan canvas
  const canvasNodes = useMemo(() => {
    return locations.filter((loc) => {
      // Filter out if not on current canvas floor
      if (getNodeFloor(loc) !== canvasFloor) return false;

      // Filter out if not placed (unless it is the selected node with temp coordinates)
      const parsed = parseCoords(loc.coordinates);
      if (!parsed && selectedNode?.id !== loc.id) return false;

      return true;
    });
  }, [locations, canvasFloor, selectedNode, tempCoords]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
        <PageHeader
          title="2D Map Coordinates Editor"
          subtitle="Manually position, drag, and calibrate wayfinding node coordinates on the 2D floor plans."
        />
        {msg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2 text-sm font-semibold animate-fadeIn shadow-sm">
            {msg}
          </div>
        )}
      </div>

      {/* Main Split Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Sidebar */}
        <aside className="w-96 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shrink-0 shadow-sm">
          {/* Node Selector & Filters */}
          <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
            <AdminInput
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            {/* Floor list filter */}
            <div className="flex gap-1.5">
              <span className="text-xs font-semibold text-slate-400 self-center mr-1">Floor:</span>
              {(["all", "1", "2", "3"] as const).map((fl) => (
                <button
                  key={fl}
                  onClick={() => setFloorFilter(fl)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors border ${
                    floorFilter === fl
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {fl === "all" ? "All" : fl === "1" ? "G/1" : fl}
                </button>
              ))}
            </div>

            {/* Placed / Unplaced Status Filters */}
            <div className="flex border border-slate-200 rounded-xl p-1 bg-white">
              {(["all", "placed", "unplaced"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                    filterTab === tab
                      ? "bg-[#800000] text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Node List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {loading ? (
              <LoadingSpinner />
            ) : filteredNodes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No locations match the filters.
              </div>
            ) : (
              filteredNodes.map((loc) => {
                const parsed = parseCoords(loc.coordinates);
                const isSelected = selectedNode?.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectNode(loc)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center justify-between border ${
                      isSelected
                        ? "bg-[#800000]/5 border-[#800000]/25 shadow-sm text-slate-900"
                        : "border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className={`text-xs font-bold truncate ${isSelected ? "text-[#800000]" : ""}`}>
                        {loc.node_name}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                        Floor: <span className="font-semibold text-slate-600">{loc.coordinate_floor ? `Level ${loc.coordinate_floor}` : (loc.floor || "—")}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          parsed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {parsed ? `${parsed.x}, ${parsed.y}` : "Unplaced"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Node Control Editor (Sticky Bottom Panel) */}
          {selectedNode && (
            <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
              {/* Node Title Details */}
              <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                <div className="p-2 bg-[#800000]/10 rounded-lg text-[#800000]">
                  <PlaceIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {selectedNode.node_name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">
                    Floor: <span className="text-slate-600 font-bold">{selectedNode.coordinate_floor ? `Level ${selectedNode.coordinate_floor}` : (selectedNode.floor || "—")}</span>
                  </p>
                </div>
              </div>

              {/* Slider Calibrations */}
              <div className="space-y-4">
                {/* Coordinate X Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    <span>X Coordinates (width)</span>
                    <input
                      type="number"
                      min={0}
                      max={1536}
                      value={tempCoords ? tempCoords.x : ""}
                      onChange={(e) => handleXChange(Number(e.target.value))}
                      placeholder="0"
                      className="w-16 text-right px-1.5 py-0.5 text-xs font-semibold border rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#800000]/30 outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1536}
                    value={tempCoords ? tempCoords.x : 0}
                    onChange={(e) => handleXChange(Number(e.target.value))}
                    disabled={!tempCoords}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#800000] disabled:opacity-50"
                  />
                </div>

                {/* Coordinate Y Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    <span>Y Coordinates (height)</span>
                    <input
                      type="number"
                      min={0}
                      max={1024}
                      value={tempCoords ? tempCoords.y : ""}
                      onChange={(e) => handleYChange(Number(e.target.value))}
                      placeholder="0"
                      className="w-16 text-right px-1.5 py-0.5 text-xs font-semibold border rounded bg-white text-slate-800 focus:ring-1 focus:ring-[#800000]/30 outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1024}
                    value={tempCoords ? tempCoords.y : 0}
                    onChange={(e) => handleYChange(Number(e.target.value))}
                    disabled={!tempCoords}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#800000] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Instructions Callout */}
              {!tempCoords && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 leading-relaxed font-medium">
                  <strong>Unplaced Node:</strong> Double-click anywhere on the map to drop the initial pin, or click the sliders above to trigger a calibration.
                </div>
              )}

              {/* Save/Reset/Delete Actions */}
              <div className="flex gap-2">
                <AdminButton
                  onClick={handleSave}
                  disabled={!tempCoords || !hasChanges || saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#800000] text-white hover:bg-[#600000] rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <SaveIcon className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : "Save Position"}
                </AdminButton>

                {hasChanges && (
                  <button
                    onClick={handleResetAdjustments}
                    title="Undo Changes"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-xs font-semibold"
                  >
                    Reset
                  </button>
                )}

                {parseCoords(selectedNode.coordinates) && (
                  <button
                    onClick={handleClearPlacement}
                    title="Clear Coordinate Record"
                    className="px-3 py-2 bg-white border border-red-200 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <DeleteOutlineIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Right Map Visual Canvas */}
        <main className="flex-1 relative overflow-hidden bg-slate-100/60 flex flex-col">
          {/* Error display banner */}
          {error && (
            <div className="absolute top-4 left-4 z-40 max-w-md">
              <ErrorBanner message={error} />
            </div>
          )}

          {/* Interactive Zoom/Pan Canvas Sandbox */}
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Zoomable Container Wrapper */}
            <div
              className="absolute origin-center transition-transform duration-100 ease-out flex items-center justify-center"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                width: "100%",
                height: "100%",
              }}
            >
              <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-white max-w-full max-h-full aspect-[1.5]">
                {/* SVG Visual and Mouse Interaction Layer */}
                <svg
                  ref={svgRef}
                  viewBox="0 0 1536 1024"
                  className="w-full h-full"
                  onDoubleClick={handleMapDoubleClick}
                >
                  {/* Background display */}
                  {!imageError[canvasFloor] ? (
                    <image
                      href={`/map/${canvasFloor === "1" ? "1st Floor Map" : canvasFloor === "2" ? "2nd Floor Map" : "3rd Floor Map"}.png`}
                      x="0"
                      y="0"
                      width="1536"
                      height="1024"
                      className="pointer-events-none select-none"
                      onError={() => {
                        setImageError(prev => ({ ...prev, [canvasFloor]: true }));
                      }}
                    />
                  ) : (
                    <>
                      {/* Premium Technical Grid Blueprint */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="1536" height="1024" fill="#0f172a" />
                      <rect width="1536" height="1024" fill="url(#grid)" />
                      <text
                        x="768"
                        y="490"
                        fill="rgba(255, 255, 255, 0.18)"
                        fontFamily="Outfit, Inter, sans-serif"
                        fontSize="32"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="tracking-wider"
                      >
                        FLOOR {canvasFloor} MAP CANVAS
                      </text>
                      <text
                        x="768"
                        y="530"
                        fill="rgba(255, 255, 255, 0.08)"
                        fontFamily="Outfit, Inter, sans-serif"
                        fontSize="14"
                        textAnchor="middle"
                        className="uppercase tracking-widest font-semibold"
                      >
                        Double click to drop coordinates pin for Level {canvasFloor}
                      </text>
                    </>
                  )}

                  {/* Draw Other Static Placed Nodes */}
                  {canvasNodes.map((loc) => {
                    const isSelected = selectedNode?.id === loc.id;
                    let nodeX = 0;
                    let nodeY = 0;

                    if (isSelected && tempCoords) {
                      nodeX = tempCoords.x;
                      nodeY = tempCoords.y;
                    } else {
                      const parsed = parseCoords(loc.coordinates);
                      if (!parsed) return null;
                      nodeX = parsed.x;
                      nodeY = parsed.y;
                    }

                    return (
                      <g
                        key={loc.id}
                        className={`group cursor-pointer pointer-events-auto`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNode(loc);
                        }}
                        onMouseDown={(e) => {
                          if (isSelected) {
                            e.stopPropagation();
                            setIsDraggingPin(true);
                          }
                        }}
                      >
                        {/* Selected Pulsing Glow Ring */}
                        {isSelected && (
                          <circle
                            cx={nodeX}
                            cy={nodeY}
                            r="32"
                            fill="#800000"
                            className="animate-ping opacity-25"
                            style={{
                              transformOrigin: "center",
                              transformBox: "fill-box"
                            }}
                          />
                        )}

                        {/* Interactive marker drop shadow */}
                        <circle
                          cx={nodeX}
                          cy={nodeY + 1}
                          r={isSelected ? "14" : "9"}
                          fill="rgba(0,0,0,0.2)"
                        />

                        {/* Core pin circle */}
                        <circle
                          cx={nodeX}
                          cy={nodeY}
                          r={isSelected ? "12" : "8"}
                          fill={isSelected ? "#800000" : "#ffcc00"}
                          stroke={isSelected ? "#ffcc00" : "#800000"}
                          strokeWidth={isSelected ? "3" : "2"}
                          className="transition-colors duration-300"
                        />

                        {/* Node Name Tag */}
                        <g className="pointer-events-none select-none">
                          <rect
                            x={nodeX - (loc.node_name.length * 3.2 + 6)}
                            y={nodeY - (isSelected ? 28 : 22)}
                            width={loc.node_name.length * 6.4 + 12}
                            height="16"
                            rx="4"
                            fill={isSelected ? "#0f172a" : "rgba(15, 23, 42, 0.85)"}
                            className="shadow-sm"
                          />
                          <text
                            x={nodeX}
                            y={nodeY - (isSelected ? 17 : 11)}
                            fill="white"
                            fontSize="9"
                            fontWeight={isSelected ? "bold" : "normal"}
                            textAnchor="middle"
                            fontFamily="Inter, sans-serif"
                          >
                            {loc.node_name}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Float Floating Tooltips */}
            {selectedNode && (
              <div className="absolute top-4 left-4 z-30 bg-slate-900/90 border border-slate-800 text-white rounded-xl p-3 shadow-xl backdrop-blur-md max-w-xs animate-slideDown pointer-events-none">
                <p className="text-[10px] font-bold text-[#ffcc00] uppercase tracking-wider flex items-center gap-1">
                  <SettingsIcon className="w-3.5 h-3.5 animate-spin" />
                  Calibrating Mode
                </p>
                <p className="text-xs font-bold truncate mt-1">
                  {selectedNode.node_name}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {tempCoords 
                    ? `Positioned at [X: ${tempCoords.x}px, Y: ${tempCoords.y}px]. Drag pin or use sliders to refine.`
                    : "Unplaced. Double click on the grid to drop the pin coordinates."
                  }
                </p>
              </div>
            )}

            {/* Vertical Floor Switcher Widget on the right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 bg-white/95 border border-slate-200 rounded-2xl p-2 shadow-xl backdrop-blur-sm">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center py-1">
                Floor
              </span>
              {(["3", "2", "1"] as const).map((fl) => {
                const isActive = canvasFloor === fl;
                return (
                  <button
                    key={fl}
                    onClick={() => {
                      setCanvasFloor(fl);
                      // If a node is selected, keep it selected and mark as changed so the user can save it to this floor
                      if (selectedNode) {
                        setHasChanges(true);
                      }
                    }}
                    className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-[#800000] text-white shadow-md scale-105"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    {fl === "1" ? "G/1" : fl}
                  </button>
                );
              })}
            </div>

            {/* Float Bottom Left Zoom Controls */}
            <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-white/90 border border-slate-200 rounded-xl p-1 shadow-lg backdrop-blur">
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomInIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOutIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Reset View"
              >
                <RestartAltIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
