# WealthScale Agent Guidelines

Guidance for AI agents operating in the WealthScale codebase.

## Project Overview

WealthScale is a 3D interactive wealth visualization app rendering billionaire fortunes as explorable 3D worlds (solar system, city skyline, ocean depths, time tunnel). Pure client-side SPA built with React 19, TypeScript 5.9, Vite 7, Three.js, React Three Fiber, and Zustand.

## Build & Development Commands

```bash
pnpm dev              # Start dev server (Vite 7, port 5173)
pnpm build            # Type-check (tsc -b) then build for production
pnpm lint             # ESLint on all .ts/.tsx files
pnpm preview          # Preview production build locally
pnpm vitest run       # Run tests once
pnpm vitest run <file>  # Run single test file
pnpm format           # Format all source files with Prettier
pnpm format:check     # Check formatting without modifying files
pnpm dlx shadcn@latest add <component>  # Add shadcn/ui components
```

**Husky hooks**: pre-commit runs `lint-staged` (ESLint --fix + Prettier on staged `.ts/.tsx` files).

## Code Style Guidelines

### Imports

- **Always use `@/` path alias** (maps to `src/`). Never use relative paths beyond one level.
  - ✅ `import { cn } from "@/lib/utils"`
  - ❌ `import { cn } from "../../lib/utils"`
- **Use `import type`** for type-only imports (required by `verbatimModuleSyntax`).
  - ✅ `import type { ClassValue } from "clsx"`
- **Direct imports only** — never use full qualifier names.
  - ✅ `import { Mesh } from "three"`
  - ❌ `import * as THREE from "three"`

### TypeScript

- **Strict mode enabled** — all TypeScript rules enforced.
- **`verbatimModuleSyntax`** enabled — must use `import type` for types.
- **No type suppression** — never use `as any`, `@ts-ignore`, or `@ts-expect-error`.
- **Always define return types** for functions, especially utilities and hooks.
- **Use explicit types** for function parameters in public APIs.

### Naming Conventions

| Element          | Convention       | Example                 |
| ---------------- | ---------------- | ----------------------- |
| Components       | PascalCase       | `BillionaireCard.tsx`   |
| Hooks            | useCamelCase     | `useBillionaireData.ts` |
| Stores           | camelCase        | `sceneStore.ts`         |
| Utils/Shaders    | camelCase        | `formatWealth.ts`       |
| Types/Interfaces | PascalCase       | `BillionaireProfile`    |
| Constants        | UPPER_SNAKE_CASE | `MAX_ZOOM_LEVEL`        |

### React & Three.js Patterns

- **Functional components** with arrow functions or `function` keyword.
- **Never set state in `useFrame`** — mutate refs directly for 60fps performance.
- **Use memoization** (`useMemo`, `useCallback`) for expensive operations.
- **Granular Zustand selectors**: `useAppStore(s => s.mode)` over `useAppStore()`.
- **Reuse geometries/materials** via `useMemo`. Always dispose on unmount.
- **Use `<Instances>`** for repeated meshes (particles, stars).
- **Disable post-processing** on mobile (`< 768px`).
- **Use `@react-spring/three`** for smooth 3D animations.
- **Lazy-load mode components** with `React.lazy()` + `Suspense`. SceneManager routes between modes dynamically.
- **3D Geometry scaling**: Create **unit geometry once** (e.g., `SphereGeometry(1, …)`) as a module-level constant and control size via `mesh.scale` — never re-create geometry per radius change.

#### Mode Transition System

The `ModeTransition` component wraps the active mode and performs a "dimensional collapse" animation when switching modes:

1. **Collapse** (0-0.8s): Current scene shrinks to zero with 360° rotation
2. **Expand** (0.8-2.0s): New scene expands from zero with another 360° rotation

```typescript
// SceneManager lazy-loads modes for code splitting
const TowersMode = lazy(() => import('@/scene/towers/TowersMode'))
const OceanMode = lazy(() => import('@/scene/ocean/OceanMode'))
const TimelineMode = lazy(() => import('@/scene/timeline/TimelineMode'))

export function SceneManager() {
  const mode = useAppStore((s) => s.mode)
  const ActiveMode = MODE_COMPONENTS[mode]

  return (
    <ModeTransition>
      <Suspense fallback={<SceneLoadingFallback />}>
        <ActiveMode />
      </Suspense>
    </ModeTransition>
  )
}
```

