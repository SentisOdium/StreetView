import type { SearchUiProps } from "../../Side_Panel/types/sidePanelProps";
export type SphereProps = {
    position?: [number, number, number],
    size?: [number, number, number],
    radius?: number,
    color?: string,
    widthSegments?: number;
    heightSegments?: number;
    textureUrl?: string
}

export type PanoramaProps = {
    nodeName: string | "";
}