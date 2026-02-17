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
- **2D HUD Overlay** — DOM elements positioned absolutely over the canvas with `pointer-events-none` (re-enabled on interactive elements)

These layers share state through Zustand. The 3D scene reads from the store and mutates refs in `useFrame`; the 2D UI reads from the store and dispatches actions normally.

### Four Visualization Modes

The scene has four mutually exclusive modes (`cosmos | towers | ocean | timeline`), only one mounted at a time. Cosmos is bundled with main; others are `React.lazy` code-split chunks. Mode switching goes through `sceneStore.mode`.

### Data Flow

```
RTB-API (CDN) → TanStack Query (6h staleTime) → Zod validation → Zustand store → R3F scene + 2D UI
```

Profile/asset data is lazy-fetched on planet click via `enabled: !!uri` in `useQuery`.

### Key Directories

- `src/api/` — fetch client, endpoint URLs, Zod schemas, TanStack Query hooks, data transformers
- `src/stores/` — Zustand slices (billionaire, scene, user, achievement) combined in `index.ts`
- `src/scene/` — all R3F 3D components, organized by mode (`cosmos/`, `towers/`, `ocean/`, `timeline/`, `shared/`)
- `src/components/` — 2D DOM UI organized by feature (`detail/`, `leaderboard/`, `comparison/`, `layout/`, `modeSwitcher/`, `funFacts/`, `achievements/`, `ui/`)
- `src/utils/` — pure functions: `formatWealth.ts`, `wealthMath.ts`, `colorByIndustry.ts`, `constants.ts`
- `src/types/index.ts` — all shared TypeScript types
- `doc/` — PRD and phase-by-phase implementation plans (PHASE-1 through PHASE-5)

## Conventions

### Imports

- Always use `@/` path alias (maps to `src/`). Never use relative paths beyond one level.
- Use `import type` for type-only imports (`verbatimModuleSyntax` is enabled).
- Don't use full qualifier names — use direct imports (e.g., `Mesh` not `THREE.Mesh`).

### Styling

- Tailwind CSS v4 with CSS-first config (no `tailwind.config.js`). Tokens defined in `src/index.css` via `@theme`.
- WealthScale custom colors use `--ws-*` CSS variables, mapped to Tailwind as `ws-*` utilities (e.g., `bg-ws-glass`, `text-ws-accent`).
- App is permanently dark-themed (`.dark` on `<html>`).
- Glass panel pattern: `bg-ws-glass backdrop-blur-xl border border-ws-border rounded-2xl`.
- shadcn/ui: New York style, neutral base, components in `src/components/ui/`. Utility `cn()` from `src/lib/utils.ts`.

### React Three Fiber

- **Never `setState` in `useFrame`** — mutate refs directly for 60fps performance.
- Reuse geometries/materials via `useMemo`. Dispose on unmount.
- Use `<Instances>` for repeated meshes (particles, stars).
- Post-processing (Bloom, Vignette) is disabled on mobile.

### State

- Zustand slices pattern: each domain has a `StateCreator`, combined in `src/stores/index.ts` with `devtools` middleware.
- Always use granular selectors: `useAppStore(s => s.mode)`, never `useAppStore()`.

### Animation

- `useFrame` — per-frame 3D (rotation, orbit)
- `@react-spring/three` — camera transitions, spring-physics 3D interpolation
- `motion/react` — 2D UI panel enter/exit animations
- GSAP — counter animations, scroll-driven effects

### API

- Base URL: `https://cdn.statically.io/gh/komed3/rtb-api@main/api/`
- Net worth values from the API are in **millions USD** (e.g., `774601.062` = $774.6B).
- TanStack Query with 6-hour staleTime (data updates monthly). Query keys: `["billionaires", "list"]`, `["billionaires", "profile", uri]`, etc.

### Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `camelCaseStore.ts`
- Utils/shaders: `camelCase.ts`
