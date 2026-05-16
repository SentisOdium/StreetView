// mainNode.tsx

import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

import type {
    SphereProps
} from "./types/panoramaProps";

export default function MainNode({
    position = [0, 0, 0],
    radius,
    widthSegments = 128,
    heightSegments = 128,
    textureUrl,
    opacity = 1
}: SphereProps) {

    const texture = useLoader(
        THREE.TextureLoader,
        textureUrl!
    );

    useEffect(() => {

        texture.wrapS =
            THREE.RepeatWrapping;

        texture.repeat.x = -1;

        texture.offset.x = 1;

        texture.minFilter =
            THREE.LinearFilter;

        texture.magFilter =
            THREE.LinearFilter;

        texture.generateMipmaps = false;

        texture.needsUpdate = true;

    }, [texture]);

    return (

        <mesh position={position}>

            <sphereGeometry
                args={[
                    radius,
                    widthSegments,
                    heightSegments
                ]}
            />

            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                transparent
                opacity={opacity}
            />

        </mesh>
    );
}