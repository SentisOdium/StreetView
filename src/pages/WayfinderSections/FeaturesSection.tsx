import { useState, useEffect, useRef } from "react";
import { useReveal } from "./utils";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

// The sphere panorama component
function PanoramaSphere() {
  const texture = useTexture("/landingPanorama/ITECH_CENTER.webp");

  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// Custom viewer component to handle interaction, vertical rotation unlocking, and auto-reset lock on inactivity
function PanoramaViewer() {
  const controlsRef = useRef<any>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const timerRef = useRef<any>(null);

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
    }, 1400); // 3 seconds of inactivity before auto-locking back vertically
  };

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <PanoramaSphere />
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={true}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        autoRotate={!isInteracting && !shouldReset}
        autoRotateSpeed={2.5}
        onStart={handleStart}
        onEnd={handleEnd}
      />
    </>
  );
}

export function FeaturesSection() {
  const row1Reveal = useReveal<HTMLDivElement>();
  const row2Reveal = useReveal<HTMLDivElement>();
  const row3Reveal = useReveal<HTMLDivElement>();

  return (
    <div className="flex flex-col gap-0">
      <section id="features-3d" ref={row1Reveal.ref} className="bg-yellow-500 h-screen w-full snap-center">

        <div className="grid grid-cols-5 grid-rows-5 gap-4">
          <div className="bg-red-500 col-span-3 row-span-4 " >1</div>
          <div className="bg-green-500 col-span-2 row-span-4 " >2</div>
        </div>

      </section>
      <section id="features-search" ref={row2Reveal.ref} className="bg-purple-500 h-screen w-full snap-center">
        <div className="grid grid-cols-5 grid-rows-5 gap-4">
          <div className="bg-red-500 col-span-3 row-span-4 " >1</div>
          <div className="bg-green-500 col-span-2 row-span-4 " >2</div>
        </div>
      </section>
      <section id="features-route" ref={row3Reveal.ref} className="bg-cyan-500 h-screen w-full snap-center">
        <div className="grid grid-cols-5 grid-rows-5 gap-4">
          <div className="bg-red-500 col-span-3 row-span-4 " >1</div>
          <div className="bg-green-500 col-span-2 row-span-4 " >2</div>
        </div>
      </section>
    </div>
  );
}
