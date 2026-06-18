import { SwapVertIcon } from "../../reusableUI/logo.exports"
import Search from "../../reusableUI/search"
import type { MapNode } from "../../../api/types/types_api"

interface NodeDirectionsInputProps {
  locationA: string;
  locationB: string;
  onUpdate: (data: Partial<{ locationA: string; locationB: string }>) => void;
  activeField: "A" | "B" | null;
  setActiveField: (field: "A" | "B" | null) => void;
  inputARef: React.RefObject<HTMLInputElement | null>;
  inputBRef: React.RefObject<HTMLInputElement | null>;
  startingItems: MapNode[];
  destinationItems: MapNode[];
  handleLocationASelect: (node: any) => void;
  handleLocationBSelect: (node: any) => void;
  locationSwap: () => void;
  mobileHeight?: 'hidden' | 'mid' | 'expanded';
}

export default function NodeDirectionsInput({
  locationA,
  locationB,
  onUpdate,
  activeField,
  setActiveField,
  inputARef,
  inputBRef,
  startingItems,
  destinationItems,
  handleLocationASelect,
  handleLocationBSelect,
  locationSwap,
  mobileHeight,
}: NodeDirectionsInputProps) {
  return (
    <div
      className={`sticky top-0 z-30 bg-[#fafafa] pt-4 pb-2 px-4 md:p-0 md:bg-white shrink-0 ${
        mobileHeight === "hidden" ? "hidden md:block" : "block"
      }`}
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 md:p-5 md:rounded-none md:border-t-0 md:border-x-0 md:border-b md:shadow-none">

      <div className="relative flex items-center gap-4">
        {/* Visual Connector Timeline (Start point to Destination) */}
        <div className="absolute left-3.5 top-5 bottom-5 w-0.5 flex flex-col items-center justify-between pointer-events-none">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 bg-white z-10" />
          <span className="flex-1 w-0.5 border-l-2 border-dashed border-slate-200 my-1" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#800000] border-2 border-white shadow-sm z-10" />
        </div>

        {/* Search Fields Wrapper */}
        <div className="flex-1 pl-7 flex flex-col gap-4">
          {/* Starting Point Input */}
          <div
            onClick={() => setActiveField("A")}
            className={`flex items-center bg-slate-50 hover:bg-slate-100/70 border rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer min-h-[46px] relative
              ${
                activeField === "A"
                  ? "border-[#800000] bg-white hover:bg-white ring-4 ring-[#800000]/10 shadow-sm"
                  : "border-slate-200"
              }`}
          >
            <div className="w-full">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Starting Point
              </span>
              <Search
                inputRef={inputARef}
                value={locationA}
                onChange={(val: string) => onUpdate({ locationA: val })}
                placeholder="Select a starting location"
                items={startingItems || []}
                getLabel={(node: any) => node?.node_name ?? ""}
                getKey={(node: any) => node?.id}
                onSelect={handleLocationASelect}
                noModal={true}
                noRelativeWrapper={true}
                modalDesign="bg-white border border-slate-200 shadow-xl rounded-xl max-h-[250px] overflow-y-auto p-2 w-full mt-2 z-50 animate-fadeIn [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              />
            </div>
          </div>

          {/* Destination Point Input */}
          <div
            onClick={() => setActiveField("B")}
            className={`flex items-center bg-slate-50 hover:bg-slate-100/70 border rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer min-h-[46px] relative
              ${
                activeField === "B"
                  ? "border-[#800000] bg-white hover:bg-white ring-4 ring-[#800000]/10 shadow-sm"
                  : "border-slate-200"
              }`}
          >
            <div className="w-full">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Destination
              </span>
              <Search
                inputRef={inputBRef}
                value={locationB}
                onChange={(val: string) => onUpdate({ locationB: val })}
                placeholder="Select destination"
                items={destinationItems || []}
                getLabel={(node: any) => node?.node_name ?? ""}
                getKey={(node: any) => node?.id}
                onSelect={handleLocationBSelect}
                noModal={true}
                noRelativeWrapper={true}
                modalDesign="bg-white border border-slate-200 shadow-xl rounded-xl max-h-[250px] overflow-y-auto p-2 w-full mt-2 z-50 animate-fadeIn [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              />
            </div>
          </div>
        </div>

        {/* Swap Button (Elegant Floating Overlay on Right) */}
        <div className="shrink-0 flex items-center justify-center pl-1">
          <button
            type="button"
            onClick={locationSwap}
            disabled={!locationA || !locationB || locationA === locationB}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.95] disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-sm hover:shadow text-[#800000] cursor-pointer group"
            title="Swap locations"
          >
            <SwapVertIcon
              sx={{ fontSize: 22 }}
              className="transition-transform duration-300 group-hover:rotate-180"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
