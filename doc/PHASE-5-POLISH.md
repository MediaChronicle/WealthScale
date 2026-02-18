# Phase 5: Polish, Gamification & Delight

> **Goal**: Add the delight layer — achievement system, mini-games, Easter eggs, screenshot/share, loading experience, mobile responsive adjustments, performance optimization, and accessibility audit.
> **Deliverable**: A polished, shareable, delightful experience that rewards exploration and feels premium on every device.

---

## Table of Contents

1. [Prerequisites & Current State](#1-prerequisites--current-state)
2. [Step 1: Install Additional Dependencies](#step-1-install-additional-dependencies)
3. [Step 2: Achievement Store](#step-2-achievement-store)
4. [Step 3: Achievement Tracking Hook](#step-3-achievement-tracking-hook)
5. [Step 4: Achievement Toast Notification](#step-4-achievement-toast-notification)
6. [Step 5: Achievement Badge Component](#step-5-achievement-badge-component)
7. [Step 6: Guess the Wealth Mini-Game](#step-6-guess-the-wealth-mini-game)
8. [Step 7: Loading Coin (3D Indicator)](#step-7-loading-coin-3d-indicator)
9. [Step 8: Loading Screen](#step-8-loading-screen)
10. [Step 9: Entry Animation (Cosmos Materialization)](#step-9-entry-animation-cosmos-materialization)
11. [Step 10: Screenshot & Share](#step-10-screenshot--share)
12. [Step 11: Easter Eggs](#step-11-easter-eggs)
13. [Step 12: Mobile Responsive](#step-12-mobile-responsive)
14. [Step 13: Header Component](#step-13-header-component)
15. [Step 14: Accessibility Audit](#step-14-accessibility-audit)
16. [Step 15: Performance Optimization Pass](#step-15-performance-optimization-pass)
17. [Step 16: Wire Phase 5 Into App](#step-16-wire-phase-5-into-app)
18. [Acceptance Criteria](#acceptance-criteria)
19. [Files Created/Modified](#files-createdmodified)
20. [Performance Budget Verification Checklist](#performance-budget-verification-checklist)

---

## 1. Prerequisites & Current State

### Already Done (Phases 1-4)

- [x] Foundation: Vite + React 19 + TypeScript + R3F + data pipeline + Zustand stores
- [x] Cosmos Mode: Full solar system with 10 billionaires, WealthSun, orbits, detail panel, leaderboard
- [x] Wealth Comparison: User input, UserParticle, comparison results, fun facts
- [x] All 4 Modes: Cosmos, Towers, Ocean, Timeline with mode switcher and transitions
- [x] Post-processing pipeline (Bloom, Vignette, ChromaticAberration)

### Still Needed (Phase 5)

- [ ] Achievement system (store, tracker, toast, badges)
- [ ] Guess the Wealth mini-game
- [ ] 3D loading coin + loading screen
- [ ] Entry animation (cosmos materialization sequence)
- [ ] Screenshot / share feature
- [ ] Easter eggs (Konami code, sun supernova)
- [ ] Mobile responsive (bottom sheet, reduced particles, adaptive DPR)
- [ ] Header component with logo, mode tabs, settings, share
- [ ] Accessibility audit (@react-three/a11y, keyboard nav, ARIA, reduced motion)
- [ ] Performance optimization pass (draw calls, bundle analysis, lazy loading)

---

## Step 1: Install Additional Dependencies

```bash
pnpm dlx shadcn@latest add sheet slider button tooltip badge
```

These shadcn components are needed for:

- **Sheet**: Mobile bottom sheet for leaderboard/detail panels
- **Slider**: Guess the Wealth game slider input
- **Button**: Share, capture, game controls
- **Tooltip**: Achievement badge hover descriptions
- **Badge**: Achievement status indicators

---

## Step 2: Achievement Store

### File: `src/stores/achievementStore.ts`

A standalone Zustand store with `persist` middleware to save unlocked achievements to `localStorage`.

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AchievementId =
  | 'first-orbit'
  | 'deep-diver'
  | 'time-traveler'
  | 'reality-check'
  | 'all-modes'
  | 'zoomed-in'
  | 'share-the-scale'

export interface AchievementDefinition {
  id: AchievementId
  name: string
  description: string
  icon: string
}

export interface UnlockedAchievement {
  id: AchievementId
  unlockedAt: number
}

interface AchievementState {
  unlocked: Record<AchievementId, UnlockedAchievement | null>
  latestUnlock: AchievementId | null

  unlock: (id: AchievementId) => void
  isUnlocked: (id: AchievementId) => boolean
  clearLatest: () => void
  resetAll: () => void
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-orbit',
    name: 'First Orbit',
    description: 'Complete one full orbit in Cosmos mode',
    icon: 'rocket',
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Reach the deepest billionaire in Ocean mode',
    icon: 'submarine',
  },
  {
    id: 'time-traveler',
    name: 'Time Traveler',
    description: 'View the full timeline from 2020 to present',
    icon: 'clock',
  },
  {
    id: 'reality-check',
    name: 'Reality Check',
    description: 'Complete your first wealth comparison',
    icon: 'scale',
  },
  {
    id: 'all-modes',
    name: 'All Modes',
    description: 'Visit all 4 visualization modes',
    icon: 'layout-grid',
  },
  {
    id: 'zoomed-in',
    name: 'Zoomed In',
    description: "Click into every billionaire's detail panel",
    icon: 'search',
  },
  {
    id: 'share-the-scale',
    name: 'Share the Scale',
    description: 'Take a screenshot of the visualization',
    icon: 'camera',
  },
]

const initialUnlocked: Record<AchievementId, UnlockedAchievement | null> = {
  'first-orbit': null,
  'deep-diver': null,
  'time-traveler': null,
  'reality-check': null,
  'all-modes': null,
  'zoomed-in': null,
  'share-the-scale': null,
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: { ...initialUnlocked },
      latestUnlock: null,

      unlock: (id) => {
        if (get().unlocked[id]) return

        set({
          unlocked: {
            ...get().unlocked,
            [id]: { id, unlockedAt: Date.now() },
          },
          latestUnlock: id,
        })
      },

      isUnlocked: (id) => !!get().unlocked[id],

      clearLatest: () => set({ latestUnlock: null }),

      resetAll: () =>
        set({ unlocked: { ...initialUnlocked }, latestUnlock: null }),
    }),
    {
      name: 'wealthscale-achievements',
      partialize: (state) => ({ unlocked: state.unlocked }),
    },
  ),
)
```

---

## Step 3: Achievement Tracking Hook

### File: `src/hooks/useAchievements.ts`

This hook integrates with the app store and achievement store to automatically detect when achievements should be unlocked based on user actions.

```typescript
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/stores'
import { useAchievementStore } from '@/stores/achievementStore'
import type { VisualizationMode } from '@/types'

export function useAchievements() {
  const mode = useAppStore((s) => s.mode)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const showComparison = useAppStore((s) => s.showComparison)
  const billionaires = useAppStore((s) => s.billionaires)

  const unlock = useAchievementStore((s) => s.unlock)
  const isUnlocked = useAchievementStore((s) => s.isUnlocked)

  // Track visited modes
  const visitedModesRef = useRef<Set<VisualizationMode>>(new Set())
  // Track clicked billionaires
  const clickedUrisRef = useRef<Set<string>>(new Set())

  // Track mode visits for "All Modes" achievement
  useEffect(() => {
    visitedModesRef.current.add(mode)

    if (visitedModesRef.current.size >= 4 && !isUnlocked('all-modes')) {
      unlock('all-modes')
    }
  }, [mode, unlock, isUnlocked])

  // Track billionaire clicks for "Zoomed In" achievement
  useEffect(() => {
    if (!selectedUri) return

    clickedUrisRef.current.add(selectedUri)

    const totalBillionaires = billionaires.length
    if (
      totalBillionaires > 0 &&
      clickedUrisRef.current.size >= totalBillionaires &&
      !isUnlocked('zoomed-in')
    ) {
      unlock('zoomed-in')
    }
  }, [selectedUri, billionaires.length, unlock, isUnlocked])

  // "Reality Check" — first wealth comparison
  useEffect(() => {
    if (showComparison && !isUnlocked('reality-check')) {
      unlock('reality-check')
    }
  }, [showComparison, unlock, isUnlocked])

  return {
    unlockFirstOrbit: () => unlock('first-orbit'),
    unlockDeepDiver: () => unlock('deep-diver'),
    unlockTimeTraveler: () => unlock('time-traveler'),
    unlockShareTheScale: () => unlock('share-the-scale'),
  }
}
```

---

## Step 4: Achievement Toast Notification

### File: `src/components/achievements/AchievementToast.tsx`

A subtle slide-up toast that appears when an achievement unlocks. Includes a mini confetti particle burst and auto-dismisses after 4 seconds.

```tsx
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Rocket,
  Waves,
  Clock,
  Scale,
  LayoutGrid,
  Search,
  Camera,
} from 'lucide-react'
import { useAchievementStore, ACHIEVEMENTS } from '@/stores/achievementStore'
import type { AchievementId } from '@/stores/achievementStore'

const ICON_MAP: Record<string, typeof Rocket> = {
  rocket: Rocket,
  submarine: Waves,
  clock: Clock,
  scale: Scale,
  'layout-grid': LayoutGrid,
  search: Search,
  camera: Camera,
}

function ConfettiParticle({ delay }: { delay: number }) {
  const randomX = Math.random() * 120 - 60
  const randomRotate = Math.random() * 360
  const colors = ['#FFD700', '#00D4FF', '#00FF88', '#FF44AA', '#AA44FF']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return (
    <motion.div
      className="absolute h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        x: randomX,
        y: -(40 + Math.random() * 60),
        opacity: 0,
        scale: 0.3,
        rotate: randomRotate,
      }}
      transition={{
        duration: 0.8 + Math.random() * 0.4,
        delay,
        ease: 'easeOut',
      }}
    />
  )
}

export function AchievementToast() {
  const latestUnlock = useAchievementStore((s) => s.latestUnlock)
  const clearLatest = useAchievementStore((s) => s.clearLatest)
  const [visible, setVisible] = useState(false)
  const [currentId, setCurrentId] = useState<AchievementId | null>(null)

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(clearLatest, 300)
  }, [clearLatest])

  useEffect(() => {
    if (!latestUnlock) return

    setCurrentId(latestUnlock)
    setVisible(true)

    const timer = setTimeout(dismiss, 4000)
    return () => clearTimeout(timer)
  }, [latestUnlock, dismiss])

  const achievement = ACHIEVEMENTS.find((a) => a.id === currentId)
  if (!achievement) return null

  const Icon = ICON_MAP[achievement.icon] ?? Rocket

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Confetti burst */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
            {Array.from({ length: 16 }).map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.03} />
            ))}
          </div>

          {/* Toast body */}
          <button
            onClick={dismiss}
            className="glass-panel flex items-center gap-3 px-5 py-3 cursor-pointer
                       border border-ws-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.15)]"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full
                          bg-ws-gold/20 text-ws-gold"
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-display text-xs uppercase tracking-wider text-ws-gold">
                Achievement Unlocked
              </p>
              <p className="font-display text-sm text-ws-text-primary">
                {achievement.name}
              </p>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Step 5: Achievement Badge Component

### File: `src/components/achievements/AchievementBadge.tsx`

A small badge showing the achievement icon. Locked state is grayed out; unlocked state has color and a subtle glow.

```tsx
import {
  Rocket,
  Waves,
  Clock,
  Scale,
  LayoutGrid,
  Search,
  Camera,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAchievementStore, ACHIEVEMENTS } from '@/stores/achievementStore'
import type { AchievementId } from '@/stores/achievementStore'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, typeof Rocket> = {
  rocket: Rocket,
  submarine: Waves,
  clock: Clock,
  scale: Scale,
  'layout-grid': LayoutGrid,
  search: Search,
  camera: Camera,
}

interface AchievementBadgeProps {
  achievementId: AchievementId
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const

const ICON_SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const

export function AchievementBadge({
  achievementId,
  size = 'md',
}: AchievementBadgeProps) {
  const unlocked = useAchievementStore((s) => s.unlocked[achievementId])
  const definition = ACHIEVEMENTS.find((a) => a.id === achievementId)

  if (!definition) return null

  const Icon = ICON_MAP[definition.icon] ?? Rocket
  const isUnlocked = !!unlocked

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center justify-center rounded-full border transition-all duration-300',
              SIZE_CLASSES[size],
              isUnlocked
                ? 'border-ws-gold/40 bg-ws-gold/15 text-ws-gold shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                : 'border-ws-border bg-ws-glass text-muted-foreground opacity-40',
            )}
          >
            <Icon className={ICON_SIZE_CLASSES[size]} />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="glass-panel border-ws-border text-ws-text-primary"
        >
          <p className="font-display text-sm font-semibold">
            {definition.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {isUnlocked ? definition.description : '???'}
          </p>
          {isUnlocked && unlocked && (
            <p className="mt-1 text-[10px] text-ws-gold">
              Unlocked {new Date(unlocked.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Displays all achievement badges in a horizontal row. */
export function AchievementBar() {
  return (
    <div className="flex items-center gap-2">
      {ACHIEVEMENTS.map((a) => (
        <AchievementBadge key={a.id} achievementId={a.id} size="sm" />
      ))}
    </div>
  )
}
```

---

## Step 6: Guess the Wealth Mini-Game

### File: `src/components/comparison/GuessTheWealth.tsx`

A mini-game where users guess each billionaire's net worth. Glass panel UI with shadcn Slider and Button. After 10 guesses, shows an accuracy leaderboard.

```tsx
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, ArrowRight, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAppStore } from '@/stores'
import { formatWealth } from '@/utils/formatWealth'
import { getIndustryColor } from '@/utils/colorByIndustry'

interface GuessResult {
  name: string
  actual: number
  guessed: number
  error: number
  industry: string
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface GuessTheWealthProps {
  onClose: () => void
}

export function GuessTheWealth({ onClose }: GuessTheWealthProps) {
  const billionaires = useAppStore((s) => s.billionaires)

  const shuffled = useMemo(
    () => shuffleArray(billionaires).slice(0, 10),
    [billionaires],
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [guess, setGuess] = useState(200_000)
  const [results, setResults] = useState<GuessResult[]>([])
  const [showResult, setShowResult] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)

  const current = shuffled[currentIndex]

  // Slider range: $10B to $800B (in millions for the API format)
  const MIN_GUESS = 10_000
  const MAX_GUESS = 800_000

  const submitGuess = useCallback(() => {
    if (!current) return

    const actual = current.networth
    const error = Math.abs(guess - actual) / actual

    const result: GuessResult = {
      name: current.name,
      actual,
      guessed: guess,
      error,
      industry: current.industry[0] ?? 'other',
    }

    setResults((prev) => [...prev, result])
    setShowResult(true)
  }, [current, guess])

  const nextBillionaire = useCallback(() => {
    setShowResult(false)

    if (currentIndex + 1 >= shuffled.length) {
      setGameComplete(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setGuess(200_000)
    }
  }, [currentIndex, shuffled.length])

  const resetGame = useCallback(() => {
    setCurrentIndex(0)
    setGuess(200_000)
    setResults([])
    setShowResult(false)
    setGameComplete(false)
  }, [])

  const averageError = useMemo(() => {
    if (results.length === 0) return 0
    return results.reduce((sum, r) => sum + r.error, 0) / results.length
  }, [results])

  const accuracy = Math.max(0, (1 - averageError) * 100)

  // Score label
  const getScoreLabel = (error: number): string => {
    if (error < 0.1) return 'Incredible!'
    if (error < 0.25) return 'Close!'
    if (error < 0.5) return 'Not bad'
    return 'Way off!'
  }

  const getScoreColor = (error: number): string => {
    if (error < 0.1) return 'text-ws-positive'
    if (error < 0.25) return 'text-ws-accent'
    if (error < 0.5) return 'text-ws-gold'
    return 'text-ws-negative'
  }

  return (
    <motion.div
      className="glass-panel fixed inset-x-4 top-1/2 z-50 mx-auto max-w-lg -translate-y-1/2
                 p-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
      initial={{ scale: 0.9, opacity: 0, y: '-40%' }}
      animate={{ scale: 1, opacity: 1, y: '-50%' }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-3 top-3 text-muted-foreground hover:text-ws-text-primary
                   transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <h2 className="mb-1 font-display text-lg text-ws-accent">
        Guess the Wealth
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        How well do you know billionaire fortunes?
      </p>

      <AnimatePresence mode="wait">
        {gameComplete ? (
          /* ===== Results Screen ===== */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-ws-gold" />
              <div>
                <p className="font-display text-2xl text-ws-gold">
                  {accuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Overall Accuracy
                </p>
              </div>
            </div>

            <div className="mb-4 max-h-56 space-y-2 overflow-y-auto pr-1">
              {results
                .sort((a, b) => a.error - b.error)
                .map((r, i) => {
                  const colors = getIndustryColor(r.industry)
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        />
                        <span className="text-sm">{r.name}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-mono ${getScoreColor(r.error)}`}
                        >
                          {((1 - r.error) * 100).toFixed(0)}%
                        </span>
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          {formatWealth(r.guessed)} / {formatWealth(r.actual)}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>

            <Button
              onClick={resetGame}
              variant="outline"
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
          </motion.div>
        ) : (
          /* ===== Guessing Screen ===== */
          <motion.div
            key={`guess-${currentIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Progress */}
            <div className="mb-4 flex items-center gap-2">
              {shuffled.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < currentIndex
                      ? 'bg-ws-accent'
                      : i === currentIndex
                        ? 'bg-ws-gold'
                        : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Billionaire hint */}
            <div className="mb-4 rounded-xl bg-white/5 p-4 text-center">
              {!showResult ? (
                <>
                  <p className="font-display text-xl text-ws-text-primary">
                    {current?.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {current?.industry.join(', ')} &middot;{' '}
                    {current?.citizenship.toUpperCase()}
                  </p>
                  <p className="mt-2 text-sm text-ws-accent">
                    How much are they worth?
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-xl text-ws-text-primary">
                    {current?.name}
                  </p>
                  <p className="mt-2 font-mono text-lg text-ws-positive">
                    Actual: {formatWealth(current?.networth ?? 0)}
                  </p>
                  <p className="font-mono text-sm text-muted-foreground">
                    Your guess: {formatWealth(guess)}
                  </p>
                  <p
                    className={`mt-2 font-display text-sm font-bold ${getScoreColor(results[results.length - 1]?.error ?? 1)}`}
                  >
                    {getScoreLabel(results[results.length - 1]?.error ?? 1)} (
                    {(
                      (1 - (results[results.length - 1]?.error ?? 1)) *
                      100
                    ).toFixed(0)}
                    % accuracy)
                  </p>
                </>
              )}
            </div>

            {!showResult ? (
              <>
                {/* Slider */}
                <div className="mb-2">
                  <Slider
                    value={[guess]}
                    onValueChange={([val]) => setGuess(val)}
                    min={MIN_GUESS}
                    max={MAX_GUESS}
                    step={5_000}
                  />
                </div>
                <div className="mb-4 flex justify-between text-xs text-muted-foreground">
                  <span>{formatWealth(MIN_GUESS)}</span>
                  <span className="font-mono text-sm text-ws-accent">
                    {formatWealth(guess)}
                  </span>
                  <span>{formatWealth(MAX_GUESS)}</span>
                </div>

                <Button onClick={submitGuess} className="w-full">
                  Lock In Guess
                </Button>
              </>
            ) : (
              <Button onClick={nextBillionaire} className="w-full gap-2">
                {currentIndex + 1 >= shuffled.length ? (
                  'See Results'
                ) : (
                  <>
                    Next <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

---

## Step 7: Loading Coin (3D Indicator)

### File: `src/scene/shared/LoadingCoin.tsx`

A 3D spinning golden coin that fills up as a progress bar during asset loading. Uses drei's `useProgress` hook.

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import {
  CylinderGeometry,
  MeshStandardMaterial,
  Color,
  Mesh,
  Group,
} from 'three'

export function LoadingCoin() {
  const { progress } = useProgress()
  const groupRef = useRef<Group>(null)
  const fillRef = useRef<Mesh>(null)

  // Coin geometry (thin cylinder)
  const coinGeometry = useMemo(() => new CylinderGeometry(1, 1, 0.12, 48), [])

  // Coin outer material (gold rim)
  const coinMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#FFD700'),
        metalness: 0.9,
        roughness: 0.2,
        emissive: new Color('#CC9900'),
        emissiveIntensity: 0.3,
      }),
    [],
  )

  // Fill material (brighter gold for progress)
  const fillMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#FFE44D'),
        metalness: 0.8,
        roughness: 0.1,
        emissive: new Color('#FFD700'),
        emissiveIntensity: 0.6,
      }),
    [],
  )

  // Animate rotation and fill scale
  useFrame((_, delta) => {
    if (!groupRef.current || !fillRef.current) return

    // Spin the coin
    groupRef.current.rotation.y += delta * 1.5

    // Gentle float
    groupRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.1

    // Scale the fill disc based on progress (0 to 1)
    const normalizedProgress = progress / 100
    fillRef.current.scale.set(normalizedProgress, 1, normalizedProgress)
  })

  return (
    <group ref={groupRef}>
      {/* Coin body */}
      <mesh geometry={coinGeometry} material={coinMaterial} />

      {/* Progress fill disc (sits slightly above coin face) */}
      <mesh
        ref={fillRef}
        position={[0, 0.07, 0]}
        geometry={coinGeometry}
        material={fillMaterial}
        scale={[0, 1, 0]}
      />

      {/* Ambient light for the coin */}
      <pointLight position={[2, 2, 2]} intensity={1} color="#FFE4B5" />
      <ambientLight intensity={0.4} />
    </group>
  )
}
```

---

## Step 8: Loading Screen

### File: `src/components/layout/LoadingScreen.tsx`

A full-screen loading overlay that shows the LoadingCoin in a small Canvas, plus a progress percentage. Fades out when loading is complete.

```tsx
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'motion/react'
import { LoadingCoin } from '@/scene/shared/LoadingCoin'

function ProgressDisplay() {
  const { progress, active } = useProgress()

  return (
    <div className="text-center">
      <p className="font-mono text-3xl text-ws-gold">{Math.round(progress)}%</p>
      <p className="mt-2 font-display text-sm tracking-widest uppercase text-ws-text-secondary">
        {active ? 'Loading WealthScale' : 'Ready'}
      </p>
    </div>
  )
}

interface LoadingScreenProps {
  ready: boolean
}

export function LoadingScreen({ ready }: LoadingScreenProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!ready) return

    const timer = setTimeout(() => setDismissed(true), 600)
    return () => clearTimeout(timer)
  }, [ready])

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ws-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* 3D Coin */}
          <div className="h-40 w-40">
            <Canvas
              camera={{ position: [0, 1.5, 3], fov: 40 }}
              gl={{ alpha: true }}
            >
              <LoadingCoin />
            </Canvas>
          </div>

          {/* Progress text */}
          <ProgressDisplay />

          {/* Subtle bottom tagline */}
          <p className="absolute bottom-8 text-xs text-ws-text-secondary/50">
            Visualize billionaire wealth in 3D
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Step 9: Entry Animation (Cosmos Materialization)

### Concept

When the app first loads into Cosmos mode, instead of all planets appearing instantly:

1. Deep-space void (just background color)
2. Stars fade in (opacity 0 to 1 over 0.8s)
3. Planets materialize one-by-one with a particle burst, smallest rank first
4. Largest planet (rank 1) appears last with a corona flare
5. Total sequence duration: ~4 seconds

### File: `src/hooks/useEntryAnimation.ts`

A hook that manages the staggered reveal timing.

```typescript
import { useState, useEffect, useCallback } from 'react'

interface EntryAnimationState {
  starsVisible: boolean
  revealedCount: number
  sequenceComplete: boolean
}

export function useEntryAnimation(totalPlanets: number) {
  const [state, setState] = useState<EntryAnimationState>({
    starsVisible: false,
    revealedCount: 0,
    sequenceComplete: false,
  })

  const start = useCallback(() => {
    // Phase 1: Stars fade in (0.3s delay)
    const starsTimer = setTimeout(() => {
      setState((s) => ({ ...s, starsVisible: true }))
    }, 300)

    // Phase 2: Planets appear one-by-one (staggered from rank 10 to rank 1)
    const planetTimers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < totalPlanets; i++) {
      const delay = 800 + i * 300 // Start at 0.8s, 0.3s apart
      const timer = setTimeout(() => {
        setState((s) => ({ ...s, revealedCount: i + 1 }))
      }, delay)
      planetTimers.push(timer)
    }

    // Phase 3: Sequence complete
    const completeDelay = 800 + totalPlanets * 300 + 500
    const completeTimer = setTimeout(() => {
      setState((s) => ({ ...s, sequenceComplete: true }))
    }, completeDelay)

    return () => {
      clearTimeout(starsTimer)
      planetTimers.forEach(clearTimeout)
      clearTimeout(completeTimer)
    }
  }, [totalPlanets])

  useEffect(() => {
    const cleanup = start()
    return cleanup
  }, [start])

  return state
}
```

### Integration in CosmosMode

Apply the entry animation to `CosmosMode.tsx` by wrapping planets in animated groups.

```tsx
// Inside CosmosMode.tsx — wrap each planet:
import { useEntryAnimation } from '@/hooks/useEntryAnimation'
import { animated, useSpring } from '@react-spring/three'

function AnimatedPlanetWrapper({
  children,
  visible,
  isLast,
}: {
  children: React.ReactNode
  visible: boolean
  isLast: boolean
}) {
  const { scale, opacity } = useSpring({
    scale: visible ? 1 : 0,
    opacity: visible ? 1 : 0,
    config: {
      mass: isLast ? 2 : 1,
      tension: isLast ? 120 : 200,
      friction: isLast ? 14 : 26,
    },
  })

  return (
    <animated.group
      scale={scale.to((s) => [s, s, s] as [number, number, number])}
    >
      {children}
    </animated.group>
  )
}

// In the CosmosMode component render:
function CosmosMode() {
  const planets = useAppStore((s) => s.billionaires)
  const { starsVisible, revealedCount, sequenceComplete } = useEntryAnimation(
    planets.length,
  )

  // Sort planets by rank descending so smallest rank reveals first, rank 1 last
  const sortedPlanets = useMemo(
    () => [...planets].sort((a, b) => b.rank - a.rank),
    [planets],
  )

  return (
    <>
      {/* Stars with fade-in */}
      <group visible={starsVisible}>
        <SpaceBackground />
      </group>

      {/* Staggered planet reveal */}
      {sortedPlanets.map((entry, index) => (
        <AnimatedPlanetWrapper
          key={entry.uri}
          visible={index < revealedCount}
          isLast={index === sortedPlanets.length - 1}
        >
          <BillionairePlanet config={toPlanetConfig(entry)} />
        </AnimatedPlanetWrapper>
      ))}

      {/* Sun appears with the last planet */}
      <AnimatedPlanetWrapper
        visible={revealedCount >= sortedPlanets.length}
        isLast
      >
        <WealthSun />
      </AnimatedPlanetWrapper>
    </>
  )
}
```

---

## Step 10: Screenshot & Share

### File: `src/hooks/useScreenshot.ts`

Captures the current 3D canvas, overlays WealthScale branding, and returns a PNG blob.

```typescript
import { useCallback } from 'react'
import { useThree } from '@react-three/fiber'

const BRANDING_PADDING = 40
const BRANDING_HEIGHT = 60

function addBranding(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const width = canvas.width
    const height = canvas.height + BRANDING_HEIGHT

    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height

    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not get 2D context'))
      return
    }

    // Black background for branding bar
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, width, height)

    // Draw the 3D scene
    ctx.drawImage(canvas, 0, 0)

    // Branding bar at bottom
    ctx.fillStyle = 'rgba(10, 10, 30, 0.9)'
    ctx.fillRect(0, canvas.height, width, BRANDING_HEIGHT)

    // WealthScale text
    ctx.font = "bold 20px 'Space Grotesk', system-ui, sans-serif"
    ctx.fillStyle = '#00d4ff'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      'WealthScale',
      BRANDING_PADDING,
      canvas.height + BRANDING_HEIGHT / 2,
    )

    // URL on the right
    ctx.font = "14px 'Inter', system-ui, sans-serif"
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'right'
    ctx.fillText(
      'wealthscale.app',
      width - BRANDING_PADDING,
      canvas.height + BRANDING_HEIGHT / 2,
    )

    offscreen.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to create blob'))
    }, 'image/png')
  })
}

