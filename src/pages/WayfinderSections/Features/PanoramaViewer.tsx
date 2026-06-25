import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

// The sphere panorama component
import { useMemo } from "react";

function PanoramaSphere() {
  const loadedTexture = useTexture("/landingPanorama/ITECH_CENTER.webp");

  const texture = useMemo(() => {
    const tex = loadedTexture.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;
    return tex;
  }, [loadedTexture]);

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// Subcomponent inside Canvas to safely use R3F hooks (useFrame)
function PanoramaController({
  isInteracting,
  setIsInteracting,
  shouldReset,
  setShouldReset,
  timerRef,
  controlsRef
}: {
  isInteracting: boolean;
  setIsInteracting: (val: boolean) => void;
  shouldReset: boolean;
  setShouldReset: (val: boolean) => void;
  timerRef: React.MutableRefObject<any>;
  controlsRef: React.MutableRefObject<any>;
}) {
  useFrame(() => {
    if (shouldReset && controlsRef.current) {
      const controls = controlsRef.current;
      const targetPolar = Math.PI / 2;
      const diff = targetPolar - controls.getPolarAngle();

      if (Math.abs(diff) > 0.001) {
        // Smoothly lerp vertical tilt back to eye-level
        controls.minPolarAngle = controls.getPolarAngle() + diff * 0.05;
        controls.maxPolarAngle = controls.minPolarAngle;
        controls.update();
      } else {
        // Lock it back horizontally
        controls.minPolarAngle = targetPolar;
        controls.maxPolarAngle = targetPolar;
        controls.update();
        setShouldReset(false);
      }
    } else if (isInteracting && controlsRef.current) {
      // Allow full vertical tilt while the user is actively dragging
      controlsRef.current.minPolarAngle = 0;
      controlsRef.current.maxPolarAngle = Math.PI;
    }
  });

  const handleStart = () => {
    setIsInteracting(true);
    setShouldReset(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleEnd = () => {
    setIsInteracting(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShouldReset(true);
    }, 1400); // Inactivity timeout before auto locking back vertically
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      autoRotate={!isInteracting && !shouldReset}
      autoRotateSpeed={2.5}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
}

// Custom viewer component to handle interaction, vertical rotation unlocking, and auto-reset lock on inactivity
export function PanoramaViewer() {
  const controlsRef = useRef<any>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full relative flex-1">
      <Canvas camera={{ position: [0, 0, 0.1] }}>
        <Suspense fallback={null}>
          <PanoramaSphere />
          <PanoramaController
            isInteracting={isInteracting}
            setIsInteracting={setIsInteracting}
            shouldReset={shouldReset}
            setShouldReset={setShouldReset}
            timerRef={timerRef}
            controlsRef={controlsRef}
          />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-md text-slate-800 text-[10px] sm:text-xs px-2.5 py-1.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 shadow-md pointer-events-none leading-relaxed z-10 text-center sm:text-left">
        <span className="font-semibold text-[#800000] mr-1.5 hidden sm:inline">Interactive Virtual View:</span>
        <span className="hidden sm:inline">Drag screen to explore the campus in 360 degrees.</span>
        <span className="inline sm:hidden">Drag screen to explore 360°</span>
      </div>
    </div>
  );
}
