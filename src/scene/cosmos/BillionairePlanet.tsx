import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Billboard, useCursor } from '@react-three/drei'
import { SphereGeometry, MeshPhysicalMaterial, Color } from 'three'
import type { Mesh } from 'three'
import type { PlanetConfig } from '@/types'
import { formatWealth } from '@/utils/formatWealth'
import { TEXT_COLOR, TEXT_OUTLINE_COLOR } from '@/utils/constants'

interface BillionairePlanetProps {
  config: PlanetConfig
  onSelect?: (uri: string) => void
}

function hashStringToAngle(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return ((Math.abs(hash) % 1000) / 1000) * Math.PI * 2
}

export function BillionairePlanet({
  config,
  onSelect,
}: BillionairePlanetProps) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const initialAngle = useMemo(
    () => hashStringToAngle(config.uri),
    [config.uri],
  )
  const orbitAngleRef = useRef(initialAngle)

  // Reuse geometry and material
  const geometry = useMemo(
    () => new SphereGeometry(config.radius, 32, 32),
    [config.radius],
  )

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(config.color),
        emissive: new Color(config.emissiveColor),
        emissiveIntensity: 0.15,
        roughness: 0.3,
        metalness: 0.7,
      }),
    [config.color, config.emissiveColor],
  )

  // Dispose GPU resources on unmount or when deps change
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  // Animate orbit + self-rotation
  useFrame((_, delta) => {
    if (!meshRef.current) return

    orbitAngleRef.current += config.orbitSpeed * delta * 60
    const angle = orbitAngleRef.current

    meshRef.current.position.x = Math.cos(angle) * config.orbitRadius
    meshRef.current.position.z = Math.sin(angle) * config.orbitRadius
    meshRef.current.rotation.y += delta * 0.2
  })

  return (
    <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[0, 0, (config.tilt * Math.PI) / 180]}
        onClick={() => onSelect?.(config.uri)}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => {
          setHovered(false)
        }}
      >
        {/* Name label */}
        <Billboard position={[0, config.radius + 0.8, 0]}>
          <Text
            fontSize={0.5}
            color={TEXT_COLOR}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor={TEXT_OUTLINE_COLOR}
          >
            {config.name}
          </Text>
          <Text
            fontSize={0.3}
            color={config.color}
            anchorX="center"
            anchorY="top"
            position={[0, -0.15, 0]}
          >
            {formatWealth(config.networth)}
          </Text>
        </Billboard>
      </mesh>
    </Float>
  )
}
