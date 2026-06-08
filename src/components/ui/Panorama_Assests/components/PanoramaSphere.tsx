import { forwardRef } from "react";
import * as THREE from "three";
import CompassMarkers from "../utils/compass";
type PanoramaSphereProps = {
  texture: THREE.Texture;
  opacity?: number;
};

const X_ROTATION = -3;
const Y_ROTATION = -90; // north correction
const Z_ROTATION = 0;

const PanoramaSphere = forwardRef<THREE.MeshBasicMaterial, PanoramaSphereProps>(
  ({ texture, opacity = 1 }, ref) => {
    return (
      <mesh
        position={[0, 0, 0]}
        rotation={[
          THREE.MathUtils.degToRad(X_ROTATION),
          THREE.MathUtils.degToRad(Y_ROTATION),
          THREE.MathUtils.degToRad(Z_ROTATION),
        ]}
      >
        <sphereGeometry args={[60, 64, 32]} />
        <axesHelper args={[60]} />
        <CompassMarkers />
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
