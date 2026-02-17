import { Stars } from '@react-three/drei'
import {
  STAR_COUNT,
  STAR_RADIUS,
  STAR_DEPTH,
  SCENE_BG_COLOR,
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
} from '@/utils/constants'

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
      <color attach="background" args={[SCENE_BG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, FOG_NEAR, FOG_FAR]} />
    </>
  )
}
