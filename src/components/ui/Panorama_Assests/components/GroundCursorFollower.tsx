import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function GroundCursorFollower() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Load the arrow SVG texture
  const texture = useTexture("/logo/arrow-open-end-svgrepo-com.png");

  // Define the ground plane at y = -12 in world space
  const groundHeight = -12;
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -groundHeight));

  // Current interpolated position of the follower
  const currentPos = useRef(new THREE.Vector3(0, groundHeight, 0));

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const raycaster = state.raycaster;
    const camera = state.camera;
    const intersection = new THREE.Vector3();

    // Raycast onto the ground plane
    const intersects = raycaster.ray.intersectPlane(groundPlane.current, intersection);

    let dist = 0;
    if (intersects) {
      dist = camera.position.distanceTo(intersection);
    }

    // Determine if the cursor is hovering over the canvas viewport container.
    // If the mouse is over the side panel overlays or off-screen, canvas:hover is false.
    const isCanvasHovered = document.querySelector(".panorama-pointer-container canvas:hover") !== null;

    // Hide the ground cursor if the pointer is specifically hovering over a hotspot arrow
    const isHoveringHotspotArrow = !!(window as any).isHoveringHotspotArrow;

    // Only show the ground follower if there is a valid intersection, it's not too far,
    // the mouse pointer is active over the canvas, and we are not hovering on a hotspot arrow.
    const isValidIntersection = intersects && dist < 45;
    const targetOpacity = (isValidIntersection && isCanvasHovered && !isHoveringHotspotArrow) ? 0.8 : 0;

    // Smoothly interpolate opacity
    materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.15;
    materialRef.current.visible = materialRef.current.opacity > 0.01;

    if (isValidIntersection) {
      // If previously hidden/faded out, snap directly to intersection to prevent trailing slide-in
      if (materialRef.current.opacity < 0.05) {
        currentPos.current.copy(intersection);
      } else {
        // Otherwise, smoothly lerp to the new position
        currentPos.current.lerp(intersection, 0.2);
      }

      // Update position of the mesh
      meshRef.current.position.copy(currentPos.current);

      // Calculate direction vector from camera to the follower on the ground plane (XZ direction only)
      const dirX = currentPos.current.x - camera.position.x;
      const dirZ = currentPos.current.z - camera.position.z;

      // The arrow texture points to the right (+X) by default.
      // We align the rotation around local Z axis (world Y axis) to point away from camera.
      const angle = Math.atan2(-dirZ, dirX);
      meshRef.current.rotation.set(-Math.PI / 2, 0, angle);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, groundHeight, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={5}
    >
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent={true}
        opacity={0}
        side={THREE.DoubleSide}
        depthTest={true}
        depthWrite={false}
        alphaTest={0.01} // Clip transparent white border pixels to prevent edge bleeding
        color="#ffffff" // Render original texture colors (yellow and red) untinted
      />
    </mesh>
  );
}
