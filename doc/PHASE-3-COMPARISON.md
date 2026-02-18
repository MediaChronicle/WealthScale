# Phase 3: Wealth Comparison Engine

> **Goal**: "Your wealth vs theirs" --- the killer feature. User enters their net worth, sees themselves as a grain of sand next to a billionaire planet, watches a wealth race, and reads mind-blowing fun facts.
> **Deliverable**: Full comparison engine --- input bar, UserParticle in 3D, scale calculations, time-to-earn, animated wealth race, rotating fun facts.

---

## Table of Contents

1. [Prerequisites & Context](#1-prerequisites--context)
2. [Step 1: Utility Functions --- wealthComparison.ts](#step-1-utility-functions--wealthcomparisontts)
3. [Step 2: Update userStore with Comparison State](#step-2-update-userstore-with-comparison-state)
4. [Step 3: Install Required shadcn/ui Components](#step-3-install-required-shadcnui-components)
5. [Step 4: ComparisonBar](#step-4-comparisonbar)
6. [Step 5: UserParticle (3D)](#step-5-userparticle-3d)
7. [Step 6: ComparisonResults](#step-6-comparisonresults)
8. [Step 7: TimeToEarn](#step-7-timetoearn)
9. [Step 8: WealthRace](#step-8-wealthrace)
10. [Step 9: useFunFact Hook](#step-9-usefunfact-hook)
11. [Step 10: FunFactCard](#step-10-funfactcard)
12. [Step 11: Wire Everything into App.tsx & SceneManager](#step-11-wire-everything-into-apptsx--scenemanager)
13. [Acceptance Criteria](#acceptance-criteria)
14. [Files Created/Modified](#files-createdmodified)

---

## 1. Prerequisites & Context

### Completed in Phases 1-2

- [x] R3F Canvas with full Cosmos mode (WealthSun, 10 planets, orbit rings)
- [x] Hover/click interactions on planets with camera fly-to
- [x] Detail panel (glass overlay, profile data)
- [x] Leaderboard sidebar
- [x] Post-processing pipeline (Bloom, Vignette, ChromaticAberration)
- [x] Zustand stores: `billionaireStore`, `sceneStore`, `userStore`
- [x] TanStack Query data pipeline with Zod validation
- [x] `formatWealth`, `formatDollars`, `wealthMath` utilities
- [x] Global styles, fonts, glass-panel CSS

### New in Phase 3

- [ ] `wealthComparison.ts` --- scale ratio, time-to-earn, stack height calculations
- [ ] `userStore` expanded with `comparisonResults`, `wealthRaceState`
- [ ] `ComparisonBar` --- bottom-anchored input UI
- [ ] `UserParticle` --- 3D grain-of-sand next to billionaire planet
- [ ] `ComparisonResults` --- glass overlay with scale data
- [ ] `TimeToEarn` --- animated time computation
- [ ] `WealthRace` --- 10-second real-time race animation
- [ ] `useFunFact` hook --- dynamic fact generator
- [ ] `FunFactCard` --- floating holographic card

---

## Step 1: Utility Functions --- wealthComparison.ts

All comparison math lives in a single pure utility file. No side effects, fully testable.

### File: `src/utils/wealthComparison.ts`

```typescript
/**
 * Wealth comparison math.
 * All net worth inputs are in MILLIONS USD (matching the API).
 * User inputs arrive in absolute dollars and are converted at the boundary.
 */

const SECONDS_PER_YEAR = 365.25 * 24 * 3600

// ----- Scale Ratio -----

/**
 * Returns what percentage the user's wealth is of the billionaire's.
 * Example: userDollars=75_000, billionaireMillions=774_601 -> 0.0000097 (%)
 */
export function scaleRatioPercent(
  userDollars: number,
  billionaireMillions: number,
): number {
  if (billionaireMillions <= 0) return 0
  const billionaireDollars = billionaireMillions * 1_000_000
  return (userDollars / billionaireDollars) * 100
}

/**
 * Human-readable ratio string: "1 : 10,320,000"
 */
export function ratioString(
  userDollars: number,
  billionaireMillions: number,
): string {
  if (userDollars <= 0) return 'N/A'
  const billionaireDollars = billionaireMillions * 1_000_000
  const ratio = Math.round(billionaireDollars / userDollars)
  return `1 : ${ratio.toLocaleString()}`
}

// ----- Time to Earn -----

export interface TimeToEarnResult {
  /** Raw value in seconds */
  seconds: number
  /** Human-readable formatted string */
  formatted: string
  /** Unit for display ("milliseconds" | "seconds" | "minutes" | "hours" | "days" | "years") */
  unit: string
}

/**
 * How many seconds it takes a billionaire to earn the user's annual income,
 * assuming the billionaire's entire net worth was earned over one year.
 *
 * Formula: billionaireNetworth (in $) / (userAnnualIncome / seconds-in-year)
 * Simplified: (billionaireMillions * 1_000_000 * seconds-in-year) / userAnnualIncome
 *
 * Wait --- we want "earns your salary every X seconds", so:
 *   X = userAnnualIncome / (billionaireMillions * 1_000_000 / SECONDS_PER_YEAR)
 *   X = (userAnnualIncome * SECONDS_PER_YEAR) / (billionaireMillions * 1_000_000)
 */
export function timeToEarn(
  userAnnualIncome: number,
  billionaireMillions: number,
): TimeToEarnResult {
  if (userAnnualIncome <= 0 || billionaireMillions <= 0) {
    return { seconds: 0, formatted: 'N/A', unit: 'seconds' }
  }

  const billionaireDollarsPerSecond =
    (billionaireMillions * 1_000_000) / SECONDS_PER_YEAR
  const seconds = userAnnualIncome / billionaireDollarsPerSecond

  return {
    seconds,
    formatted: formatTimeSeconds(seconds),
    unit: getTimeUnit(seconds),
  }
}

function formatTimeSeconds(seconds: number): string {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)} milliseconds`
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)} seconds`
  }
  if (seconds < 3600) {
    return `${(seconds / 60).toFixed(1)} minutes`
  }
  if (seconds < 86400) {
    return `${(seconds / 3600).toFixed(1)} hours`
  }
  if (seconds < SECONDS_PER_YEAR) {
    return `${(seconds / 86400).toFixed(1)} days`
  }
  return `${(seconds / SECONDS_PER_YEAR).toFixed(1)} years`
}

function getTimeUnit(seconds: number): string {
  if (seconds < 1) return 'milliseconds'
  if (seconds < 60) return 'seconds'
  if (seconds < 3600) return 'minutes'
  if (seconds < 86400) return 'hours'
  if (seconds < SECONDS_PER_YEAR) return 'days'
  return 'years'
}

// ----- Wealth Race -----

/**
 * Compute how much each party earns per second (in dollars).
 */
export function earningsPerSecond(annualIncome: number): number {
  return annualIncome / SECONDS_PER_YEAR
}

/**
 * Compute accumulated wealth over elapsed seconds.
 */
export function accumulatedWealth(
  perSecond: number,
  elapsedSeconds: number,
): number {
  return perSecond * elapsedSeconds
}

// ----- Physical Stack -----

/**
 * Height of a stack of $1 bills for a given dollar amount.
 * A single $1 bill is 0.10922 mm thick.
 * Returns height in miles.
 */
export function dollarBillStackMiles(dollars: number): number {
  const mmPerBill = 0.10922
  const totalMm = dollars * mmPerBill
  const miles = totalMm / 1_609_344 // mm per mile
  return miles
}

/**
 * Height of a stack of $100 bills for a given dollar amount.
 * Returns height in feet.
 */
export function hundredBillStackFeet(dollars: number): number {
  const numBills = dollars / 100
  const mmPerBill = 0.10922
  const totalMm = numBills * mmPerBill
  const feet = totalMm / 304.8 // mm per foot
  return feet
}

// ----- User Particle 3D Scale -----

/**
 * The 3D radius for the user's grain-of-sand particle.
 * Always tiny relative to the billionaire planet, but never invisible.
 */
export function userParticleRadius(
  userDollars: number,
  billionaireMillions: number,
  billionairePlanetRadius: number,
): number {
  const ratio = userDollars / (billionaireMillions * 1_000_000)
  const rawRadius = ratio * billionairePlanetRadius
  return Math.max(0.02, Math.min(rawRadius, 0.15))
}
```

---

## Step 2: Update userStore with Comparison State

Expand the existing `UserSlice` with comparison result caching and wealth race state.

### File: `src/stores/userStore.ts` (replace)

```typescript
import type { StateCreator } from 'zustand'

export interface ComparisonResults {
  /** Percentage of billionaire's wealth */
  scalePercent: number
  /** "1 : 10,320,000" */
  ratio: string
  /** Formatted time string */
  timeToEarn: string
  /** Raw time-to-earn in seconds */
  timeToEarnSeconds: number
  /** Dollar bill stack height for user (feet) */
  userStackFeet: number
  /** Dollar bill stack height for billionaire (feet) */
  billionaireStackFeet: number
}

export type RaceStatus = 'idle' | 'running' | 'finished'

export interface WealthRaceState {
  status: RaceStatus
  /** Elapsed time in seconds */
  elapsed: number
  /** User accumulated dollars */
  userAccumulated: number
  /** Billionaire accumulated dollars */
  billionaireAccumulated: number
  /** Duration of the race in seconds */
  duration: number
}

export interface UserSlice {
  netWorth: number
  currency: string
  showComparison: boolean
  comparisonTarget: string | null
  comparisonResults: ComparisonResults | null
  wealthRace: WealthRaceState

  setNetWorth: (value: number) => void
  setCurrency: (code: string) => void
  setShowComparison: (show: boolean) => void
  setComparisonTarget: (uri: string | null) => void
  setComparisonResults: (results: ComparisonResults | null) => void
  startRace: () => void
  updateRace: (elapsed: number, userAcc: number, billionaireAcc: number) => void
  finishRace: () => void
  resetRace: () => void
}

const INITIAL_RACE: WealthRaceState = {
  status: 'idle',
  elapsed: 0,
  userAccumulated: 0,
  billionaireAccumulated: 0,
  duration: 10,
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set,
) => ({
  netWorth: 0,
  currency: 'USD',
  showComparison: false,
  comparisonTarget: null,
  comparisonResults: null,
  wealthRace: { ...INITIAL_RACE },

  setNetWorth: (value) => set({ netWorth: value }),
  setCurrency: (code) => set({ currency: code }),
  setShowComparison: (show) => set({ showComparison: show }),
  setComparisonTarget: (uri) => set({ comparisonTarget: uri }),
  setComparisonResults: (results) => set({ comparisonResults: results }),

  startRace: () =>
    set({
      wealthRace: { ...INITIAL_RACE, status: 'running' },
    }),
  updateRace: (elapsed, userAcc, billionaireAcc) =>
    set((s) => ({
      wealthRace: {
        ...s.wealthRace,
        elapsed,
        userAccumulated: userAcc,
        billionaireAccumulated: billionaireAcc,
      },
    })),
  finishRace: () =>
    set((s) => ({
      wealthRace: { ...s.wealthRace, status: 'finished' },
    })),
  resetRace: () => set({ wealthRace: { ...INITIAL_RACE } }),
})
```

### File: `src/stores/index.ts` (updated)

The combined store stays the same shape. The `AppStore` type union automatically picks up the expanded `UserSlice`:

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createBillionaireSlice } from './billionaireStore'
import { createSceneSlice } from './sceneStore'
import { createUserSlice } from './userStore'
import type { BillionaireSlice } from './billionaireStore'
import type { SceneSlice } from './sceneStore'
import type { UserSlice } from './userStore'

export type AppStore = BillionaireSlice & SceneSlice & UserSlice

export const useAppStore = create<AppStore>()(
  devtools((...args) => ({
    ...createBillionaireSlice(...args),
    ...createSceneSlice(...args),
    ...createUserSlice(...args),
  })),
)
```

---

## Step 3: Install Required shadcn/ui Components

Before building the UI, install the shadcn primitives:

```bash
pnpm dlx shadcn@latest add input slider button badge
```

This drops the following into `src/components/ui/`:

- `input.tsx`
- `slider.tsx`
- `button.tsx`
- `badge.tsx`

---

## Step 4: ComparisonBar

Bottom-anchored glass panel. User enters net worth, picks presets, and hits Compare.

### File: `src/components/comparison/ComparisonBar.tsx`

```tsx
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores'
import {
  scaleRatioPercent,
  ratioString,
  timeToEarn,
  hundredBillStackFeet,
} from '@/utils/wealthComparison'
import { DollarSign, ArrowRight, X } from 'lucide-react'
import type { ComparisonResults } from '@/stores/userStore'

const PRESETS = [
  { label: 'Median US Salary', value: 59_000, display: '$59K' },
  { label: 'Median US Household', value: 75_000, display: '$75K' },
  { label: 'Top 1%', value: 5_800_000, display: '$5.8M' },
] as const

const SLIDER_MAX = 10_000_000
const SLIDER_STEP = 1_000

export function ComparisonBar() {
  const [inputValue, setInputValue] = useState('')
  const [sliderValue, setSliderValue] = useState([59_000])

  const showComparison = useAppStore((s) => s.showComparison)
  const setShowComparison = useAppStore((s) => s.setShowComparison)
  const setNetWorth = useAppStore((s) => s.setNetWorth)
  const setComparisonResults = useAppStore((s) => s.setComparisonResults)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  const getTargetBillionaire = useCallback(() => {
    if (selectedUri) {
      return billionaires.find((b) => b.uri === selectedUri)
    }
    return billionaires[0] // Default to #1 richest
  }, [selectedUri, billionaires])

  const computeComparison = useCallback(
    (userDollars: number): ComparisonResults | null => {
      const target = getTargetBillionaire()
      if (!target || userDollars <= 0) return null

      const percent = scaleRatioPercent(userDollars, target.networth)
      const ratio = ratioString(userDollars, target.networth)
      const tte = timeToEarn(userDollars, target.networth)
      const userStack = hundredBillStackFeet(userDollars)
      const billionaireStack = hundredBillStackFeet(target.networth * 1_000_000)

      return {
        scalePercent: percent,
        ratio,
        timeToEarn: tte.formatted,
        timeToEarnSeconds: tte.seconds,
        userStackFeet: userStack,
        billionaireStackFeet: billionaireStack,
      }
    },
    [getTargetBillionaire],
  )

  const handleCompare = useCallback(
    (dollars: number) => {
      if (dollars <= 0) return
      setNetWorth(dollars)
      const results = computeComparison(dollars)
      setComparisonResults(results)
      setShowComparison(true)
    },
    [setNetWorth, computeComparison, setComparisonResults, setShowComparison],
  )

  const handleSubmit = useCallback(() => {
    const parsed = parseFloat(inputValue.replace(/[^0-9.]/g, ''))
    if (!isNaN(parsed) && parsed > 0) {
      handleCompare(parsed)
    }
  }, [inputValue, handleCompare])

  const handlePreset = useCallback(
    (value: number) => {
      setInputValue(value.toLocaleString())
      setSliderValue([value])
      handleCompare(value)
    },
    [handleCompare],
  )

  const handleSliderChange = useCallback((values: number[]) => {
    const val = values[0]
    setSliderValue(values)
    setInputValue(val.toLocaleString())
  }, [])

  const handleSliderCommit = useCallback(
    (values: number[]) => {
      handleCompare(values[0])
    },
    [handleCompare],
  )

  const handleClose = useCallback(() => {
    setShowComparison(false)
    setComparisonResults(null)
    setNetWorth(0)
  }, [setShowComparison, setComparisonResults, setNetWorth])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="glass-panel mx-auto max-w-3xl p-6">
          {/* Header row */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-ws-accent">
              Compare Your Wealth
            </h3>
            {showComparison && (
              <button
                onClick={handleClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Input + Compare button */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your net worth"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="border-ws-border bg-ws-glass pl-9 font-mono text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="bg-ws-accent font-display text-sm font-semibold text-black transition-all hover:brightness-110"
            >
              Compare
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {/* Slider */}
          <div className="mb-4">
            <Slider
              value={sliderValue}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit}
              max={SLIDER_MAX}
              step={SLIDER_STEP}
              className="cursor-pointer"
            />
            <div className="mt-1 flex justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                $0
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                $10M
              </span>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Badge
                key={preset.value}
                variant="outline"
                className="cursor-pointer border-ws-border px-3 py-1.5 font-mono text-xs transition-all hover:border-ws-accent hover:text-ws-accent"
                onClick={() => handlePreset(preset.value)}
              >
                {preset.label} ({preset.display})
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## Step 5: UserParticle (3D)

The grain-of-sand that represents the user's wealth next to a billionaire planet. Lives inside the R3F scene graph.

### File: `src/scene/shared/UserParticle.tsx`

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Billboard, Sparkles, Line } from '@react-three/drei'
import { useAppStore } from '@/stores'
import { userParticleRadius, scaleRatioPercent } from '@/utils/wealthComparison'
import { planetRadius, orbitRadius } from '@/utils/wealthMath'
import { formatDollars } from '@/utils/formatWealth'
import { Vector3, Mesh } from 'three'

export function UserParticle() {
  const meshRef = useRef<Mesh>(null)
  const showComparison = useAppStore((s) => s.showComparison)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  // Find the comparison target billionaire
  const target = useMemo(() => {
    if (selectedUri) {
      return billionaires.find((b) => b.uri === selectedUri)
    }
    return billionaires[0]
  }, [selectedUri, billionaires])

  // Calculate 3D positioning
  const config = useMemo(() => {
    if (!target || netWorth <= 0) return null

    const bRadius = planetRadius(target.networth)
    const bOrbit = orbitRadius(target.rank)
    const particleR = userParticleRadius(netWorth, target.networth, bRadius)
    const percent = scaleRatioPercent(netWorth, target.networth)

    // Position the particle slightly outside the planet's orbit
    const offset = bRadius + 2

    return {
      particleRadius: particleR,
      billionaireOrbitRadius: bOrbit,
      billionairePlanetRadius: bRadius,
      offset,
      percent,
      name: target.name,
    }
  }, [target, netWorth])

  // Track the planet position to follow it
  const particlePos = useRef(new Vector3())
  const planetPos = useRef(new Vector3())

  useFrame(() => {
    if (!meshRef.current || !config) return
    // Keep the particle at a fixed offset from origin along X for simplicity.
    // In a full implementation you'd track the actual planet mesh position.
    const angle = Date.now() * 0.0001
    const px = Math.cos(angle) * config.billionaireOrbitRadius
    const pz = Math.sin(angle) * config.billionaireOrbitRadius

    planetPos.current.set(px, 0, pz)

    // Place particle above and to the right of the planet
    const offsetX = config.billionairePlanetRadius + 1.5
    const offsetY = config.billionairePlanetRadius + 0.5

    particlePos.current.set(px + offsetX, offsetY, pz)
    meshRef.current.position.copy(particlePos.current)
  })

  if (!showComparison || !config || netWorth <= 0) return null

  const linePoints: [number, number, number][] = [
    [0, 0, 0],
    [-1.5, -0.5, 0],
  ]

  return (
    <group>
      <Float speed={2} floatIntensity={0.5} rotationIntensity={0}>
        <mesh ref={meshRef}>
          {/* The grain of sand */}
          <sphereGeometry args={[config.particleRadius, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
          />

          {/* Sparkles halo */}
          <Sparkles
            count={20}
            size={2}
            scale={[1, 1, 1]}
            color="#ffffff"
            speed={0.4}
          />

          {/* Label: user's net worth */}
          <Billboard position={[0, config.particleRadius + 0.6, 0]}>
            <Text
              fontSize={0.25}
              color="#ffffff"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.015}
              outlineColor="#000000"
              font={undefined}
            >
              You: {formatDollars(netWorth)}
            </Text>
            <Text
              fontSize={0.15}
              color="#94a3b8"
              anchorX="center"
              anchorY="top"
              position={[0, -0.08, 0]}
            >
              {config.percent.toFixed(6)}% of {config.name}
            </Text>
          </Billboard>

          {/* Dotted connector line toward planet */}
          <Line
            points={linePoints}
            color="#ffffff"
            lineWidth={1}
            dashed
            dashScale={5}
            dashSize={0.2}
            dashOffset={0}
            opacity={0.4}
            transparent
          />
        </mesh>
      </Float>
    </group>
  )
}
```

---

## Step 6: ComparisonResults

Glass panel overlay showing the computed comparison data with staggered entrance animations.

### File: `src/components/comparison/ComparisonResults.tsx`

```tsx
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/stores'
import { formatDollars } from '@/utils/formatWealth'
import { Scale, Clock, Layers, Percent } from 'lucide-react'

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

function PercentRing({ percent }: { percent: number }) {
  // SVG ring showing the percentage visually
  const radius = 40
  const circumference = 2 * Math.PI * radius
  // Clamp display percent for visual: if tiny, show at least a sliver
  const displayPercent = Math.max(percent, 0.5)
  const strokeDashoffset =
    circumference - (displayPercent / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={100}
        height={100}
        viewBox="0 0 100 100"
        className="-rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={6}
        />
        {/* Percentage fill */}
        <motion.circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="#00d4ff"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute font-mono text-xs text-ws-accent">
        {percent < 0.001 ? '<0.001%' : `${percent.toFixed(3)}%`}
      </span>
    </div>
  )
}

export function ComparisonResults() {
  const showComparison = useAppStore((s) => s.showComparison)
  const results = useAppStore((s) => s.comparisonResults)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  const target = selectedUri
    ? billionaires.find((b) => b.uri === selectedUri)
    : billionaires[0]

  if (!showComparison || !results || !target) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-4 top-1/2 z-40 w-80 -translate-y-1/2"
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="glass-panel space-y-5 p-6">
          {/* Title */}
          <motion.div variants={ITEM_VARIANTS}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-ws-accent">
              Your Wealth vs {target.name}
            </h3>
          </motion.div>

          {/* Percentage ring */}
          <motion.div
            variants={ITEM_VARIANTS}
            className="flex items-center gap-4"
          >
            <PercentRing percent={results.scalePercent} />
            <div>
              <p className="text-xs text-muted-foreground">Your wealth is</p>
              <p className="font-mono text-sm text-foreground">
                {results.scalePercent < 0.000001
                  ? `${results.scalePercent.toExponential(2)}%`
                  : `${results.scalePercent.toFixed(6)}%`}
              </p>
              <p className="text-xs text-muted-foreground">
                of {target.name}'s fortune
              </p>
            </div>
          </motion.div>

          {/* Scale ratio */}
          <motion.div
            variants={ITEM_VARIANTS}
            className="flex items-start gap-3"
          >
            <Scale className="mt-0.5 h-4 w-4 shrink-0 text-ws-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Scale Ratio</p>
              <p className="font-mono text-sm text-foreground">
                {results.ratio}
              </p>
            </div>
          </motion.div>

          {/* Time to earn */}
          <motion.div
            variants={ITEM_VARIANTS}
            className="flex items-start gap-3"
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ws-accent" />
            <div>
              <p className="text-xs text-muted-foreground">
                {target.name} earns your {formatDollars(netWorth)} every
              </p>
              <p className="font-mono text-lg font-bold text-ws-positive">
                {results.timeToEarn}
              </p>
            </div>
          </motion.div>

          {/* Stack comparison */}
          <motion.div
            variants={ITEM_VARIANTS}
            className="flex items-start gap-3"
          >
            <Layers className="mt-0.5 h-4 w-4 shrink-0 text-ws-accent" />
            <div>
              <p className="text-xs text-muted-foreground">
                Stacked in $100 bills
              </p>
              <p className="font-mono text-xs text-foreground">
                You: {results.userStackFeet.toFixed(1)} ft
              </p>
              <p className="font-mono text-xs text-foreground">
                {target.name}:{' '}
                {results.billionaireStackFeet >= 5280
                  ? `${(results.billionaireStackFeet / 5280).toFixed(0)} miles`
                  : `${results.billionaireStackFeet.toFixed(0)} ft`}
              </p>
            </div>
          </motion.div>

          {/* User's input summary */}
          <motion.div
            variants={ITEM_VARIANTS}
            className="border-t border-ws-border pt-3"
          >
            <div className="flex items-center gap-2">
              <Percent className="h-3 w-3 text-muted-foreground" />
              <p className="font-mono text-xs text-muted-foreground">
                Your net worth: {formatDollars(netWorth)}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## Step 7: TimeToEarn

Standalone animated component that dramatically counts up the time-to-earn figure.

### File: `src/components/comparison/TimeToEarn.tsx`

```tsx
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/stores'
import { timeToEarn } from '@/utils/wealthComparison'
import gsap from 'gsap'
import { Timer } from 'lucide-react'

export function TimeToEarn() {
  const showComparison = useAppStore((s) => s.showComparison)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  const [displayValue, setDisplayValue] = useState('0')
  const [unit, setUnit] = useState('')
  const counterRef = useRef({ value: 0 })
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const target = selectedUri
    ? billionaires.find((b) => b.uri === selectedUri)
    : billionaires[0]

  useEffect(() => {
    if (!showComparison || !target || netWorth <= 0) return

    const result = timeToEarn(netWorth, target.networth)
    setUnit(result.unit)

    // Reset counter
    counterRef.current.value = 0

    // Determine the display number based on unit
    let targetNumber: number
    switch (result.unit) {
      case 'milliseconds':
        targetNumber = result.seconds * 1000
        break
      case 'seconds':
        targetNumber = result.seconds
        break
      case 'minutes':
        targetNumber = result.seconds / 60
        break
      case 'hours':
        targetNumber = result.seconds / 3600
        break
      case 'days':
        targetNumber = result.seconds / 86400
        break
      case 'years':
        targetNumber = result.seconds / (365.25 * 24 * 3600)
        break
      default:
        targetNumber = result.seconds
    }

    // Kill any existing tween
    tweenRef.current?.kill()

    // GSAP counter animation
    tweenRef.current = gsap.to(counterRef.current, {
      value: targetNumber,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        const val = counterRef.current.value
        if (result.unit === 'milliseconds') {
          setDisplayValue(Math.round(val).toLocaleString())
        } else if (val < 10) {
          setDisplayValue(val.toFixed(1))
        } else {
          setDisplayValue(Math.round(val).toLocaleString())
        }
      },
    })

    return () => {
      tweenRef.current?.kill()
    }
  }, [showComparison, netWorth, target])

  if (!showComparison || !target || netWorth <= 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed left-4 top-24 z-40"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -200, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.3 }}
      >
        <div className="glass-panel max-w-xs p-5">
          <div className="mb-2 flex items-center gap-2">
            <Timer className="h-4 w-4 text-ws-accent" />
            <span className="font-display text-xs font-semibold uppercase tracking-widest text-ws-accent">
              Time to Earn
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {target.name} earns your annual salary every
          </p>

          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold text-ws-positive">
              {displayValue}
            </span>
            <span className="font-mono text-lg text-muted-foreground">
              {unit}
            </span>
          </div>

          <p className="text-xs text-muted-foreground/70">
            Based on annualizing net worth growth
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## Step 8: WealthRace

A 10-second real-time race: user income accumulates at real speed while the billionaire's counter races ahead.

### File: `src/components/comparison/WealthRace.tsx`

```tsx
import { useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/stores'
import { earningsPerSecond, accumulatedWealth } from '@/utils/wealthComparison'
import { formatDollars, formatWealth } from '@/utils/formatWealth'
import { Button } from '@/components/ui/button'
import gsap from 'gsap'
import { Play, RotateCcw, Trophy } from 'lucide-react'

const RACE_DURATION = 10 // seconds

export function WealthRace() {
  const showComparison = useAppStore((s) => s.showComparison)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)
  const wealthRace = useAppStore((s) => s.wealthRace)
  const startRace = useAppStore((s) => s.startRace)
  const updateRace = useAppStore((s) => s.updateRace)
  const finishRace = useAppStore((s) => s.finishRace)
  const resetRace = useAppStore((s) => s.resetRace)

  const userDisplayRef = useRef<HTMLSpanElement>(null)
  const billionaireDisplayRef = useRef<HTMLSpanElement>(null)
  const userBarRef = useRef<HTMLDivElement>(null)
  const billionaireBarRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const target = selectedUri
    ? billionaires.find((b) => b.uri === selectedUri)
    : billionaires[0]

  const handleStart = useCallback(() => {
    if (!target || netWorth <= 0) return

    // Kill any existing timeline
    timelineRef.current?.kill()

    startRace()

    const userPerSec = earningsPerSecond(netWorth)
    const billionairePerSec = earningsPerSecond(target.networth * 1_000_000)

    const state = { elapsed: 0 }

    timelineRef.current = gsap.timeline({
      onUpdate: () => {
        const elapsed = state.elapsed
        const userAcc = accumulatedWealth(userPerSec, elapsed)
        const billionaireAcc = accumulatedWealth(billionairePerSec, elapsed)

        updateRace(elapsed, userAcc, billionaireAcc)

        // Update DOM directly for performance (avoid React re-renders at 60fps)
        if (userDisplayRef.current) {
          userDisplayRef.current.textContent = formatDollars(userAcc)
        }
        if (billionaireDisplayRef.current) {
          billionaireDisplayRef.current.textContent =
            formatDollars(billionaireAcc)
        }

        // Progress bars (user is tiny, billionaire fills up)
        const userPercent = Math.min((userAcc / billionaireAcc) * 100, 100)
        const timePercent = (elapsed / RACE_DURATION) * 100

        if (userBarRef.current) {
          userBarRef.current.style.width = `${Math.max(userPercent, 0.1)}%`
        }
        if (billionaireBarRef.current) {
          billionaireBarRef.current.style.width = `${timePercent}%`
        }
      },
      onComplete: () => {
        finishRace()
      },
    })

    timelineRef.current.to(state, {
      elapsed: RACE_DURATION,
      duration: RACE_DURATION,
      ease: 'none',
    })
  }, [target, netWorth, startRace, updateRace, finishRace])

  const handleReset = useCallback(() => {
    timelineRef.current?.kill()
    resetRace()
  }, [resetRace])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  if (!showComparison || !target || netWorth <= 0) return null

  const { status, userAccumulated, billionaireAccumulated, elapsed } =
    wealthRace

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-28 right-4 z-40 w-80"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.5 }}
      >
        <div className="glass-panel p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-ws-gold" />
              <span className="font-display text-xs font-semibold uppercase tracking-widest text-ws-gold">
                Wealth Race
              </span>
            </div>
            {status !== 'idle' && (
              <span className="font-mono text-xs text-muted-foreground">
                {elapsed.toFixed(1)}s / {RACE_DURATION}s
              </span>
            )}
          </div>

          {/* User bar */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">You</span>
              <span
                ref={userDisplayRef}
                className="font-mono text-xs text-foreground"
              >
                {status === 'idle' ? '$0' : formatDollars(userAccumulated)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                ref={userBarRef}
                className="h-full rounded-full bg-ws-accent transition-none"
                style={{ width: '0%' }}
              />
            </div>
          </div>

          {/* Billionaire bar */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {target.name}
              </span>
              <span
                ref={billionaireDisplayRef}
                className="font-mono text-xs text-foreground"
              >
                {status === 'idle'
                  ? '$0'
                  : formatDollars(billionaireAccumulated)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                ref={billionaireBarRef}
                className="h-full rounded-full bg-ws-gold transition-none"
                style={{ width: '0%' }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {status === 'idle' && (
              <Button
                onClick={handleStart}
                className="flex-1 bg-ws-accent font-display text-sm font-semibold text-black hover:brightness-110"
              >
                <Play className="mr-1 h-4 w-4" />
                Start Race
              </Button>
            )}
            {status === 'running' && (
              <p className="flex-1 text-center font-mono text-sm text-ws-accent animate-pulse">
                Racing...
              </p>
            )}
            {status === 'finished' && (
              <>
                <div className="flex-1 text-center">
                  <p className="text-xs text-muted-foreground">
                    In {RACE_DURATION} seconds, {target.name} made
                  </p>
                  <p className="font-mono text-lg font-bold text-ws-gold">
                    {formatDollars(billionaireAccumulated)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    vs your{' '}
                    <span className="text-ws-accent">
                      {formatDollars(userAccumulated)}
                    </span>
                  </p>
                  {billionaireAccumulated > 0 && userAccumulated > 0 && (
                    <p className="mt-1 font-mono text-xs text-ws-negative">
                      {Math.round(
                        billionaireAccumulated / userAccumulated,
                      ).toLocaleString()}
                      x more
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-ws-border"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

---

## Step 9: useFunFact Hook

Pure data hook. Takes net worth in millions, returns an array of dynamically computed fun fact strings with automatic rotation.

### File: `src/hooks/useFunFact.ts`

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react'
import { dollarBillStackMiles } from '@/utils/wealthComparison'

const ROTATION_INTERVAL_MS = 8_000

// ----- Reference Data -----

interface CityHomePrice {
  city: string
  averagePrice: number // USD
}

const CITY_HOME_PRICES: CityHomePrice[] = [
  { city: 'Detroit', averagePrice: 85_000 },
  { city: 'Cleveland', averagePrice: 105_000 },
  { city: 'Memphis', averagePrice: 135_000 },
  { city: 'Indianapolis', averagePrice: 195_000 },
  { city: 'Las Vegas', averagePrice: 380_000 },
  { city: 'Phoenix', averagePrice: 410_000 },
  { city: 'Denver', averagePrice: 550_000 },
  { city: 'Austin', averagePrice: 485_000 },
  { city: 'Miami', averagePrice: 580_000 },
  { city: 'Seattle', averagePrice: 830_000 },
  { city: 'San Francisco', averagePrice: 1_350_000 },
  { city: 'Manhattan', averagePrice: 1_900_000 },
]

interface CountryGdp {
  country: string
  gdpUsd: number // Annual GDP in USD
}

const COUNTRY_GDPS: CountryGdp[] = [
  { country: 'Tuvalu', gdpUsd: 63_000_000 },
  { country: 'Nauru', gdpUsd: 150_000_000 },
  { country: 'Palau', gdpUsd: 264_000_000 },
  { country: 'Marshall Islands', gdpUsd: 280_000_000 },
  { country: 'Kiribati', gdpUsd: 223_000_000 },
  { country: 'Tonga', gdpUsd: 500_000_000 },
  { country: 'Samoa', gdpUsd: 850_000_000 },
  { country: 'Belize', gdpUsd: 2_400_000_000 },
  { country: 'Bhutan', gdpUsd: 2_700_000_000 },
  { country: 'Maldives', gdpUsd: 6_200_000_000 },
  { country: 'Iceland', gdpUsd: 28_000_000_000 },
  { country: 'Jamaica', gdpUsd: 17_100_000_000 },
  { country: 'Paraguay', gdpUsd: 42_000_000_000 },
  { country: 'Kenya', gdpUsd: 113_000_000_000 },
  { country: 'Sri Lanka', gdpUsd: 75_000_000_000 },
  { country: 'Croatia', gdpUsd: 78_000_000_000 },
  { country: 'New Zealand', gdpUsd: 247_000_000_000 },
  { country: 'Portugal', gdpUsd: 287_000_000_000 },
  { country: 'Finland', gdpUsd: 300_000_000_000 },
]

// Physical reference points in miles
const DISTANCE_REFERENCES: { name: string; miles: number }[] = [
  { name: 'the height of Mount Everest', miles: 5.5 },
  { name: 'the edge of space (Karman line)', miles: 62 },
  { name: 'low Earth orbit', miles: 1200 },
  { name: 'the Moon', miles: 238_900 },
  { name: 'Mars (closest approach)', miles: 33_900_000 },
  { name: 'the Sun', miles: 93_000_000 },
]

// Other reference costs
const REFERENCE_COSTS: { item: string; cost: number }[] = [
  { item: 'a cup of coffee', cost: 5 },
  { item: 'an iPhone', cost: 1_200 },
  { item: 'a new car', cost: 48_000 },
  { item: 'a year of Harvard tuition', cost: 57_000 },
  { item: 'a Lamborghini Huracan', cost: 250_000 },
  { item: 'a private island in Belize', cost: 5_000_000 },
  { item: 'a Boeing 747', cost: 418_000_000 },
  { item: 'an aircraft carrier', cost: 13_000_000_000 },
  { item: 'the International Space Station', cost: 150_000_000_000 },
]

// ----- Fact Generators -----

function generateFacts(networthMillions: number): string[] {
  const dollars = networthMillions * 1_000_000
  const facts: string[] = []

  // Home buying facts
  for (const city of CITY_HOME_PRICES) {
    const homes = Math.floor(dollars / city.averagePrice)
    if (homes >= 100 && homes <= 100_000_000) {
      facts.push(
        `This wealth could buy every home in ${city.city} --- roughly ${homes.toLocaleString()} houses.`,
      )
    }
  }

  // GDP comparisons
  const exceededCountries = COUNTRY_GDPS.filter((c) => dollars > c.gdpUsd)
  if (exceededCountries.length > 0) {
    // Pick the largest country they exceed
    const biggest = exceededCountries[exceededCountries.length - 1]
    facts.push(
      `This is more than the entire annual GDP of ${biggest.country} ($${(biggest.gdpUsd / 1_000_000_000).toFixed(1)}B).`,
    )

    // Count how many countries
    if (exceededCountries.length >= 3) {
      facts.push(
        `This wealth exceeds the GDP of ${exceededCountries.length} countries combined.`,
      )
    }
  }

  // Dollar bill stack height
  const stackMiles = dollarBillStackMiles(dollars)
  if (stackMiles > 0.01) {
    // Find nearest distance reference
    const nearest = DISTANCE_REFERENCES.reduce((prev, curr) =>
      Math.abs(curr.miles - stackMiles) < Math.abs(prev.miles - stackMiles)
        ? curr
        : prev,
    )

    if (stackMiles >= nearest.miles * 0.5) {
      const multiple = (stackMiles / nearest.miles).toFixed(1)
      facts.push(
        `Stacked in $1 bills, this would reach ${stackMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })} miles --- ${multiple}x the distance to ${nearest.name}.`,
      )
    } else {
      facts.push(
        `Stacked in $1 bills, this would reach ${stackMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })} miles high.`,
      )
    }
  }

  // How many of X could you buy
  for (const ref of REFERENCE_COSTS) {
    const count = Math.floor(dollars / ref.cost)
    if (count >= 1000 && count <= 1_000_000_000_000) {
      facts.push(`This could buy ${count.toLocaleString()} of ${ref.item}.`)
    }
  }

  // Spending rate
  if (dollars >= 1_000_000_000) {
    const daysToSpend = dollars / 1_000_000 // spending $1M/day
    const yearsToSpend = daysToSpend / 365.25
    facts.push(
      `Spending $1 million every day, it would take ${yearsToSpend.toFixed(0)} years to exhaust this wealth.`,
    )
  }

  // Weight in $100 bills
  const hundredBillCount = dollars / 100
  const weightKg = hundredBillCount * 0.001 // ~1 gram per bill
  const weightTons = weightKg / 1000
  if (weightTons >= 1) {
    facts.push(
      `In $100 bills, this wealth would weigh ${weightTons.toLocaleString(undefined, { maximumFractionDigits: 0 })} metric tons --- about ${(weightTons / 5.9).toFixed(0)} elephants.`,
    )
  }

  return facts
}

// ----- Hook -----

/**
 * Returns a rotating fun fact about the given net worth.
 * @param networthMillions Net worth in millions USD (from API).
 * @returns The current fact string and the total count.
 */
export function useFunFact(networthMillions: number) {
  const facts = useMemo(
    () => generateFacts(networthMillions),
    [networthMillions],
  )

  const [currentIndex, setCurrentIndex] = useState(0)

  // Shuffle starting index
  useEffect(() => {
    if (facts.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * facts.length))
    }
  }, [facts])

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (facts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length)
    }, ROTATION_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [facts.length])

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % facts.length)
  }, [facts.length])

  const previous = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + facts.length) % facts.length)
  }, [facts.length])

  return {
    fact: facts[currentIndex] ?? '',
    total: facts.length,
    index: currentIndex,
    next,
    previous,
  }
}
```

---

## Step 10: FunFactCard

Floating holographic-style glass card that displays rotating fun facts.

### File: `src/components/funFacts/FunFactCard.tsx`

```tsx
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/stores'
import { useFunFact } from '@/hooks/useFunFact'
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'

export function FunFactCard() {
  const showComparison = useAppStore((s) => s.showComparison)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  const target = selectedUri
    ? billionaires.find((b) => b.uri === selectedUri)
    : billionaires[0]

  const { fact, total, index, next, previous } = useFunFact(
    target?.networth ?? 0,
  )

  if (!showComparison || !target || !fact) return null

  return (
    <motion.div
      className="fixed bottom-28 left-4 z-40 max-w-sm"
      initial={{ y: 40, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.6 }}
    >
      <div className="glass-panel relative overflow-hidden p-5">
        {/* Holographic shimmer overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            background:
              'linear-gradient(135deg, #00d4ff 0%, #aa44ff 25%, #ff44aa 50%, #ffd700 75%, #00ff88 100%)',
            backgroundSize: '200% 200%',
            animation: 'shimmer 6s ease infinite',
          }}
        />

        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-ws-gold" />
          <span className="font-display text-xs font-semibold uppercase tracking-widest text-ws-gold">
            Did You Know?
          </span>
        </div>

        {/* Fact text with crossfade */}
        <div className="relative min-h-[3.5rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              className="text-sm leading-relaxed text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {fact}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {total > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={previous}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-1 rounded-full transition-colors ${
                    i === index % Math.min(total, 8)
                      ? 'bg-ws-gold'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
```

### Shimmer Keyframe

Add the shimmer animation to `src/index.css` inside the existing styles:

```css
@keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

---

## Step 11: Wire Everything into App.tsx & SceneManager

### Update `src/scene/SceneManager.tsx`

Add the `UserParticle` to the scene graph:

```tsx
import { Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import { CosmosLighting } from './shared/Lighting'
import { SpaceBackground } from './shared/Background'
import { BillionairePlanet } from './cosmos/BillionairePlanet'
import { UserParticle } from './shared/UserParticle'
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

      {/* User's grain-of-sand particle (comparison mode) */}
      <UserParticle />

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
```

### Update `src/App.tsx`

Add all comparison 2D overlays alongside the Canvas:

```tsx
import { useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneManager } from '@/scene/SceneManager'
import { useBillionaireList } from '@/api/queries'
import { toPlanetConfig } from '@/api/transformers'
import { useAppStore } from '@/stores'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/utils/constants'
import { ComparisonBar } from '@/components/comparison/ComparisonBar'
import { ComparisonResults } from '@/components/comparison/ComparisonResults'
import { TimeToEarn } from '@/components/comparison/TimeToEarn'
import { WealthRace } from '@/components/comparison/WealthRace'
import { FunFactCard } from '@/components/funFacts/FunFactCard'

export default function App() {
  const {
    data: billionaires,
    isPending,
    isError,
    error,
  } = useBillionaireList(10)
  const setBillionaires = useAppStore((s) => s.setBillionaires)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  // Sync API data into Zustand
  useEffect(() => {
    if (billionaires) {
      setBillionaires(billionaires)
    }
  }, [billionaires, setBillionaires])

  // Transform to planet configs
  const planets = useMemo(
    () => (billionaires ?? []).map(toPlanetConfig),
    [billionaires],
  )

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ws-bg">
        <p className="font-display text-xl text-ws-accent animate-pulse">
          Loading WealthScale...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ws-bg">
        <p className="font-display text-xl text-ws-negative">
          Error: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen">
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
        <SceneManager planets={planets} onSelectPlanet={selectBillionaire} />
      </Canvas>

      {/* 2D UI Overlays (comparison engine) */}
      <ComparisonBar />
      <ComparisonResults />
      <TimeToEarn />
      <WealthRace />
      <FunFactCard />
    </div>
  )
}
```

---

## Acceptance Criteria

- [ ] **ComparisonBar** renders fixed at the bottom of the viewport
- [ ] **ComparisonBar** slides up with a spring animation on mount
- [ ] User can type a dollar amount into the input field
- [ ] Pressing Enter or clicking "Compare" triggers comparison
- [ ] Three preset buttons ("Median US Salary", "Median US Household", "Top 1%") work on click
- [ ] Slider adjusts the value and triggers comparison on commit
- [ ] **UserParticle** appears in the 3D scene when `showComparison` is true
- [ ] UserParticle is a tiny white emissive sphere with Sparkles
- [ ] UserParticle has a Billboard label showing "You: $XX" and the percentage
- [ ] A dashed line connects the UserParticle toward the billionaire planet
- [ ] UserParticle disappears when comparison is closed
- [ ] **ComparisonResults** panel appears on the right side with staggered animation
- [ ] Results show: percentage ring (SVG), scale ratio, time-to-earn, stack comparison
- [ ] Percentage ring animates from 0 to the computed value
- [ ] **TimeToEarn** panel appears on the left with GSAP-animated counter
- [ ] Counter dramatically counts up from 0 to the time value
- [ ] Time displays correct units (ms, seconds, minutes, hours, days, years)
- [ ] **WealthRace** panel appears bottom-right
- [ ] Clicking "Start Race" begins a 10-second real-time accumulation
- [ ] User and billionaire progress bars animate in real time
- [ ] Dollar counters update at ~60fps via direct DOM mutation (no React state per frame)
- [ ] After 10 seconds, race shows final results with multiplier
- [ ] "Reset" button returns race to idle state
- [ ] **FunFactCard** appears bottom-left with holographic shimmer
- [ ] Facts rotate every 8 seconds with crossfade animation
- [ ] Facts are computed dynamically from the billionaire's net worth
- [ ] Navigation arrows allow manual cycling through facts
- [ ] All panels use `glass-panel` styling (backdrop blur, border, shadow)
- [ ] Closing comparison (X button) hides all comparison UI
- [ ] Comparison defaults to #1 billionaire if no planet is selected
- [ ] If a planet is selected, comparison targets that billionaire
- [ ] `userStore` correctly tracks `netWorth`, `showComparison`, `comparisonResults`, `wealthRace`
- [ ] No TypeScript errors
- [ ] No console errors

---

## Files Created/Modified

### New Files (8)

| File                                              | Purpose                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `src/utils/wealthComparison.ts`                   | All comparison math: ratios, time-to-earn, stack heights, race math |
| `src/components/comparison/ComparisonBar.tsx`     | Bottom-anchored wealth input UI with presets and slider             |
| `src/components/comparison/ComparisonResults.tsx` | Right-side glass panel with scale data and percentage ring          |
| `src/components/comparison/TimeToEarn.tsx`        | Left-side panel with GSAP-animated time counter                     |
| `src/components/comparison/WealthRace.tsx`        | Bottom-right 10-second race with real-time progress bars            |
| `src/components/funFacts/FunFactCard.tsx`         | Bottom-left rotating fun fact card with holographic shimmer         |
| `src/hooks/useFunFact.ts`                         | Hook: generates and rotates dynamic wealth facts                    |
| `src/scene/shared/UserParticle.tsx`               | 3D grain-of-sand particle with sparkles, label, connector line      |

### Modified Files (4)

| File                         | Changes                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/stores/userStore.ts`    | Added `ComparisonResults`, `WealthRaceState`, race actions, `setShowComparison`, `setComparisonResults`           |
| `src/stores/index.ts`        | Re-exports updated `UserSlice` type (no logic change)                                                             |
| `src/scene/SceneManager.tsx` | Added `<UserParticle />` to scene graph                                                                           |
| `src/App.tsx`                | Added all 2D comparison overlays: `ComparisonBar`, `ComparisonResults`, `TimeToEarn`, `WealthRace`, `FunFactCard` |

### CSS Addition (1)

| File            | Changes                                                       |
| --------------- | ------------------------------------------------------------- |
| `src/index.css` | Added `@keyframes shimmer` for FunFactCard holographic effect |

### shadcn/ui Components to Install (4)

| Component | Command                             |
| --------- | ----------------------------------- |
| `input`   | `pnpm dlx shadcn@latest add input`  |
| `slider`  | `pnpm dlx shadcn@latest add slider` |
| `button`  | `pnpm dlx shadcn@latest add button` |
| `badge`   | `pnpm dlx shadcn@latest add badge`  |
