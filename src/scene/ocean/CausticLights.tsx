import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { SpotLight } from 'three'
import {
  OCEAN_CAUSTIC_DIR_INTENSITY,
  OCEAN_CAUSTIC_DIR_COLOR,
  OCEAN_CAUSTIC_SPOT1_INTENSITY,
  OCEAN_CAUSTIC_SPOT1_COLOR,
  OCEAN_CAUSTIC_SPOT2_INTENSITY,
  OCEAN_CAUSTIC_SPOT2_COLOR,
  OCEAN_AMBIENT_INTENSITY,
  OCEAN_AMBIENT_COLOR,
} from '@/utils/constants'

export function CausticLights() {
  const spotRef1 = useRef<SpotLight>(null)
  const spotRef2 = useRef<SpotLight>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (spotRef1.current) {
      spotRef1.current.position.x = Math.sin(t * 0.3) * 3
      spotRef1.current.position.z = Math.cos(t * 0.2) * 3
    }
    if (spotRef2.current) {
      spotRef2.current.position.x = Math.cos(t * 0.25) * 4
      spotRef2.current.position.z = Math.sin(t * 0.35) * 2
    }
  })

  return (
    <>
      <directionalLight
        position={[5, 15, 5]}
        intensity={OCEAN_CAUSTIC_DIR_INTENSITY}
        color={OCEAN_CAUSTIC_DIR_COLOR}
      />

      <spotLight
        ref={spotRef1}
        position={[2, 10, 0]}
        angle={0.3}
        penumbra={0.8}
        intensity={OCEAN_CAUSTIC_SPOT1_INTENSITY}
        color={OCEAN_CAUSTIC_SPOT1_COLOR}
        distance={25}
        decay={2}
      />

      <spotLight
        ref={spotRef2}
        position={[-3, 12, 2]}
        angle={0.25}
        penumbra={0.9}
        intensity={OCEAN_CAUSTIC_SPOT2_INTENSITY}
        color={OCEAN_CAUSTIC_SPOT2_COLOR}
        distance={20}
        decay={2}
      />

      <ambientLight
        intensity={OCEAN_AMBIENT_INTENSITY}
        color={OCEAN_AMBIENT_COLOR}
      />
    </>
  )
}