### Types

```typescript
// Visualization modes
export type VisualizationMode = 'cosmos' | 'towers' | 'ocean' | 'timeline'

// Timeline data structures
export interface BandDataPoint {
  month: number
  networth: number
}

export interface TimelineBillionaire {
  uri: string
  name: string
  color: string
  dataPoints: BandDataPoint[]
}

export interface TimelineData {
  months: string[]
  billionaires: TimelineBillionaire[]
}
```

### Custom Hooks

- **`useSelectedBillionaire()`** — Returns the currently selected billionaire using granular selectors + `useMemo`. Replaces inline `.find()` calls in components. Never subscribe to `billionaires` array just to call `.find()` inline.
- **`useFunFact(networth)`** — Returns `{ fact, total, index, next, previous, goToIndex }`. Manual navigation (`next`, `previous`, `goToIndex`) resets the auto-rotation timer.
- **`useBillionaireTop10History()`** — Fetches historical top 10 data from `/stats/top10` endpoint. Returns `{ data: TimelineData, isPending }` with 24h staleTime. Used by TimelineMode for wealth bands visualization.

### State Management (Zustand)

- **Use slice pattern** — each domain has a `StateCreator`, combined in `src/stores/index.ts`.
- **Include `devtools` middleware** in store configuration.
- **Use granular selectors** for reading state.

#### Scene Slice (Mode Management)

The scene store manages visualization mode state with a transition system:

```typescript
// src/stores/sceneStore.ts
export interface SceneSlice {
  mode: VisualizationMode // Current active mode: 'cosmos' | 'towers' | 'ocean' | 'timeline'
  pendingMode: VisualizationMode | null // Mode waiting for transition completion
  cameraTarget: Vec3
  isTransitioning: boolean // True during dimensional collapse transition
  showLabels: boolean
  showOrbits: boolean
  leaderboardOpen: boolean

  setMode: (mode: VisualizationMode) => void // Initiates mode switch (sets pendingMode)
  commitMode: () => void // Called by ModeTransition to finalize switch
  setTransitioning: (value: boolean) => void
  // ... other actions
}
```

**Mode Switching Flow:**

1. `setMode(newMode)` sets `pendingMode` and `isTransitioning = true`
2. `ModeTransition` component animates collapse → expand
3. On expand complete, `commitMode()` copies `pendingMode` to `mode` and clears it
4. New mode component mounts with lazy loading

#### User Slice (Comparison State)

Expanded with wealth comparison features:

```typescript
// src/stores/userStore.ts
interface ComparisonResults {
  scalePercent: number // User wealth as % of billionaire's
  ratio: string // "1 : 10,345,678"
  timeToEarn: string // e.g., "0.003 seconds"
  timeToEarnSeconds: number
  userStackFeet: number
  billionaireStackFeet: number
}

type RaceStatus = 'idle' | 'running' | 'finished'

interface WealthRaceState {
  status: RaceStatus
  elapsed: number
  userAccumulated: number
  billionaireAccumulated: number
  duration: number // 10 seconds default
}
```

### Animation Patterns (motion/react)

- **Individual `<AnimatePresence>` per component** — not a shared wrapper. Each overlay component mounts/unmounts via its own `<AnimatePresence>`.
- **Condition on the child** — put the condition (`selectedUri`, `showComparison`, etc.) on the motion component inside `<AnimatePresence>`, not as an early return inside the component.
- **Exit animations require condition on child** — early-return guards break exit animations.
- **Pattern**: `<AnimatePresence>{condition && <Panel />}</AnimatePresence>` in parent, no early returns in Panel component.
- **Pointer events**: Overlay components outside the `pointer-events-none` HUD wrapper need `pointer-events-auto` on their outer `motion.div`.

### Styling (Tailwind CSS v4)

