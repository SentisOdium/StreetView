import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ArrowBackIcon } from "../../reusableUI/logo.exports"
import type { NodeDirectionsProps } from "../types/sidePanelProps"
import NodeDirectionsInput from "./nodeDirectionsInput"
import NodeDirectionsSuggestions from "./nodeDirectionsSuggestions"
import MobileRouteCarousel from "./MobileRouteCarousel"

type ActiveField = "A" | "B" | null;

export default function NodeDirectionsMobile({ list, fullList, activeNodeId, onBack, onSelectedRouteNode, directionsState, onUpdate, mobileHeight, setMobileHeight }: NodeDirectionsProps) {
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
    const [isEditingRoute, setIsEditingRoute] = useState(false);

    useEffect(() => {
        if (hasBothLocations && setMobileHeight && !isEditingRoute) {
            setMobileHeight('hidden');
        }
    }, [hasBothLocations, setMobileHeight, isEditingRoute]);

    const handleUpdate = (updateData: Partial<{ locationA: string; locationB: string }>) => {
        onUpdate(updateData);
        const nextLocA = updateData.locationA !== undefined ? updateData.locationA : locationA;
        const nextLocB = updateData.locationB !== undefined ? updateData.locationB : locationB;
        if (isValidNodeName(nextLocA) && isValidNodeName(nextLocB)) {
            setIsEditingRoute(false);
        }
    };

    // When editing route, make sure panel is visible
    useEffect(() => {
        if (isEditingRoute && setMobileHeight && mobileHeight === 'hidden') {
            setMobileHeight('mid');
        }
    }, [isEditingRoute, setMobileHeight, mobileHeight]);

    const showRouteCarousel = hasBothLocations && !isEditingRoute;

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

    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
    const [carouselPortalContainer, setCarouselPortalContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setPortalContainer(document.getElementById("mobile-directions-input-portal"));
        // Create or find a container for the carousel at the very bottom
        let carouselContainer = document.getElementById("mobile-route-carousel-portal");
        if (!carouselContainer) {
            carouselContainer = document.createElement("div");
            carouselContainer.id = "mobile-route-carousel-portal";
            document.body.appendChild(carouselContainer);
        }
        setCarouselPortalContainer(carouselContainer);

        return () => {
            // Cleanup empty portal container if needed, but it's fine to leave it attached
        };
    }, []);

    useEffect(() => {
        if (!showRouteCarousel) {
            if (activeField === "A") {
                inputARef.current?.focus();
            } else if (activeField === "B") {
                inputBRef.current?.focus();
            }
        }
    }, [activeField, showRouteCarousel]);

    const locationSwap = () => {
        if (!locationA || !locationB || locationA === locationB) return;
        handleUpdate({
            locationA: locationB,
            locationB: locationA,
        });
    };

    function handleLocationASelect(node: any) {
        const name = node?.node_name ?? "";
        handleUpdate({ locationA: name });
        setActiveField("B");
    }

    function handleLocationBSelect(node: any) {
        const name = node?.node_name ?? "";
        handleUpdate({ locationB: name });
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
            onUpdate={handleUpdate}
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

    const [frozenActiveNodeName, setFrozenActiveNodeName] = useState(activeNodeName);

    useEffect(() => {
        if (!showRouteCarousel) {
            setFrozenActiveNodeName(activeNodeName);
        }
    }, [showRouteCarousel, activeNodeName]);

    return (
        <div className="w-full h-full flex flex-col bg-[#fafafa]">
            {/* If Route is active, inputs are hidden. Otherwise, render them in portal. */}
            {!showRouteCarousel && portalContainer && createPortal(inputComponent, portalContainer)}

            {/* If Route is active, render Carousel in portal to bottom of body */}
            {showRouteCarousel && carouselPortalContainer && createPortal(
                <MobileRouteCarousel
                    locA={locationA}
                    locB={locationB}
                    resolvedLocA={locationA === "Current Location" ? frozenActiveNodeName : locationA}
                    resolvedLocB={locationB === "Current Location" ? frozenActiveNodeName : locationB}
                    onSelectedRouteNode={onSelectedRouteNode}
                    onEditRoute={() => setIsEditingRoute(true)}
                />,
                carouselPortalContainer
            )}

            {/* If not showing route carousel, show suggestions and back button inside the panel body */}
            {!showRouteCarousel && (
                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-end mb-3">
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
                </div>
            )}
        </div>
    )
}
