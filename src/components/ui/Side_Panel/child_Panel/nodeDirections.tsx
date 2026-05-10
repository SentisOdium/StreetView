import { useEffect, useState } from "react"
import { SwapVertIcon } from "../../reusableUI/logo.exports"
import RouteCardComponent from "../../reusableUI/routeCardComponent"
import Search from "../../reusableUI/search"
import type { NodeDirectionsProps } from "../types/sidePanelProps"

type ActiveField = "A" | "B" | null;

export default function NodeDirections({  list, onBack, onSelectedRouteNode, initialLocationA }: NodeDirectionsProps) {
    const [locationA, setLocationA] = useState(initialLocationA || "");
    const [locationB, setLocationB] = useState("");
    const [activeField, setActiveField] = useState<ActiveField>("A");
    
    const locationSwap = () => {
        if (!locationA || !locationB || locationA === locationB) return;

        const temp = locationA;
        setLocationA(locationB);
        setLocationB(temp);
    };

    function handleLocationSelect(node: any) {
        const name = node?.node_name ?? "";

        if (activeField === "A") {
            setLocationA(name);
            // auto move to B
            setActiveField("B");
            return;
        }
        if (activeField === "B") {
            setLocationB(name);
            setActiveField(null);
        }
    }

    useEffect(() => {
        if(initialLocationA){
            setActiveField("B")
        }
    }, [initialLocationA])
    return (
        <>
            <div className="w-110 h-screen border-gray-600 shadow-lg overflow-y-auto ml-10 animate-slideDown bg-white p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div onClick={onBack}
                            className="col-span-3 flex items-center  h-12 justify-center border rounded-xl shadow-sm">
                            other nav here  
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
                                                onChange={setLocationA}
                                                placeholder="Choose Starting Point"
                                                items={list || []}
                                                getLabel={(node: any) => node?.node_name ?? ""}    
                                                onSelect={handleLocationSelect} 
                                                disabled={activeField !== "A"}
                                                modalDesign="mt-32 ml-4 w-66.5 shadow-xl animate-slideDown rounded-xl"
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
                                                onChange={setLocationB}
                                                placeholder="Choose Destination Point"
                                                items={list || []}
                                                getLabel={(node: any) => node?.node_name ?? ""}    
                                                onSelect={handleLocationSelect} 
                                                disabled={activeField !== "B"}
                                                modalDesign="mt-47 ml-4 w-66.5 shadow-xl animate-slideDown rounded-xl"
                                            />
                            </div>
                        </div>
                    </div>
                    
                        <RouteCardComponent 
                        locA={locationA} 
                        locB={locationB} 
                        onSelectedRouteNode={onSelectedRouteNode}
                        />
                    
                    {(!locationA || !locationB) && (
                        <div className="mt-4 bg-white rounded-2xl shadow-lg max-h-90 overflow-y-auto">
                            <h1 className="ml-5 p-2">Select Locations</h1>
                            {list.map((node: any) => (
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