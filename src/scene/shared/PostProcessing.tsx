import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import {
  BLOOM_THRESHOLD,
  BLOOM_SMOOTHING,
  BLOOM_INTENSITY,
  VIGNETTE_OFFSET,
  VIGNETTE_DARKNESS,
  CHROMATIC_OFFSET,
} from '@/utils/constants'

const chromaticOffset = new Vector2(CHROMATIC_OFFSET, CHROMATIC_OFFSET)

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={BLOOM_THRESHOLD}
        luminanceSmoothing={BLOOM_SMOOTHING}
        intensity={BLOOM_INTENSITY}
        mipmapBlur
      />
      <Vignette
        offset={VIGNETTE_OFFSET}
        darkness={VIGNETTE_DARKNESS}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={chromaticOffset}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