- **CSS-first config** — no `tailwind.config.js`. Tokens in `src/index.css` via `@theme`.
- **WealthScale colors** use `--ws-*` CSS variables (`bg-ws-glass`, `text-ws-accent`).
- **Glass panel pattern**: `bg-ws-glass backdrop-blur-xl border border-ws-border rounded-2xl`
- **Dark theme only** — `.dark` is permanently on `<html>`.
- **Numeric displays**: Use `tabular-nums` class for numbers (prevents layout shift during counting animations).

### Error Handling

- **Never use empty catch blocks** (`catch(e) {}`).
- **Always handle async errors** with try/catch or `.catch()`.
- **Use proper error boundaries** for React components.
- **Log errors appropriately** — use `console.error` for errors, not `console.log`.

### Linting & Formatting

**Prettier config** (`.prettierrc.json`): no semicolons, single quotes, trailing commas, 80 char width, arrow parens always.

**ESLint** extends: `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`.

## Project Architecture

### Directory Structure

```
src/
├── api/              # Fetch client, endpoints, Zod schemas, TanStack Query hooks
├── components/       # 2D DOM UI
│   ├── comparison/   # Wealth comparison components (ComparisonBar, WealthRace, etc.)
│   ├── detail/       # Billionaire detail panel
│   ├── funFacts/     # Fun fact cards and overlays
│   ├── leaderboard/  # Leaderboard sidebar
│   ├── modeSwitcher/ # Mode tabs UI (ModeTabs.tsx)
│   └── ui/           # shadcn/ui primitives
├── hooks/            # Custom React hooks
│   ├── useIsMobile.ts
│   ├── useSelectedBillionaire.ts
│   ├── useFunFact.ts
│   └── useBillionaireTop10History.ts  # Timeline historical data
├── scene/            # R3F 3D components organized by mode
│   ├── cosmos/       # Solar system mode
│   ├── towers/       # Futuristic cityscape skyscrapers
│   ├── ocean/        # Underwater depth visualization
│   ├── timeline/     # Time-travel corridor
│   └── shared/       # Shared 3D components
│       ├── UserParticle.tsx
│       └── ModeTransition.tsx
├── stores/           # Zustand slices (billionaire, scene, user)
├── utils/            # Pure functions (formatWealth.ts, wealthMath.ts, wealthComparison.ts, constants.ts)
├── types/            # Shared TypeScript types
├── lib/              # Utilities (utils.ts for cn() helper)
└── index.css         # Tailwind v4 CSS-first config with custom theme
```

### Dual-Layer Rendering

1. **3D Canvas** (React Three Fiber) — full-viewport `<Canvas>` with 3D scene
2. **2D HUD Overlay** — DOM elements positioned absolutely over canvas with `pointer-events-none`

State shared through Zustand. 3D scene reads from store and mutates refs in `useFrame`; 2D UI reads from store and dispatches actions.

### Data Flow

```
RTB-API (CDN) → TanStack Query (6h staleTime) → Zod validation → Zustand store → R3F scene + 2D UI
```

API data is lazy-fetched on planet click via `enabled: !!uri` in `useQuery`.

### Performance

**Manual Code Splitting**: Vite config uses `manualChunks` for vendor splitting:

- `react-vendor`, `three-vendor`, `r3f-vendor`, `postprocessing-vendor`, `animation-vendor`, `ui-vendor`

**Mobile**: Post-processing disabled on mobile devices (`< 768px`).

## Dependencies

- **React 19** + React DOM 19
- **TypeScript 5.9** (strict mode)
- **Vite 7**
- **Three.js 0.182** + React Three Fiber + Drei + Postprocessing
- **Tailwind CSS 4** (CSS-first config)
- **Zustand 5** with devtools middleware
- **TanStack Query 5**
- **Zod 4**
- **Motion 12** + GSAP
- **shadcn/ui** (New York style)

## Best Practices

1. **Performance first** — optimize for 60fps in 3D scenes
2. **Use code splitting** — mode components are lazy-loaded
3. **Follow existing patterns** — match the codebase style exactly
4. **Keep components small** — single responsibility principle
5. **Use TypeScript properly** — avoid `any`, use proper types
6. **Accessibility** — use `@react-three/a11y` for 3D accessibility
7. **Mobile-first** — disable expensive effects on mobile
