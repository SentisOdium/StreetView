import { useRef, useState } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import type { HotspotMarkerProps } from "../types/panoramaProps";

export default function HotspotArrow({ position, onClick, disabled }: HotspotMarkerProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Load texture from the SVG
    const texture = useTexture("/logo/arrow-open-end-svgrepo-com.svg");

    // Calculate rotation to face the direction of the hotspot (from 0,0,0)
    // The SVG texture arrow points to the right (+X) by default.
    // So the angle around the Z axis is Math.atan2(z, x).
    const angle = Math.atan2(-position[2], position[0]);

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => {
                    if (!disabled) {
                        setHovered(true);
                        document.body.style.cursor = "pointer";
                    }
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = "default";
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onClick();
                }}
                rotation={[-Math.PI / 2, 0, angle]}
                position={[0, -40, 0]}
                renderOrder={10}
            >
                <planeGeometry args={[15, 10]} />
                <meshBasicMaterial
                    map={texture}
                    transparent={true}
                    color={hovered ? "#ff4d4d" : "#800000"}
                    side={THREE.DoubleSide}
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}