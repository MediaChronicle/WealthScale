import { useRef, useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useAppStore } from '@/stores'
import { toPlanetConfig } from '@/api/transformers'
import { SpaceBackground } from '@/scene/shared/Background'
import { CosmosLighting } from '@/scene/shared/Lighting'
import { WealthSun } from './WealthSun'
import { OrbitRing } from './OrbitRing'
import { BillionairePlanet } from './BillionairePlanet'
import { CameraController } from '@/scene/shared/CameraController'
import { UserParticle } from '@/scene/shared/UserParticle'
import { useEntryAnimation } from '@/hooks/useEntryAnimation'

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>

interface AnimatedPlanetWrapperProps {
  visible: boolean
  isLast?: boolean
  children: React.ReactNode
}

function AnimatedPlanetWrapper({
  visible,
  isLast = false,
  children,
}: AnimatedPlanetWrapperProps) {
  const { scale } = useSpring({
    scale: visible ? 1 : 0,
    config: isLast
      ? { mass: 2, tension: 120, friction: 14 }
      : { mass: 1, tension: 200, friction: 26 },
  })

  return <animated.group scale={scale}>{children}</animated.group>
}

export function CosmosMode() {
  const controlsRef = useRef<OrbitControlsRef>(null)
  const planetPositionsRef = useRef(new Map<string, [number, number, number]>())
  const billionaires = useAppStore((s) => s.billionaires)
  const showOrbits = useAppStore((s) => s.showOrbits)

  const planets = useMemo(
    () => billionaires.map(toPlanetConfig),
    [billionaires],
  )

  // Sort by rank descending — rank 10 first, rank 1 last (smallest appear first)
  const sortedPlanets = useMemo(
    () => [...planets].sort((a, b) => b.rank - a.rank),
    [planets],
  )

  const { starsVisible, revealedCount } = useEntryAnimation(
    sortedPlanets.length,
  )

  return (
    <>
      <group visible={starsVisible}>
        <SpaceBackground />
      </group>
      <CosmosLighting />

      <AnimatedPlanetWrapper
        visible={revealedCount >= sortedPlanets.length + 1}
        isLast
      >
        <WealthSun />
      </AnimatedPlanetWrapper>

      {showOrbits &&
        sortedPlanets.map((config, index) => (
          <group key={`orbit-${config.uri}`} visible={index < revealedCount}>
            <OrbitRing radius={config.orbitRadius} color={config.color} />
          </group>
        ))}

      {sortedPlanets.map((config, index) => (
        <AnimatedPlanetWrapper key={config.uri} visible={index < revealedCount}>
          <BillionairePlanet
            config={config}
            planetPositions={planetPositionsRef}
          />
        </AnimatedPlanetWrapper>
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
