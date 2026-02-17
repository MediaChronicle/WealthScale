import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence } from 'motion/react'
import { SceneManager } from '@/scene/SceneManager'
import { useBillionaireList } from '@/api/queries'
import { toPlanetConfig } from '@/api/transformers'
import { useAppStore } from '@/stores'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/utils/constants'
import { LeaderboardSidebar } from '@/components/leaderboard/LeaderboardSidebar'
import { ZodError } from 'zod'

const DetailPanel = lazy(() =>
  import('@/components/detail/DetailPanel').then((m) => ({
    default: m.DetailPanel,
  })),
)

function getErrorMessage(error: Error): string {
  if (error instanceof ZodError) {
    return 'Failed to parse billionaire data. The API format may have changed.'
  }
  if (error.message.includes('fetch')) {
    return 'Unable to connect to the wealth data API. Please check your connection.'
  }
  return error.message || 'An unexpected error occurred.'
}

export default function App() {
  const {
    data: billionaires,
    isPending,
    isError,
    error,
    refetch,
  } = useBillionaireList()
  const setBillionaires = useAppStore((s) => s.setBillionaires)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const [leaderboardOpen, setLeaderboardOpen] = useState(true)

  useEffect(() => {
    if (billionaires) {
      setBillionaires(billionaires)
    }
  }, [billionaires, setBillionaires])

  const planets = useMemo(
    () => (billionaires ?? []).map(toPlanetConfig),
    [billionaires],
  )

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ws-bg">
        <p className="animate-pulse font-display text-xl text-ws-accent">
          Loading WealthScale...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-ws-bg">
        <p className="font-display text-xl text-ws-negative">
          {getErrorMessage(error)}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-ws-accent px-4 py-2 font-body text-sm text-ws-bg transition-opacity hover:opacity-80"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: DEFAULT_CAMERA_FOV,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <SceneManager planets={planets} />
      </Canvas>

      {/* 2D HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Header */}
        <div className="pointer-events-auto flex justify-center pt-4">
          <div className="glass-panel px-6 py-2.5">
            <h1 className="font-display text-lg font-bold tracking-wide text-ws-text-primary">
              Wealth<span className="text-ws-accent">Scale</span>
            </h1>
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="pointer-events-auto">
          <LeaderboardSidebar
            isOpen={leaderboardOpen}
            onToggle={() => setLeaderboardOpen((prev) => !prev)}
          />
        </div>

        {/* Detail Panel */}
        <div className="pointer-events-auto">
          <AnimatePresence>
            {selectedUri && (
              <Suspense fallback={null}>
                <DetailPanel />
              </Suspense>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
