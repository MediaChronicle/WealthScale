# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (Vite 7, port 5173)
pnpm build            # Type-check (tsc -b) then build for production
pnpm lint             # ESLint on all .ts/.tsx files
pnpm format           # Format code with Prettier
pnpm format:check     # Check if code is properly formatted
pnpm preview          # Preview production build locally
pnpm dlx shadcn@latest add <component>  # Add shadcn/ui components
```

### Pre-commit Hooks

Husky is configured with lint-staged to automatically:

- Run ESLint with `--fix` on `.ts/.tsx` files
- Run Prettier on `.ts/.tsx` files
- Run Prettier on `.json`, `.md`, `.css`, `.html` files

These run automatically before each commit. If hooks fail, the commit is blocked — fix the issues and try again.

No test runner is configured yet. When added, use Vitest (`pnpm vitest` or `pnpm vitest run <file>`).

## What This Project Is

WealthScale is a 3D interactive wealth visualization app that renders billionaire fortunes as explorable 3D worlds (solar system, city skyline, ocean depths, time tunnel). It's a pure client-side SPA — no backend, no SSR. Data comes from the free RTB-API (Forbes CDN, no API key).

Full product spec: `doc/PRD.md`

## Architecture

### Dual-Layer Rendering

The app renders two layers simultaneously:

- **3D Canvas** (React Three Fiber) — full-viewport `<Canvas>` with 3D scene
- **2D HUD Overlay** — DOM elements positioned absolutely over the canvas with `pointer-events-none` (re-enabled on interactive elements via `pointer-events-auto`)

These layers share state through Zustand. The 3D scene reads from the store and mutates refs in `useFrame`; the 2D UI reads from the store and dispatches actions normally. The HUD includes a header bar, `LeaderboardSidebar` (left), and `DetailPanel` (right, lazy-loaded with `AnimatePresence`).

### Four Visualization Modes

The scene has four mutually exclusive modes (`cosmos | towers | ocean | timeline`), only one mounted at a time. All modes are `React.lazy` code-split chunks. Mode switching uses a two-phase system via `sceneStore`:

1. `setMode(mode)` sets `pendingMode` + `isTransitioning=true` (guarded: no-op if already transitioning)
2. `ModeTransition` (react-spring) collapses the old scene (scale 1→0 with spin)
3. At collapse midpoint, `commitMode()` swaps `pendingMode → mode`, mounting the new mode
4. `ModeTransition` expands the new scene (scale 0→1), then sets `isTransitioning=false`

Each mode is a self-contained orchestrator that owns its background, fog, lighting, camera controls, and sub-components. `SceneManager` is a stateless router: it reads `mode` from Zustand, resolves the lazy component via `MODE_COMPONENTS` map, and wraps it in `<ModeTransition><Suspense>`.

**No props flow through SceneManager.** Each mode reads `billionaires` (and any other data) directly from Zustand. The `toPlanetConfig()` transform lives inside `CosmosMode`, not in App.tsx. Timeline mode fetches its own historical data via `useBillionaireTop10History()` hook.

Post-processing (`Bloom`, `Vignette`, `ChromaticAberration`) is shared across all modes — rendered in `App.tsx` inside `<Canvas>`, lazy-loaded, gated by `!isMobile`.

**Mode components:**
| Mode | Root | Camera | Key sub-components |
|------|------|--------|--------------------|
| Cosmos | `CosmosMode` | `CameraController` + `OrbitControls` | WealthSun, BillionairePlanet, OrbitRing, SpaceBackground, CosmosLighting |
| Towers | `TowersMode` | `OrbitControls` (street-level, maxPolarAngle) | WealthTower (unit box + scale), TowerLabel, EnergyParticles, GroundPlane |
| Ocean | `OceanMode` | `OrbitControls` | WealthCreature (unit hemisphere + scale), WaterSurface, DepthMarker, CausticLights |
| Timeline | `TimelineMode` | Manual (wheel-scroll along Z, lerped in useFrame) | WealthBand (custom BufferGeometry), TimeTunnel, EventCard (drei Html), DateMarker |

### Data Flow

```
RTB-API (CDN) → TanStack Query (6h staleTime) → Zod validation → Zustand store → R3F scene + 2D UI
```

Profile/asset data is lazy-fetched on planet click via `enabled: !!uri` in `useQuery`.

### Comparison Engine

When a billionaire is selected, a comparison overlay activates:

- **`ComparisonBar`** — fixed bottom bar; user enters their net worth (input + slider + presets), computes results, sets `showComparison: true` and closes the leaderboard
- **`ComparisonResults`** — fixed right panel; ratio, time-to-earn, bill-stack heights with animated percent ring
- **`TimeToEarn`** — fixed left panel; GSAP counter animation for time-to-earn value
- **`WealthRace`** — fixed bottom-right panel; 10-second race using GSAP timeline with direct DOM ref mutations (no Zustand in `onUpdate`)
- **`FunFactCard`** — fixed bottom-left panel; rotating facts from `useFunFact` hook
- **`UserParticle`** — R3F 3D particle that floats near the selected planet, sized proportional to user vs. billionaire wealth

When `showComparison` is true, `DetailPanel` is hidden. Comparison components live **outside** the `pointer-events-none` HUD wrapper in `App.tsx`; each is mounted/unmounted via its own `<AnimatePresence>` with the correct condition (`selectedUri`, `showComparison`, `comparisonResults`, `netWorth > 0`). Components must have `pointer-events-auto` on their outer `motion.div`. Do **not** use early-return guards for visibility — that breaks exit animations.

- `useSelectedBillionaire()` hook (granular selectors + `useMemo`) replaces `.find()` calls in all comparison components. Never subscribe to `billionaires` array just to call `.find()` inline.
- `useFunFact` returns `{ fact, total, index, next, previous, goToIndex }`. Manual nav (`next`, `previous`, `goToIndex`) resets the auto-rotation timer so the user has time to read.

Math lives in `src/utils/wealthComparison.ts`; constants in the `// ===== Comparison Engine =====` section of `constants.ts`.

