import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { MathUtils } from 'three'
import type { Object3D } from 'three'
import { seededRandom } from '@/utils/seededRandom'
import {
  TOWER_MAX_PARTICLES,
  TOWER_PARTICLE_BASE_COUNT,
  TOWER_PARTICLE_SCALE_FACTOR,
  TOWER_PARTICLE_SIZE,
  TOWER_PARTICLE_FADE_ZONE,
  TOWER_POSITIVE_COLOR,
  TOWER_NEGATIVE_COLOR,
} from '@/utils/constants'

interface EnergyParticlesProps {
  height: number
  dailyChange: number
}

interface Particle {
  id: number
  x: number
  z: number
  speed: number
  offset: number
}

export function EnergyParticles({ height, dailyChange }: EnergyParticlesProps) {
  const instanceRefs = useRef<(Object3D | null)[]>([])

  const isPositive = dailyChange >= 0
  const color = isPositive ? TOWER_POSITIVE_COLOR : TOWER_NEGATIVE_COLOR

  const count = useMemo(() => {
    const absChange = Math.abs(dailyChange)
    return Math.max(
      TOWER_PARTICLE_BASE_COUNT,
      Math.min(
        TOWER_MAX_PARTICLES,
        Math.floor(absChange / TOWER_PARTICLE_SCALE_FACTOR) +
          TOWER_PARTICLE_BASE_COUNT,
      ),
    )
  }, [dailyChange])

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (seededRandom(i * 4 + 0) - 0.5) * 1.6,
        z: (seededRandom(i * 4 + 1) - 0.5) * 1.6,
        speed: 0.5 + seededRandom(i * 4 + 2) * 1.5,
        offset: seededRandom(i * 4 + 3) * height,
      })),
    [count, height],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    particles.forEach((p, i) => {
      const ref = instanceRefs.current[i]
      if (!ref) return

      const y = (p.offset + t * p.speed) % (height + 2)
      ref.position.set(p.x, y, p.z)

      const fadeZone = height * TOWER_PARTICLE_FADE_ZONE
      const opacity = y > fadeZone ? 1 - (y - fadeZone) / (height * 0.2 + 2) : 1
      ref.scale.setScalar(
        MathUtils.clamp(opacity, 0.05, 1) * TOWER_PARTICLE_SIZE,
      )
    })
  })

  return (
    <Instances limit={TOWER_MAX_PARTICLES}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
      {particles.map((p, i) => (
        <Instance
          key={p.id}
          ref={(el: Object3D | null) => {
            instanceRefs.current[i] = el
          }}
        />
      ))}
    </Instances>
  )
}
