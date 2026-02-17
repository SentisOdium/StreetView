import * as THREE from "three"
import { useRef, useState, useMemo } from "react"


type InfoSpriteProps = {
  position: [number, number, number]
  title: string
  description: string
}

export function InfoSprite({
  position,
  title,
  description
}: InfoSpriteProps) {

  const spriteRef = useRef<THREE.Sprite>(null)
  const [visible, setVisible] = useState(false)
  
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 2048
    canvas.height = 1024

    const ctx = canvas.getContext("2d")!

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Title
    ctx.fillStyle = "#FFD700"
    ctx.font = "bold 72px Arial"
    ctx.fillText(title, 60, 110)

    // Description
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "44px Arial"

    const lines = description.split("\n")
    lines.forEach((line, i) => {
      ctx.fillText(line, 60, 200 + i * 60)
    })

    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 16
    texture.needsUpdate = true
    return texture
  }, [title, description])

  // Always face camera
  
  return (
    <group position={position}>
      {/* Clickable Info Point */}
      <mesh onClick={() => setVisible(!visible)}>
        <sphereGeometry args={[2, 32, 32]} /> 
        <meshBasicMaterial color="cyan" />
      </mesh>

      {/* Info Panel */}
      {visible && (
        <sprite
          ref={spriteRef}
          scale={[50, 30, 1]}  
          position={[0, 0, 0]}
        >
          <spriteMaterial
            map={texture}
            transparent
            depthTest={false}   // ensures visibility
          />
        </sprite>
      )}
    </group>
  )
}
