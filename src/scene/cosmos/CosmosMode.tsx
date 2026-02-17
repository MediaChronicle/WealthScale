import { useRef, useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useAppStore } from '@/stores'
import { toPlanetConfig } from '@/api/transformers'
import { SpaceBackground } from '@/scene/shared/Background'
import { CosmosLighting } from '@/scene/shared/Lighting'
import { WealthSun } from './WealthSun'
import { OrbitRing } from './OrbitRing'
import { BillionairePlanet } from './BillionairePlanet'
import { CameraController } from '@/scene/shared/CameraController'
import { UserParticle } from '@/scene/shared/UserParticle'

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>

export function CosmosMode() {
  const controlsRef = useRef<OrbitControlsRef>(null)
  const planetPositionsRef = useRef(new Map<string, [number, number, number]>())
  const billionaires = useAppStore((s) => s.billionaires)
  const showOrbits = useAppStore((s) => s.showOrbits)

  const planets = useMemo(
    () => billionaires.map(toPlanetConfig),
    [billionaires],
  )

  return (
    <>
      <SpaceBackground />
      <CosmosLighting />

      <WealthSun />

      {showOrbits &&
        planets.map((config) => (
          <OrbitRing
            key={`orbit-${config.uri}`}
            radius={config.orbitRadius}
            color={config.color}
          />
        ))}

      {planets.map((config) => (
        <BillionairePlanet
          key={config.uri}
          config={config}
          planetPositions={planetPositionsRef}
        />
      ))}

      <UserParticle planetPositions={planetPositionsRef} />

      <CameraController
        controlsRef={controlsRef}
        planetPositions={planetPositionsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
      />
    </>
  )
}