### Key Directories

- `src/api/` — fetch client, endpoint URLs, Zod schemas, TanStack Query hooks, data transformers
- `src/stores/` — Zustand slices (billionaire, scene, user, achievement) combined in `index.ts`
- `src/scene/` — all R3F 3D components, organized by mode (`cosmos/`, `towers/`, `ocean/`, `timeline/`, `shared/`)
- `src/scene/cosmos/shaders/` — GLSL shader source strings (e.g., `sunShader.ts` for the WealthSun plasma effect)
- `src/components/` — 2D DOM UI organized by feature (`detail/`, `leaderboard/`, `comparison/`, `layout/`, `modeSwitcher/`, `funFacts/`, `achievements/`, `ui/`)
- `src/hooks/` — custom React hooks (`useIsMobile.ts`, `useSelectedBillionaire.ts`, `useFunFact.ts`, `useBillionaireTop10History.ts`, etc.)
- `src/utils/` — pure functions: `formatWealth.ts`, `wealthMath.ts`, `wealthComparison.ts`, `colorByIndustry.ts`, `constants.ts`
- `src/types/index.ts` — all shared TypeScript types
- `doc/` — PRD and phase-by-phase implementation plans (PHASE-1 through PHASE-5)

## Conventions

### TypeScript

- `erasableSyntaxOnly` is enabled — parameter properties (`public x: number` in constructors) are not allowed. Use explicit property declarations + constructor assignments instead.
- Always define explicit return types on exported functions, especially in `src/utils/` and `src/api/`.
- Use `import type` for type-only imports (`verbatimModuleSyntax` is enabled).

### Imports

- Always use `@/` path alias (maps to `src/`). Never use relative paths beyond one level.
- Don't use full qualifier names — use direct imports (e.g., `Mesh` not `THREE.Mesh`).

### Styling

- Tailwind CSS v4 with CSS-first config (no `tailwind.config.js`). Tokens defined in `src/index.css` via `@theme`.
- WealthScale custom colors use `--ws-*` CSS variables, mapped to Tailwind as `ws-*` utilities (e.g., `bg-ws-glass`, `text-ws-accent`).
- App is permanently dark-themed (`.dark` on `<html>`).
- Glass panel pattern: `bg-ws-glass backdrop-blur-xl border border-ws-border rounded-2xl`.
- shadcn/ui: New York style, neutral base, components in `src/components/ui/`. Utility `cn()` from `src/lib/utils.ts`.

### React Three Fiber

