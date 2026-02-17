import { Stars } from '@react-three/drei'
import { STAR_COUNT, STAR_RADIUS, STAR_DEPTH } from '@/utils/constants'

export function SpaceBackground() {
  return (
    <>
      <Stars
        radius={STAR_RADIUS}
        depth={STAR_DEPTH}
        count={STAR_COUNT}
        factor={6}
        saturation={0}
        fade
        speed={0.5}
      />
      {/* Deep space gradient via scene background */}
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a2e', 80, 200]} />
    </>
  )
}
