import { useLoader } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"

type sphereProps = {
    position?: [number, number, number],
    size?: [number, number, number],
    radius?: number,
    color?: string,
    widthSegments?: number;
    heightSegments?: number;
    textureUrl?: string
}

export default function MainNode ({ position = [0,0,0], radius, widthSegments = 64, heightSegments = 64, textureUrl }: sphereProps) {
    const textureLoader = useLoader(THREE.TextureLoader, textureUrl!);
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