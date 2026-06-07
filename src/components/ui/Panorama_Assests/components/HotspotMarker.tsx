import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { HotspotMarkerProps } from "../types/panoramaProps";

export default function HotspotMarker({position, onClick, disabled}: HotspotMarkerProps) {
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
        <meshBasicMaterial
          visible={false}
        />
      </mesh>

      
    </group>
  );
}