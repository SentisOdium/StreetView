import { Billboard, Text } from "@react-three/drei";

const COMPASS_RADIUS = 25;

export default function CompassMarkers() {
  return (
    <>
      {/* North (+Z) */}
      <Billboard position={[0, 0, COMPASS_RADIUS]}>
        <Text
          fontSize={3}
          anchorX="center"
          anchorY="middle"
          color="white"
        >
          N
        </Text>
      </Billboard>

      {/* East (+X) */}
      <Billboard position={[COMPASS_RADIUS, 0, 0]}>
        <Text
          fontSize={3}
          anchorX="center"
          anchorY="middle"
          color="white"
        >
          E
        </Text>
      </Billboard>

      {/* South (-Z) */}
      <Billboard position={[0, 0, -COMPASS_RADIUS]}>
        <Text
          fontSize={3}
          anchorX="center"
          anchorY="middle"
          color="white"
        >
          S
        </Text>
      </Billboard>

      {/* West (-X) */}
      <Billboard position={[-COMPASS_RADIUS, 0, 0]}>
        <Text
          fontSize={3}
          anchorX="center"
          anchorY="middle"
          color="white"
        >
          W
        </Text>
      </Billboard>
    </>
  );
}