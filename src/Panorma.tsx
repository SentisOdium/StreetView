import { Canvas, useFrame,useLoader, useThree } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls, useGLTF } from "@react-three/drei"
import pano from './components/assets/pano.jpg'

type cubeProps = {
    position?: [number, number, number],
    color?: string
    size?: [number, number, number]
}

type sphereProps = {
    position?: [number, number, number],
    size?: [number, number, number],
    radius?: number,
    color?: string,
    widthSegments?: number;
    heightSegments?: number;
    textureUrl?: string
}

const Models  = {
    arrow: '/carArrow.glb',
}

export default function Panorma() {

    // const Cube  = ({position, color, size}:cubeProps) => {
    //     const ref = useRef<THREE.Mesh>(null);

        
    //     useFrame((state, delta) =>{
    //         if (ref.current) {
    //         // ref.current.rotation.x += delta * 0.2;
    //             //ref.current.rotation.y += delta * 0.2;
    //             //ref.current.position.y = Math.sin(state.clock.elapsedTime) * 2;
    //         }
    //     })
    //     return(
    //         <mesh ref={ref} position={position}>
    //             <boxGeometry args={size}/>
    //             <meshStandardMaterial color={color} />
    //         </mesh>
    //     )
    // }

    const SphereWithTexture = ({ position = [0,0,0], radius, widthSegments = 64, heightSegments = 64, textureUrl }: sphereProps) => {
        const textureLoader = useLoader(THREE.TextureLoader, textureUrl || pano );
        
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

            ref.current.rotation.y += deltaX * 0.005;
            ref.current.rotation.x += deltaY * 0.005;

            // Clamp X rotation
            ref.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, ref.current.rotation.x));

            setPrevPosX(e.clientX);
            setPrevPosY(e.clientY);
        };


        const handlePointerUp = () => {
            setIsDragging(false);
            
        }

        // useFrame((state, delta) =>{
        //     if (ref.current) {
        //        //ref.current.rotation.x += delta * 0.2;
        //         ref.current.rotation.y += delta * 0.1;
        //         //ref.current.position.y = Math.sin(state.clock.elapsedTime) * 2;
        //     }
        // })
        
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


    const BoxTexture = ({position, color, size}: cubeProps) =>{
        return(
            <mesh position={position}>
                <boxGeometry args={size}/>
                <meshStandardMaterial color={color} />
            </mesh>
        )
    }

    function Model() {
    const gltf = useGLTF('/assets/carArrow.glb') as any;

    return (
        <primitive
            object={gltf.scene}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            rotation={[0, 0, 0]}
        />
    );
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


return (
        <Canvas 
            style={{width: '100vw', height: '100vh' }} 
            camera={{position: [0,0,50], 
            fov: 75, 
            near: 0.1, 
            far: 2000}}
            frameloop="demand"
            >

            {/* 3D content goes here */}
            
            {/* Helpers*/}
            {/* <gridHelper args={[100, 100, `white`, `gray`]} /> */}
            <axesHelper args={[1000]} />
            <CameraLogger />
            {/* Controls*/}
            <OrbitControls enableZoom={true} enablePan={true}  />
            {/* Lighting */}
            <directionalLight position={[0,0,0]}/>
            <ambientLight intensity={1} />
            {/* Geometry  */}
            {/* <Cube position={[0, 0, 0]} color="orange" size={[9,9,9]} /> */}
            <SphereWithTexture radius={50} textureUrl={pano}/>
            {/* <BoxTexture position={[50,50,50]} color={"red"} size={[20,20,20]} />      */}
            <Model />
        </Canvas>
    )
}