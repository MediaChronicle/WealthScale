import { useMemo, useEffect } from 'react'
import { RingGeometry, MeshBasicMaterial, DoubleSide, Color } from 'three'
import {
  ORBIT_RING_WIDTH,
  ORBIT_RING_SEGMENTS,
  ORBIT_RING_BRIGHTNESS,
  ORBIT_RING_OPACITY,
} from '@/utils/constants'

interface OrbitRingProps {
  radius: number
  color: string
}

export function OrbitRing({ radius, color }: OrbitRingProps) {
  const geometry = useMemo(
    () =>
      new RingGeometry(
        radius - ORBIT_RING_WIDTH,
        radius + ORBIT_RING_WIDTH,
        ORBIT_RING_SEGMENTS,
      ),
    [radius],
  )

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(color).multiplyScalar(ORBIT_RING_BRIGHTNESS),
        transparent: true,
        opacity: ORBIT_RING_OPACITY,
        side: DoubleSide,
        depthWrite: false,
      }),
    [color],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
}