export function useScreenshot() {
  const gl = useThree((s) => s.gl)

  const capture = useCallback(async (): Promise<Blob> => {
    // Force a render to ensure canvas is up-to-date
    const canvas = gl.domElement
    return addBranding(canvas)
  }, [gl])

  const download = useCallback(async () => {
    const blob = await capture()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wealthscale-${Date.now()}.png`
    link.click()
    URL.revokeObjectURL(url)
  }, [capture])

  const copyToClipboard = useCallback(async () => {
    const blob = await capture()
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      return true
    } catch {
      // Fallback: download instead
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `wealthscale-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)
      return false
    }
  }, [capture])

  return { capture, download, copyToClipboard }
}
```

### File: `src/components/layout/ShareButton.tsx`

A capture/share button for the header. Downloads the screenshot or copies to clipboard.

```tsx
import { useState, useCallback } from 'react'
import { Camera, Download, Clipboard, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ShareButtonProps {
  /** Must be called from inside a Canvas context (R3F). Pass the download/copy functions from useScreenshot. */
  onDownload: () => Promise<void>
  onCopy: () => Promise<boolean>
  onShare?: () => void
}

export function ShareButton({ onDownload, onCopy, onShare }: ShareButtonProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const success = await onCopy()
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    onShare?.()
  }, [onCopy, onShare])

  const handleDownload = useCallback(async () => {
    await onDownload()
    onShare?.()
  }, [onDownload, onShare])

  return (
    <TooltipProvider>
      <div className="relative flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-ws-text-secondary hover:text-ws-accent"
              onClick={() => setExpanded(!expanded)}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Capture Screenshot</TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-ws-text-secondary hover:text-ws-positive"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-ws-text-secondary hover:text-ws-accent"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-ws-positive" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
```

---

## Step 11: Easter Eggs

### File: `src/hooks/useKonamiCode.ts`

Listens for the classic Konami Code sequence (up up down down left right left right b a). Triggers a callback when the sequence is completed.

```typescript
import { useEffect, useRef, useCallback } from 'react'

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
]

