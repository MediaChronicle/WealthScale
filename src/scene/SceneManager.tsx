import { Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import { CosmosLighting } from './shared/Lighting'
import { SpaceBackground } from './shared/Background'
import { BillionairePlanet } from './cosmos/BillionairePlanet'
import type { PlanetConfig } from '@/types'

interface SceneManagerProps {
  planets: PlanetConfig[]
  onSelectPlanet?: (uri: string) => void
}

export function SceneManager({ planets, onSelectPlanet }: SceneManagerProps) {
  return (
    <Suspense fallback={null}>
      {/* Background */}
      <SpaceBackground />

      {/* Lighting */}
      <CosmosLighting />

      {/* Planets */}
      {planets.map((config) => (
        <BillionairePlanet
          key={config.uri}
          config={config}
          onSelect={onSelectPlanet}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        target={[0, 0, 0]}
      />
    </Suspense>
  )
}
