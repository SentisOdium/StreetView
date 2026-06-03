// hotspot.tsx
import type { hotspotProps } from "./types/panoramaProps";

export default function Hotspot({
    position,
    size = [1, 1, 1],
    onclick,
    color = "white"
}: hotspotProps) {

    return (

        <mesh
            position={position}
            onClick={(e) => {
                e.stopPropagation();
                onclick?.();
            }}
        >

            <boxGeometry args={size} />

            <meshBasicMaterial
                color={color}
            />

        </mesh>
    );
}