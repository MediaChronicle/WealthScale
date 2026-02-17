import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, ShaderMaterial, Color, DoubleSide } from 'three'
import type { Mesh } from 'three'
import { waterVertexShader, waterFragmentShader } from './shaders/waterShader'
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
      new ShaderMaterial({
        vertexShader: waterVertexShader,
        fragmentShader: waterFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(OCEAN_WATER_COLOR) },
          uOpacity: { value: OCEAN_WATER_OPACITY },
          uWaveSpeed1: { value: OCEAN_WAVE_SPEED_1 },
          uWaveSpeed2: { value: OCEAN_WAVE_SPEED_2 },
          uWaveSpeed3: { value: OCEAN_WAVE_SPEED_3 },
          uWaveAmp1: { value: OCEAN_WAVE_AMP_1 },
          uWaveAmp2: { value: OCEAN_WAVE_AMP_2 },
          uWaveAmp3: { value: OCEAN_WAVE_AMP_3 },
        },
        transparent: true,
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
    const mat = meshRef.current.material as ShaderMaterial
    mat.uniforms.uTime.value = clock.elapsedTime
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}
