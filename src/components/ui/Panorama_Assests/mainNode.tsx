import { useLoader } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"

import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch"

import type { SphereProps } from "./types/panoramaProps"

export default function MainNode ({ position = [0,0,0], radius, widthSegments = 128, heightSegments = 128, textureUrl}: SphereProps) {
    
    const textureLoader = useLoader(THREE.TextureLoader, textureUrl!);
  
    textureLoader.wrapS = THREE.RepeatWrapping;
    textureLoader.repeat.x = -1;
    textureLoader.offset.x = 1;
    
    textureLoader.minFilter = THREE.LinearFilter;
    textureLoader.magFilter = THREE.LinearFilter;
    textureLoader.generateMipmaps = false;
        
    const ref = useRef<THREE.Mesh>(null);
        
    const [isDragging, setIsDragging] = useState(false);
    const [prevPosX, setPrevPosX] = useState(0);
    const [prevPosY, setPrevPosY] = useState(0);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setPrevPosX(e.clientX);
        setPrevPosY(e.clientY);
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !ref.current) return; 
        const deltaX = e.clientX - prevPosX;
        const deltaY = e.clientY - prevPosY;

        ref.current.rotation.y += deltaX * 0.00001;
        ref.current.rotation.x += deltaY * 0.00001;

        // Clamp X rotation
        ref.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, ref.current.rotation.x));

        setPrevPosX(e.clientX);
        setPrevPosY(e.clientY);
    }

    const handlePointerUp = () => {
        setIsDragging(false);
    }

    return (
        <mesh 
            ref={ref} 
            position={position}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >

            <sphereGeometry args={[radius, widthSegments, heightSegments]} />
            <meshBasicMaterial map={textureLoader} side={THREE.BackSide} />

        </mesh>
    )
}