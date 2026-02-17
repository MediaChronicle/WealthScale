import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
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
  PLANET_SEGMENTS,
  PLANET_EMISSIVE_INTENSITY,
  PLANET_ROUGHNESS,
  PLANET_METALNESS,
  PLANET_FLOAT_SPEED,
  PLANET_FLOAT_INTENSITY,
  PLANET_FLOAT_ROTATION_INTENSITY,
  LABEL_Y_OFFSET,
  LABEL_NAME_FONT_SIZE,
  LABEL_WEALTH_FONT_SIZE,
  LABEL_OUTLINE_WIDTH,
  LABEL_WEALTH_Y_OFFSET,
  ORBIT_FRAME_RATE,
} from '@/utils/constants'

const AnimatedText = animated(Text)

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
    () => new SphereGeometry(config.radius, PLANET_SEGMENTS, PLANET_SEGMENTS),
    [config.radius],
  )

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(config.color),
        emissive: new Color(config.emissiveColor),
        emissiveIntensity: PLANET_EMISSIVE_INTENSITY,
        roughness: PLANET_ROUGHNESS,
        metalness: PLANET_METALNESS,
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

  const handleClick = useCallback(() => {
    selectBillionaire(config.uri)
  }, [selectBillionaire, config.uri])

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
  }, [])

  const handlePointerOut = useCallback(() => {
    setHovered(false)
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    orbitAngleRef.current += config.orbitSpeed * delta * ORBIT_FRAME_RATE
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
      <Float
        speed={PLANET_FLOAT_SPEED}
        floatIntensity={PLANET_FLOAT_INTENSITY}
        rotationIntensity={PLANET_FLOAT_ROTATION_INTENSITY}
      >
        <animated.mesh
          geometry={geometry}
          material={material}
          rotation={[0, 0, (config.tilt * Math.PI) / 180]}
          scale={scale}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Name label */}
          <Billboard position={[0, config.radius + LABEL_Y_OFFSET, 0]}>
            <AnimatedText
              fontSize={LABEL_NAME_FONT_SIZE}
              color={TEXT_COLOR}
              anchorX="center"
              anchorY="bottom"
              outlineWidth={LABEL_OUTLINE_WIDTH}
              outlineColor={TEXT_OUTLINE_COLOR}
              fillOpacity={labelOpacity}
            >
              {config.name}
            </AnimatedText>
            <AnimatedText
              fontSize={LABEL_WEALTH_FONT_SIZE}
              color={config.color}
              anchorX="center"
              anchorY="top"
              position={[0, LABEL_WEALTH_Y_OFFSET, 0]}
              fillOpacity={labelOpacity}
            >
              {formatWealth(config.networth)}
            </AnimatedText>
          </Billboard>
        </animated.mesh>
      </Float>
    </group>
  )
}
