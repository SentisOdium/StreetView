const HOTSPOT_DISTANCE = 45;

export function yawPitchToPosition(
  yawDeg: number,
  pitchDeg: number,
  distance = HOTSPOT_DISTANCE
): [number, number, number] {
  const yaw = (yawDeg * Math.PI) / 180;
  const pitch = (pitchDeg * Math.PI) / 180;
  const x = distance * Math.cos(pitch) * Math.sin(yaw);
  const y = distance * Math.sin(pitch);
  const z = -distance * Math.cos(pitch) * Math.cos(yaw);
  return [x, y, z];
}

export function positionToYawPitch(
  x: number,
  y: number,
  z: number
): { yaw: number; pitch: number } {
  const yaw = (Math.atan2(x, -z) * 180) / Math.PI;
  const dist = Math.sqrt(x * x + y * y + z * z) || 1;
  const pitch = (Math.asin(y / dist) * 180) / Math.PI;
  return {
    yaw: Math.round(yaw * 10) / 10,
    pitch: Math.round(pitch * 10) / 10,
  };
}

export function snapAngle(value: number, step = 5): number {
  return Math.round(value / step) * step;
}

export function directionToYaw(label: string): number | null {
  const map: Record<string, number> = {
    N: 0,
    NE: 45,
    E: 90,
    SE: 135,
    S: 180,
    SW: -135,
    W: -90,
    NW: -45,
  };
  return map[label.trim().toUpperCase()] ?? null;
}
