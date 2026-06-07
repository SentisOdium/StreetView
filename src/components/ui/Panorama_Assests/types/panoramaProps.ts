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

export type HotspotMarkerProps = {
  position: [number, number, number];
  label: string;
  onClick: () => void;
  disabled: boolean;
};
