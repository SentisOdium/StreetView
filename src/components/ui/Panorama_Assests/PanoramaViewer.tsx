import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import type { Hotspot as HotspotData } from "../../api/types/types_api";
import { useLocation } from "../../../context/LocationContext";
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch";
import Scene from "./components/Scene";
import GroundCursorFollower from "./components/GroundCursorFollower";
import PanoramaStatus from "../reusableUI/PanoramaStatus";
import { panoramaImageUrl } from "../../utils/imageUrl";
import { loadTexture, preloadTextureLowPriority } from "./utils/textureCache";

export type PanoramaViewerProps = {
  nodeId: number;
  onNavigate: (destinationId: number) => void;
};

type SceneState = {
  nodeId: number;
  texture: THREE.Texture;
  hotspots: HotspotData[];
  rotationOffset?: number;
  rotationOffsetX?: number;
  rotationOffsetZ?: number;
};

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

type TransitionControllerProps = {
  prevMaterialRef: React.RefObject<THREE.MeshBasicMaterial | null>;
  currMaterialRef: React.RefObject<THREE.MeshBasicMaterial | null>;
  animatingTransition: boolean;
  onComplete: () => void;
  transitionTarget: THREE.Vector3 | null;
  scenesGroupRef: React.RefObject<THREE.Group | null>;
  currentSceneGroupRef: React.RefObject<THREE.Group | null>;
};

function TransitionController({
  prevMaterialRef,
  currMaterialRef,
  animatingTransition,
  onComplete,
  transitionTarget,
  scenesGroupRef,
  currentSceneGroupRef,
}: TransitionControllerProps) {
  const transitionTime = useRef(0);
  const duration = 1.5; // 900ms transition
  const hasCompleted = useRef(false);

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

      if (transitionTarget && scenesGroupRef.current && currentSceneGroupRef.current) {
        // Move the entire world backwards to simulate camera moving forward
        const moveDist = 20 * eased;
        scenesGroupRef.current.position.copy(transitionTarget).multiplyScalar(-moveDist);

        // Keep current scene offset forwards so it ends up perfectly at origin
        currentSceneGroupRef.current.position.copy(transitionTarget).multiplyScalar(20);
      }

      if (transitionTime.current >= duration && !hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    } else {
      if (currMaterialRef.current) {
        currMaterialRef.current.opacity = 1;
      }
      if (prevMaterialRef.current) {
        prevMaterialRef.current.opacity = 0;
      }

      // Safe state reset after React re-renders to prevent 1-frame jitter
      if (scenesGroupRef.current) {
        scenesGroupRef.current.position.set(0, 0, 0);
      }
      if (currentSceneGroupRef.current) {
        currentSceneGroupRef.current.position.set(0, 0, 0);
      }

      transitionTime.current = 0;
      hasCompleted.current = false;
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
  const [transitionTarget, setTransitionTarget] = useState<THREE.Vector3 | null>(null);

  const prevMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const currMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const scenesGroupRef = useRef<THREE.Group>(null);
  const currentSceneGroupRef = useRef<THREE.Group>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Smart Preloading: fetches adjacent textures in the background with low network priority.
  // This downloads the image to the browser cache without clogging the network for active clicks.
  const preloadAdjacent = useCallback(
    async (hotspots: HotspotData[]) => {
      for (const hotspot of hotspots) {
        try {
          const adjDetails = await fetchNodeDetails(hotspot.destination_id);
          if (adjDetails?.Current?.img.src) {
            const adjUrl = panoramaImageUrl(adjDetails.Current.img.src);
            if (adjUrl) {
              preloadTextureLowPriority(adjUrl);
            }
          }
        } catch (err) {
          console.warn(`Failed to preload adjacent node ID: ${hotspot.destination_id}`, err);
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
          rotationOffset: current.img?.rotation_offset,
          rotationOffsetX: current.img?.rotation_offset_x,
          rotationOffsetZ: current.img?.rotation_offset_z,
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

        // Preload adjacent node textures using the low-priority smart queue
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
    setTransitionTarget(null);
  }, []);

  const handleHotspotClick = useCallback(
    (destinationId: number, position?: [number, number, number]) => {
      if (animatingTransition || (currentScene && nodeId !== currentScene.nodeId)) {
        return; // Transition Lock
      }

      if (position) {
        const targetVec = new THREE.Vector3(...position).normalize();
        setTransitionTarget(targetVec);
      } else {
        setTransitionTarget(null);
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
        message="Virtual view Images are Unavaliable, try reloading the website"
      />
    );
  }

  if (error) {
    return <PanoramaStatus variant="error" message={`Failed to load: ${error}`} />;
  }

  if (loading && !currentScene) {
    return <PanoramaStatus message="Loading virtual view..." />;
  }

  if (!currentScene) {
    return <PanoramaStatus message="Loading virtual view..." />;
  }

  return (
    <div className="relative h-full w-full bg-black panorama-pointer-container">
      <Canvas
        style={{ width: "100%", height: "100%" }}
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
          transitionTarget={transitionTarget}
          scenesGroupRef={scenesGroupRef}
          currentSceneGroupRef={currentSceneGroupRef}
        />


        <OrbitControls
          enableZoom={!isTransitioning}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={2}
          maxDistance={55}
        />

        <ambientLight intensity={1} />

        {/* Ground cursor follower projecting arrow SVG */}
        <GroundCursorFollower />

        <group ref={scenesGroupRef}>
          {/* Previous panorama scene (fades out) */}
          {previousScene && (
            <Scene
              ref={prevMaterialRef}
              texture={previousScene.texture}
              opacity={1}
              rotationOffset={previousScene.rotationOffset}
              rotationOffsetX={previousScene.rotationOffsetX}
              rotationOffsetZ={previousScene.rotationOffsetZ}
              showHotspots={false}
              hotspotsDisabled={true}
              onHotspotClick={handleHotspotClick}
            />
          )}

          {/* Current panorama scene (fades in) */}
          {currentScene && (
            <group ref={currentSceneGroupRef}>
              <Scene
                ref={currMaterialRef}
                texture={currentScene.texture}
                opacity={animatingTransition ? 0 : 1}
                rotationOffset={currentScene.rotationOffset}
                rotationOffsetX={currentScene.rotationOffsetX}
                rotationOffsetZ={currentScene.rotationOffsetZ}
                hotspots={currentScene.hotspots}
                showHotspots={true}
                hotspotsDisabled={isTransitioning}
                onHotspotClick={handleHotspotClick}
              />
            </group>
          )}
        </group>
      </Canvas>
    </div>
  );
}
