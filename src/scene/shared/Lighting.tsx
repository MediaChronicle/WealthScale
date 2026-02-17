import { Environment } from '@react-three/drei'
import { SUN_COLOR, SUN_INTENSITY, AMBIENT_INTENSITY } from '@/utils/constants'

export function CosmosLighting() {
  return (
    <>
      {/* Central sun light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={SUN_INTENSITY}
        color={SUN_COLOR}
      />
      {/* Soft ambient fill */}
      <ambientLight intensity={AMBIENT_INTENSITY} />
      {/* Environment map for reflections */}
      <Environment preset="night" />
    </>
  )
}
