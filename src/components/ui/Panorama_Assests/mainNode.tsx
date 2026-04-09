import { useLoader } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"

import type { SphereProps } from "./types/panoramaProps"

export default function MainNode ({ position = [0,0,0], radius, widthSegments = 128, heightSegments = 128, textureUrl}: SphereProps) {
    
    const texture = useLoader(THREE.TextureLoader, textureUrl!);
    
   
    useEffect(() => {   
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.offset.x = 1;

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        texture.needsUpdate = true;
    }, [texture]);

    const ref = useRef<THREE.Mesh>(null);
    const prevPos = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);

    const handlePointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        prevPos.current = { x: e.clientX, y: e.clientY };   
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !ref.current) return; 
        const deltaX = e.clientX - prevPos.current.x;
        const deltaY = e.clientY - prevPos.current.y;

        ref.current.rotation.y += deltaX * 0.00000001;
        ref.current.rotation.x += deltaY * 0.00000001;

        ref.current.rotation.x = Math.max(
            -Math.PI/2, 
            Math.min(Math.PI/2, ref.current.rotation.x)
        );

        prevPos.current = { x: e.clientX, y: e.clientY };
    }

    const handlePointerUp = () => {
        isDragging.current = false;
    }

    return (
        <mesh 
            ref={ref} 
            position={position}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >

            <sphereGeometry args={[radius, widthSegments, heightSegments]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />

        </mesh>
    )
}