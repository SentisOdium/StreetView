import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { HotspotMarkerProps } from "../types/panoramaProps";

export default function HotspotMarker({ position, label, onClick, disabled }: HotspotMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!meshRef.current) return;

    // Make it initially face camera center
    meshRef.current.lookAt(new THREE.Vector3(0, 0, 0));
  }, []);

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
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!disabled) onClick();
        }}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[30, 55]} />
        <meshBasicMaterial />
      </mesh>
      <Html center pointerEvents="none">
        <div
          className={`pointer-events-none select-none rounded px-2.5 py-1 text-xs font-bold tracking-wide text-white border border-white/20 shadow-lg backdrop-blur-sm transition-all duration-200 ${hovered ? "bg-[#b30000] scale-110" : "bg-[#800000]/85 scale-100"
            }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}