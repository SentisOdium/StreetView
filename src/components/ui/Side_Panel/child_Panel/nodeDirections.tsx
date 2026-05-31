import { useState } from "react"
import { SwapVertIcon } from "../../reusableUI/logo.exports"
import RouteCardComponent from "../../reusableUI/routeCardComponent"
import Search from "../../reusableUI/search"
import type { NodeDirectionsProps } from "../types/sidePanelProps"

type ActiveField = "A" | "B" | null;

export default function NodeDirections({  list, onBack, onSelectedRouteNode, directionsState, onUpdate }: NodeDirectionsProps) {
    const locationA = directionsState.locationA;
    const locationB = directionsState.locationB;
    const [activeField, setActiveField] = useState<ActiveField>("A");
    
    const hasBothLocations = locationA.length > 0 && locationB.length > 0;

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
        <>
            <div className="w-110 h-screen border-gray-600 shadow-lg overflow-y-auto ml-10 animate-slideDown bg-white p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div onClick={onBack}
                            className="col-span-3 flex items-center  h-12 justify-center border rounded-xl shadow-sm">
                            <h1 className="ml-5 p-2">Select Locations</h1>
                        </div>
                        {/* Starting Point */}
                        <div  className="col-span-2 z-15">
                            <div onClick={() => setActiveField("A")}
                                className={`px-4 flex items-center bg-white h-12 border-gray-600 transition-all
                                        ${activeField === "A"
                                            ? "ring-2 ring-[#800000] shadow-xl rounded-xl"
                                            : "rounded-t-2xl rounded-b-none"
                                        }
                                        ${locationA ? "text-black" : "text-gray-400"}`}>
                                            <Search
                                                value={locationA}
                                                onChange={(val: string) => onUpdate({ locationA: val })}
                                                placeholder="Choose Starting Point"
                                                items={list || []}
                                                getLabel={(node: any) => node?.node_name ?? ""}    
                                                onSelect={handleLocationASelect} 
                                                disabled={activeField !== "A"}
                                                modalDesign="mt-32 ml-auto mr-4 w-66.5 shadow-xl animate-slideDown rounded-xl"
                                            />
                            </div>
                        </div>
                        {/* Icon / Swap / Action */}
                        <div onClick={locationSwap}
                            className="row-span-2 flex items-center justify-center bg-white rounded-lg">
                                <span
                                    className="p-1 hover:bg-gray-100 rounded-xl cursor-pointer ">
                                        <SwapVertIcon 
                                            sx={{ color: '#800000', fontSize: 28}}/>
                                </span>
                        </div>
                        {/* Destination */}
                        <div className="col-span-2 z-10">
                            <div onClick={() => setActiveField("B")}
                                className={`px-4 flex items-center bg-white h-12 transition-all
                                        ${activeField === "B"
                                            ? "ring-2 ring-[#800000] shadow-xl rounded-xl"
                                            : "rounded-t-2xl rounded-b-none"
                                        }
                                        ${locationB ? "text-black" : "text-gray-400"}
                                    `}>
                                            <Search
                                                value={locationB}
                                                onChange={(val: string) => onUpdate({ locationB: val })}
                                                placeholder="Choose Destination Point"
                                                items={list || []}
                                                getLabel={(node: any) => node?.node_name ?? ""}    
                                                onSelect={handleLocationBSelect} 
                                                disabled={activeField !== "B"}
                                                modalDesign="mt-47 ml-auto mr-4 w-66.5 shadow-xl animate-slideDown rounded-xl"
                                            />
                            </div>
                        </div>
                    </div>
                    
                        {hasBothLocations && (
                            <RouteCardComponent 
                                locA={locationA} 
                                locB={locationB} 
                                onSelectedRouteNode={onSelectedRouteNode}
                            />
                        )}
                    
                    {(!locationA || !locationB) && (
                        <div className="mt-7 border bg-white rounded-2xl p-3 shadow-lg max-h-[700px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            
                            {list?.map((node: any) => (
                                <button
                                    key={node.id}
                                    onClick={() => handleLocationSelect(node)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100"
                                >
                                    {node.node_name}
                                </button>
                            ))}
                        </div>
                    )}
            </div>
        </>
    )
}