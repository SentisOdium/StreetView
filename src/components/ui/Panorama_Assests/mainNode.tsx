// mainNode.tsx

import { useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

import type {
    SphereProps
} from "./types/panoramaProps";

export default function MainNode({
    position = [0, 0, 0],
    radius,
    widthSegments = 64,
    heightSegments = 32,
    geometry,
    textureUrl,
    opacity = 1
}: SphereProps) {

    const loadedTexture = useLoader(
        THREE.TextureLoader,
        textureUrl!
    );

    const texture = useMemo(() => {
        const configuredTexture = loadedTexture.clone();

        configuredTexture.wrapS = THREE.RepeatWrapping;
        configuredTexture.repeat.x = -1;
        configuredTexture.offset.x = 1;
        configuredTexture.minFilter = THREE.LinearFilter;
        configuredTexture.magFilter = THREE.LinearFilter;
        configuredTexture.generateMipmaps = false;
        configuredTexture.needsUpdate = true;

        return configuredTexture;
    }, [loadedTexture]);

    useEffect(() => {
        return () => {
            texture.dispose();
        };
    }, [texture]);

    return (

        <mesh position={position} geometry={geometry}>

            {!geometry && (
                <sphereGeometry
                    args={[
                        radius,
                        widthSegments,
                        heightSegments
                    ]}
                />
            )}

            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                transparent
                opacity={opacity}
            />

        </mesh>
    );
}
