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
      {/* Row 1: 3D Visualization */}
      <section
        id="features-3d"
        ref={row1Reveal.ref}
        className={`flex items-center justify-center min-h-[80vh] w-full relative box-border px-6 py-10 overflow-hidden snap-center snap-always ${row1Reveal.visible ? "wf-reveal" : ""}`}
      >
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="text-left flex flex-col justify-center relative z-30">
            <span className="inline-block px-4 py-1.5 bg-[var(--wf-maroon-glow)] text-[var(--wf-maroon)] rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
              Core Features
            </span>
            <h3 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight mb-4 text-[var(--wf-dark)]">
              3D Visualize
            </h3>
            <p className="text-lg text-[var(--wf-gray-600)] leading-relaxed m-0">
              Explore the campus in an interactive 3D panoramic view with smooth navigation.
              Get a real-world perspective before you even step foot in the building.
            </p>
          </div>
          <div
            className="
              relative
              w-[80vw]
              h-[80vw]
              max-w-[340px]
              max-h-[340px]
              mx-auto
              mt-8
              rounded-full
              overflow-hidden
              z-20
              md:absolute
              md:w-[115vh]
              md:h-[115vh]
              md:max-w-none
              md:max-h-none
              md:top-1/2
              md:-right-[25vh]
              md:-translate-y-1/2
              md:mt-0
            "
          >
            <Canvas camera={{ position: [0, 0, 0.1], fov: 90 }}>
              <PanoramaViewer />
            </Canvas>
          </div>
        </div>
      </section>

      {/* Row 2: Search */}
      <section
        id="features-search"
        ref={row2Reveal.ref}
        className={`flex items-center justify-center min-h-[80vh] w-full relative box-border px-6 py-10 overflow-hidden snap-center snap-always ${row2Reveal.visible ? "wf-reveal" : ""}`}
      >
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="relative w-full flex items-center justify-center py-6 md:py-0 order-2 md:order-1">
            <div className="w-full max-w-[400px] bg-[var(--wf-white)] rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.1)] border border-[var(--wf-gray-200)] p-6">
              <div className="flex items-center gap-3 bg-[var(--wf-gray-100)] px-5 py-4 rounded-[16px] mb-6">
                <svg className="text-[var(--wf-gray-600)]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input className="border-none bg-none text-base text-[var(--wf-dark)] w-full outline-none" type="text" placeholder="Search for ITECH Center..." disabled />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-4 rounded-[12px] transition-colors duration-200 cursor-pointer hover:bg-[var(--wf-gray-100)]">
                  <div className="text-xl">📍</div>
                  <div className="font-medium text-[var(--wf-dark)]">ITECH Center - Main Entrance</div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-[12px] transition-colors duration-200 cursor-pointer hover:bg-[var(--wf-gray-100)]">
                  <div className="text-xl">🏢</div>
                  <div className="font-medium text-[var(--wf-dark)]">ITECH Center - 2nd Floor Labs</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-left flex flex-col justify-center order-1 md:order-2">
            <span className="inline-block px-4 py-1.5 bg-[var(--wf-maroon-glow)] text-[var(--wf-maroon)] rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
              Core Features
            </span>
            <h3 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight mb-4 text-[var(--wf-dark)]">
              Intelligent Search
            </h3>
            <p className="text-lg text-[var(--wf-gray-600)] leading-relaxed m-0">
              Find any building, room, or landmark instantly. Our smart search helps you locate exactly what you need in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Row 3: Route Generation */}
      <section
        id="features-route"
        ref={row3Reveal.ref}
        className={`flex items-center justify-center min-h-[80vh] w-full relative box-border px-6 py-10 overflow-hidden snap-center snap-always ${row3Reveal.visible ? "wf-reveal" : ""}`}
      >
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="text-left flex flex-col justify-center">
            <span className="inline-block px-4 py-1.5 bg-[var(--wf-maroon-glow)] text-[var(--wf-maroon)] rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
              Core Features
            </span>
            <h3 className="text-[clamp(32px,4vw,48px)] font-extrabold tracking-tight mb-4 text-[var(--wf-dark)]">
              Generate Route
            </h3>
            <p className="text-lg text-[var(--wf-gray-600)] leading-relaxed m-0">
              Get step-by-step directions to navigate anywhere across campus. Optimize your path and never get lost again.
            </p>
          </div>
          <div className="relative w-full flex items-center justify-center py-6 md:py-0">
            <div className="w-full max-w-[400px] bg-[var(--wf-white)] rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.1)] border border-[var(--wf-gray-200)] overflow-hidden">
              <div className="p-6 border-b border-[var(--wf-gray-200)] bg-[#fafafa]">
                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-base text-[var(--wf-dark)] flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full border-[3px] border-[var(--wf-gray-400)] block" />
                    Main Gate
                  </div>
                  <div className="ml-1.5 text-[var(--wf-gray-400)] text-sm">↓</div>
                  <div className="font-semibold text-base text-[var(--wf-dark)] flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[var(--wf-maroon)] block" />
                    ITECH Center
                  </div>
                </div>
              </div>
              <div className="w-full h-[200px] bg-[var(--wf-gray-100)] relative">
                {/* Simple SVG mock route */}
                <svg viewBox="0 0 200 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                  <path d="M20,80 Q50,80 80,50 T180,20" fill="none" stroke="var(--wf-maroon)" strokeWidth="4" strokeDasharray="6,6" className="animate-[routeDash_20s_linear_infinite]" />
                  <circle cx="20" cy="80" r="6" fill="var(--wf-dark)" />
                  <circle cx="180" cy="20" r="8" fill="var(--wf-maroon)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
