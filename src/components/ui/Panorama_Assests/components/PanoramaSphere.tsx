import { forwardRef } from "react";
import * as THREE from "three";
type PanoramaSphereProps = {
  texture: THREE.Texture;
  opacity?: number;
  rotationOffset?: number;
  rotationOffsetX?: number;
  rotationOffsetZ?: number;
};

const PanoramaSphere = forwardRef<THREE.MeshBasicMaterial, PanoramaSphereProps>(
  ({ texture, opacity = 1, rotationOffset = 81, rotationOffsetX = 0, rotationOffsetZ = 0 }, ref) => {
    return (
      <mesh
        position={[0, 0, 0]}
        rotation={[
          THREE.MathUtils.degToRad(3 + rotationOffsetX),
          THREE.MathUtils.degToRad(rotationOffset),
          THREE.MathUtils.degToRad(rotationOffsetZ),
        ]}
      >
        <sphereGeometry args={[60, 64, 32]} />
        <meshBasicMaterial
          ref={ref}
          map={texture}
          side={THREE.BackSide}
          transparent={true}
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>
    );
  }
);

PanoramaSphere.displayName = "PanoramaSphere";
export default PanoramaSphere;
