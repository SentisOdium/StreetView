import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch";
import { Suspense, useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

import type { PanoramaProps } from "./types/panoramaProps";
import type { Hotspot as HotspotData, NodeDetails } from "../../api/types/types_api";

import CameraTransition from "./CameraTransistion";
import MainNode from "./mainNode";
import Hotspot from "./hotspot";
import PanoramaStatus from "../reusableUI/PanoramaStatus";
import { panoramaImageUrl } from "../../utils/imageUrl";

const DEBUG_NAV = import.meta.env.DEV;

function convertCoordinates(coord: string): [number, number, number] {
  const [x, y] = coord.split(",").map(Number);

  return [x * 5, 0, y * -5];
}

type PendingNavigation = {
  destinationId: number;
  destinationName: string;
  targetPosition: [number, number, number];
};

const PANORAMA_RADIUS = 60;
const PANORAMA_WIDTH_SEGMENTS = 64;
const PANORAMA_HEIGHT_SEGMENTS = 32;

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
  const blinkTimeouts = useRef<number[]>([]);
  const currentImageRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    currentImageRef.current = currentImage;
  }, [currentImage]);

  const handleCameraTransitionStart = useCallback(() => {
    setCameraTransitionActive(true);
  }, []);

  const handleCameraTransitionComplete = useCallback(() => {
    setCameraTransitionActive(false);
    setPendingNavigation(null);
  }, []);

  const currentNodeId = details?.Current?.id;

  const handleCameraTransitionMidpoint = useCallback(() => {
    if (!pendingNavigation) return;
    onNavigate(
      pendingNavigation.destinationId,
      pendingNavigation.destinationName
    );
  }, [onNavigate, pendingNavigation]);

  const handleHotspotClick = useCallback(
    (hotspot: HotspotData, targetPosition: [number, number, number]) => {
      const { destination_id: destinationId } = hotspot;

      if (DEBUG_NAV) {
        console.log("Hotspot payload:", hotspot);
        console.log("Current node:", currentNodeId);
        console.log("Destination node:", destinationId);
      }

      if (!destinationId || destinationId === currentNodeId) return;

      setPendingNavigation({
        destinationId,
        destinationName: hotspot.destination_name,
        targetPosition,
      });

      setTransitionTrigger((prev) => prev + 1);
    },
    [currentNodeId]
  );

  const rawUrl = details?.Current?.img.src;
  const panoUrl = panoramaImageUrl(rawUrl);
  const cloudfrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";

  const panoramaGeometry = useMemo(
    () =>
      new THREE.SphereGeometry(
        PANORAMA_RADIUS,
        PANORAMA_WIDTH_SEGMENTS,
        PANORAMA_HEIGHT_SEGMENTS
      ),
    []
  );

  useEffect(() => {
    return () => {
      panoramaGeometry.dispose();
    };
  }, [panoramaGeometry]);

  // panorama blink transition
  useEffect(() => {
    if (!panoUrl) return;

    blinkTimeouts.current.forEach(clearTimeout);
    blinkTimeouts.current = [];

    setPreviousImage(currentImageRef.current ?? null);
    setCurrentImage(panoUrl);
    setTransition(1);

    const blinkSequence = [0, 1, 0, 1];
    blinkSequence.forEach((value, index) => {
      const timeoutId = window.setTimeout(() => {
        setTransition(value);
      }, index * 120);
      blinkTimeouts.current.push(timeoutId);
    });

    const cleanupId = window.setTimeout(() => {
      setPreviousImage(null);
    }, blinkSequence.length * 120);
    blinkTimeouts.current.push(cleanupId);

    return () => {
      blinkTimeouts.current.forEach(clearTimeout);
      blinkTimeouts.current = [];
    };
  }, [panoUrl]);

  if (!cloudfrontUrl) {
    console.error("VITE_CLOUDFRONT_URL is not set");
    return (
      <PanoramaStatus
        variant="error"
        message="Panorama images are unavailable. Set VITE_CLOUDFRONT_URL and reload."
      />
    );
  }

  if (!rawUrl || !panoUrl) {
    return <PanoramaStatus message="Loading panorama..." />;
  }

  return (
    <div className="relative h-full w-full">
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
        {(details?.Hotspots ?? []).map(
          (h: NodeDetails["Hotspots"][number], index: number) => {
            const position = convertCoordinates(
              h.coordinates.node_Coordinates
            );

            return (
              <Hotspot
                key={`${h.destination_id}-${h.coordinates.node_Direction}-${index}`}
                color="red"
                position={position}
                onclick={() => handleHotspotClick(h, position)}
              />
            );
          }
        )}

        {/* PREVIOUS PANORAMA */}
        {previousImage && (
          <MainNode
            radius={PANORAMA_RADIUS}
            geometry={panoramaGeometry}
            textureUrl={previousImage}
            position={[0, 0, 0]}
            opacity={1 - transition}
          />
        )}

        {/* CURRENT PANORAMA */}
        {currentImage && (
          <MainNode
            radius={PANORAMA_RADIUS}
            geometry={panoramaGeometry}
            textureUrl={currentImage}
            position={[0, 0, 0]}
            opacity={transition}
          />
        )}
      </Suspense>
    </Canvas>
    </div>
  );
}