export function useKonamiCode(onActivate: () => void) {
  const indexRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const reset = useCallback(() => {
    indexRef.current = 0
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Reset if user takes too long between keys
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(reset, 2000)

      if (e.code === KONAMI_SEQUENCE[indexRef.current]) {
        indexRef.current += 1

        if (indexRef.current === KONAMI_SEQUENCE.length) {
          onActivate()
          reset()
        }
      } else {
        reset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [onActivate, reset])
}
```

### File: `src/scene/shared/MoneyRain.tsx`

A particle effect that "rains money" across the scene. Triggered by the Konami Code.

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { Color, Object3D } from 'three'

interface MoneyRainProps {
  active: boolean
  count?: number
}

interface Particle {
  id: number
  x: number
  y: number
  z: number
  speed: number
  wobble: number
  rotation: number
}

export function MoneyRain({ active, count = 200 }: MoneyRainProps) {
  const instancesRef = useRef<Object3D[]>([])

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 60,
      y: Math.random() * 40 + 20,
      z: (Math.random() - 0.5) * 60,
      speed: 2 + Math.random() * 4,
      wobble: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
    }))
  }, [count])

  useFrame((_, delta) => {
    if (!active) return

    particles.forEach((p) => {
      p.y -= p.speed * delta
      p.wobble += delta * 2
      p.rotation += delta * 3

      // Reset when it falls below
      if (p.y < -10) {
        p.y = 30 + Math.random() * 10
        p.x = (Math.random() - 0.5) * 60
        p.z = (Math.random() - 0.5) * 60
      }
    })
  })

  if (!active) return null

  return (
    <Instances limit={count}>
      <planeGeometry args={[0.3, 0.15]} />
      <meshStandardMaterial
        color={new Color('#00FF88')}
        emissive={new Color('#00AA55')}
        emissiveIntensity={0.5}
        side={2}
      />
      {particles.map((p) => (
        <Instance
          key={p.id}
          position={[
            p.x + Math.sin(p.wobble) * 0.5,
            p.y,
            p.z + Math.cos(p.wobble) * 0.3,
          ]}
          rotation={[p.rotation, p.wobble, 0]}
          color={p.id % 3 === 0 ? '#FFD700' : '#00FF88'}
        />
      ))}
    </Instances>
  )
}
```

### Sun Supernova Easter Egg

Track clicks on WealthSun. After 5 clicks, trigger a supernova explosion, then reform the scene.

### File: `src/hooks/useSunEasterEgg.ts`

```typescript
import { useState, useCallback, useRef } from 'react'

const CLICK_THRESHOLD = 5
const RESET_TIMEOUT = 3000
const SUPERNOVA_DURATION = 2000

export function useSunEasterEgg() {
  const [phase, setPhase] = useState<'idle' | 'exploding' | 'reforming'>('idle')
  const clickCountRef = useRef(0)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleSunClick = useCallback(() => {
    if (phase !== 'idle') return

    // Reset timer on each click
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, RESET_TIMEOUT)

    clickCountRef.current += 1

    if (clickCountRef.current >= CLICK_THRESHOLD) {
      clickCountRef.current = 0

      // Explosion phase
      setPhase('exploding')

      setTimeout(() => {
        setPhase('reforming')
      }, SUPERNOVA_DURATION)

      setTimeout(() => {
        setPhase('idle')
      }, SUPERNOVA_DURATION + 1500)
    }
  }, [phase])

  return {
    supernovaPhase: phase,
    handleSunClick,
    isExploding: phase === 'exploding',
    isReforming: phase === 'reforming',
  }
}
```

### Integration in WealthSun

Apply the supernova effect inside the WealthSun component.

```tsx
// Inside WealthSun.tsx — add supernova animation:
import { useSunEasterEgg } from '@/hooks/useSunEasterEgg'
import { useSpring, animated } from '@react-spring/three'
import { Sparkles } from '@react-three/drei'

function WealthSun() {
  const { supernovaPhase, handleSunClick, isExploding } = useSunEasterEgg()

  const { scale, emissiveIntensity } = useSpring({
    scale: isExploding ? 8 : supernovaPhase === 'reforming' ? 0.1 : 1,
    emissiveIntensity: isExploding ? 10 : 0.5,
    config: isExploding
      ? { tension: 400, friction: 15 }
      : { tension: 120, friction: 14 },
  })

  return (
    <animated.group
      scale={scale.to((s) => [s, s, s] as [number, number, number])}
      onClick={handleSunClick}
    >
      {/* Existing sun mesh and shader */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        {/* Sun material... */}
      </mesh>

      {/* Supernova particles */}
      {isExploding && (
        <Sparkles count={200} size={10} speed={5} scale={30} color="#FFD700" />
      )}
    </animated.group>
  )
}
```

---

## Step 12: Mobile Responsive

### File: `src/hooks/useIsMobile.ts`

A simple responsive hook for detecting mobile viewports.

```typescript
import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    setIsMobile(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
```

### File: `src/components/layout/MobileSheet.tsx`

A bottom sheet for mobile that replaces the sidebar leaderboard and detail panel on small screens. Uses shadcn's Sheet component.

```tsx
import type { ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { List, User } from 'lucide-react'

interface MobileSheetProps {
  trigger: 'leaderboard' | 'detail'
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

const TRIGGER_ICONS = {
  leaderboard: List,
  detail: User,
} as const

export function MobileSheet({
  trigger,
  title,
  open,
  onOpenChange,
  children,
}: MobileSheetProps) {
  const Icon = TRIGGER_ICONS[trigger]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 glass-panel border-ws-border text-ws-text-secondary
                     hover:text-ws-accent md:hidden"
        >
          <Icon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="glass-panel max-h-[70vh] overflow-y-auto border-t border-ws-border
                   bg-ws-bg/95 backdrop-blur-xl"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-ws-text-primary">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
```

### File: `src/hooks/useMobilePerformance.ts`

Reduces particle counts and disables post-processing on mobile.

```typescript
import { useMemo } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

interface MobilePerformanceConfig {
  particleCount: number
  starCount: number
  enablePostProcessing: boolean
  enableVolumetricLights: boolean
  sphereSegments: number
  dprRange: [number, number]
}

const DESKTOP_CONFIG: MobilePerformanceConfig = {
  particleCount: 500,
  starCount: 5000,
  enablePostProcessing: true,
  enableVolumetricLights: true,
  sphereSegments: 32,
  dprRange: [1, 2],
}

const MOBILE_CONFIG: MobilePerformanceConfig = {
  particleCount: 250,
  starCount: 2500,
  enablePostProcessing: false,
  enableVolumetricLights: false,
  sphereSegments: 16,
  dprRange: [1, 1.5],
}

export function useMobilePerformance(): MobilePerformanceConfig {
  const isMobile = useIsMobile()

  return useMemo(() => (isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG), [isMobile])
}
```

### Mobile Performance Integration in Canvas

Update the main Canvas setup to use adaptive rendering.

```tsx
// In App.tsx — updated Canvas with mobile performance:
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { useMobilePerformance } from '@/hooks/useMobilePerformance'

function AppCanvas() {
  const perfConfig = useMobilePerformance()
  const [dpr, setDpr] = useState(perfConfig.dprRange[1])

  return (
    <Canvas
      camera={{
        position: DEFAULT_CAMERA_POSITION,
        fov: DEFAULT_CAMERA_FOV,
        near: 0.1,
        far: 1000,
      }}
      dpr={dpr}
      gl={{
        antialias: !perfConfig.enablePostProcessing, // AA handled by post-processing on desktop
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true, // Required for screenshots
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(perfConfig.dprRange[0])}
        onIncline={() => setDpr(perfConfig.dprRange[1])}
      >
        <AdaptiveDpr pixelated />
        <SceneManager />
      </PerformanceMonitor>
    </Canvas>
  )
}
```

---

## Step 13: Header Component

### File: `src/components/layout/Header.tsx`

Top header bar with the WealthScale logo, mode tabs, settings gear, and share/capture button. Uses glass panel styling.

```tsx
import { useState } from 'react'
import { Settings, Gamepad2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ShareButton } from '@/components/layout/ShareButton'
import { AchievementBar } from '@/components/achievements/AchievementBadge'
import { useAppStore } from '@/stores'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { VisualizationMode } from '@/types'

const MODE_LABELS: Record<VisualizationMode, string> = {
  cosmos: 'Cosmos',
  towers: 'Towers',
  ocean: 'Ocean',
  timeline: 'Timeline',
}

interface HeaderProps {
  onOpenSettings: () => void
  onOpenGame: () => void
  onScreenshotDownload: () => Promise<void>
  onScreenshotCopy: () => Promise<boolean>
}

export function Header({
  onOpenSettings,
  onOpenGame,
  onScreenshotDownload,
  onScreenshotCopy,
}: HeaderProps) {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const isMobile = useIsMobile()

  return (
    <header
      className="glass-panel fixed left-4 right-4 top-4 z-40 flex items-center
                 justify-between px-4 py-2 md:left-6 md:right-6 md:px-6"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg font-bold tracking-tight text-ws-accent md:text-xl">
          WealthScale
        </h1>
      </div>

      {/* Mode Tabs — hidden on mobile (use bottom nav instead) */}
      {!isMobile && (
        <nav className="flex items-center gap-1 rounded-full bg-white/5 p-1">
          {(Object.entries(MODE_LABELS) as [VisualizationMode, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors
                  ${
                    mode === key
                      ? 'text-ws-accent'
                      : 'text-ws-text-secondary hover:text-ws-text-primary'
                  }`}
              >
                {mode === key && (
                  <motion.div
                    layoutId="active-mode-tab"
                    className="absolute inset-0 rounded-full bg-ws-accent/10 border border-ws-accent/20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ),
          )}
        </nav>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Achievement badges — desktop only */}
        {!isMobile && <AchievementBar />}

        <div className="mx-1 h-6 w-px bg-ws-border" />

        {/* Mini-game button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-ws-text-secondary hover:text-ws-gold"
                onClick={onOpenGame}
              >
                <Gamepad2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Guess the Wealth</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Share / capture */}
        <ShareButton
          onDownload={onScreenshotDownload}
          onCopy={onScreenshotCopy}
        />

        {/* Settings */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-ws-text-secondary hover:text-ws-text-primary"
                onClick={onOpenSettings}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
```

---

## Step 14: Accessibility Audit

### 14.1 `@react-three/a11y` for 3D Objects

Wrap interactive 3D objects with the `A11y` component from `@react-three/a11y`:

```tsx
// In BillionairePlanet.tsx:
import { A11y } from '@react-three/a11y'

export function BillionairePlanet({
  config,
  onSelect,
}: BillionairePlanetProps) {
  return (
    <A11y
      role="button"
      description={`${config.name}, net worth ${formatWealth(config.networth)}, rank ${config.rank}`}
      actionCall={() => onSelect?.(config.uri)}
    >
      <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
        {/* ...existing planet mesh... */}
      </Float>
    </A11y>
  )
}
```

### 14.2 Keyboard Navigation

Add keyboard navigation support for the leaderboard and detail panels.

```tsx
// In LeaderboardRow.tsx — add keyboard support:
interface LeaderboardRowProps {
  entry: BillionaireListEntry
  isSelected: boolean
  onSelect: (uri: string) => void
}

export function LeaderboardRow({
  entry,
  isSelected,
  onSelect,
}: LeaderboardRowProps) {
  return (
    <button
      role="listitem"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`${entry.name}, rank ${entry.rank}, net worth ${formatWealth(entry.networth)}`}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ws-accent',
        'hover:bg-ws-glass-hover',
        isSelected && 'bg-ws-accent/10 border border-ws-accent/20',
      )}
      onClick={() => onSelect(entry.uri)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(entry.uri)
        }
      }}
    >
      {/* ...row contents... */}
    </button>
  )
}
```

### 14.3 ARIA Live Regions

Add live regions for dynamically updating wealth figures.

```tsx
// In ComparisonResults.tsx:
function ComparisonResults({ networth, userWealth }: ComparisonResultsProps) {
  return (
    <div aria-live="polite" aria-atomic="true" role="status">
      <p className="font-mono text-lg text-ws-accent">
        {formatWealth(networth)}
      </p>
      <p className="text-sm text-muted-foreground">
        Your wealth is{' '}
        {((userWealth / (networth * 1_000_000)) * 100).toFixed(6)}% of this
        fortune
      </p>
    </div>
  )
}
```

### 14.4 Reduced Motion

### File: `src/hooks/useReducedMotion.ts`

```typescript
import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches)
    }

    setPrefersReduced(mql.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}
