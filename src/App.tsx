import { useEffect, useCallback, lazy, Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { SceneManager } from '@/scene/SceneManager'
import { useBillionaireList } from '@/api/queries'
import { useAppStore } from '@/stores'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAchievements } from '@/hooks/useAchievements'
import { useKonamiCode } from '@/hooks/useKonamiCode'
import { useMobilePerformance } from '@/hooks/useMobilePerformance'
import { useScreenshot } from '@/hooks/useScreenshot'
import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_FOV,
  CANVAS_NEAR,
  CANVAS_FAR,
  KONAMI_RAIN_DURATION_MS,
} from '@/utils/constants'
import { LeaderboardSidebar } from '@/components/leaderboard/LeaderboardSidebar'
import { ModeTabs } from '@/components/modeSwitcher/ModeTabs'
import { ComparisonBar } from '@/components/comparison/ComparisonBar'
import { ComparisonResults } from '@/components/comparison/ComparisonResults'
import { TimeToEarn } from '@/components/comparison/TimeToEarn'
import { WealthRace } from '@/components/comparison/WealthRace'
import { FunFactCard } from '@/components/funFacts/FunFactCard'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { AchievementToast } from '@/components/achievements/AchievementToast'
import { MoneyRain } from '@/scene/shared/MoneyRain'
import { MobileSheet } from '@/components/layout/MobileSheet'
import { A11yAnnouncer } from '@react-three/a11y'
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

