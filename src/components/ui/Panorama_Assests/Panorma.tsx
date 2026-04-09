import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import useNodeDetailsFetch from "../../hooks/useNodeDetailsFetch"
import { Suspense } from "react"
import type { PanoramaProps } from "./types/panoramaProps"
import MainNode from "./mainNode"
import Hotspot from "./hotspot"

export default function Panorma({ nodeName }: PanoramaProps) {
    const { details } = useNodeDetailsFetch(nodeName);

    if (!details?.Current?.img?.src) {
        return <div className="ml-60">Loading panorama...</div>;
    }

    const rawUrl = details.Current.img.src;
    const cloudfrontUrl = import.meta.env.VITE_CLOUDFRONT_URL;
    const panoUrl = `${cloudfrontUrl}/${rawUrl}`;

   console.log("Panorama Rendered with nodeName:", nodeName, "and panoUrl:", panoUrl);
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
            frameloop="demand"
        >
            <CameraLogger />
         
            <OrbitControls 
                enableZoom={true} 
                enablePan={true}  
                enableRotate={true} 
                zoomSpeed={2}
                maxDistance={55}/>


            <ambientLight 
                intensity={1} />

            {/* Geometry  */}
            <Suspense fallback={null}>
                <MainNode radius={maxRadius} textureUrl={panoUrl} />    
            </Suspense>
            
            
        </Canvas>

     
    )
}