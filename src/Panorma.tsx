//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER
//REFRACTOR THIS FILE LATER

//Split files Accordingly

import { Canvas, useFrame,useLoader, useThree } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"

import pano from './components/assets/dump/pano.jpg'
import q1 from './components/assets/dump/q1 (2).jpg'
import q2 from './components/assets/dump/q2 (2).jpg'
import q3 from './components/assets/dump/q3 (1).jpg'

import { InfoSprite } from "./components/ui/InforSprite"


type sphereProps = {
    position?: [number, number, number],
    size?: [number, number, number],
    radius?: number,
    color?: string,
    widthSegments?: number;
    heightSegments?: number;
    textureUrl?: string
}

type hotspotProps = {
    position?: [number, number, number],
    size?: [number, number, number],
    color?: string,
    textureUrl?: string,
    onclick?: () => void
}

export default function Panorma() {


    const [currentPano, setCurrentPano] = useState<string>(pano);
    
    const SphereWithTexture = ({ position = [0,0,0], radius, widthSegments = 64, heightSegments = 64, textureUrl }: sphereProps) => {
        const textureLoader = useLoader(THREE.TextureLoader, textureUrl!);
        
        const ref = useRef<THREE.Mesh>(null);
        
        const [isDragging, setIsDragging] = useState(false);
        const [prevPosX, setPrevPosX] = useState(0);
        const [prevPosY, setPrevPosY] = useState(0);

        const handlePointerDown = (e: React.PointerEvent) => {
            setIsDragging(true);
            setPrevPosX(e.clientX);
            setPrevPosY(e.clientY);
        }

        const handlePointerMove = (e: React.PointerEvent) => {
            if (!isDragging || !ref.current) return; 
            const deltaX = e.clientX - prevPosX;
            const deltaY = e.clientY - prevPosY;

            ref.current.rotation.y += deltaX * 0.00001;
            ref.current.rotation.x += deltaY * 0.00001;

            // Clamp X rotation
            ref.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, ref.current.rotation.x));

            setPrevPosX(e.clientX);
            setPrevPosY(e.clientY);
        };


        const handlePointerUp = () => {
            setIsDragging(false);
            
        }

        useFrame((state, delta) =>{
            if (ref.current) {
               //ref.current.rotation.x += delta * 0.2;
                ref.current.rotation.y += delta * 0.1;
                //ref.current.position.y = Math.sin(state.clock.elapsedTime) * 2;
            }
        })
        
        return (
            <mesh 
            ref={ref} 
            position={position}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            >
                <sphereGeometry args={[radius, widthSegments, heightSegments]} />
                <meshBasicMaterial map={textureLoader} side={THREE.BackSide} />
            </mesh>
        )
    }
   
    const Hotspot = ({position, size, onclick, color}:hotspotProps) => {
        return (
            <mesh position={position} onClick={onclick}>
                <boxGeometry args={size}/>
                <meshBasicMaterial  color={color} />
            </mesh>
        )
    }
    
    function CameraLogger() {
        const { camera } = useThree();

        useFrame(() => {
            console.log(
                "x:", camera.position.x.toFixed(2),
                "y:", camera.position.y.toFixed(2),
                "z:", camera.position.z.toFixed(2)
            );
        });

        return null;
    }

    const maxRadius = 60;

return (
        <Canvas 
            style={{width: '100vw', height: '100vh' }} 
            camera={{position: [0.3,0,0], 
            fov: 75, 
            near: 0.1, 
            far: 2000}}
            // frameloop="demand"
        >

            {/* 3D content goes here */}
            {/* Helpers*/}
            {/* <axesHelper args={[1000]} /> */}
            <CameraLogger />
            {/* Controls*/}
            <OrbitControls 
                enableZoom={true} 
                enablePan={true}  
                enableRotate={true} 
                zoomSpeed={2}
                maxDistance={55}/>

            {/* Lighting */}
            <directionalLight 
                position={[0,0,0]}/>

            <ambientLight 
                intensity={1} />



            {/* Geometry  */}
            <SphereWithTexture radius={maxRadius} textureUrl={currentPano} />
            <Hotspot 
                position={[32, -0, -45]} 
                size={[2,2,2]}
                onclick={() => setCurrentPano(q1)} 
                color="yellow"
            />

            <Hotspot 
                position={[52, 5, 20]} 
                size={[2,2,2]}
                onclick={() => setCurrentPano(q2)} 
                color="green"
            />

            <Hotspot 
                position={[-20, 5, 55]} 
                size={[5,5,5]}
                onclick={() => setCurrentPano(q3)} 
                color="orange"
            />
            <Hotspot 
                position={[30, -30, 40]} 
                size={[5,5,5]}
                onclick={() => setCurrentPano(pano)} 
                color="red"
            />

            {currentPano === pano && (
            <InfoSprite
                position={[10, 5, -50]}
                title="Room 301 – Computer Lab"
                description={`• 40 Workstations
            • Used for Programming Classes
            • Air-conditioned
            • Faculty-in-Charge: Prof. Dela Cruz`}
            />
            )}

        </Canvas>
    )
}