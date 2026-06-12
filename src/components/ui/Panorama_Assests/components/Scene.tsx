import { forwardRef } from "react";
import * as THREE from "three";
import PanoramaSphere from "./PanoramaSphere";
import HotspotLayer from "./HotspotLayer";
import type { Hotspot as HotspotData } from "../../../api/types/types_api";

type SceneProps = {
  texture: THREE.Texture;
  opacity: number;
  rotationOffset?: number;
  rotationOffsetX?: number;
  rotationOffsetZ?: number;
  hotspots?: HotspotData[];
  showHotspots: boolean;
  hotspotsDisabled: boolean;
  onHotspotClick: (destinationId: number) => void;
};

const Scene = forwardRef<THREE.MeshBasicMaterial, SceneProps>(
  ({
    texture,
    opacity,
    rotationOffset,
    rotationOffsetX,
    rotationOffsetZ,
    hotspots = [],
    showHotspots,
    hotspotsDisabled,
    onHotspotClick,
  }, ref) => {
    return (
      <group>
        <PanoramaSphere ref={ref} texture={texture} opacity={opacity} rotationOffset={rotationOffset} rotationOffsetX={rotationOffsetX} rotationOffsetZ={rotationOffsetZ} />
        {showHotspots && hotspots.length > 0 && (
          <HotspotLayer
            hotspots={hotspots}
            disabled={hotspotsDisabled}
            onHotspotClick={onHotspotClick}
          />
        )}
      </group>
    );
  }
);

Scene.displayName = "Scene";
export default Scene;
