import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, MeshPhysicalMaterial, Color, FrontSide } from 'three'
import type { Mesh } from 'three'
import {
  TOWER_WIDTH,
  TOWER_DEPTH,
  TOWER_TRANSMISSION,
  TOWER_ROUGHNESS,
  TOWER_METALNESS,
  TOWER_OPACITY,
  TOWER_EMISSIVE_BASE,
  TOWER_EMISSIVE_PULSE,
  TOWER_PULSE_SPEED,
} from '@/utils/constants'

// Unit box geometry — shared across all towers, scaled per instance
const UNIT_BOX = new BoxGeometry(1, 1, 1)

interface WealthTowerProps {
  height: number
  color: string
  emissiveColor: string
}

export function WealthTower({
  height,
  color,
  emissiveColor,
}: WealthTowerProps) {
  const meshRef = useRef<Mesh>(null)

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(color),
        emissive: new Color(emissiveColor),
        emissiveIntensity: TOWER_EMISSIVE_BASE,
        transmission: TOWER_TRANSMISSION,
        roughness: TOWER_ROUGHNESS,
        metalness: TOWER_METALNESS,
        thickness: 2,
        transparent: true,
        opacity: TOWER_OPACITY,
        side: FrontSide,
      }),
    [color, emissiveColor],
  )

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as MeshPhysicalMaterial
    mat.emissiveIntensity =
      TOWER_EMISSIVE_BASE +
      Math.sin(clock.elapsedTime * TOWER_PULSE_SPEED) * TOWER_EMISSIVE_PULSE
  })

  return (
    <mesh
      ref={meshRef}
      geometry={UNIT_BOX}
      material={material}
      scale={[TOWER_WIDTH, height, TOWER_DEPTH]}
      position={[0, height / 2, 0]}
      castShadow
      receiveShadow
    />
  )
}
