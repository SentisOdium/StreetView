import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type CameraTransitionProps = {
    trigger: string;
    onStart?: () => void;
    onComplete?: () => void;
}

export default function CameraTransition({
    trigger,
    onStart,
    onComplete
}: CameraTransitionProps) {

    const { camera } = useThree();

    const startPos = useRef(new THREE.Vector3());
    const endPos = useRef(new THREE.Vector3());

    const progress = useRef(1);
    const animating = useRef(false);
    const elapsedTime = useRef(0);

    const duration = 0.8;

    useEffect(() => {

        // current camera position
        startPos.current.copy(camera.position);

        // where camera will move
        endPos.current.set(2, 0, 0);

        progress.current = 0;
        elapsedTime.current = 0;
        animating.current = true;
        onStart?.();

    }, [trigger, camera.position, onStart]);

    useFrame((_, delta) => {

        if (!animating.current) return;

        elapsedTime.current += delta;
        progress.current = Math.min(elapsedTime.current / duration, 1);

        // cubic ease
        const t = progress.current;

        const eased =
            t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(
            startPos.current,
            endPos.current,
            eased
        );

        if (progress.current >= 1) {
            animating.current = false;
            onComplete?.();
        }
    });

    return null;
}
