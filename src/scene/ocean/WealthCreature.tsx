import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import {
  SphereGeometry,
  CylinderGeometry,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  Color,
} from 'three'
import type { Group, Mesh } from 'three'
import { formatWealth } from '@/utils/formatWealth'
import { TEXT_COLOR, TEXT_OUTLINE_COLOR } from '@/utils/constants'
import {
  OCEAN_CREATURE_TENTACLE_COUNT,
  OCEAN_CREATURE_BOB_SPEED,
  OCEAN_CREATURE_BOB_AMP,
  OCEAN_CREATURE_TENTACLE_SWAY_X,
  OCEAN_CREATURE_TENTACLE_SWAY_Z,
  OCEAN_CREATURE_EMISSIVE_INTENSITY,
  OCEAN_CREATURE_TRANSMISSION,
  OCEAN_CREATURE_OPACITY,
} from '@/utils/constants'
import type { Vec3 } from '@/types'

interface WealthCreatureProps {
  name: string
  networth: number
  position: Vec3
  color: string
  emissiveColor: string
}

// Unit geometries shared across instances
const UNIT_HEMISPHERE = new SphereGeometry(
  1,
  24,
  16,
  0,
  Math.PI * 2,
  0,
  Math.PI / 2,
)
const UNIT_TENTACLE = new CylinderGeometry(0.02, 0.01, 1, 4)

export function WealthCreature({
  name,
  networth,
  position,
  color,
  emissiveColor,
}: WealthCreatureProps) {
  const groupRef = useRef<Group>(null)
  const tentacleRefs = useRef<(Mesh | null)[]>([])

  const bodyRadius = useMemo(
    () => 0.3 + Math.log10(networth / 50_000) * 0.4,
    [networth],
  )

  const bodyMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(color),
        emissive: new Color(emissiveColor),
        emissiveIntensity: OCEAN_CREATURE_EMISSIVE_INTENSITY,
        transmission: OCEAN_CREATURE_TRANSMISSION,
        roughness: 0.2,
        metalness: 0,
        thickness: 1,
        transparent: true,
        opacity: OCEAN_CREATURE_OPACITY,
      }),
    [color, emissiveColor],
  )

  const tentacleMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity: 0.4,
      }),
    [color],
  )

  useEffect(() => {
    return () => {
      bodyMaterial.dispose()
      tentacleMaterial.dispose()
    }
  }, [bodyMaterial, tentacleMaterial])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime

    groupRef.current.position.y =
      position[1] +
      Math.sin(t * OCEAN_CREATURE_BOB_SPEED) * OCEAN_CREATURE_BOB_AMP

    tentacleRefs.current.forEach((tentacle, i) => {
      if (!tentacle) return
      const phase = (i / OCEAN_CREATURE_TENTACLE_COUNT) * Math.PI * 2
      tentacle.rotation.x =
        Math.sin(t * 0.8 + phase) * OCEAN_CREATURE_TENTACLE_SWAY_X
      tentacle.rotation.z =
        Math.cos(t * 0.6 + phase) * OCEAN_CREATURE_TENTACLE_SWAY_Z
    })
  })

  const tentaclePositions = useMemo(
    () =>
      Array.from({ length: OCEAN_CREATURE_TENTACLE_COUNT }, (_, i) => {
        const angle = (i / OCEAN_CREATURE_TENTACLE_COUNT) * Math.PI * 2
        const r = bodyRadius * 0.6
        return {
          x: Math.cos(angle) * r,
          z: Math.sin(angle) * r,
        }
      }),
    [bodyRadius],
  )

  const tentacleLength = bodyRadius * 3

  return (
    <group ref={groupRef} position={position}>
      <mesh
        geometry={UNIT_HEMISPHERE}
        material={bodyMaterial}
        scale={[bodyRadius, bodyRadius, bodyRadius]}
      />

      <pointLight
        color={emissiveColor}
        intensity={0.8}
        distance={bodyRadius * 6}
        decay={2}
      />

      {tentaclePositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            tentacleRefs.current[i] = el
          }}
          geometry={UNIT_TENTACLE}
          material={tentacleMaterial}
          position={[pos.x, -(bodyRadius * 1.5), pos.z]}
          scale={[1, tentacleLength, 1]}
        />
      ))}

      <Billboard position={[0, bodyRadius + 0.6, 0]}>
        <Text
          fontSize={0.3}
          color={TEXT_COLOR}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor={TEXT_OUTLINE_COLOR}
        >
          {name}
        </Text>
        <Text
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="top"
          position={[0, -0.08, 0]}
        >
          {formatWealth(networth)}
        </Text>
      </Billboard>
    </group>
  )
}
