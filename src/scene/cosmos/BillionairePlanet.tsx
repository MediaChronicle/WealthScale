import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Billboard, useCursor } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { SphereGeometry, MeshPhysicalMaterial, Color } from 'three'
import type { Group } from 'three'
import type { PlanetConfig } from '@/types'
import { useAppStore } from '@/stores'
import { formatWealth } from '@/utils/formatWealth'
import {
  TEXT_COLOR,
  TEXT_OUTLINE_COLOR,
  PLANET_HOVER_SCALE,
  PLANET_DEFAULT_SCALE,
  PLANET_HOVER_SPRING,
  LABEL_SPRING,
} from '@/utils/constants'

interface BillionairePlanetProps {
  config: PlanetConfig
  planetPositions?: React.RefObject<Map<string, [number, number, number]>>
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
  planetPositions,
}: BillionairePlanetProps) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)
  const isSelected = selectedUri === config.uri

  const initialAngle = useMemo(
    () => hashStringToAngle(config.uri),
    [config.uri],
  )
  const orbitAngleRef = useRef(initialAngle)

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

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  const { scale } = useSpring({
    scale: hovered || isSelected ? PLANET_HOVER_SCALE : PLANET_DEFAULT_SCALE,
    config: PLANET_HOVER_SPRING,
  })

  const { labelOpacity } = useSpring({
    labelOpacity: hovered || isSelected ? 1 : 0,
    config: LABEL_SPRING,
  })

  useFrame((_, delta) => {
    if (!groupRef.current) return

    orbitAngleRef.current += config.orbitSpeed * delta * 60
    const angle = orbitAngleRef.current

    const x = Math.cos(angle) * config.orbitRadius
    const z = Math.sin(angle) * config.orbitRadius

    groupRef.current.position.x = x
    groupRef.current.position.z = z

    // Report position for CameraController
    if (planetPositions?.current) {
      planetPositions.current.set(config.uri, [x, 0, z])
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
        <animated.mesh
          geometry={geometry}
          material={material}
          rotation={[0, 0, (config.tilt * Math.PI) / 180]}
          scale={scale}
          onClick={() => selectBillionaire(config.uri)}
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
              fillOpacity={labelOpacity.get()}
            >
              {config.name}
            </Text>
            <Text
              fontSize={0.3}
              color={config.color}
              anchorX="center"
              anchorY="top"
              position={[0, -0.15, 0]}
              fillOpacity={labelOpacity.get()}
            >
              {formatWealth(config.networth)}
            </Text>
          </Billboard>
        </animated.mesh>
      </Float>
    </group>
  )
}
