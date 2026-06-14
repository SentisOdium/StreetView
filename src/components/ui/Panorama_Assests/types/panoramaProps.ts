import type * as THREE from "three";

export type SphereProps = {
    position?: [number, number, number],
    size?: [number, number, number],
    radius?: number,
    color?: string,
    widthSegments?: number;
    heightSegments?: number;
    geometry?: THREE.SphereGeometry;
    textureUrl?: string
    opacity?: number;
    rotationOffset?: number;
    rotationOffsetX?: number;
    rotationOffsetZ?: number;
}

export type PanoramaProps  = {
    nodeName: string;
    onNavigate: (destinationId: number, destinationName?: string) => void;
}

export type hotspotProps = {
    position?: [number, number, number];
    size?: [number, number, number];
    color?: string;
    onclick?: () => void;
}

import type React from "react";

export type HotspotMarkerProps = {
  position: [number, number, number];
  label: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  selected?: boolean;
  onSingleClick?: () => void;
  isEditor?: boolean;
  index?: number;
};
