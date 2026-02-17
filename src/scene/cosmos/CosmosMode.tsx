import { useRef, lazy, Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { PlanetConfig } from '@/types'
import { useAppStore } from '@/stores'
import { useIsMobile } from '@/hooks/useIsMobile'
import { WealthSun } from './WealthSun'
import { OrbitRing } from './OrbitRing'
import { BillionairePlanet } from './BillionairePlanet'
import { CameraController } from '@/scene/shared/CameraController'

const PostProcessing = lazy(() =>
  import('@/scene/shared/PostProcessing').then((m) => ({
    default: m.PostProcessing,
  })),
)

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>

interface CosmosModeProps {
  planets: PlanetConfig[]
}

export function CosmosMode({ planets }: CosmosModeProps) {
  const controlsRef = useRef<OrbitControlsRef>(null)
  const planetPositionsRef = useRef(new Map<string, [number, number, number]>())
  const showOrbits = useAppStore((s) => s.showOrbits)
  const isMobile = useIsMobile()

  return (
    <>
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

      <CameraController
        controlsRef={controlsRef}
        planetPositions={planetPositionsRef}
      />

      {!isMobile && (
        <Suspense fallback={null}>
          <PostProcessing />
        </Suspense>
      )}

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