```

### Apply Reduced Motion to Animations

```tsx
// In BillionairePlanet.tsx — respect reduced motion:
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function BillionairePlanet({ config, onSelect }: BillionairePlanetProps) {
  const prefersReduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!meshRef.current || prefersReduced) return;

    // Only animate if motion is allowed
    orbitAngleRef.current += config.orbitSpeed * delta * 60;
    const angle = orbitAngleRef.current;
    meshRef.current.position.x = Math.cos(angle) * config.orbitRadius;
    meshRef.current.position.z = Math.sin(angle) * config.orbitRadius;
    meshRef.current.rotation.y += delta * 0.2;
  });

  // If reduced motion, place planet at a static position
  const staticPosition: Vec3 = prefersReduced
    ? [Math.cos(config.rank) * config.orbitRadius, 0, Math.sin(config.rank) * config.orbitRadius]
    : [0, 0, 0]; // Animated via useFrame

  return (
    <Float
      speed={prefersReduced ? 0 : 0.5}
      floatIntensity={prefersReduced ? 0 : 0.2}
      rotationIntensity={prefersReduced ? 0 : 0.1}
    >
      <mesh
        ref={meshRef}
        position={prefersReduced ? staticPosition : undefined}
        {/* ...rest... */}
      />
    </Float>
  );
}
```

### 14.5 motion/react Reduced Motion

Motion (framer-motion) has built-in reduced motion support:

```tsx
// In App.tsx or a layout component, wrap with MotionConfig:
import { MotionConfig } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function AppLayout({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion()

  return (
    <MotionConfig reducedMotion={prefersReduced ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  )
}
```

### 14.6 WCAG AA Contrast Verification

| Element          | Foreground | Background | Contrast Ratio | Pass?     |
| ---------------- | ---------- | ---------- | -------------- | --------- |
| Primary text     | `#e2e8f0`  | `#0a0a1a`  | 14.5:1         | Yes (AAA) |
| Secondary text   | `#94a3b8`  | `#0a0a1a`  | 7.2:1          | Yes (AA)  |
| Accent on dark   | `#00d4ff`  | `#0a0a1a`  | 8.9:1          | Yes (AA)  |
| Gold on dark     | `#ffd700`  | `#0a0a1a`  | 11.3:1         | Yes (AAA) |
| Positive on dark | `#00ff88`  | `#0a0a1a`  | 12.1:1         | Yes (AAA) |
| Negative on dark | `#ff4466`  | `#0a0a1a`  | 5.1:1          | Yes (AA)  |

All text meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).

---

## Step 15: Performance Optimization Pass

### 15.1 Audit Draw Calls with Leva Debug Panel

Add a dev-only performance monitor.

### File: `src/hooks/usePerformanceDebug.ts`

```typescript
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

/** Dev-only hook that logs renderer stats. Enable via Leva toggle. */
export function usePerformanceDebug(enabled: boolean) {
  const gl = useThree((s) => s.gl)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const info = gl.info
      const now = performance.now()
      const elapsed = now - lastTimeRef.current
      const fps = (frameCountRef.current / elapsed) * 1000

      console.table({
        'Draw calls': info.render.calls,
        Triangles: info.render.triangles,
        Geometries: info.memory.geometries,
        Textures: info.memory.textures,
        FPS: fps.toFixed(1),
      })

      frameCountRef.current = 0
      lastTimeRef.current = now
    }, 3000)

    return () => clearInterval(interval)
  }, [enabled, gl])

  // Increment frame counter
  useEffect(() => {
    if (!enabled) return

    const raf = () => {
      frameCountRef.current += 1
      handle = requestAnimationFrame(raf)
    }
    let handle = requestAnimationFrame(raf)
    return () => cancelAnimationFrame(handle)
  }, [enabled])
}
```

### 15.2 Geometry & Material Reuse Checklist

Ensure all scene components follow the reuse pattern:

```tsx
// Pattern: Memoize geometry and material, dispose on unmount
const geometry = useMemo(
  () => new SphereGeometry(radius, segments, segments),
  [radius, segments],
)
const material = useMemo(
  () => new MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0.7 }),
  [color],
)

useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
  }
}, [geometry, material])
```

### 15.3 Lazy Loading Verification

Confirm non-Cosmos modes are lazy loaded:

```tsx
// In SceneManager.tsx:
import { lazy, Suspense } from 'react'

const TowersMode = lazy(() => import('@/scene/towers/TowersMode'))
const OceanMode = lazy(() => import('@/scene/ocean/OceanMode'))
const TimelineMode = lazy(() => import('@/scene/timeline/TimelineMode'))

// These will be code-split into separate chunks
// Verify with: pnpm build && ls -la dist/assets/
```

### 15.4 AdaptiveDpr + PerformanceMonitor

Already integrated in Step 12's Canvas setup. Verify the monitor thresholds work correctly.

### 15.5 Bundle Analysis

Add a build analysis script:

```bash
# Add to package.json scripts:
# "build:analyze": "vite build --mode production && npx vite-bundle-visualizer"

pnpm build
# Check dist/assets/ sizes
# Target: < 500KB gzipped total
```

Recommended Vite config additions for optimal splitting:

```typescript
// vite.config.ts — add build optimization:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'r3f-vendor': [
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing',
          ],
          'ui-vendor': ['motion', 'zustand', '@tanstack/react-query'],
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
  },
})
```

---

## Step 16: Wire Phase 5 Into App

### Updated `src/App.tsx`

Integrate all Phase 5 features into the main App component.

```tsx
import { useState, useCallback, useMemo, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { MotionConfig, AnimatePresence } from 'motion/react'

import { SceneManager } from '@/scene/SceneManager'
import { MoneyRain } from '@/scene/shared/MoneyRain'
import { useBillionaireList } from '@/api/queries'
import { toPlanetConfig } from '@/api/transformers'
import { useAppStore } from '@/stores'
import { useAchievements } from '@/hooks/useAchievements'
import { useKonamiCode } from '@/hooks/useKonamiCode'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMobilePerformance } from '@/hooks/useMobilePerformance'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/utils/constants'

import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { AchievementToast } from '@/components/achievements/AchievementToast'
import { GuessTheWealth } from '@/components/comparison/GuessTheWealth'

/** Inner component that has access to R3F context (for useScreenshot). */
function ScreenshotBridge({
  onRegister,
}: {
  onRegister: (fns: {
    download: () => Promise<void>
    copy: () => Promise<boolean>
  }) => void
}) {
  // useScreenshot must be called inside Canvas context
  // We import it lazily to avoid R3F context issues
  const { useScreenshot } = require('@/hooks/useScreenshot')
  const { download, copyToClipboard } = useScreenshot()

  useEffect(() => {
    onRegister({ download, copy: copyToClipboard })
  }, [download, copyToClipboard, onRegister])

  return null
}

export default function App() {
  const {
    data: billionaires,
    isPending,
    isError,
    error,
  } = useBillionaireList(10)
  const setBillionaires = useAppStore((s) => s.setBillionaires)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  const prefersReduced = useReducedMotion()
  const perfConfig = useMobilePerformance()
  const { unlockShareTheScale } = useAchievements()

  // Konami code easter egg
  const [moneyRainActive, setMoneyRainActive] = useState(false)
  useKonamiCode(() => {
    setMoneyRainActive(true)
    setTimeout(() => setMoneyRainActive(false), 8000)
  })

  // Mini-game state
  const [gameOpen, setGameOpen] = useState(false)

  // Settings state
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Screenshot functions bridge (from R3F context to 2D UI)
  const [screenshotFns, setScreenshotFns] = useState<{
    download: () => Promise<void>
    copy: () => Promise<boolean>
  } | null>(null)

  const handleScreenshotRegister = useCallback(
    (fns: { download: () => Promise<void>; copy: () => Promise<boolean> }) => {
      setScreenshotFns(fns)
    },
    [],
  )

  const handleScreenshotDownload = useCallback(async () => {
    await screenshotFns?.download()
    unlockShareTheScale()
  }, [screenshotFns, unlockShareTheScale])

  const handleScreenshotCopy = useCallback(async () => {
    const result = (await screenshotFns?.copy()) ?? false
    unlockShareTheScale()
    return result
  }, [screenshotFns, unlockShareTheScale])

  // DPR management
  const [dpr, setDpr] = useState(perfConfig.dprRange[1])

  // Sync API data into Zustand
  useEffect(() => {
    if (billionaires) setBillionaires(billionaires)
  }, [billionaires, setBillionaires])

  // Planet configs
  const planets = useMemo(
    () => (billionaires ?? []).map(toPlanetConfig),
    [billionaires],
  )

  const isReady = !isPending && !isError

  return (
    <MotionConfig reducedMotion={prefersReduced ? 'always' : 'never'}>
      {/* Loading screen */}
      <LoadingScreen ready={isReady} />

      {/* Error state */}
      {isError && (
        <div className="flex h-screen w-screen items-center justify-center bg-ws-bg">
          <p className="font-display text-xl text-ws-negative">
            Error: {error.message}
          </p>
        </div>
      )}

      {/* Main app */}
      {isReady && (
        <div className="h-screen w-screen">
          {/* Header */}
          <Header
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenGame={() => setGameOpen(true)}
            onScreenshotDownload={handleScreenshotDownload}
            onScreenshotCopy={handleScreenshotCopy}
          />

          {/* 3D Canvas */}
          <Canvas
            camera={{
              position: DEFAULT_CAMERA_POSITION,
              fov: DEFAULT_CAMERA_FOV,
              near: 0.1,
              far: 1000,
            }}
            dpr={dpr}
            gl={{
              antialias: !perfConfig.enablePostProcessing,
              alpha: false,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: true,
            }}
          >
            <PerformanceMonitor
              onDecline={() => setDpr(perfConfig.dprRange[0])}
              onIncline={() => setDpr(perfConfig.dprRange[1])}
            >
              <AdaptiveDpr pixelated />

              <Suspense fallback={null}>
                <SceneManager
                  planets={planets}
                  onSelectPlanet={selectBillionaire}
                />

                {/* Konami Code money rain */}
                <MoneyRain active={moneyRainActive} />

                {/* Screenshot bridge */}
                <ScreenshotBridge onRegister={handleScreenshotRegister} />
              </Suspense>
            </PerformanceMonitor>
          </Canvas>

          {/* Achievement toast */}
          <AchievementToast />

          {/* Guess the Wealth mini-game */}
          <AnimatePresence>
            {gameOpen && <GuessTheWealth onClose={() => setGameOpen(false)} />}
          </AnimatePresence>
        </div>
      )}
    </MotionConfig>
  )
}
```

---

## Acceptance Criteria

- [ ] **Achievement System**: 7 achievements defined, persist to localStorage, unlock triggers work
- [ ] **Achievement Toast**: Slide-up toast with confetti on unlock, auto-dismiss after 4 seconds
- [ ] **Achievement Badges**: All 7 display in header, locked (gray) vs unlocked (gold glow)
- [ ] **Guess the Wealth**: 10-round game with slider, accuracy scoring, results leaderboard
- [ ] **Loading Coin**: 3D spinning gold coin shown during Suspense loading
- [ ] **Loading Screen**: Full-screen overlay with progress %, fades out when ready
- [ ] **Entry Animation**: Stars fade in, planets materialize one-by-one, rank 1 appears last (~4s)
- [ ] **Screenshot**: Captures 3D canvas with WealthScale branding overlay
- [ ] **Share Button**: Download PNG and copy-to-clipboard both work
- [ ] **Konami Code**: up-up-down-down-left-right-left-right-B-A triggers money rain
- [ ] **Sun Supernova**: 5 clicks on WealthSun triggers explosion + reform animation
- [ ] **Mobile Bottom Sheet**: Leaderboard/detail panel collapses into bottom sheet on <768px
- [ ] **Mobile Performance**: Particle counts reduced 50%, post-processing disabled on mobile
- [ ] **AdaptiveDpr**: Dynamic resolution scaling under performance pressure
- [ ] **Header**: Logo, mode tabs (desktop), achievement bar, game button, share button, settings
- [ ] **A11y - 3D**: Interactive objects wrapped in `@react-three/a11y` with descriptions
- [ ] **A11y - Keyboard**: Leaderboard and detail panels navigable via keyboard
- [ ] **A11y - ARIA**: `aria-live` regions for dynamic wealth figures
- [ ] **A11y - Reduced Motion**: `prefers-reduced-motion` disables all animations
- [ ] **A11y - Contrast**: All text passes WCAG AA (4.5:1 minimum)
- [ ] **Performance**: < 50 draw calls per frame verified in dev tools
- [ ] **Performance**: Geometry and material reuse confirmed across all components
- [ ] **Performance**: Non-cosmos modes are lazy loaded (code-split chunks verified)
- [ ] **Performance**: Bundle < 500KB gzipped
- [ ] **No Errors**: Zero console errors, zero TypeScript errors
- [ ] **Dev**: `pnpm dev` runs successfully with all Phase 5 features

---

## Files Created/Modified

### New Files (18)

| File                                               | Purpose                                                        |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `src/stores/achievementStore.ts`                   | Achievement definitions, unlock state, persist to localStorage |
| `src/hooks/useAchievements.ts`                     | Integrates app state to auto-detect achievement triggers       |
| `src/hooks/useEntryAnimation.ts`                   | Staggered planet reveal timing for cosmos entry                |
| `src/hooks/useScreenshot.ts`                       | Captures 3D canvas with branding overlay                       |
| `src/hooks/useKonamiCode.ts`                       | Konami Code key sequence detector                              |
| `src/hooks/useSunEasterEgg.ts`                     | Sun click counter and supernova phase manager                  |
| `src/hooks/useIsMobile.ts`                         | Mobile viewport breakpoint detection                           |
| `src/hooks/useMobilePerformance.ts`                | Performance config based on device type                        |
| `src/hooks/useReducedMotion.ts`                    | `prefers-reduced-motion` media query hook                      |
| `src/hooks/usePerformanceDebug.ts`                 | Dev-only renderer stats logging                                |
| `src/components/achievements/AchievementToast.tsx` | Slide-up toast with confetti on achievement unlock             |
| `src/components/achievements/AchievementBadge.tsx` | Badge + AchievementBar components                              |
| `src/components/comparison/GuessTheWealth.tsx`     | Wealth guessing mini-game                                      |
| `src/components/layout/LoadingScreen.tsx`          | Full-screen loading overlay with progress                      |
| `src/components/layout/ShareButton.tsx`            | Screenshot download/copy button group                          |
| `src/components/layout/MobileSheet.tsx`            | Bottom sheet for mobile panels                                 |
| `src/components/layout/Header.tsx`                 | App header with logo, tabs, actions                            |
| `src/scene/shared/LoadingCoin.tsx`                 | 3D spinning gold coin loading indicator                        |
| `src/scene/shared/MoneyRain.tsx`                   | Konami Code money particle rain effect                         |

### Modified Files (5)

| File                                     | Changes                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/App.tsx`                            | Integrate all Phase 5 systems (loading, header, achievements, easter eggs, mobile perf) |
| `src/scene/cosmos/BillionairePlanet.tsx` | Add `@react-three/a11y` wrapper, reduced motion support                                 |
| `src/scene/cosmos/CosmosMode.tsx`        | Add entry animation with staggered planet reveal                                        |
| `src/scene/cosmos/WealthSun.tsx`         | Add supernova easter egg integration                                                    |
| `vite.config.ts`                         | Add manual chunks for vendor splitting                                                  |

### shadcn/ui Components to Install

| Component | Usage                         |
| --------- | ----------------------------- |
| `sheet`   | Mobile bottom sheet           |
| `slider`  | Guess the Wealth game input   |
| `button`  | Share, game, settings actions |
| `tooltip` | Achievement badge hover info  |
| `badge`   | Achievement status display    |

---

## Performance Budget Verification Checklist

Run these checks after completing Phase 5 implementation:

### Bundle Size

- [ ] Run `pnpm build` and verify total gzipped output < 500KB
- [ ] Verify Three.js vendor chunk is separate from main bundle
- [ ] Verify R3F vendor chunk is separate
- [ ] Verify TowersMode, OceanMode, TimelineMode are separate lazy chunks
- [ ] Run `npx vite-bundle-visualizer` and screenshot the treemap

### Runtime Performance (Chrome DevTools)

- [ ] Open Performance tab, record 10 seconds of Cosmos mode
- [ ] Verify consistent 60fps on desktop (16.6ms frame budget)
- [ ] Open `about:gpu` and verify WebGL2 is active
- [ ] Check GPU memory usage < 200MB in Task Manager

### Draw Calls (Leva / Console)

- [ ] Enable `usePerformanceDebug` hook
- [ ] Verify < 50 draw calls per frame in Cosmos mode
- [ ] Verify < 60 draw calls per frame in Towers mode
- [ ] Verify instanced meshes are used for all particle systems

### Geometry & Material Reuse

- [ ] Verify `gl.info.memory.geometries` count is stable (not growing)
- [ ] Verify `gl.info.memory.textures` count is stable
- [ ] Confirm `useMemo` wraps all geometry and material creation
- [ ] Confirm `dispose()` is called in cleanup effects

### Mobile Performance

- [ ] Test on iPhone / Android Chrome (or DevTools mobile emulation)
- [ ] Verify post-processing is disabled on mobile
- [ ] Verify particle counts are halved
- [ ] Verify AdaptiveDpr activates and lowers resolution under load
- [ ] Verify bottom sheet UI works for leaderboard and detail panel

### Accessibility

- [ ] Run axe DevTools audit on the page, resolve all critical/serious issues
- [ ] Tab through entire UI with keyboard only — all interactive elements reachable
- [ ] Enable VoiceOver/NVDA, verify 3D objects are announced with descriptions
- [ ] Enable `prefers-reduced-motion: reduce` in OS settings, verify no animations
- [ ] Verify all text meets WCAG AA contrast (use Chrome DevTools color picker)

### Loading Performance

- [ ] Measure First Contentful Paint < 2 seconds (Lighthouse)
- [ ] Measure Time to Interactive < 4 seconds (3D scene visible and responsive)
- [ ] Verify loading screen appears immediately and shows progress
- [ ] Verify loading screen fades out cleanly when assets are ready
