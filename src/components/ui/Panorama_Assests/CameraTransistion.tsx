import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  trigger: number;
  targetPosition: [number, number, number] | null;
  onStart?: () => void;
  onMidpoint?: () => void;
  onComplete?: () => void;
};

// Internal scratch variables to keep memory usage low
const _v1 = new THREE.Vector3();
const _qStart = new THREE.Quaternion();
const _qEnd = new THREE.Quaternion();

export default function CameraTransition({
  trigger,
  targetPosition,
  onStart,
  onMidpoint,
  onComplete,
}: Props) {
  const { camera } = useThree() as { camera: THREE.PerspectiveCamera };

  const startPos = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const startRot = useRef(new THREE.Quaternion());
  const endRot = useRef(new THREE.Quaternion());

  const progress = useRef(1);
  const animating = useRef(false);
  const midpointFired = useRef(false);

  const duration = 2; // Seconds
  const fovMax = 125;    // The peak of the stretch
  const pushDist = 12;   // How far the camera "dives" into the hotspot

  useEffect(() => {
    if (!targetPosition) return;

    // 1. Capture snapshots of where we are now
    startPos.current.copy(camera.position);
    startRot.current.copy(camera.quaternion);

    // 2. Calculate where we want to "end" (a dash toward the target)
    const targetVec = _v1.set(...targetPosition);
    const direction = _v1.subVectors(targetVec, startPos.current).normalize();
    endPos.current.copy(startPos.current).add(direction.multiplyScalar(pushDist));

    // 3. Calculate the rotation we need to be facing
    const originalRot = camera.quaternion.clone();
    camera.lookAt(targetVec);
    endRot.current.copy(camera.quaternion);
    camera.quaternion.copy(originalRot); // Reset immediately so we can animate it

    progress.current = 0;
    animating.current = true;
    midpointFired.current = false;

    onStart?.();
  }, [trigger]); // Only re-run when the trigger incremented

  useFrame((_, delta) => {
    if (!animating.current) return;

    progress.current = Math.min(progress.current + delta / duration, 1);
    const p = progress.current;

    // QUINTIC EASING: Slow start -> Warp speed -> Gentle settle
    const eased = p < 0.5 
        ? 16 * Math.pow(p, 5) 
        : 1 - Math.pow(-2 * p + 2, 5) / 2;

    // Position & Rotation lerping
    camera.position.lerpVectors(startPos.current, endPos.current, eased);
    camera.quaternion.slerpQuaternions(startRot.current, endRot.current, eased);

    // FOV PUMP: Stretches the world visually during the dash
    const stretch = Math.pow(Math.sin(p * Math.PI), 2);
    camera.fov = THREE.MathUtils.lerp(75, fovMax, stretch);
    camera.updateProjectionMatrix();

    // Midpoint: Swap textures/Nodes here
    if (!midpointFired.current && p >= 0.45) {
      midpointFired.current = true;
      onMidpoint?.();
    }

    if (p >= 1) {
      animating.current = false;
      // SNAP to center of the next scene to allow OrbitControls to work
      camera.position.set(0.3, 0, 0); 
      camera.fov = 75;
      camera.updateProjectionMatrix();
      onComplete?.();
    }
  });

  return null;
}