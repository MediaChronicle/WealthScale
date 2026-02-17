import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, MeshPhysicalMaterial, Color, DoubleSide } from 'three'
import type { Mesh } from 'three'
import {
  OCEAN_WATER_COLOR,
  OCEAN_WATER_OPACITY,
  OCEAN_WATER_SIZE,
  OCEAN_WATER_SEGMENTS,
  OCEAN_WAVE_SPEED_1,
  OCEAN_WAVE_SPEED_2,
  OCEAN_WAVE_SPEED_3,
  OCEAN_WAVE_AMP_1,
  OCEAN_WAVE_AMP_2,
  OCEAN_WAVE_AMP_3,
} from '@/utils/constants'

export function WaterSurface() {
  const meshRef = useRef<Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(
      OCEAN_WATER_SIZE,
      OCEAN_WATER_SIZE,
      OCEAN_WATER_SEGMENTS,
      OCEAN_WATER_SEGMENTS,
    )
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(OCEAN_WATER_COLOR),
        transparent: true,
        opacity: OCEAN_WATER_OPACITY,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.4,
        thickness: 0.5,
        side: DoubleSide,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const positions = meshRef.current.geometry.attributes.position
    const t = clock.elapsedTime

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      const y =
        Math.sin(x * 0.3 + t * OCEAN_WAVE_SPEED_1) * OCEAN_WAVE_AMP_1 +
        Math.sin(z * 0.4 + t * OCEAN_WAVE_SPEED_2) * OCEAN_WAVE_AMP_2 +
        Math.sin((x + z) * 0.2 + t * OCEAN_WAVE_SPEED_3) * OCEAN_WAVE_AMP_3

      positions.setY(i, y)
    }

    positions.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}
