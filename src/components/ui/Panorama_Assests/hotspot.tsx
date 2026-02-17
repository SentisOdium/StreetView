type hotspotProps = {
    position?: [number, number, number],
    size?: [number, number, number],
    color?: string,
    textureUrl?: string,
    onclick?: () => void
}

export default function Hotspot  ({position, size, onclick, color}:hotspotProps){
        return (
            <mesh position={position} onClick={onclick}>
                <boxGeometry args={size}/>
                <meshBasicMaterial  color={color} />
            </mesh>
        )
    }