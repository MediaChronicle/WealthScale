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
pnpm build:analyze    # Build + open bundle visualizer
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

These layers share state through Zustand. The 3D scene reads from the store and mutates refs in `useFrame`; the 2D UI reads from the store and dispatches actions normally. The HUD includes a `Header` (top bar with logo, embedded `ModeTabs`, achievement badges, game/screenshot actions), `LeaderboardSidebar` (left, desktop only), and `DetailPanel` (right, lazy-loaded with `AnimatePresence`). On mobile, sidebar and detail panels are replaced by bottom `MobileSheet` components.

### Four Visualization Modes

The scene has four mutually exclusive modes (`cosmos | towers | ocean | timeline`), only one mounted at a time. All modes are `React.lazy` code-split chunks. Mode switching uses a two-phase system via `sceneStore`:

1. `setMode(mode)` sets `pendingMode` + `isTransitioning=true` (guarded: no-op if already transitioning)
2. `ModeTransition` (react-spring) collapses the old scene (scale 1→0 with spin). When `prefers-reduced-motion` is active (`useReducedMotion` hook), spin is disabled and a fast spring (`TRANSITION_REDUCED_CONFIG`) is used instead.
3. At collapse midpoint, `commitMode()` swaps `pendingMode → mode`, mounting the new mode
4. `ModeTransition` expands the new scene (scale 0→1), then sets `isTransitioning=false`

Each mode is a self-contained orchestrator that owns its background, fog, lighting, camera controls, and sub-components. `SceneManager` is a stateless router: it reads `mode` from Zustand, resolves the lazy component via `MODE_COMPONENTS` map, and wraps it in `<ModeTransition><Suspense>`.

**No props flow through SceneManager.** Each mode reads `billionaires` (and any other data) directly from Zustand. The `toPlanetConfig()` transform lives inside `CosmosMode`, not in App.tsx. Timeline mode fetches its own historical data via `useBillionaireTop10History()` hook.

Post-processing (`Bloom`, `Vignette`, `ChromaticAberration`) is shared across all modes — rendered in `App.tsx` inside `<Canvas>`, lazy-loaded, gated by `perfConfig.enablePostProcessing` (from `useMobilePerformance()`). `<PerformanceMonitor>` + `<AdaptiveDpr>` dynamically adjust DPR based on frame rate.

**Mode components:**
| Mode | Root | Camera | Key sub-components |
|------|------|--------|--------------------|
| Cosmos | `CosmosMode` | `CameraController` + `OrbitControls` | WealthSun, BillionairePlanet, OrbitRing, SpaceBackground, CosmosLighting |
| Towers | `TowersMode` | `OrbitControls` (street-level, maxPolarAngle) | WealthTower (unit box + scale), TowerLabel, EnergyParticles, GroundPlane |
| Ocean | `OceanMode` | `OrbitControls` | WealthCreature (unit hemisphere + scale), WaterSurface (GPU shader waves), DepthMarker, CausticLights |
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

- `useSelectedBillionaire()` hook (granular selectors + `useMemo`) replaces `.find()` calls in all components that need the selected billionaire entry (`DetailPanel`, comparison components). Never subscribe to `billionaires` array just to call `.find()` inline.
- `useFunFact` returns `{ fact, total, index, next, previous, goToIndex }`. Manual nav (`next`, `previous`, `goToIndex`) resets the auto-rotation timer so the user has time to read.

Math lives in `src/utils/wealthComparison.ts`; constants in the `// ===== Comparison Engine =====` section of `constants.ts`.

### Achievement System

`useAchievementStore` is a **standalone** Zustand store with `persist` middleware (NOT a slice in `index.ts` — `persist` is incompatible with the slices combiner). It stores 7 achievements (`first-orbit`, `deep-diver`, `time-traveler`, `reality-check`, `all-modes`, `zoomed-in`, `share-the-scale`) persisted to localStorage under `wealthscale-achievements`.