- **Never `setState` in `useFrame`** — mutate refs directly for 60fps performance.
- Reuse geometries/materials via `useMemo`. **Dispose on unmount** with a `useEffect` cleanup (`geometry.dispose()`, `material.dispose()`). For size-varying meshes, create a **unit geometry once** (e.g., `SphereGeometry(1, …)`) as a module-level constant and control size via `mesh.scale` — never re-create geometry per radius change.
- Use drei's `useCursor(hovered)` hook for cursor changes — never manipulate `document.body.style.cursor` directly.
- Use `<Instances>` for repeated meshes (particles, stars).
- Post-processing (`Bloom`, `Vignette`, `ChromaticAberration`) is shared across all modes — rendered once in `App.tsx` inside `<Canvas>`, lazy-loaded via `React.lazy`, disabled on mobile (checked via `useIsMobile` hook). Individual modes do NOT render their own post-processing.
- Scene colors, lighting values, and other 3D constants live in `src/utils/constants.ts` — never hardcode hex colors or magic numbers in scene components. Phase 4 constants are organized by mode under `// ===== Phase 4: Visualization Modes =====`.
- **React 19 purity rule**: Never use `Math.random()` inside `useMemo` or during render. Use a seeded deterministic pseudo-random function instead (see `seededRandom()` in `EnergyParticles.tsx`).
- Custom GLSL shaders are exported as template literal strings from `src/scene/<mode>/shaders/` and consumed by `ShaderMaterial`.
- 3D components read selection state directly from Zustand (`useAppStore(s => s.selectedUri)`) — avoid prop-drilling callbacks like `onSelect`.
- Planet positions are tracked via a shared `Map` ref (`planetPositions`) passed from the mode orchestrator, used by `CameraController` for fly-to targeting.

### State

- Zustand slices pattern: each domain has a `StateCreator`, combined in `src/stores/index.ts` with `devtools` middleware.
- Always use granular selectors: `useAppStore(s => s.mode)`, never `useAppStore()`.
- `leaderboardOpen` / `setLeaderboardOpen` live in `sceneStore` (not local component state).
- `userStore` holds `comparisonResults`, `wealthRace` (status/elapsed/accumulated), and actions `startRace` / `updateRace` / `finishRace` / `resetRace`. `toggleComparison` was replaced by `setShowComparison(bool)`.
- **Two-phase mode switching** in `sceneStore`: `setMode(mode)` sets `pendingMode` + `isTransitioning=true` (guarded: no-op if already transitioning). `commitMode()` swaps `pendingMode → mode`. `ModeTabs` reads `pendingMode ?? mode` for immediate visual feedback on tab click.

### Animation

- `useFrame` — per-frame 3D (rotation, orbit, position updates)
- `@react-spring/three` — camera fly-to on planet selection (`CameraController`), hover/scale spring on planets (`animated.mesh`), label fade springs, dimensional collapse/expand mode transitions (`ModeTransition`)
- `motion/react` — 2D UI panel enter/exit animations. Use **individual** `<AnimatePresence>` per component (not a shared wrapper); the condition goes on the `<AnimatePresence>` child, not as an early return inside the component. Pattern: `<AnimatePresence>{condition && <Panel />}</AnimatePresence>`.
- GSAP — counter animations, scroll-driven effects

### API

- Base URL: `https://raw.githubusercontent.com/komed3/rtb-api/main/api`
- Endpoints don't include file extensions (e.g., `/list/rtb/latest` not `.json`)
- Net worth values from the API are in **millions USD** (e.g., `774601.062` = $774.6B).
- TanStack Query with 6-hour staleTime (data updates monthly). Query keys: `["billionaires", "list"]`, `["billionaires", "profile", uri]`, `["billionaires", "top10"]` (timeline). Cache TTLs are defined as constants (`CACHE_TTL_MS`, `CACHE_TTL_PROFILE_MS`, `CACHE_TTL_TOP10_MS`) in `src/utils/constants.ts`.
- **Zod schemas handle nullable/variable API fields**: `age`, `change`, `gender`, `flag`, and `citizenship` can have null or unexpected values — schemas normalize these with sensible defaults.
- Scaling math (planet radius, orbit radius, tower height, ocean depth) lives in `src/utils/wealthMath.ts` — always call those functions rather than duplicating formulas.

### Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `camelCaseStore.ts`
- Utils/shaders: `camelCase.ts`

### ESLint

- `src/components/ui/**` is excluded from ESLint via `globalIgnores` in `eslint.config.js` — shadcn/ui components are not linted.

### Build

- Vite manual chunk splitting is configured in `vite.config.ts` — vendors are split into `react-vendor`, `three-vendor`, `r3f-vendor`, `postprocessing-vendor`, `animation-vendor`, and `ui-vendor`. Add new heavy dependencies to the appropriate chunk.
