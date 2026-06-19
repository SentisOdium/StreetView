import { useState, useEffect } from "react";
import type { NodeDirectionsProps } from "../types/sidePanelProps";
import NodeDirectionsDesktop from "./NodeDirectionsDesktop";
import NodeDirectionsMobile from "./NodeDirectionsMobile";

export default function NodeDirections(props: NodeDirectionsProps) {
    const [internalIsMobile, setInternalIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

    useEffect(() => {
        const handleResize = () => {
            setInternalIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = props.isMobile ?? internalIsMobile;

    if (isMobile) {
        return <NodeDirectionsMobile {...props} />;
    }

    return <NodeDirectionsDesktop {...props} />;
}