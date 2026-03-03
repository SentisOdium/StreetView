import { Canvas, useFrame,useLoader, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch"
import pano from "/panorama/fallbackPanorama/pano.jpg"
import { Suspense } from "react"
import type { PanoramaProps } from "./types/panoramaProps"
import MainNode from "./mainNode"
import Hotspot from "./hotspot"

export default function Panorma({nodeName}: PanoramaProps) {
    const { details } = useNodeDetailsFetch(nodeName);

    
    const defaultPano = pano; 
 
    const rawUrl = details?.Current?.img?.src;
    const currentPano = rawUrl ? rawUrl.replace(/^"|"$/g, '') : defaultPano;
  

   
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
    if (!details?.Current?.img?.src) {
    return <div>Loading panorama...</div>; // Standard HTML is fine here
}
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
            

            <ambientLight 
                intensity={1} />

            {/* Geometry  */}
            <Suspense fallback={<div>Loading panorama...</div>}>
                <MainNode radius={maxRadius} textureUrl={currentPano} />    
            </Suspense>
            
            
        </Canvas>

     
    )
}