const GuessTheWealth = lazy(() =>
  import('@/components/comparison/GuessTheWealth').then((m) => ({
    default: m.GuessTheWealth,
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
  preserveDrawingBuffer: true,
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

// Bridge component to expose screenshot functions from inside Canvas
function ScreenshotBridge({
  onRegister,
}: {
  onRegister: (fns: {
    download: () => Promise<boolean>
    copy: () => Promise<boolean>
  }) => void
}) {
  const { download, copyToClipboard } = useScreenshot()
  const registeredRef = useRef(false)

  useEffect(() => {
    if (!registeredRef.current) {
      onRegister({ download, copy: copyToClipboard })
      registeredRef.current = true
    }
  }, [download, copyToClipboard, onRegister])

  return null
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
  const prefersReduced = useReducedMotion()
  const perfConfig = useMobilePerformance()

  // Phase 5 state
  const [moneyRainActive, setMoneyRainActive] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)
  const [screenshotFns, setScreenshotFns] = useState<{
    download: () => Promise<boolean>
    copy: () => Promise<boolean>
  } | null>(null)
  const [dpr, setDpr] = useState(perfConfig.dprRange[1])
  const [mobileLeaderboard, setMobileLeaderboard] = useState(false)
  const [mobileDetail, setMobileDetail] = useState(false)

  // Achievement tracking
  const { unlockShareTheScale } = useAchievements()

  // Konami code
  const handleKonami = useCallback(() => {
    setMoneyRainActive(true)
    setTimeout(() => setMoneyRainActive(false), KONAMI_RAIN_DURATION_MS)
  }, [])
  useKonamiCode(handleKonami)

  const handleToggle = useCallback(
    () => setLeaderboardOpen(!useAppStore.getState().leaderboardOpen),
    [setLeaderboardOpen],
  )

  const handleScreenshotRegister = useCallback(
    (fns: {
      download: () => Promise<boolean>
      copy: () => Promise<boolean>
    }) => {
      setScreenshotFns(fns)
    },
    [],
  )

  const handleScreenshotDownload = useCallback(async (): Promise<boolean> => {
    if (!screenshotFns) return false
    const success = await screenshotFns.download()
    if (success) unlockShareTheScale()
    return success
  }, [screenshotFns, unlockShareTheScale])

  const handleScreenshotCopy = useCallback(async (): Promise<boolean> => {
    if (!screenshotFns) return false
    const success = await screenshotFns.copy()
    if (success) unlockShareTheScale()
    return success
  }, [screenshotFns, unlockShareTheScale])

  useEffect(() => {
    if (billionaires) {
      setBillionaires(billionaires)
    }
  }, [billionaires, setBillionaires])

  const isReady = !isPending && !isError

  // Open mobile detail sheet when a billionaire is selected
  useEffect(() => {
    if (!isMobile) return
    return useAppStore.subscribe((state, prev) => {
      if (state.selectedUri && state.selectedUri !== prev.selectedUri) {
        setMobileDetail(true)
      }
    })
  }, [isMobile])

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
    <MotionConfig reducedMotion={prefersReduced ? 'always' : 'never'}>
      <div className="relative h-screen w-screen overflow-hidden">
        {/* Loading screen */}
        <LoadingScreen ready={isReady} />

        {/* Skip link for keyboard users */}
        <a
          href="#leaderboard"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:z-50 focus-visible:rounded-lg focus-visible:bg-ws-accent focus-visible:px-4 focus-visible:py-2 focus-visible:text-ws-bg"
        >
          Skip to leaderboard
        </a>

        {/* 3D Canvas */}
        <Canvas
          camera={CAMERA_CONFIG}
          dpr={[perfConfig.dprRange[0], dpr]}
          gl={GL_CONFIG}
        >
          <PerformanceMonitor
            onIncline={() => setDpr(perfConfig.dprRange[1])}
            onDecline={() => setDpr(perfConfig.dprRange[0])}
          >
            <SceneManager />
            <MoneyRain active={moneyRainActive} />
            <ScreenshotBridge onRegister={handleScreenshotRegister} />
            {perfConfig.enablePostProcessing && (
              <Suspense fallback={null}>
                <PostProcessing />
              </Suspense>
            )}
          </PerformanceMonitor>
          <AdaptiveDpr pixelated />
        </Canvas>
        <A11yAnnouncer />

        {/* Header */}
        <Header
          onOpenGame={() => setGameOpen(true)}
          onScreenshotDownload={handleScreenshotDownload}
          onScreenshotCopy={handleScreenshotCopy}
        />

        {/* 2D HUD Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Mode Switcher — floating on mobile (header embeds it on desktop) */}
          {isMobile && <ModeTabs />}

          {/* Leaderboard Sidebar (desktop only) */}
          {!isMobile && (
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
          )}

          {/* Detail Panel — hidden when comparison is active (desktop only) */}
          {!isMobile && (
            <div className="pointer-events-auto" aria-live="polite">
              <Suspense fallback={null}>
                <AnimatePresence>
                  {selectedUri && !showComparison && <DetailPanel />}
                </AnimatePresence>
              </Suspense>
            </div>
          )}
        </div>

        {/* Mobile bottom triggers */}
        {isMobile && (
          <div className="pointer-events-auto fixed bottom-4 left-4 z-30 flex gap-2">
            <button
              onClick={() => setMobileLeaderboard(true)}
              className="glass-panel rounded-xl px-3 py-2 text-sm text-ws-text-primary"
              aria-label="Open leaderboard"
            >
              Rankings
            </button>
            {selectedUri && !showComparison && (
              <button
                onClick={() => setMobileDetail(true)}
                className="glass-panel rounded-xl px-3 py-2 text-sm text-ws-text-primary"
                aria-label="Open detail"
              >
                Details
              </button>
            )}
          </div>
        )}

        {/* Mobile sheets */}
        {isMobile && (
          <>
            <MobileSheet
              title="Wealth Rankings"
              open={mobileLeaderboard}
              onOpenChange={setMobileLeaderboard}
            >
              <LeaderboardSidebar
                isOpen
                onToggle={() => setMobileLeaderboard(false)}
              />
            </MobileSheet>
            <MobileSheet
              title="Billionaire Details"
              open={mobileDetail && !!selectedUri && !showComparison}
              onOpenChange={setMobileDetail}
            >
              <Suspense fallback={null}>
                {selectedUri && <DetailPanel />}
              </Suspense>
            </MobileSheet>
          </>
        )}

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

        {/* Achievement toast */}
        <AchievementToast />

        {/* Guess the Wealth game */}
        <AnimatePresence>
          {gameOpen && (
            <Suspense fallback={null}>
              <GuessTheWealth onClose={() => setGameOpen(false)} />
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
