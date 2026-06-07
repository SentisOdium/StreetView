import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

import type { SphereProps } from "./types/panoramaProps";

export default function MainNode({
    position = [0, 0, 0],
    radius,
    widthSegments = 64,
    heightSegments = 32,
    geometry,
    textureUrl,
    opacity = 1,
}: SphereProps) {

    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (!textureUrl) return;

        console.log("Loading texture:", textureUrl);

        const loader = new THREE.TextureLoader();

        loader.setCrossOrigin("anonymous");

        loader.load(
            textureUrl,

            (loadedTexture) => {
                console.log("Texture loaded successfully:", loadedTexture);

                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.repeat.x = -1;
                loadedTexture.offset.x = 1;
                loadedTexture.minFilter = THREE.LinearFilter;
                loadedTexture.magFilter = THREE.LinearFilter;
                loadedTexture.generateMipmaps = false;
                loadedTexture.needsUpdate = true;

                setTexture(loadedTexture);
            },

            (progress) => {
                if (progress.total > 0) {
                    console.log(
                        `Loading progress: ${(
                            (progress.loaded / progress.total) *
                            100
                        ).toFixed(2)}%`
                    );
                }
            },

            (error) => {
                console.error("TEXTURE LOAD FAILED");
                console.error("URL:", textureUrl);
                console.error("ERROR:", error);
            }
        );

        return () => {
            setTexture((prev) => {
                prev?.dispose();
                return null;
            });
        };
    }, [textureUrl]);

    const material = useMemo(() => {
        if (!texture) return null;

        return (
            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                transparent
                opacity={opacity}
            />
        );
    }, [texture, opacity]);

    if (!texture) {
        return null;
    }

    return (
        <mesh position={position} geometry={geometry}>
            {!geometry && (
                <sphereGeometry
                    args={[
                        radius,
                        widthSegments,
                        heightSegments,
                    ]}
                />
            )}

            {material}
        </mesh>
    );
}