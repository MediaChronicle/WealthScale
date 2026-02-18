import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { MathUtils, DoubleSide } from 'three'
import type { Object3D } from 'three'
import { seededRandom } from '@/utils/seededRandom'
import {
  KONAMI_RAIN_PARTICLE_COUNT,
  KONAMI_RAIN_PARTICLE_WIDTH,
  KONAMI_RAIN_PARTICLE_HEIGHT,
  KONAMI_RAIN_FALL_SPEED,
  KONAMI_RAIN_SPREAD,
  KONAMI_RAIN_HEIGHT_RANGE,
  KONAMI_RAIN_GREEN,
  KONAMI_RAIN_GOLD,
} from '@/utils/constants'

interface MoneyRainProps {
  active: boolean
}

interface RainParticle {
  id: number
  x: number
  z: number
  speed: number
  offset: number
  wobbleSpeed: number
  wobbleAmp: number
}

export function MoneyRain({ active }: MoneyRainProps) {
  const instanceRefs = useRef<(Object3D | null)[]>([])

  const particles = useMemo<RainParticle[]>(
    () =>
      Array.from({ length: KONAMI_RAIN_PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: (seededRandom(i * 6 + 0) - 0.5) * KONAMI_RAIN_SPREAD,
        z: (seededRandom(i * 6 + 1) - 0.5) * KONAMI_RAIN_SPREAD,
        speed:
          KONAMI_RAIN_FALL_SPEED * 0.5 +
          seededRandom(i * 6 + 2) * KONAMI_RAIN_FALL_SPEED,
        offset: seededRandom(i * 6 + 3) * KONAMI_RAIN_HEIGHT_RANGE,
        wobbleSpeed: 1 + seededRandom(i * 6 + 4) * 3,
        wobbleAmp: 0.3 + seededRandom(i * 6 + 5) * 0.7,
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (!active) return
    const t = clock.getElapsedTime()

    particles.forEach((p, i) => {
      const ref = instanceRefs.current[i]
      if (!ref) return

      const y =
        KONAMI_RAIN_HEIGHT_RANGE -
        ((p.offset + t * p.speed) % (KONAMI_RAIN_HEIGHT_RANGE * 2))
      const wobbleX = Math.sin(t * p.wobbleSpeed) * p.wobbleAmp

      ref.position.set(p.x + wobbleX, y, p.z)
      ref.rotation.set(0, t * 2, Math.sin(t * p.wobbleSpeed) * 0.5)
      ref.scale.setScalar(MathUtils.clamp(1, 0.5, 1.5))
    })
  })

  if (!active) return null

  return (
    <>
      {/* Green bills */}
      <Instances limit={KONAMI_RAIN_PARTICLE_COUNT / 2}>
        <planeGeometry
          args={[KONAMI_RAIN_PARTICLE_WIDTH, KONAMI_RAIN_PARTICLE_HEIGHT]}
        />
        <meshStandardMaterial
          color={KONAMI_RAIN_GREEN}
          emissive={KONAMI_RAIN_GREEN}
          emissiveIntensity={0.5}
          side={DoubleSide}
          transparent
          opacity={0.9}
        />
        {particles.slice(0, KONAMI_RAIN_PARTICLE_COUNT / 2).map((p, i) => (
          <Instance
            key={p.id}
            ref={(el: Object3D | null) => {
              instanceRefs.current[i] = el
            }}
          />
        ))}
      </Instances>

      {/* Gold bills */}
      <Instances limit={KONAMI_RAIN_PARTICLE_COUNT / 2}>
        <planeGeometry
          args={[KONAMI_RAIN_PARTICLE_WIDTH, KONAMI_RAIN_PARTICLE_HEIGHT]}
        />
        <meshStandardMaterial
          color={KONAMI_RAIN_GOLD}
          emissive={KONAMI_RAIN_GOLD}
          emissiveIntensity={0.5}
          side={DoubleSide}
          transparent
          opacity={0.9}
        />
        {particles.slice(KONAMI_RAIN_PARTICLE_COUNT / 2).map((p, i) => (
          <Instance
            key={p.id}
            ref={(el: Object3D | null) => {
              instanceRefs.current[KONAMI_RAIN_PARTICLE_COUNT / 2 + i] = el
            }}
          />
        ))}
      </Instances>
    </>
  )
}
