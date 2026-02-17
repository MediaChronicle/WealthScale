import { lazy, Suspense, useMemo } from 'react'
import { useAppStore } from '@/stores'
import { ModeTransition } from './shared/ModeTransition'
import type { VisualizationMode } from '@/types'
import type { LazyExoticComponent, ComponentType } from 'react'

const CosmosMode = lazy(() =>
  import('@/scene/cosmos/CosmosMode').then((m) => ({
    default: m.CosmosMode,
  })),
)
const TowersMode = lazy(() =>
  import('@/scene/towers/TowersMode').then((m) => ({
    default: m.TowersMode,
  })),
)
const OceanMode = lazy(() =>
  import('@/scene/ocean/OceanMode').then((m) => ({
    default: m.OceanMode,
  })),
)
const TimelineMode = lazy(() =>
  import('@/scene/timeline/TimelineMode').then((m) => ({
    default: m.TimelineMode,
  })),
)

const MODE_COMPONENTS: Record<
  VisualizationMode,
  LazyExoticComponent<ComponentType>
> = {
  cosmos: CosmosMode,
  towers: TowersMode,
  ocean: OceanMode,
  timeline: TimelineMode,
}

export function SceneManager() {
  const mode = useAppStore((s) => s.mode)

  const ActiveMode = useMemo(() => MODE_COMPONENTS[mode], [mode])

  return (
    <ModeTransition>
      <Suspense fallback={<SceneLoadingFallback />}>
        <ActiveMode />
      </Suspense>
    </ModeTransition>
  )
}

function SceneLoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#00d4ff" wireframe />
    </mesh>
  )
}
