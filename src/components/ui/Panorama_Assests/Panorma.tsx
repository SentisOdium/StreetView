import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch";
import { Suspense, useState, useEffect, useCallback } from "react";
import * as THREE from "three";

import type { PanoramaProps } from "./types/panoramaProps";
import type { NodeDetails } from "../../api/types/types_api";

import CameraTransition from "./CameraTransistion";
import MainNode from "./mainNode";
import Hotspot from "./hotspot";

function convertCoordinates(coord: string): [number, number, number] {
  const [x, y] = coord.split(",").map(Number);

  return [x * 5, 0, y * -5];
}

type PendingNavigation = {
  nodeName: string;
  targetPosition: [number, number, number];
};

export default function Panorma({
  nodeName,
  onNavigate,
}: PanoramaProps) {
  const { details } = useNodeDetailsFetch(nodeName);

  const [currentImage, setCurrentImage] = useState<string>();
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [transition, setTransition] = useState(1);

  const [cameraTransitionActive, setCameraTransitionActive] = useState(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);

  const [transitionTrigger, setTransitionTrigger] = useState(0);

  const handleCameraTransitionStart = useCallback(() => {
    setCameraTransitionActive(true);
  }, []);

  const handleCameraTransitionComplete = useCallback(() => {
    setCameraTransitionActive(false);
    setPendingNavigation(null);
  }, []);

  const handleCameraTransitionMidpoint = useCallback(() => {
    if (!pendingNavigation) return;
    onNavigate(pendingNavigation.nodeName);
  }, [onNavigate, pendingNavigation]);

  const handleHotspotClick = useCallback(
    (nextNodeName: string, targetPosition: [number, number, number]) => {
      if (nextNodeName === nodeName) return;

      setPendingNavigation({
        nodeName: nextNodeName,
        targetPosition,
      });

      setTransitionTrigger((prev) => prev + 1);
    },
    [nodeName]
  );

  const cloudfrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";
  const rawUrl = details?.Current?.img.src;

  const panoUrl =
    rawUrl && cloudfrontUrl ? `${cloudfrontUrl}/${rawUrl}` : null;

  const maxRadius = 60;

  // panorama transition
  useEffect(() => {
    if (!panoUrl) return;

    let animationFrameId: number;
    let cancelled = false;
    let preloadTexture: THREE.Texture | null = null;
    let start: number;

    const duration = 800;

    const animate = (time: number) => {
      if (cancelled) return;

      if (!start) {
        start = time;
        setTransition(0);

        setCurrentImage((prev) => {
          setPreviousImage(prev ?? null);
          return panoUrl;
        });
      }

      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);

      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setTransition(eased);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setPreviousImage(null);
      }
    };

    const loader = new THREE.TextureLoader();

    preloadTexture = loader.load(
      panoUrl,
      () => {
        if (cancelled) return;
        animationFrameId = requestAnimationFrame(animate);
      },
      undefined,
      () => {
        if (cancelled) return;
        animationFrameId = requestAnimationFrame(animate);
      }
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      preloadTexture?.dispose();
    };
  }, [panoUrl]);

  // loading guard
  if (!rawUrl) {
    return <div className="ml-60">Loading panorama...</div>;
  }

  if (!cloudfrontUrl) {
    console.error("VITE_CLOUDFRONT_URL is not set");
    return <div className="ml-60">Configuration error</div>;
  }

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      camera={{
        position: [0.3, 0, 0],
        fov: 75,
        near: 0.1,
        far: 2000,
      }}
    >
      {/* camera push animation */}
      <CameraTransition
        trigger={transitionTrigger}
        targetPosition={
          pendingNavigation?.targetPosition ?? null
        }
        onStart={handleCameraTransitionStart}
        onMidpoint={handleCameraTransitionMidpoint}
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
        {(details.Hotspots ?? []).map(
          (h: NodeDetails["Hotspots"][number]) => {
            const position = convertCoordinates(
              h.coordinates.node_Coordinates
            );

            return (
              <Hotspot
                key={h.node_id}
                color="red"
                position={position}
                onclick={() =>
                  handleHotspotClick(
                    h.hotspot_name,
                    position
                  )
                }
              />
            );
          }
        )}

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