- `useAchievements()` hook (called in `App.tsx`) auto-detects triggers from app state (mode visits, billionaire clicks, comparison toggle) using `useEffect` + `useAchievementStore.getState()` inside effects (NOT as a selector dependency — avoids re-render churn). Returns `{ unlockShareTheScale }` (and others) — `App.tsx` captures the return value and calls `unlockShareTheScale()` after successful screenshot download/copy.
- `AchievementToast` subscribes to `latestUnlock`, shows a slide-up toast with confetti, auto-dismisses after 4s.
- `AchievementBar` renders all 7 badges in a row with tooltips (shadcn `TooltipProvider`).

### Loading & Entry Animation

- `LoadingScreen` renders a **separate mini `<Canvas>`** (not inside the main Canvas) with a spinning `LoadingCoin`. It overlays the entire viewport at `z-[100]` and fades out (AnimatePresence) when data is ready. The `<AnimatePresence>` must always stay mounted — do **not** add an early `return null` guard that would unmount it before exit animation completes.
- `useEntryAnimation` uses a **module-level `hasPlayedEntry` flag** — the staggered planet reveal plays ONCE per session. On remount (e.g., switching back to cosmos), everything appears instantly.
- `CosmosMode` wraps each planet in `AnimatedPlanetWrapper` (react-spring scale 0→1). Planets are sorted by rank descending (rank 10 first, rank 1 last = smallest appear first, sun last with bouncy spring).

### Screenshot & Share

- `useScreenshot()` hook (called inside Canvas context) uses `useThree` to access `gl`, `scene`, `camera`. `capture()` renders the scene, composites a branding bar via offscreen 2D canvas, returns a PNG Blob. `download()` and `copyToClipboard()` return `Promise<boolean>` indicating success/failure.
- `copyToClipboard()` passes `capture()` as a Promise directly to `ClipboardItem` (Safari-safe — avoids user-gesture timeout that occurs when awaiting the blob before calling `clipboard.write()`). Falls back to download on failure.
- `ScreenshotBridge` is a null-rendering component inside `<Canvas>` that passes `download`/`copyToClipboard` callbacks up to App via `onRegister` prop. `GL_CONFIG` includes `preserveDrawingBuffer: true` to enable screenshot capture.
- `ShareButton` is the UI: camera icon expands to show download + clipboard buttons. "Copied!" feedback only appears after the async copy operation confirms success.

### Easter Eggs

- **Konami Code** (`useKonamiCode` hook): ArrowUp×2, ArrowDown×2, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, B, A → triggers `MoneyRain` (instanced green/gold plane particles) for 8 seconds. Uses `e.code` for locale-safety.
- **Sun Supernova** (`useSunEasterEgg` hook): 5 rapid clicks on the sun (3s timeout reset) → `exploding` phase (scale 8 + Sparkles, 2s) → `reforming` (scale 0.1→1, 1.5s) → `idle`. `WealthSun` wraps in `animated.group` with spring-animated scale; pulse skipped during explosion/reform.

### Header & Mini-Game

- `Header` composes `ModeTabs embedded`, `AchievementBar`, game button, `ShareButton`. On mobile, `ModeTabs` is hidden from Header (kept as floating component).
- `ModeTabs` accepts `embedded?: boolean` prop — when true, strips fixed positioning classes so it renders inline inside Header.
- `GuessTheWealth` is a self-contained lazy-loaded modal: 10 rounds of shuffled billionaires, slider guess ($10B–$800B), accuracy scoring, results screen with play-again.

### Mobile Responsive

- `useMobilePerformance()` returns device-adaptive config: particle counts, star counts, sphere segments, DPR range, post-processing toggle.
- On mobile (`useIsMobile()`): desktop `LeaderboardSidebar` and `DetailPanel` are hidden; replaced by `MobileSheet` (shadcn `Sheet` with `side="bottom"`). Trigger buttons appear at bottom-left. Mobile detail sheet auto-opens on billionaire selection (via `useAppStore.subscribe` in an effect).
- `<PerformanceMonitor>` wraps Canvas children to dynamically incline/decline DPR. `<AdaptiveDpr pixelated />` is also rendered inside Canvas.

### Key Directories

