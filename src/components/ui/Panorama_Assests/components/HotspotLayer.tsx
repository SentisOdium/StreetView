import type { Hotspot as HotspotData } from "../../../api/types/types_api";
import HotspotMarker from "./HotspotMarker";
import HotspotArrow from "./HotspotArrow";
import { directionToYaw } from "../../../../admin/utils/hotspotMath";

const HOTSPOT_DISTANCE = 25;
const HOTSPOT_ARROW_Y_POS = -10
function convertCoordinates(coord: string): [number, number, number] {
  const [x, y] = coord.split(",").map(Number);
  return [x * 5, 0, y * -5];
}

function directionToPosition(direction: string | undefined): [number, number, number] | null {
  if (!direction?.trim()) return null;
  const d = direction.trim().toUpperCase();
  const r = HOTSPOT_DISTANCE;
  const diag = r * Math.SQRT1_2;
  const positions: Record<string, [number, number, number]> = {
    N: [0, 0, -r],
    S: [0, 0, r],
    E: [r, 0, 0],
    W: [-r, 0, 0],
    NE: [diag, 0, -diag],
    NW: [-diag, 0, -diag],
    SE: [diag, 0, diag],
    SW: [-diag, 0, diag],
  };
  return positions[d] ?? null;
}

function yawPitchToPosition(yawDeg: number, pitchDeg: number): [number, number, number] {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const r = HOTSPOT_DISTANCE;
  const x = r * Math.cos(pitch) * Math.sin(yaw);
  const y = r * Math.sin(pitch);
  const z = -r * Math.cos(pitch) * Math.cos(yaw);
  return [x, y, z];
}

export function getHotspotPosition(hotspot: HotspotData): [number, number, number] {
  if (hotspot.yaw != null && hotspot.pitch != null) {
    return yawPitchToPosition(hotspot.yaw, hotspot.pitch);
  }

  const fromDirection =
    directionToPosition(hotspot.hotspot_label) ??
    directionToPosition(hotspot.coordinates?.node_Direction);

  if (fromDirection) return fromDirection;

  const labelYaw = directionToYaw(hotspot.hotspot_label);
  if (labelYaw != null) return yawPitchToPosition(labelYaw, 0);

  const coord = hotspot.coordinates?.node_Coordinates;
  if (coord?.trim()) {
    const parts = coord.split(",").map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && Math.abs(parts[0]) <= 360) {
      return yawPitchToPosition(parts[0], parts[1]);
    }
    return convertCoordinates(coord);
  }

  return [0, 0, -HOTSPOT_DISTANCE];
}

type HotspotLayerProps = {
  hotspots: HotspotData[];
  disabled: boolean;
  onHotspotClick: (destinationId: number) => void;
};

export default function HotspotLayer({
  hotspots,
  disabled,
  onHotspotClick,
}: HotspotLayerProps) {
  return (
    <group>
      {hotspots.map((h, index) => {
        const position = getHotspotPosition(h);
        const arrowScale = (HOTSPOT_DISTANCE + HOTSPOT_ARROW_Y_POS) / HOTSPOT_DISTANCE;
        const arrowPosition: [number, number, number] = [
          position[0] * arrowScale,
          position[1],
          position[2] * arrowScale,
        ];

        return (
          <group key={`${h.destination_id}-${h.hotspot_label}-${index}`}>
            <HotspotMarker
              position={position}
              label={h.hotspot_label || h.destination_name}
              onClick={() => onHotspotClick(h.destination_id)}
              disabled={disabled}
            />
            <HotspotArrow
              position={arrowPosition}
              label={h.hotspot_label || h.destination_name}
              onClick={() => onHotspotClick(h.destination_id)}
              disabled={disabled}
            />
          </group>
        );
      })}
    </group>
  );
}
