import { Environment } from '@react-three/drei'

export function CosmosLighting() {
  return (
    <>
      {/* Central sun light */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFE4B5" />
      {/* Soft ambient fill */}
      <ambientLight intensity={0.15} />
      {/* Environment map for reflections */}
      <Environment preset="night" />
    </>
  )
}