- `src/api/` — fetch client, endpoint URLs, Zod schemas, TanStack Query hooks, data transformers
- `src/stores/` — Zustand slices (billionaire, scene, user) combined in `index.ts`; `achievementStore.ts` is standalone with `persist`
- `src/scene/` — all R3F 3D components, organized by mode (`cosmos/`, `towers/`, `ocean/`, `timeline/`, `shared/`)
- `src/scene/<mode>/shaders/` — GLSL shader source strings (e.g., `cosmos/shaders/sunShader.ts`, `ocean/shaders/waterShader.ts`)
- `src/components/` — 2D DOM UI organized by feature (`detail/`, `leaderboard/`, `comparison/`, `layout/`, `modeSwitcher/`, `funFacts/`, `achievements/`, `ui/`)
- `src/hooks/` — custom React hooks (`useIsMobile.ts`, `useReducedMotion.ts`, `useSelectedBillionaire.ts`, `useFunFact.ts`, `useBillionaireTop10History.ts`, `useAchievements.ts`, `useEntryAnimation.ts`, `useScreenshot.ts`, `useKonamiCode.ts`, `useSunEasterEgg.ts`, `useMobilePerformance.ts`, `usePerformanceDebug.ts`)
- `src/utils/` — pure functions: `formatWealth.ts`, `wealthMath.ts`, `wealthComparison.ts`, `colorByIndustry.ts`, `seededRandom.ts`, `constants.ts`
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

### Accessibility

- `ModeTabs` uses ARIA tab pattern: `role="tablist"` on container, `role="tab"` + `aria-selected` on buttons.
- Interactive elements use `focus-visible:` (not `focus:`) for keyboard focus indicators, avoiding showing focus rings on mouse clicks.
- `LeaderboardRow` has `focus-visible:ring-2 focus-visible:ring-ws-accent` and `aria-selected`.
- `ComparisonResults` wraps dynamic content in `aria-live="polite" role="status"`.
- `DetailPanel` implements a keyboard focus trap (Tab/Shift-Tab cycles within the panel).
- `ModeTransition` respects `prefers-reduced-motion` via `useReducedMotion` hook — disables spin animation and uses fast spring config.
- `BillionairePlanet` respects `prefers-reduced-motion` — disables `Float`, stops orbit animation in `useFrame`, sets static position. Wrapped with `<A11y role="button">` from `@react-three/a11y` for keyboard support (Enter/Space triggers `actionCall`).
- `App.tsx` renders `<A11yAnnouncer />` from `@react-three/a11y` as a sibling immediately after `</Canvas>` — this is required for screen reader announcements of 3D interactions.
- `App.tsx` wraps all DOM content in `<MotionConfig reducedMotion={prefersReduced ? "always" : "never"}>`.
- Skip-to-content link in `App.tsx` uses `focus-visible:` variants.

### React Three Fiber

- **Never `setState` in `useFrame`** — mutate refs directly for 60fps performance.
- Reuse geometries/materials via `useMemo`. **Dispose on unmount** with a `useEffect` cleanup (`geometry.dispose()`, `material.dispose()`). For size-varying meshes, create a **unit geometry once** (e.g., `SphereGeometry(1, …)`) as a module-level constant and control size via `mesh.scale` — never re-create geometry per radius change.
- Use drei's `useCursor(hovered)` hook for cursor changes — never manipulate `document.body.style.cursor` directly.
- Use `<Instances>` for repeated meshes (particles, stars).
- Post-processing (`Bloom`, `Vignette`, `ChromaticAberration`) is shared across all modes — rendered once in `App.tsx` inside `<Canvas>`, lazy-loaded via `React.lazy`, gated by `perfConfig.enablePostProcessing` (via `useMobilePerformance`). Individual modes do NOT render their own post-processing.
- `<PerformanceMonitor>` wraps Canvas children and adjusts DPR dynamically. `<AdaptiveDpr pixelated />` is also rendered inside Canvas.
- `GL_CONFIG` includes `preserveDrawingBuffer: true` for screenshot capture. `ScreenshotBridge` is a null-rendering component inside Canvas that bridges `useScreenshot()` callbacks to the DOM layer.
- Scene colors, lighting values, and other 3D constants live in `src/utils/constants.ts` — never hardcode hex colors or magic numbers in scene components. Constants are organized by phase: `// ===== Phase 4: Visualization Modes =====` and `// ===== Phase 5: Polish & Gamification =====`. The canonical accent color is `WS_ACCENT_COLOR` (`#00d4ff`) — use this constant instead of hardcoding the hex value.
- Avoid per-instance `<pointLight>` on repeated meshes (e.g., ocean creatures) — use shared scene lights + emissive materials instead to keep the light count low.
- **React 19 purity rule**: Never use `Math.random()` inside `useMemo` or during render. Use the shared `seededRandom()` from `src/utils/seededRandom.ts`. `Math.random()` is allowed inside `useState` lazy initializers, event handlers, and effects.
- Custom GLSL shaders are exported as template literal strings from `src/scene/<mode>/shaders/` and consumed by `ShaderMaterial`.
- 3D components read selection state directly from Zustand (`useAppStore(s => s.selectedUri)`) — avoid prop-drilling callbacks like `onSelect`.
- Planet positions are tracked via a shared `Map` ref (`planetPositions`) passed from the mode orchestrator, used by `CameraController` for fly-to targeting.

