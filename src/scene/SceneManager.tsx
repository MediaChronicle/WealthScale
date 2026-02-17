import { Suspense } from 'react'
import { CosmosLighting } from './shared/Lighting'
import { SpaceBackground } from './shared/Background'
import { CosmosMode } from './cosmos/CosmosMode'
import type { PlanetConfig } from '@/types'

interface SceneManagerProps {
  planets: PlanetConfig[]
}

export function SceneManager({ planets }: SceneManagerProps) {
  return (
    <Suspense fallback={null}>
      <SpaceBackground />
      <CosmosLighting />
      <CosmosMode planets={planets} />
    </Suspense>
  )
}
