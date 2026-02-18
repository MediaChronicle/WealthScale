# Phase 1: Foundation

> **Goal**: Project config + data pipeline + Zustand stores + one spinning planet from live API data
> **Deliverable**: A single planet in space, sized by Elon Musk's net worth, with his name label, Stars background, and Environment lighting.

---

## Table of Contents

1. [Prerequisites & Current State](#1-prerequisites--current-state)
2. [Step 1: Configure Global Styles & Fonts](#step-1-configure-global-styles--fonts)
3. [Step 2: TypeScript Types](#step-2-typescript-types)
4. [Step 3: API Client & Endpoints](#step-3-api-client--endpoints)
5. [Step 4: Zod Schemas & Transformers](#step-4-zod-schemas--transformers)
6. [Step 5: TanStack Query Setup & Hooks](#step-5-tanstack-query-setup--hooks)
7. [Step 6: Zustand Stores](#step-6-zustand-stores)
8. [Step 7: R3F Canvas Shell](#step-7-r3f-canvas-shell)
9. [Step 8: First BillionairePlanet](#step-8-first-billionaireplanet)
10. [Step 9: Environment & Stars Background](#step-9-environment--stars-background)
11. [Step 10: Wire It All Together](#step-10-wire-it-all-together)
12. [Acceptance Criteria](#acceptance-criteria)
13. [Files Created/Modified](#files-createdmodified)

---

## 1. Prerequisites & Current State

### Already Done

- [x] Vite 7 + React 19 + TypeScript 5.9 scaffolded
- [x] All dependencies installed (R3F, drei, postprocessing, zustand, tanstack query, zod, gsap, motion)
- [x] Tailwind CSS v4 with `@tailwindcss/vite` plugin configured
- [x] shadcn/ui initialized (new-york style, neutral)
- [x] Path alias `@/` configured in `tsconfig.json` and `vite.config.ts`
- [x] Folder structure created (empty)

### Still Needed

- [ ] Install fonts (Space Grotesk, Inter, JetBrains Mono)
- [ ] Replace default Vite template code
- [ ] Set up WealthScale design tokens in CSS
- [ ] Build entire data pipeline
- [ ] Set up 3D canvas with first planet

---

## Step 1: Configure Global Styles & Fonts

### 1.1 Install Fonts

```bash
pnpm add @fontsource-variable/space-grotesk @fontsource-variable/inter @fontsource/jetbrains-mono
```

### 1.2 Update `src/index.css`

Replace the default Vite styles. Keep shadcn tokens, add WealthScale tokens:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

/* Font imports */
@import '@fontsource-variable/space-grotesk';
@import '@fontsource-variable/inter';
@import '@fontsource/jetbrains-mono';

@custom-variant dark (&:is(.dark *));

/* ===== WealthScale Design Tokens ===== */
:root {
  --radius: 0.625rem;

  /* WealthScale palette (dark-first) */
  --ws-bg: #0a0a1a;
  --ws-glass: rgba(10, 10, 30, 0.7);
  --ws-glass-hover: rgba(20, 20, 50, 0.8);
  --ws-border: rgba(255, 255, 255, 0.08);
  --ws-text-primary: #e2e8f0;
  --ws-text-secondary: #94a3b8;
  --ws-accent: #00d4ff;
  --ws-positive: #00ff88;
  --ws-negative: #ff4466;
  --ws-gold: #ffd700;

  /* Industry colors */
  --ws-industry-tech: #00d4ff;
  --ws-industry-luxury: #ffd700;
  --ws-industry-finance: #00ff88;
  --ws-industry-retail: #ff8844;
  --ws-industry-auto: #c0c0c0;
  --ws-industry-energy: #aa44ff;
  --ws-industry-telecom: #ff44aa;
  --ws-industry-conglomerate: #ff2244;
  --ws-industry-healthcare: #00ccaa;

  /* shadcn overrides for dark space theme */
  --background: oklch(0.07 0.01 270);
  --foreground: oklch(0.93 0 0);
  --card: oklch(0.12 0.01 270);
  --card-foreground: oklch(0.93 0 0);
  --popover: oklch(0.12 0.01 270);
  --popover-foreground: oklch(0.93 0 0);
  --primary: oklch(0.7 0.15 220);
  --primary-foreground: oklch(0.07 0 0);
  --muted: oklch(0.2 0.01 270);
  --muted-foreground: oklch(0.6 0 0);
  --border: oklch(1 0 0 / 8%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.7 0.15 220);
}

@theme inline {
  /* Fonts */
  --font-display: 'Space Grotesk Variable', system-ui, sans-serif;
  --font-body: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* WealthScale custom colors */
  --color-ws-bg: var(--ws-bg);
  --color-ws-glass: var(--ws-glass);
  --color-ws-glass-hover: var(--ws-glass-hover);
  --color-ws-border: var(--ws-border);
  --color-ws-accent: var(--ws-accent);
  --color-ws-positive: var(--ws-positive);
  --color-ws-negative: var(--ws-negative);
  --color-ws-gold: var(--ws-gold);

  /* Radii */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);

  /* shadcn token mappings */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

/* ===== Global Resets ===== */

html,
body,
#root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--ws-bg);
  color: var(--ws-text-primary);
  font-family: var(--font-body);
}

/* Glass panel utility */
.glass-panel {
  background: var(--ws-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--ws-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 1.3 Update `index.html`

Add the `dark` class to the root `<html>` element:

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WealthScale — Visualize Billionaire Wealth in 3D</title>
    <meta
      name="description"
      content="Turn incomprehensible billionaire fortunes into visceral, tangible, explorable 3D worlds."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Step 2: TypeScript Types

### File: `src/types/index.ts`

```typescript
// ===== API Response Types =====

export interface BillionaireListEntry {
  rank: number
  uri: string
  name: string
  gender: 'm' | 'f'
  age: number
  networth: number // In millions USD
  change: number | null // Daily change in millions
  diff: number // Rank change
  flag: 'up' | 'down' | 'unchanged' | 'new'
  citizenship: string // ISO country code
  industry: string[]
  source: string[]
}

export interface BillionaireProfile {
  uri: string
  name: string
  birthDate: string
  gender: 'm' | 'f'
  citizenship: string
  residence: {
    country: string
    state: string
    city: string
  }
  industry: string[]
  source: string[]
  image: string
  children: number
  maritalStatus: string
  education: Array<{ school: string; degree: string }>
  organization: { name: string; title: string }
  selfMade: { _is: boolean; type: string; rank: number }
}

export interface BillionaireAssets {
  uri: string
  assets: Array<{
    name: string
    value: number
    type: string
  }>
}

export interface HistoryEntry {
  date: string
  networth: number
}

// ===== App Domain Types =====

export type VisualizationMode = 'cosmos' | 'towers' | 'ocean' | 'timeline'

export type IndustryType =
  | 'technology'
  | 'fashion & retail'
  | 'finance & investments'
  | 'automotive'
  | 'energy'
  | 'telecom'
  | 'healthcare'
  | 'diversified'
  | 'media & entertainment'
  | 'other'

export interface IndustryColor {
  primary: string
  emissive: string
}

// ===== 3D Scene Types =====

export type Vec3 = [number, number, number]

export interface PlanetConfig {
  uri: string
  name: string
  radius: number
  orbitRadius: number
  orbitSpeed: number
  color: string
  emissiveColor: string
  tilt: number
  rank: number
  networth: number
}
```

---

## Step 3: API Client & Endpoints

### File: `src/api/endpoints.ts`

```typescript
const BASE_URL = 'https://cdn.statically.io/gh/komed3/rtb-api@main/api'

export const endpoints = {
  /** Top billionaires list with rank, net worth, industry */
  list: `${BASE_URL}/list/rtb/latest.json`,

  /** Detailed profile info */
  profile: (uri: string) => `${BASE_URL}/profile/${uri}/info.json`,

  /** Biography text */
  bio: (uri: string) => `${BASE_URL}/profile/${uri}/bio.json`,

  /** Asset breakdown */
  assets: (uri: string) => `${BASE_URL}/profile/${uri}/assets.json`,

  /** Historical net worth (CSV) */
  history: (uri: string) => `${BASE_URL}/profile/${uri}/history.csv`,

  /** Rank history */
  rankHistory: (uri: string) => `${BASE_URL}/profile/${uri}/rank.json`,

  /** Monthly top 10 with historical data */
  top10: `${BASE_URL}/stats/top10.json`,

  /** Biggest daily gainers */
  winners: `${BASE_URL}/movers/value/winner/latest.json`,

  /** Biggest daily losers */
  losers: `${BASE_URL}/movers/value/loser/latest.json`,

  /** Country distribution */
  map: `${BASE_URL}/stats/map.json`,

  /** Industry index */
  industries: `${BASE_URL}/filter/industry/_index.json`,
} as const
```

### File: `src/api/client.ts`

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch: ${url}`)
  }

  return response.json()
}

export async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch CSV: ${url}`)
  }

  return response.text()
}
```

---

## Step 4: Zod Schemas & Transformers

### File: `src/api/schemas.ts`

```typescript
import { z } from 'zod'

export const BillionaireListEntrySchema = z.object({
  rank: z.number(),
  uri: z.string(),
  name: z.string(),
  gender: z.enum(['m', 'f']).optional().default('m'),
  age: z.number().optional().default(0),
  networth: z.number(),
  change: z.number().nullable().optional().default(null),
  diff: z.number().optional().default(0),
  flag: z
    .enum(['up', 'down', 'unchanged', 'new'])
    .optional()
    .default('unchanged'),
  citizenship: z.string().optional().default('unknown'),
  industry: z.array(z.string()).optional().default([]),
  source: z.array(z.string()).optional().default([]),
})

export const BillionaireListSchema = z.array(BillionaireListEntrySchema)

export const BillionaireProfileSchema = z.object({
  uri: z.string(),
  name: z.string(),
  birthDate: z.string().optional().default(''),
  gender: z.enum(['m', 'f']).optional().default('m'),
  citizenship: z.string().optional().default(''),
  residence: z
    .object({
      country: z.string().optional().default(''),
      state: z.string().optional().default(''),
      city: z.string().optional().default(''),
    })
    .optional()
    .default({}),
  industry: z.array(z.string()).optional().default([]),
  source: z.array(z.string()).optional().default([]),
  image: z.string().optional().default(''),
  children: z.number().optional().default(0),
  maritalStatus: z.string().optional().default(''),
  education: z
    .array(z.object({ school: z.string(), degree: z.string() }))
    .optional()
    .default([]),
  organization: z
    .object({ name: z.string(), title: z.string() })
    .optional()
    .default({ name: '', title: '' }),
  selfMade: z
    .object({
      _is: z.boolean(),
      type: z.string(),
      rank: z.number(),
    })
    .optional()
    .default({ _is: false, type: '', rank: 0 }),
})
```

### File: `src/api/transformers.ts`

```typescript
import type { BillionaireListEntry, PlanetConfig, HistoryEntry } from '@/types'
import { getIndustryColor } from '@/utils/colorByIndustry'

/**
 * Transform a billionaire list entry into 3D planet configuration.
 */
export function toPlanetConfig(entry: BillionaireListEntry): PlanetConfig {
  const industry = entry.industry[0] ?? 'other'
  const colors = getIndustryColor(industry)
  const radius = 0.3 + Math.log10(entry.networth / 100_000) * 0.8
  const orbitRadius = 8 + entry.rank * 3
  const orbitSpeed = 0.001 / entry.rank
  const tilt = (Math.random() - 0.5) * 30 // -15 to +15 degrees

  return {
    uri: entry.uri,
    name: entry.name,
    radius: Math.max(0.3, radius),
    orbitRadius,
    orbitSpeed,
    color: colors.primary,
    emissiveColor: colors.emissive,
    tilt,
    rank: entry.rank,
    networth: entry.networth,
  }
}

/**
 * Parse CSV history data into typed entries.
 */
export function parseHistoryCsv(csv: string): HistoryEntry[] {
  const lines = csv.trim().split('\n')
  // Skip header row
  return lines.slice(1).map((line) => {
    const [date, networth] = line.split(',')
    return {
      date: date.trim(),
      networth: parseFloat(networth),
    }
  })
}
```

---

## Step 5: TanStack Query Setup & Hooks

### File: `src/api/queries.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchJson } from './client'
import { endpoints } from './endpoints'
import { BillionaireListSchema, BillionaireProfileSchema } from './schemas'
import type { BillionaireListEntry, BillionaireProfile } from '@/types'

/**
 * Fetch top billionaires list (top 10 extracted).
 */
export function useBillionaireList(limit = 10) {
  return useQuery({
    queryKey: ['billionaires', 'list', limit],
    queryFn: async (): Promise<BillionaireListEntry[]> => {
      const raw = await fetchJson<unknown[]>(endpoints.list)
      const validated = BillionaireListSchema.parse(raw)
      return validated.slice(0, limit)
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  })
}

/**
 * Fetch individual billionaire profile (lazy, on-demand).
 */
export function useBillionaireProfile(uri: string | null) {
  return useQuery({
    queryKey: ['billionaires', 'profile', uri],
    queryFn: async (): Promise<BillionaireProfile> => {
      const raw = await fetchJson<unknown>(endpoints.profile(uri!))
      return BillionaireProfileSchema.parse(raw)
    },
    enabled: !!uri,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (profiles change rarely)
  })
}
```

### QueryClient Provider Setup

In `src/main.tsx`:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 6,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

---

## Step 6: Zustand Stores

### File: `src/stores/billionaireStore.ts`

```typescript
import { StateCreator } from 'zustand'
import type { BillionaireListEntry, BillionaireProfile } from '@/types'

export interface BillionaireSlice {
  billionaires: BillionaireListEntry[]
  profiles: Record<string, BillionaireProfile>
  selectedUri: string | null

  setBillionaires: (data: BillionaireListEntry[]) => void
  selectBillionaire: (uri: string | null) => void
  addProfile: (uri: string, profile: BillionaireProfile) => void
}

export const createBillionaireSlice: StateCreator<
  BillionaireSlice,
  [],
  [],
  BillionaireSlice
> = (set) => ({
  billionaires: [],
  profiles: {},
  selectedUri: null,

  setBillionaires: (data) => set({ billionaires: data }),
  selectBillionaire: (uri) => set({ selectedUri: uri }),
  addProfile: (uri, profile) =>
    set((state) => ({
      profiles: { ...state.profiles, [uri]: profile },
    })),
})
```

### File: `src/stores/sceneStore.ts`

```typescript
import { StateCreator } from 'zustand'
import type { VisualizationMode, Vec3 } from '@/types'

export interface SceneSlice {
  mode: VisualizationMode
  cameraTarget: Vec3
  isTransitioning: boolean
  showLabels: boolean
  showOrbits: boolean

  setMode: (mode: VisualizationMode) => void
  setCameraTarget: (target: Vec3) => void
  setTransitioning: (value: boolean) => void
  toggleLabels: () => void
  toggleOrbits: () => void
}

export const createSceneSlice: StateCreator<SceneSlice, [], [], SceneSlice> = (
  set,
) => ({
  mode: 'cosmos',
  cameraTarget: [0, 0, 0],
  isTransitioning: false,
  showLabels: true,
  showOrbits: true,

  setMode: (mode) => set({ mode, isTransitioning: true }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setTransitioning: (value) => set({ isTransitioning: value }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
})
```

### File: `src/stores/userStore.ts`

```typescript
import { StateCreator } from 'zustand'

export interface UserSlice {
  netWorth: number
  currency: string
  showComparison: boolean
  comparisonTarget: string | null

  setNetWorth: (value: number) => void
  setCurrency: (code: string) => void
  toggleComparison: () => void
  setComparisonTarget: (uri: string | null) => void
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set,
) => ({
  netWorth: 0,
  currency: 'USD',
  showComparison: false,
  comparisonTarget: null,

  setNetWorth: (value) => set({ netWorth: value }),
  setCurrency: (code) => set({ currency: code }),
  toggleComparison: () => set((s) => ({ showComparison: !s.showComparison })),
  setComparisonTarget: (uri) => set({ comparisonTarget: uri }),
})
```

### File: `src/stores/index.ts`

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  createBillionaireSlice,
  type BillionaireSlice,
} from './billionaireStore'
import { createSceneSlice, type SceneSlice } from './sceneStore'
import { createUserSlice, type UserSlice } from './userStore'

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

## Step 7: R3F Canvas Shell

### File: `src/utils/constants.ts`

```typescript
// Scene defaults
export const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 15, 40]
export const DEFAULT_CAMERA_FOV = 60

// Planet scaling
export const PLANET_BASE_RADIUS = 0.3
export const PLANET_SCALE_FACTOR = 0.8
export const ORBIT_BASE_RADIUS = 8
export const ORBIT_SPACING = 3

// Sun
export const SUN_RADIUS = 5
export const SUN_SEGMENTS = 64

// Background
export const STAR_COUNT = 5000
export const STAR_RADIUS = 300
export const STAR_DEPTH = 100

// API
export const TOP_BILLIONAIRES_COUNT = 10
export const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours
```

### File: `src/utils/colorByIndustry.ts`

```typescript
import type { IndustryColor } from '@/types'

const INDUSTRY_COLORS: Record<string, IndustryColor> = {
  technology: { primary: '#00D4FF', emissive: '#0066FF' },
  'fashion & retail': { primary: '#FFD700', emissive: '#CC9900' },
  'finance & investments': { primary: '#00FF88', emissive: '#009955' },
  automotive: { primary: '#C0C0C0', emissive: '#888888' },
  energy: { primary: '#AA44FF', emissive: '#7722CC' },
  telecom: { primary: '#FF44AA', emissive: '#CC2288' },
  healthcare: { primary: '#00CCAA', emissive: '#009977' },
  diversified: { primary: '#FF2244', emissive: '#CC0022' },
  'media & entertainment': { primary: '#FF8844', emissive: '#CC5500' },
}

const DEFAULT_COLOR: IndustryColor = { primary: '#FFFFFF', emissive: '#AAAAAA' }

export function getIndustryColor(industry: string): IndustryColor {
  const key = industry.toLowerCase()
  return INDUSTRY_COLORS[key] ?? DEFAULT_COLOR
}
```

### File: `src/utils/formatWealth.ts`

```typescript
/**
 * Format net worth (in millions) to human-readable string.
 * 774601.062 -> "$774.6B"
 * 59.0 -> "$59M"
 * 0.075 -> "$75K"
 */
export function formatWealth(millionsUsd: number): string {
  if (millionsUsd >= 1_000_000) {
    return `$${(millionsUsd / 1_000_000).toFixed(1)}T`
  }
  if (millionsUsd >= 1_000) {
    return `$${(millionsUsd / 1_000).toFixed(1)}B`
  }
  if (millionsUsd >= 1) {
    return `$${millionsUsd.toFixed(0)}M`
  }
  return `$${(millionsUsd * 1_000).toFixed(0)}K`
}

/**
 * Format an absolute dollar amount (not millions).
 * 75000 -> "$75K"
 */
export function formatDollars(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `$${(amount / 1_000_000_000_000).toFixed(1)}T`
  }
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return `$${amount.toFixed(0)}`
}
```

### File: `src/utils/wealthMath.ts`

```typescript
/**
 * Calculate planet radius from net worth (in millions USD).
 * Musk (~774,601M) -> ~2.2 units
 * Smallest top 10 (~100,000M) -> ~0.7 units
 */
export function planetRadius(networth: number): number {
  return Math.max(0.3, 0.3 + Math.log10(networth / 100_000) * 0.8)
}

/**
 * Calculate orbit radius from rank (1-indexed).
 */
export function orbitRadius(rank: number): number {
  return 8 + rank * 3
}

/**
 * Calculate tower height from net worth.
 */
export function towerHeight(networth: number): number {
  return Math.log10(networth / 10_000) * 10
}

/**
 * Calculate ocean depth from net worth.
 */
export function oceanDepth(networth: number): number {
  return -(networth / 50_000)
}
```

---

## Step 8: First BillionairePlanet

### File: `src/scene/cosmos/BillionairePlanet.tsx`

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Billboard } from '@react-three/drei'
import { SphereGeometry, MeshPhysicalMaterial, Color, Mesh } from 'three'
import type { PlanetConfig } from '@/types'
import { formatWealth } from '@/utils/formatWealth'

interface BillionairePlanetProps {
  config: PlanetConfig
  isSelected?: boolean
  onSelect?: (uri: string) => void
}

export function BillionairePlanet({
  config,
  isSelected = false,
  onSelect,
}: BillionairePlanetProps) {
  const meshRef = useRef<Mesh>(null)
  const orbitAngleRef = useRef(Math.random() * Math.PI * 2)

  // Reuse geometry and material
  const geometry = useMemo(
    () => new SphereGeometry(config.radius, 32, 32),
    [config.radius],
  )

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(config.color),
        emissive: new Color(config.emissiveColor),
        emissiveIntensity: 0.15,
        roughness: 0.3,
        metalness: 0.7,
      }),
    [config.color, config.emissiveColor],
  )

  // Animate orbit + self-rotation
  useFrame((_, delta) => {
    if (!meshRef.current) return

    orbitAngleRef.current += config.orbitSpeed * delta * 60
    const angle = orbitAngleRef.current

    meshRef.current.position.x = Math.cos(angle) * config.orbitRadius
    meshRef.current.position.z = Math.sin(angle) * config.orbitRadius
    meshRef.current.rotation.y += delta * 0.2
  })

  return (
    <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        rotation={[0, 0, (config.tilt * Math.PI) / 180]}
        onClick={() => onSelect?.(config.uri)}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        {/* Name label */}
        <Billboard position={[0, config.radius + 0.8, 0]}>
          <Text
            fontSize={0.5}
            color="#e2e8f0"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {config.name}
          </Text>
          <Text
            fontSize={0.3}
            color={config.color}
            anchorX="center"
            anchorY="top"
            position={[0, -0.15, 0]}
          >
            {formatWealth(config.networth)}
          </Text>
        </Billboard>
      </mesh>
    </Float>
  )
}
```

---

## Step 9: Environment & Stars Background

### File: `src/scene/shared/Lighting.tsx`

```tsx
import { Environment } from '@react-three/drei'

export function CosmosLighting() {
  return (
    <>
      {/* Central sun light */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#FFE4B5" />
      {/* Soft ambient fill */}
      <ambientLight intensity={0.15} />
      {/* Environment map for reflections */}
      <Environment preset="night" />
    </>
  )
}
```

### File: `src/scene/shared/Background.tsx`

```tsx
import { Stars } from '@react-three/drei'
import { STAR_COUNT, STAR_RADIUS, STAR_DEPTH } from '@/utils/constants'

export function SpaceBackground() {
  return (
    <>
      <Stars
        radius={STAR_RADIUS}
        depth={STAR_DEPTH}
        count={STAR_COUNT}
        factor={6}
        saturation={0}
        fade
        speed={0.5}
      />
      {/* Deep space gradient via scene background */}
      <color attach="background" args={['#0a0a1a']} />
      <fog attach="fog" args={['#0a0a2e', 80, 200]} />
    </>
  )
}
```

### File: `src/scene/SceneManager.tsx`

```tsx
import { Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import { CosmosLighting } from './shared/Lighting'
import { SpaceBackground } from './shared/Background'
import { BillionairePlanet } from './cosmos/BillionairePlanet'
import { DEFAULT_CAMERA_POSITION } from '@/utils/constants'
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

---

## Step 10: Wire It All Together

### File: `src/App.tsx` (replace default)

```tsx
import { Canvas } from '@react-three/fiber'
import { SceneManager } from '@/scene/SceneManager'
import { useBillionaireList } from '@/api/queries'
import { toPlanetConfig } from '@/api/transformers'
import { useAppStore } from '@/stores'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/utils/constants'
import { useMemo, useEffect } from 'react'

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
    <div className="h-screen w-screen">
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
    </div>
  )
}
```

### File: `src/main.tsx` (updated)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 6,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

---

## Acceptance Criteria

- [ ] App loads without errors
- [ ] API fetches top 10 billionaires from RTB-API
- [ ] Zod validates the response (invalid data throws helpful error)
- [ ] Zustand store populated with billionaire data
- [ ] R3F Canvas renders with black space background
- [ ] `<Stars>` visible in background
- [ ] 10 planets visible, each sized logarithmically by net worth
- [ ] Planets orbit the center at different speeds (inner = faster)
- [ ] Each planet colored by industry
- [ ] Hovering planet changes cursor to pointer
- [ ] Clicking planet logs URI (store updates `selectedUri`)
- [ ] Name + net worth label visible above each planet
- [ ] OrbitControls allow camera orbit, zoom, pan
- [ ] No console errors or TypeScript errors
- [ ] Dev server runs with `pnpm dev`

---

## Files Created/Modified

### New Files (15)

| File                                     | Purpose                     |
| ---------------------------------------- | --------------------------- |
| `src/types/index.ts`                     | All shared TypeScript types |
| `src/api/endpoints.ts`                   | API URL builder             |
| `src/api/client.ts`                      | Fetch wrapper               |
| `src/api/schemas.ts`                     | Zod validation schemas      |
| `src/api/transformers.ts`                | Raw API → app data mappers  |
| `src/api/queries.ts`                     | TanStack Query hooks        |
| `src/stores/billionaireStore.ts`         | Billionaire data slice      |
| `src/stores/sceneStore.ts`               | Scene config slice          |
| `src/stores/userStore.ts`                | User wealth slice           |
| `src/stores/index.ts`                    | Combined store              |
| `src/utils/constants.ts`                 | Magic numbers, defaults     |
| `src/utils/colorByIndustry.ts`           | Industry → color mapper     |
| `src/utils/formatWealth.ts`              | Number formatting           |
| `src/utils/wealthMath.ts`                | Scale calculations          |
| `src/scene/cosmos/BillionairePlanet.tsx` | Planet 3D component         |
| `src/scene/shared/Lighting.tsx`          | Scene lighting              |
| `src/scene/shared/Background.tsx`        | Stars + fog                 |
| `src/scene/SceneManager.tsx`             | Scene root component        |

### Modified Files (4)

| File            | Changes                                           |
| --------------- | ------------------------------------------------- |
| `src/index.css` | WealthScale tokens, fonts, global resets          |
| `src/main.tsx`  | QueryClientProvider wrapper                       |
| `src/App.tsx`   | Replace Vite template with Canvas + data pipeline |
| `index.html`    | Dark class, meta tags, title                      |

### Deleted Files (1)

| File          | Reason                                     |
| ------------- | ------------------------------------------ |
| `src/App.css` | Replaced by Tailwind utilities + index.css |