### State

- Zustand slices pattern: each domain has a `StateCreator`, combined in `src/stores/index.ts` with `devtools` middleware. **Exception:** `useAchievementStore` is a standalone store with `persist` middleware — `persist` is incompatible with the slices combiner, so it lives separately in `achievementStore.ts`.
- Always use granular selectors: `useAppStore(s => s.mode)`, never `useAppStore()`. When a component only needs a boolean derived from an object (e.g., `comparisonResults !== null`), derive the boolean in the selector to avoid re-renders on object identity changes.
- In `useCallback`, avoid closing over reactive store values that cause the callback to be recreated. Use `useAppStore.getState()` inside the callback to read live values at call time (e.g., `handleToggle` reads `leaderboardOpen` via `getState()`).
- `leaderboardOpen` / `setLeaderboardOpen` live in `sceneStore` (not local component state).
- `userStore` holds `netWorth`, `showComparison`, `comparisonResults`, `wealthRace` (status/elapsed/accumulated), and actions `setNetWorth` / `setShowComparison` / `setComparisonResults` / `startRace` / `updateRace` / `finishRace` / `resetRace`.
- `billionaireStore` holds `billionaires` array and `selectedUri` with `setBillionaires` / `selectBillionaire` actions.
- `sceneStore` holds `mode`, `pendingMode`, `isTransitioning`, `showOrbits`, `leaderboardOpen` with corresponding actions.
- **Two-phase mode switching** in `sceneStore`: `setMode(mode)` sets `pendingMode` + `isTransitioning=true` (guarded: no-op if already transitioning). `commitMode()` swaps `pendingMode → mode`. `ModeTabs` reads `pendingMode ?? mode` for immediate visual feedback on tab click.

### Animation

- `useFrame` — per-frame 3D (rotation, orbit, position updates, MoneyRain particle fall, LoadingCoin spin/float)
- `@react-spring/three` — camera fly-to on planet selection (`CameraController`), hover/scale spring on planets (`animated.mesh`), label fade springs, dimensional collapse/expand mode transitions (`ModeTransition`), entry animation planet reveal (`AnimatedPlanetWrapper`), sun supernova explosion/reform scale (`WealthSun`)
- `motion/react` — 2D UI panel enter/exit animations. Use **individual** `<AnimatePresence>` per component (not a shared wrapper); the condition goes on the `<AnimatePresence>` child, not as an early return inside the component. Pattern: `<AnimatePresence>{condition && <Panel />}</AnimatePresence>`. `MotionConfig` wraps all DOM content in App.tsx with `reducedMotion` setting.
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
- `GuessTheWealth` is code-split via `React.lazy` (loaded on game open). `DetailPanel` and `PostProcessing` are also lazy-loaded.
- `pnpm build:analyze` runs the build then opens `vite-bundle-visualizer` for chunk inspection.
