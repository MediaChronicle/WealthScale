import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { SpotLight } from 'three'
import {
  OCEAN_CAUSTIC_DIR_INTENSITY,
  OCEAN_CAUSTIC_DIR_COLOR,
  OCEAN_CAUSTIC_DIR_POSITION,
  OCEAN_CAUSTIC_SPOT1_INTENSITY,
  OCEAN_CAUSTIC_SPOT1_COLOR,
  OCEAN_CAUSTIC_SPOT1_POSITION,
  OCEAN_CAUSTIC_SPOT1_ANGLE,
  OCEAN_CAUSTIC_SPOT1_PENUMBRA,
  OCEAN_CAUSTIC_SPOT1_DISTANCE,
  OCEAN_CAUSTIC_SPOT1_SPEED_X,
  OCEAN_CAUSTIC_SPOT1_SPEED_Z,
  OCEAN_CAUSTIC_SPOT1_AMP_X,
  OCEAN_CAUSTIC_SPOT1_AMP_Z,
  OCEAN_CAUSTIC_SPOT2_INTENSITY,
  OCEAN_CAUSTIC_SPOT2_COLOR,
  OCEAN_CAUSTIC_SPOT2_POSITION,
  OCEAN_CAUSTIC_SPOT2_ANGLE,
  OCEAN_CAUSTIC_SPOT2_PENUMBRA,
  OCEAN_CAUSTIC_SPOT2_DISTANCE,
  OCEAN_CAUSTIC_SPOT2_SPEED_X,
  OCEAN_CAUSTIC_SPOT2_SPEED_Z,
  OCEAN_CAUSTIC_SPOT2_AMP_X,
  OCEAN_CAUSTIC_SPOT2_AMP_Z,
  OCEAN_CAUSTIC_DECAY,
  OCEAN_AMBIENT_INTENSITY,
  OCEAN_AMBIENT_COLOR,
} from '@/utils/constants'

export function CausticLights() {
  const spotRef1 = useRef<SpotLight>(null)
  const spotRef2 = useRef<SpotLight>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (spotRef1.current) {
      spotRef1.current.position.x =
        Math.sin(t * OCEAN_CAUSTIC_SPOT1_SPEED_X) * OCEAN_CAUSTIC_SPOT1_AMP_X
      spotRef1.current.position.z =
        Math.cos(t * OCEAN_CAUSTIC_SPOT1_SPEED_Z) * OCEAN_CAUSTIC_SPOT1_AMP_Z
    }
    if (spotRef2.current) {
      spotRef2.current.position.x =
        Math.cos(t * OCEAN_CAUSTIC_SPOT2_SPEED_X) * OCEAN_CAUSTIC_SPOT2_AMP_X
      spotRef2.current.position.z =
        Math.sin(t * OCEAN_CAUSTIC_SPOT2_SPEED_Z) * OCEAN_CAUSTIC_SPOT2_AMP_Z
    }
  })

  return (
    <>
      <directionalLight
        position={OCEAN_CAUSTIC_DIR_POSITION}
        intensity={OCEAN_CAUSTIC_DIR_INTENSITY}
        color={OCEAN_CAUSTIC_DIR_COLOR}
      />

      <spotLight
        ref={spotRef1}
        position={OCEAN_CAUSTIC_SPOT1_POSITION}
        angle={OCEAN_CAUSTIC_SPOT1_ANGLE}
        penumbra={OCEAN_CAUSTIC_SPOT1_PENUMBRA}
        intensity={OCEAN_CAUSTIC_SPOT1_INTENSITY}
        color={OCEAN_CAUSTIC_SPOT1_COLOR}
        distance={OCEAN_CAUSTIC_SPOT1_DISTANCE}
        decay={OCEAN_CAUSTIC_DECAY}
      />

      <spotLight
        ref={spotRef2}
        position={OCEAN_CAUSTIC_SPOT2_POSITION}
        angle={OCEAN_CAUSTIC_SPOT2_ANGLE}
        penumbra={OCEAN_CAUSTIC_SPOT2_PENUMBRA}
        intensity={OCEAN_CAUSTIC_SPOT2_INTENSITY}
        color={OCEAN_CAUSTIC_SPOT2_COLOR}
        distance={OCEAN_CAUSTIC_SPOT2_DISTANCE}
        decay={OCEAN_CAUSTIC_DECAY}
      />

      <ambientLight
        intensity={OCEAN_AMBIENT_INTENSITY}
        color={OCEAN_AMBIENT_COLOR}
      />
    </>
  )
}
