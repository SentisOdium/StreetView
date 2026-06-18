import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ArrowBackIcon } from "../../reusableUI/logo.exports"
import RouteCardComponent from "../../reusableUI/routeCardComponent"
import type { NodeDirectionsProps } from "../types/sidePanelProps"
import NodeDirectionsInput from "./nodeDirectionsInput"
import NodeDirectionsSuggestions from "./nodeDirectionsSuggestions"

type ActiveField = "A" | "B" | null;

export default function NodeDirections({ list, fullList, activeNodeId, onBack, onSelectedRouteNode, directionsState, onUpdate, mobileHeight }: NodeDirectionsProps) {
    const locationA = directionsState.locationA;
    const locationB = directionsState.locationB;
    const [activeField, setActiveField] = useState<ActiveField>(
        locationA ? "B" : "A"
    );

    const isValidNodeName = (name: string) => {
        const trimmed = name?.trim().toLowerCase();
        if (!trimmed) return false;
        if (trimmed === "current location" && activeNodeId) return true;
        return fullList?.some(node => node.node_name.trim().toLowerCase() === trimmed);
    };

    const hasBothLocations = isValidNodeName(locationA) && isValidNodeName(locationB);

    const inputARef = useRef<HTMLInputElement>(null);
    const inputBRef = useRef<HTMLInputElement>(null);

    const activeNode = fullList?.find(n => n.id === activeNodeId);
    const activeNodeName = activeNode?.node_name ?? "";

    const startingItems = activeNode
        ? [{ id: -1, node_name: "Current Location", type: "special" }, ...list]
        : list;

    const destinationItems = activeNode
        ? [{ id: -1, node_name: "Current Location", type: "special" }, ...list]
        : list;

    // Detect mobile viewport and portal target
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const updatePortalTarget = () => {
            if (window.innerWidth < 768) {
                setPortalContainer(document.getElementById("mobile-directions-input-portal"));
            } else {
                setPortalContainer(null);
            }
        };

        updatePortalTarget();
        window.addEventListener("resize", updatePortalTarget);
        return () => window.removeEventListener("resize", updatePortalTarget);
    }, []);

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

            const inputComponent = (
                <NodeDirectionsInput
                    locationA={locationA}
                    locationB={locationB}
                    onUpdate={onUpdate}
                    activeField={activeField}
                    setActiveField={setActiveField}
                    inputARef={inputARef}
                    inputBRef={inputBRef}
                    startingItems={startingItems}
                    destinationItems={destinationItems}
                    handleLocationASelect={handleLocationASelect}
                    handleLocationBSelect={handleLocationBSelect}
                    locationSwap={locationSwap}
                    mobileHeight={mobileHeight}
                />
            );

            return (
                <div className="w-full md:w-120 h-full md:h-screen shadow-2xl animate-slideDown bg-[#fafafa] flex flex-col md:rounded-br-[32px] overflow-hidden">
                    {/* Header & Back Button - Desktop Only */}
                    <div className={`px-5 py-4 bg-white border-b border-slate-100 items-center gap-3 shrink-0 transition-all duration-300 hidden md:flex ${mobileHeight === 'hidden' ? 'pt-6' : 'pt-4'}`}>
                        <button
                            type="button"
                            onClick={onBack}
                            className="p-2 rounded-full border border-slate-200 hover:border-[#800000]/30 hover:bg-slate-50 transition text-[#800000] hover:text-[#660000] cursor-pointer flex items-center justify-center shadow-sm"
                            title="Back to search"
                        >
                            <ArrowBackIcon sx={{ fontSize: 20 }} />
                        </button>
                        <h2 className="text-base font-bold text-slate-800 tracking-tight">Directions</h2>
                    </div>
        
                    {/* Inputs Container Card */}
                    {portalContainer ? createPortal(inputComponent, portalContainer) : inputComponent}

            {/* Scrollable Results Area */}
            <div className={`flex-1 overflow-y-auto px-4 pb-4 pt-10 md:p-5 ${mobileHeight === 'hidden' ? 'hidden md:block' : 'block'}`}>
                {hasBothLocations ? (
                    <div className="animate-fadeIn">
                        <RouteCardComponent
                            locA={locationA}
                            locB={locationB}
                            resolvedLocA={locationA === "Current Location" ? activeNodeName : locationA}
                            resolvedLocB={locationB === "Current Location" ? activeNodeName : locationB}
                            onSelectedRouteNode={onSelectedRouteNode}
                            onBack={onBack}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Mobile-only Standalone Back Button */}
                        <div className="md:hidden flex items-center justify-end mb-3">
                            <button
                                type="button"
                                onClick={onBack}
                                className="p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition text-[#800000] cursor-pointer flex items-center justify-center shadow-sm"
                                title="Back"
                            >
                                <ArrowBackIcon sx={{ fontSize: 18 }} />
                            </button>
                        </div>
                        <NodeDirectionsSuggestions
                            activeNode={activeNode}
                            list={list}
                            handleLocationSelect={handleLocationSelect}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}