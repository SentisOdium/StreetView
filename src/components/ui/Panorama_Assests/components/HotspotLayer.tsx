import type { Hotspot as HotspotData } from "../../../api/types/types_api";
import HotspotMarker from "./HotspotMarker";
import HotspotArrow from "./HotspotArrow";
import { directionToYaw } from "../../../../admin/utils/hotspotMath";

const HOTSPOT_DISTANCE = 25;
const HOTSPOT_ARROW_Y_POS = 10
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
  const fromDirection = directionToPosition(hotspot.hotspot_label);

  if (fromDirection) return fromDirection;

  const labelYaw = directionToYaw(hotspot.hotspot_label);
  if (labelYaw != null) return yawPitchToPosition(labelYaw, 0);

  return [0, 0, -HOTSPOT_DISTANCE];
}

type HotspotLayerProps = {
  hotspots: HotspotData[];
  disabled: boolean;
  onHotspotClick: (destinationId: number, position: [number, number, number]) => void;
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
              onClick={() => onHotspotClick(h.destination_id, position)}
              disabled={disabled}
            />
            <HotspotArrow
              position={arrowPosition}
              label={h.hotspot_label || h.destination_name}
              onClick={() => onHotspotClick(h.destination_id, position)}
              disabled={disabled}
            />
          </group>
        );
      })}
    </group>
  );
}
