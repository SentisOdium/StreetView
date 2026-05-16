// hotspot.tsx

type hotspotProps = {
    position?: [number, number, number];
    size?: [number, number, number];
    color?: string;
    onclick?: () => void;
}

export default function Hotspot({
    position,
    size = [1, 1, 1],
    onclick,
    color = "white"
}: hotspotProps) {

    return (

        <mesh
            position={position}
            onClick={onclick}
        >

            <boxGeometry args={size} />

            <meshBasicMaterial
                color={color}
            />

        </mesh>
    );
}