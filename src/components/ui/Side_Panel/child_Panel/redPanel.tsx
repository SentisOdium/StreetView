import { useState, useRef, useEffect } from "react";
import {
  WayfinderLogo1,
  SearchIcon,
  DirectionsIcon,
  ClearIcon,
} from "../../reusableUI/logo.exports";

interface RedPanelProps {
  onSearchClick: () => void;
  onDirectionsClick: () => void;
  onLogoClick: () => void;
  currentPanelType?: string;
}

export default function RedPanel({
  onSearchClick,
  onDirectionsClick,
  onLogoClick,
  currentPanelType,
}: RedPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close the expanded panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div
      ref={panelRef}
      className={`absolute top-4 left-4 z-50 transition-all duration-300 ease-out 
        bg-white/95 backdrop-blur-md border border-[#800000]/15 rounded-2xl shadow-2xl 
        flex flex-col items-center justify-center select-none overflow-hidden
        ${isExpanded ? "w-32 h-32 p-3" : "w-12 h-12 cursor-pointer hover:scale-105 hover:bg-[#800000]/5 active:scale-95"}`}
      onClick={() => {
        if (!isExpanded) setIsExpanded(true);
      }}
    >
      {!isExpanded ? (
        // Collapsed state: just the pulsing logo
        <div className="relative flex items-center justify-center w-full h-full">
          <img
            src={WayfinderLogo1}
            alt="Wayfinder Logo"
            className="w-9 h-9 object-contain animate-pulse-subtle"
          />
          {/* Subtle badge indicator of active tab */}
          {currentPanelType && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#800000] rounded-full border border-white" />
          )}
        </div>
      ) : (
        // Expanded state: 2x2 grid of actions
        <div className="grid grid-cols-2 gap-2 w-full h-full animate-fadeIn">
          {/* Logo / Home button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogoClick();
              setIsExpanded(false);
            }}
            className="flex flex-col items-center justify-center rounded-xl p-1.5 cursor-pointer transition-all duration-200 hover:bg-[#800000]/10 hover:scale-105 active:scale-95"
            title="Go to Home"
          >
            <img
              src={WayfinderLogo1}
              alt="Home"
              className="w-6 h-6 object-contain"
            />
            <span className="text-[10px] font-semibold text-[#800000] mt-0.5">Home</span>
          </button>

          {/* Search Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSearchClick();
              setIsExpanded(false);
            }}
            className={`flex flex-col items-center justify-center rounded-xl p-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${currentPanelType === "search" || currentPanelType === "location"
                ? "bg-[#800000] text-white shadow-md shadow-[#800000]/25"
                : "text-[#800000] hover:bg-[#800000]/10"
              }`}
            title="Search Locations"
          >
            <SearchIcon sx={{ fontSize: 20 }} />
            <span className={`text-[10px] font-semibold mt-0.5 ${currentPanelType === "search" || currentPanelType === "location" ? "text-white" : "text-[#800000]"
              }`}>Search</span>
          </button>

          {/* Directions Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDirectionsClick();
              setIsExpanded(false);
            }}
            className={`flex flex-col items-center justify-center rounded-xl p-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${currentPanelType === "directions"
                ? "bg-[#800000] text-white shadow-md shadow-[#800000]/25"
                : "text-[#800000] hover:bg-[#800000]/10"
              }`}
            title="Generate Route"
          >
            <DirectionsIcon sx={{ fontSize: 20 }} />
            <span className={`text-[10px] font-semibold mt-0.5 ${currentPanelType === "directions" ? "text-white" : "text-[#800000]"
              }`}>Route</span>
          </button>

          {/* Close Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="flex flex-col items-center justify-center rounded-xl p-1.5 cursor-pointer text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:scale-105 active:scale-95"
            title="Close Menu"
          >
            <ClearIcon sx={{ fontSize: 20 }} />
            <span className="text-[10px] font-semibold mt-0.5">Close</span>
          </button>
        </div>
      )}
    </div>
  );
}
