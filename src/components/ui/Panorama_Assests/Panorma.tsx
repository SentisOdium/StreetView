// Panorma.tsx

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch";
import { Suspense, useState, useEffect, useCallback } from "react";
import type { PanoramaProps } from "./types/panoramaProps";
import type { NodeDetails } from "../../api/types/types_api";

import CameraTransition from "./CameraTransistion";

import MainNode from "./mainNode";
import Hotspot from "./hotspot";

function convertCoordinates(
    coord: string
): [number, number, number] {

    const [x, y] = coord
        .split(",")
        .map(Number);

    return [
        x * 5,
        0,
        y * -5
    ];
}

export default function Panorma({
    nodeName,
    onNavigate
}: PanoramaProps) {

    const { details } = useNodeDetailsFetch(nodeName);

    const [currentImage, setCurrentImage] = useState<string>();
    const [previousImage, setPreviousImage] = useState<string | null>(null);
    const [transition, setTransition] = useState(1);
    const [cameraTransitionActive, setCameraTransitionActive] = useState(false);

    const handleCameraTransitionStart = useCallback(() => {
        setCameraTransitionActive(true);
    }, []);

    const handleCameraTransitionComplete = useCallback(() => {
        setCameraTransitionActive(false);
    }, []);

    const cloudfrontUrl =
        import.meta.env.VITE_CLOUDFRONT_URL || "";

    const rawUrl = details?.Current?.img.src;

    const panoUrl = rawUrl && cloudfrontUrl
        ? `${cloudfrontUrl}/${rawUrl}`
        : null;

    const maxRadius = 60;

    // panorama transition
    useEffect(() => {

        if (!panoUrl) return;

        let animationFrameId: number;

        let start: number;

        const duration = 800;

        const animate = (time: number) => {

            if (!start) {
                start = time;
                setTransition(0);

                setCurrentImage(prev => {

                    setPreviousImage(prev ?? null);

                    return panoUrl;
                });
            }

            const elapsed = time - start;

            const progress =
                Math.min(elapsed / duration, 1);

            // cubic easing
            const eased =
                progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 -
                    Math.pow(
                        -2 * progress + 2,
                        3
                    ) / 2;

            setTransition(eased);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setPreviousImage(null);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };

    }, [panoUrl]);

    // loading guard
    if (!rawUrl) {
        return (
            <div className="ml-60">
                Loading panorama...
            </div>
        );
    }

    if (!cloudfrontUrl) {
        console.error("VITE_CLOUDFRONT_URL is not set");

        return (
            <div className="ml-60">
                Configuration error
            </div>
        );
    }

    return (

        <Canvas
            style={{
                width: "100vw",
                height: "100vh"
            }}

            camera={{
                position: [0.3, 0, 0],
                fov: 75,
                near: 0.1,
                far: 2000
            }}
        >

            {/* camera push animation */}
            <CameraTransition
                trigger={nodeName}
                onStart={handleCameraTransitionStart}
                onComplete={handleCameraTransitionComplete}
            />

            <OrbitControls
                enabled={!cameraTransitionActive}
                enableZoom={!cameraTransitionActive}
                enablePan={true}
                enableRotate={!cameraTransitionActive}
                zoomSpeed={2}
                maxDistance={55}
            />

            <ambientLight intensity={1} />

            <Suspense fallback={null}>

                {/* HOTSPOTS */}
                {(details.Hotspots ?? []).map((
                    h: NodeDetails["Hotspots"][number]
                ) => (

                    <Hotspot
                        key={h.node_id}
                        color={"red"}
                        position={convertCoordinates(
                            h.coordinates.node_Coordinates
                        )}

                        onclick={() =>
                            onNavigate(
                                h.hotspot_name
                            )
                        }
                    />

                ))}

                {/* PREVIOUS PANORAMA */}
                {previousImage && (

                    <MainNode
                        radius={maxRadius}
                        textureUrl={previousImage}
                        position={[0, 0, 0]}
                        opacity={1 - transition}
                    />

                )}

                {/* CURRENT PANORAMA */}
                {currentImage && (

                    <MainNode
                        radius={maxRadius}
                        textureUrl={currentImage}
                        position={[0, 0, 0]}
                        opacity={transition}
                    />

                )}

            </Suspense>

        </Canvas>
    );
}
