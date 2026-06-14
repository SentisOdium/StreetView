import { useState, useRef, useEffect } from "react"
import { SwapVertIcon, ArrowBackIcon } from "../../reusableUI/logo.exports"
import RouteCardComponent from "../../reusableUI/routeCardComponent"
import Search from "../../reusableUI/search"
import type { NodeDirectionsProps } from "../types/sidePanelProps"

type ActiveField = "A" | "B" | null;

export default function NodeDirections({ list, onBack, onSelectedRouteNode, directionsState, onUpdate }: NodeDirectionsProps) {
    const locationA = directionsState.locationA;
    const locationB = directionsState.locationB;
    const [activeField, setActiveField] = useState<ActiveField>(
        locationA ? "B" : "A"
    );

    const hasBothLocations = locationA.length > 0 && locationB.length > 0;

    const inputARef = useRef<HTMLInputElement>(null);
    const inputBRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeField === "A") {
            inputARef.current?.focus();
        } else if (activeField === "B") {
            inputBRef.current?.focus();
        }
    }, [activeField]);

    const locationSwap = () => {
        if (!locationA || !locationB || locationA === locationB) return;

        onUpdate({
            locationA: locationB,
            locationB: locationA,
        });
    };

    function handleLocationASelect(node: any) {
        const name = node?.node_name ?? "";
        onUpdate({ locationA: name });
        setActiveField("B");
    }

    function handleLocationBSelect(node: any) {
        const name = node?.node_name ?? "";
        onUpdate({ locationB: name });
        setActiveField(null);
    }

    function handleLocationSelect(node: any) {
        if (activeField === "B") {
            handleLocationBSelect(node);
            return;
        }
        handleLocationASelect(node);
    }



    return (
        <div className="w-120 h-screen border-r border-slate-100 shadow-2xl overflow-y-auto animate-slideDown bg-[#fafafa] flex flex-col rounded-br-[32px] overflow-hidden">
            {/* Header & Back Button */}
            <div className="p-5 bg-white border-b border-slate-100 shrink-0">
                <button
                    type="button"
                    onClick={onBack}
                    className="group flex h-11 cursor-pointer items-center justify-start px-4 rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-[#800000]/30 hover:shadow active:scale-[0.98] text-slate-700 hover:text-[#800000] gap-2.5 w-full"
                >
                    <ArrowBackIcon sx={{ color: '#800000', fontSize: 20 }} className="transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-bold tracking-wide uppercase">Back to Search</span>
                </button>
            </div>

            {/* Inputs Container */}
            <div className="p-5 bg-white border-b border-slate-100 shadow-sm shrink-0">
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
                        <div onClick={() => setActiveField("A")}
                            className={`flex items-center bg-slate-50 hover:bg-slate-100/70 border rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer min-h-[46px] relative
                                ${activeField === "A"
                                    ? "border-[#800000] bg-white hover:bg-white ring-4 ring-[#800000]/10 shadow-sm"
                                    : "border-slate-200"
                                }`}>
                            <div className="w-full">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Starting Point</span>
                                <Search
                                    inputRef={inputARef}
                                    value={locationA}
                                    onChange={(val: string) => onUpdate({ locationA: val })}
                                    placeholder="Select a starting location"
                                    items={list || []}
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
                        <div onClick={() => setActiveField("B")}
                            className={`flex items-center bg-slate-50 hover:bg-slate-100/70 border rounded-xl px-4 py-1.5 transition-all duration-200 cursor-pointer min-h-[46px] relative
                                ${activeField === "B"
                                    ? "border-[#800000] bg-white hover:bg-white ring-4 ring-[#800000]/10 shadow-sm"
                                    : "border-slate-200"
                                }`}>
                            <div className="w-full">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Destination</span>
                                <Search
                                    inputRef={inputBRef}
                                    value={locationB}
                                    onChange={(val: string) => onUpdate({ locationB: val })}
                                    placeholder="Select destination"
                                    items={list || []}
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

            {/* Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto p-5">
                {hasBothLocations ? (
                    <div className="animate-fadeIn">
                        <RouteCardComponent
                            locA={locationA}
                            locB={locationB}
                            onSelectedRouteNode={onSelectedRouteNode}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {list?.map((node: any) => (
                                <button
                                    key={node.id}
                                    onClick={() => handleLocationSelect(node)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all duration-200 group text-slate-700 hover:text-[#800000]"
                                >
                                    {/* Small modern map-dot indicator */}
                                    <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#800000] transition-colors shrink-0" />
                                    <span className="text-sm font-semibold transition-colors leading-tight">
                                        {node.node_name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}