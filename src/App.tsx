import { useEffect, useCallback, lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence } from 'motion/react'
import { SceneManager } from '@/scene/SceneManager'
import { useBillionaireList } from '@/api/queries'
import { useAppStore } from '@/stores'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_FOV,
  CANVAS_NEAR,
  CANVAS_FAR,
  DPR_RANGE,
} from '@/utils/constants'
import { LeaderboardSidebar } from '@/components/leaderboard/LeaderboardSidebar'
import { ModeTabs } from '@/components/modeSwitcher/ModeTabs'
import { ComparisonBar } from '@/components/comparison/ComparisonBar'
import { ComparisonResults } from '@/components/comparison/ComparisonResults'
import { TimeToEarn } from '@/components/comparison/TimeToEarn'
import { WealthRace } from '@/components/comparison/WealthRace'
import { FunFactCard } from '@/components/funFacts/FunFactCard'
import { ZodError } from 'zod'

const DetailPanel = lazy(() =>
  import('@/components/detail/DetailPanel').then((m) => ({
    default: m.DetailPanel,
  })),
)

const PostProcessing = lazy(() =>
  import('@/scene/shared/PostProcessing').then((m) => ({
    default: m.PostProcessing,
  })),
)

const CAMERA_CONFIG = {
  position: DEFAULT_CAMERA_POSITION,
  fov: DEFAULT_CAMERA_FOV,
  near: CANVAS_NEAR,
  far: CANVAS_FAR,
} as const

const GL_CONFIG = {
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance' as const,
}

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
  const showComparison = useAppStore((s) => s.showComparison)
  const hasComparisonResults = useAppStore((s) => s.comparisonResults !== null)
  const netWorth = useAppStore((s) => s.netWorth)
  const leaderboardOpen = useAppStore((s) => s.leaderboardOpen)
  const setLeaderboardOpen = useAppStore((s) => s.setLeaderboardOpen)
  const isMobile = useIsMobile()

  const handleToggle = useCallback(
    () => setLeaderboardOpen(!useAppStore.getState().leaderboardOpen),
    [setLeaderboardOpen],
  )

  useEffect(() => {
    if (billionaires) {
      setBillionaires(billionaires)
    }
  }, [billionaires, setBillionaires])

  if (isPending) {
    return (
      <div
        role="status"
        className="flex h-screen w-screen items-center justify-center bg-ws-bg"
      >
        <p className="animate-pulse font-display text-xl text-ws-accent">
          Loading WealthScale...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-ws-bg"
      >
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
      {/* Skip link for keyboard users */}
      <a
        href="#leaderboard"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-ws-accent focus-visible:px-4 focus-visible:py-2 focus-visible:text-ws-bg"
      >
        Skip to leaderboard
      </a>

      {/* 3D Canvas */}
      <Canvas camera={CAMERA_CONFIG} dpr={DPR_RANGE} gl={GL_CONFIG}>
        <SceneManager />
        {!isMobile && (
          <Suspense fallback={null}>
            <PostProcessing />
          </Suspense>
        )}
      </Canvas>

      {/* 2D HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Header */}
        <header className="pointer-events-auto flex justify-center pt-4">
          <div className="glass-panel px-6 py-2.5">
            <h1 className="font-display text-lg font-bold tracking-wide text-ws-text-primary">
              Wealth<span className="text-ws-accent">Scale</span>
            </h1>
          </div>
        </header>

        {/* Mode Switcher */}
        <ModeTabs />

        {/* Leaderboard Sidebar */}
        <nav
          id="leaderboard"
          aria-label="Wealth rankings"
          className="pointer-events-auto"
        >
          <LeaderboardSidebar
            isOpen={leaderboardOpen}
            onToggle={handleToggle}
          />
        </nav>

        {/* Detail Panel — hidden when comparison is active */}
        <div className="pointer-events-auto" aria-live="polite">
          <Suspense fallback={null}>
            <AnimatePresence>
              {selectedUri && !showComparison && <DetailPanel />}
            </AnimatePresence>
          </Suspense>
        </div>
      </div>

      {/* Comparison overlay components */}
      <AnimatePresence>{selectedUri && <ComparisonBar />}</AnimatePresence>
      <AnimatePresence>
        {showComparison && hasComparisonResults && <ComparisonResults />}
      </AnimatePresence>
      <AnimatePresence>
        {showComparison &&
          hasComparisonResults &&
          netWorth > 0 &&
          selectedUri && <TimeToEarn />}
      </AnimatePresence>
      <AnimatePresence>
        {showComparison && selectedUri && netWorth > 0 && <WealthRace />}
      </AnimatePresence>
      <AnimatePresence>
        {showComparison && selectedUri && <FunFactCard />}
      </AnimatePresence>
    </div>
  )
}
