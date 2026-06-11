import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import type { Hotspot as HotspotData } from "../../api/types/types_api";
import { useLocation } from "../../../context/LocationContext";
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch";
import Scene from "./components/Scene";
import PanoramaStatus from "../reusableUI/PanoramaStatus";
import { panoramaImageUrl } from "../../utils/imageUrl";
import { loadTexture } from "./utils/textureCache";

export type PanoramaViewerProps = {
  nodeId: number;
  onNavigate: (destinationId: number) => void;
};

type SceneState = {
  nodeId: number;
  texture: THREE.Texture;
  hotspots: HotspotData[];
};

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

type TransitionControllerProps = {
  prevMaterialRef: React.RefObject<THREE.MeshBasicMaterial | null>;
  currMaterialRef: React.RefObject<THREE.MeshBasicMaterial | null>;
  animatingTransition: boolean;
  onComplete: () => void;
};

function TransitionController({
  prevMaterialRef,
  currMaterialRef,
  animatingTransition,
  onComplete,
}: TransitionControllerProps) {
  const transitionTime = useRef(0);
  const duration = 0.9; // 900ms transition

  useFrame((_, delta) => {
    if (animatingTransition) {
      transitionTime.current = Math.min(transitionTime.current + delta, duration);
      const progress = transitionTime.current / duration;
      const eased = easeInOutCubic(progress);

      if (prevMaterialRef.current) {
        prevMaterialRef.current.opacity = 1 - eased;
      }
      if (currMaterialRef.current) {
        currMaterialRef.current.opacity = eased;
      }

      if (transitionTime.current >= duration) {
        onComplete();
        transitionTime.current = 0;
      }
    } else {
      if (currMaterialRef.current) {
        currMaterialRef.current.opacity = 1;
      }
      if (prevMaterialRef.current) {
        prevMaterialRef.current.opacity = 0;
      }
    }
  });

  return null;
}

export default function PanoramaViewer({ nodeId, onNavigate }: PanoramaViewerProps) {
  const { fetchNodeDetails } = useLocation();
  const { details, loading, error } = useNodeDetailsFetch(nodeId);

  const [currentScene, setCurrentScene] = useState<SceneState | null>(null);
  const [previousScene, setPreviousScene] = useState<SceneState | null>(null);
  const [animatingTransition, setAnimatingTransition] = useState(false);

  const prevMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const currMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Preloads the textures/details of adjacent nodes
  const preloadAdjacent = useCallback(
    async (hotspots: HotspotData[]) => {
      for (const hotspot of hotspots) {
        try {
          const adjDetails = await fetchNodeDetails(hotspot.destination_id);
          if (adjDetails?.Current?.img.src) {
            const adjUrl = panoramaImageUrl(adjDetails.Current.img.src);
            if (adjUrl) {
              void loadTexture(adjUrl);
            }
          }
        } catch (err) {
          console.warn(`Failed to preload adjacent node details or texture for ID: ${hotspot.destination_id}`, err);
        }
      }
    },
    [fetchNodeDetails]
  );

  // Load the new node details and texture
  useEffect(() => {
    const current = details?.Current;
    if (!current) return;

    let active = true;
    const loadScene = async () => {
      const srcUrl = current.img.src;
      const panoUrl = panoramaImageUrl(srcUrl);

      if (!panoUrl) return;

      try {
        const texture = await loadTexture(panoUrl);

        if (!active || !isMounted.current) return;

        const nextScene: SceneState = {
          nodeId: current.id,
          texture,
          hotspots: details?.Hotspots || [],
        };

        setCurrentScene((prev) => {
          if (!prev) {
            // First scene loads immediately
            setAnimatingTransition(false);
            return nextScene;
          } else if (prev.nodeId !== nextScene.nodeId) {
            // Swap and trigger transition
            setPreviousScene(prev);
            setAnimatingTransition(true);
            return nextScene;
          }
          return prev;
        });

        // Preload adjacent node textures immediately
        void preloadAdjacent(nextScene.hotspots);
      } catch (err) {
        console.error("Failed to load scene texture", err);
      }
    };

    void loadScene();

    return () => {
      active = false;
    };
  }, [details, preloadAdjacent]);

  const handleTransitionComplete = useCallback(() => {
    setPreviousScene(null);
    setAnimatingTransition(false);
  }, []);

  const handleHotspotClick = useCallback(
    (destinationId: number) => {
      if (animatingTransition || (currentScene && nodeId !== currentScene.nodeId)) {
        return; // Transition Lock
      }
      onNavigate(destinationId);
    },
    [animatingTransition, currentScene, nodeId, onNavigate]
  );

  // Navigation lock if prop nodeId is different from loaded currentScene ID, or if transition animation is active
  const isTransitioning =
    animatingTransition || (currentScene !== null && nodeId !== currentScene.nodeId);

  const cloudfrontUrl = import.meta.env.VITE_CLOUDFRONT_URL || "";
  if (!cloudfrontUrl) {
    console.error("VITE_CLOUDFRONT_URL is not set");
    return (
      <PanoramaStatus
        variant="error"
        message="Panorama images are unavailable. Set VITE_CLOUDFRONT_URL and reload."
      />
    );
  }

  if (error) {
    return <PanoramaStatus variant="error" message={`Failed to load: ${error}`} />;
  }

  if (loading && !currentScene) {
    return <PanoramaStatus message="Loading panorama..." />;
  }

  if (!currentScene) {
    return <PanoramaStatus message="Loading panorama..." />;
  }

  return (
    <div className="relative h-full w-full bg-black">
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{
          position: [0.3, 0, 0],
          fov: 75,
          near: 0.1,
          far: 2000,
        }}

      >

        <TransitionController
          prevMaterialRef={prevMaterialRef}
          currMaterialRef={currMaterialRef}
          animatingTransition={animatingTransition}
          onComplete={handleTransitionComplete}
        />


        <OrbitControls
          enableZoom={!isTransitioning}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={2}
          maxDistance={55}
        />

        <ambientLight intensity={1} />

        {/* Previous panorama scene (fades out) */}
        {previousScene && (
          <Scene
            ref={prevMaterialRef}
            texture={previousScene.texture}
            opacity={1}
            showHotspots={false}
            hotspotsDisabled={true}
            onHotspotClick={handleHotspotClick}
          />
        )}

        {/* Current panorama scene (fades in) */}
        {currentScene && (
          <Scene
            ref={currMaterialRef}
            texture={currentScene.texture}
            opacity={animatingTransition ? 0 : 1}
            hotspots={currentScene.hotspots}
            showHotspots={true}
            hotspotsDisabled={isTransitioning}
            onHotspotClick={handleHotspotClick}
          />
        )}
      </Canvas>
    </div>
  );
}
