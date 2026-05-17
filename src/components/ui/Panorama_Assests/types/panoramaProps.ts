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
    onNavigate: (node: string) => void;
}
