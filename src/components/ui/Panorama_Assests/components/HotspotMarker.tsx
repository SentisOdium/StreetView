import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { HotspotMarkerProps } from "../types/panoramaProps";

export default function HotspotMarker({ position, label, onClick, disabled, selected, onSingleClick, isEditor }: HotspotMarkerProps) {
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
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onSingleClick?.();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!disabled) onClick();
        }}
        rotation={[0, 0, 0]}
      >
        <planeGeometry args={[30, 55]} />
        <meshBasicMaterial
          color={isEditor ? "gray" : "#800000"}
        />
      </mesh>
      <Html center pointerEvents="none">
        <div
          className={`pointer-events-none select-none rounded px-2.5 py-1 text-xs font-bold tracking-wide text-white border shadow-lg backdrop-blur-sm transition-all duration-200 ${selected
            ? "bg-[#ffd700] text-[#800000] border-[#ffd700]/40 scale-110 shadow-[0_0_15px_rgba(255,215,0,0.5)] font-extrabold"
            : hovered
              ? "bg-[#b30000] border-white/20 scale-110"
              : "bg-[#800000]/85 border-white/20 scale-100"
            }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}