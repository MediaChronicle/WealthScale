import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import {
  SphereGeometry,
  ShaderMaterial,
  MeshBasicMaterial,
  AdditiveBlending,
  Color,
} from 'three'
import type { Mesh } from 'three'
import { sunVertexShader, sunFragmentShader } from './shaders/sunShader'
import { useSunEasterEgg } from '@/hooks/useSunEasterEgg'
import {
  SUN_RADIUS,
  SUN_SEGMENTS,
  SUN_GLOW_COLOR,
  SUN_GLOW_OPACITY,
  SUN_GLOW_SCALE,
  SUN_CORONA_COLOR,
  SUN_CORONA_OUTER_COLOR,
  SUN_CORONA_COUNT,
  SUN_CORONA_OUTER_COUNT,
  SUN_CORONA_SIZE,
  SUN_CORONA_OUTER_SIZE,
  SUN_CORONA_SCALE_FACTOR,
  SUN_CORONA_OUTER_SCALE_FACTOR,
  SUN_CORONA_SPEED,
  SUN_CORONA_OUTER_SPEED,
  SUN_CORONA_OPACITY,
  SUN_CORONA_OUTER_OPACITY,
  SUN_LIGHT_INTENSITY,
  SUN_LIGHT_COLOR,
  SUN_LIGHT_DISTANCE,
  SUN_LIGHT_DECAY,
  SUN_PULSE_AMPLITUDE,
  SUN_SHADER_INTENSITY,
  SUPERNOVA_EXPLOSION_SCALE,
  SUPERNOVA_REFORM_SCALE,
  SUPERNOVA_SPARKLE_COUNT,
  SUPERNOVA_SPARKLE_SIZE,
  SUPERNOVA_SPARKLE_SPEED,
  SUPERNOVA_SPARKLE_SCALE,
  SUPERNOVA_SPARKLE_COLOR,
} from '@/utils/constants'

export function WealthSun() {
  const meshRef = useRef<Mesh>(null)
  const { handleSunClick, isExploding, isReforming } = useSunEasterEgg()

  const geometry = useMemo(
    () => new SphereGeometry(SUN_RADIUS, SUN_SEGMENTS, SUN_SEGMENTS),
    [],
  )

  const shaderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: SUN_SHADER_INTENSITY },
        },
      }),
    [],
  )

  const glowGeometry = useMemo(
    () =>
      new SphereGeometry(
        SUN_RADIUS * SUN_GLOW_SCALE,
        SUN_SEGMENTS,
        SUN_SEGMENTS,
      ),
    [],
  )

  const glowMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(SUN_GLOW_COLOR),
        transparent: true,
        opacity: SUN_GLOW_OPACITY,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      shaderMaterial.dispose()
      glowGeometry.dispose()
      glowMaterial.dispose()
    }
  }, [geometry, shaderMaterial, glowGeometry, glowMaterial])

  const { scale: supernovaScale } = useSpring({
    scale: isExploding
      ? SUPERNOVA_EXPLOSION_SCALE
      : isReforming
        ? SUPERNOVA_REFORM_SCALE
        : 1,
    config: isExploding
      ? { mass: 1, tension: 200, friction: 20 }
      : isReforming
        ? { mass: 1.5, tension: 120, friction: 14 }
        : { mass: 1, tension: 200, friction: 26 },
  })

  useFrame(({ clock }) => {
    if (isExploding || isReforming) return

    const t = clock.getElapsedTime()

    if (meshRef.current) {
      const mat = meshRef.current.material as ShaderMaterial
      mat.uniforms.uTime.value = t
      meshRef.current.scale.setScalar(1 + Math.sin(t) * SUN_PULSE_AMPLITUDE)
    }
  })

  return (
    <animated.group scale={supernovaScale} onClick={handleSunClick}>
      {/* Main plasma sphere */}
      <mesh ref={meshRef} geometry={geometry} material={shaderMaterial} />

      {/* Inner glow */}
      <mesh geometry={glowGeometry} material={glowMaterial} />

      {/* Inner corona particles */}
      <Sparkles
        count={SUN_CORONA_COUNT}
        size={SUN_CORONA_SIZE}
        scale={SUN_RADIUS * SUN_CORONA_SCALE_FACTOR}
        speed={SUN_CORONA_SPEED}
        opacity={SUN_CORONA_OPACITY}
        color={SUN_CORONA_COLOR}
      />

      {/* Outer corona particles */}
      <Sparkles
        count={SUN_CORONA_OUTER_COUNT}
        size={SUN_CORONA_OUTER_SIZE}
        scale={SUN_RADIUS * SUN_CORONA_OUTER_SCALE_FACTOR}
        speed={SUN_CORONA_OUTER_SPEED}
        opacity={SUN_CORONA_OUTER_OPACITY}
        color={SUN_CORONA_OUTER_COLOR}
      />

      {/* Supernova explosion sparkles */}
      {isExploding && (
        <Sparkles
          count={SUPERNOVA_SPARKLE_COUNT}
          size={SUPERNOVA_SPARKLE_SIZE}
          speed={SUPERNOVA_SPARKLE_SPEED}
          scale={SUPERNOVA_SPARKLE_SCALE}
          color={SUPERNOVA_SPARKLE_COLOR}
        />
      )}

      {/* Central point light */}
      <pointLight
        intensity={SUN_LIGHT_INTENSITY}
        color={SUN_LIGHT_COLOR}
        distance={SUN_LIGHT_DISTANCE}
        decay={SUN_LIGHT_DECAY}
      />
    </animated.group>
  )
}
