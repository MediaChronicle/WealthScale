# WealthScale Agent Guidelines

Guidance for AI agents operating in the WealthScale codebase.

## Project Overview

WealthScale is a 3D interactive wealth visualization app rendering billionaire fortunes as explorable 3D worlds (solar system, city skyline, ocean depths, time tunnel). Features gamification (achievements, mini-games), easter eggs, and social sharing. Pure client-side SPA built with React 19, TypeScript 5.9 (strict), Vite 7, Three.js, React Three Fiber, and Zustand.

## Build & Development Commands

```bash
pnpm dev              # Start dev server (Vite 7, port 5173)
pnpm build            # Type-check (tsc -b) then build for production
pnpm build:analyze    # Build and visualize bundle size
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
- **Use `import type`** for type-only imports (required by `verbatimModuleSyntax`).
- **Direct imports only** — never use full qualifier names (`import { Mesh } from "three"` not `import * as THREE`).

### TypeScript

- **Strict mode enabled** — all TypeScript rules enforced.
- **No type suppression** — never use `as any`, `@ts-ignore`, or `@ts-expect-error`.
- **Always define return types** for functions, especially utilities and hooks.

### Naming Conventions

| Element          | Convention       | Example                 |
| ---------------- | ---------------- | ----------------------- |
| Components       | PascalCase       | `BillionaireCard.tsx`   |
| Hooks            | useCamelCase     | `useBillionaireData.ts` |
| Stores           | camelCase        | `sceneStore.ts`         |
| Utils/Shaders    | camelCase        | `seededRandom.ts`       |
| Types/Interfaces | PascalCase       | `BillionaireProfile`    |
| Constants        | UPPER_SNAKE_CASE | `MAX_ZOOM_LEVEL`        |

### React & Three.js Patterns

- **Never set state in `useFrame`** — mutate refs directly for 60fps performance.
- **Use memoization** (`useMemo`, `useCallback`) for expensive operations.
- **Granular Zustand selectors**: `useAppStore(s => s.mode)` over `useAppStore()`.
- **Reuse geometries/materials** via `useMemo`. Always dispose on unmount.
- **Use `<Instances>`** for repeated meshes (particles, stars).
- **Disable post-processing** on mobile (`< 768px`).
- **3D Geometry scaling**: Create **unit geometry once** as module-level constant and control size via `mesh.scale`.

### Animation Patterns (motion/react)

- **Individual `<AnimatePresence>` per component** — not a shared wrapper.
- **Condition on the child** — put condition on motion component inside `<AnimatePresence>`, not as early return.
- **Exit animations require condition on child** — early-return guards break exit animations.
- **Pattern**: `<AnimatePresence>{condition && <Panel />}</AnimatePresence>` in parent.
- **Reduced motion support** — respect `prefers-reduced-motion` via `useReducedMotion()` hook.
- **Never unmount AnimatePresence itself** — condition the child inside, not the wrapper.

### State Management (Zustand)

- **Use slice pattern** — each domain has a `StateCreator`, combined in `src/stores/index.ts`.
- **Avoid stale closures**: `() => setX(!useAppStore.getState().x)` not `() => setX(!x)`.
- **Prefer boolean selectors**: `const hasX = useAppStore(s => s.x !== null)`.
- **Remove dead state** — periodically audit stores for unused state/actions.

### Hooks Patterns

- **Async action return types** — return `Promise<boolean>` for actions like download/copy.
- **Safari clipboard compatibility** — pass capture Promise directly: `new ClipboardItem({ 'image/png': capture() })`.

### Styling (Tailwind CSS v4)

- **CSS-first config** — no `tailwind.config.js`. Tokens in `src/index.css` via `@theme`.
- **WealthScale colors** use `--ws-*` CSS variables (`bg-ws-glass`, `text-ws-accent`).
- **Glass panel pattern**: `bg-ws-glass backdrop-blur-xl border border-ws-border rounded-2xl`
- **Dark theme only** — `.dark` is permanently on `<html>`.
- **Numeric displays**: Use `tabular-nums` class for numbers.

### Error Handling

- **Never use empty catch blocks** (`catch(e) {}`).
- **Always handle async errors** with try/catch or `.catch()`.

### Accessibility

- **Use `focus-visible` not `focus`** — for keyboard-only focus indicators.
- **Focus trapping** — modals/panels must trap focus with tab/shift+tab handling.
- **ARIA attributes** — use proper roles (`role="tablist"`, `role="tab"`), `aria-selected`, `aria-label`.
- **@react-three/a11y** — wrap interactive 3D elements in `<A11y role="button">` with `description` and `actionCall`.

### Linting & Formatting

**Prettier config**: no semicolons, single quotes, trailing commas, 80 char width, arrow parens always.

**ESLint** extends: `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`.

## Project Architecture

```
src/
├── api/              # Fetch client, endpoints, Zod schemas, TanStack Query hooks
├── components/       # 2D DOM UI (achievements/, comparison/, detail/, funFacts/, leaderboard/, layout/, modeSwitcher/, ui/)
├── hooks/            # Custom React hooks
├── scene/            # R3F 3D components organized by mode (cosmos/, towers/, ocean/, timeline/, shared/)
├── stores/           # Zustand slices (billionaire, scene, user, achievement)
├── utils/            # Pure functions (formatWealth.ts, wealthMath.ts, constants.ts, seededRandom.ts)
├── types/            # Shared TypeScript types
├── lib/              # Utilities (utils.ts for cn() helper)
└── index.css         # Tailwind v4 CSS-first config
```

### Data Flow

```
RTB-API (CDN) → TanStack Query (6h staleTime) → Zod validation → Zustand store → R3F scene + 2D UI
```

## Best Practices

1. **Performance first** — optimize for 60fps in 3D scenes
2. **Use code splitting** — mode components are lazy-loaded
3. **Follow existing patterns** — match the codebase style exactly
4. **Keep components small** — single responsibility principle
5. **Use TypeScript properly** — avoid `any`, use proper types
6. **Accessibility** — use `@react-three/a11y` for 3D accessibility
7. **Mobile-first** — disable expensive effects on mobile

## Key Constants

From `src/utils/constants.ts`:

- `TRANSITION_*_SPRING` / `TRANSITION_REDUCED_CONFIG` — animation springs
- `WS_ACCENT_COLOR` — canonical accent color (replaces `#00d4ff` hardcodes)
- `TOWER_GLASS_THICKNESS`, `TIMELINE_SPOTLIGHT_*`, `OCEAN_CAUSTIC_*` — 3D scene params
- `CACHE_TTL_*` — cache durations (6h for list, 24h for profiles)
- `TIMELINE_MAX_BAND_WIDTH` — timeline wealth band clamping
- `SEEDABLE_RANDOM_*` — deterministic random algorithm constants
- `ACHIEVEMENT_*` — toast duration, spring, confetti count
- `GUESS_*` — Guess the Wealth mini-game params
- `ENTRY_*` — entry animation timings
- `LOADING_COIN_*` — 3D loading coin appearance
- `KONAMI_RAIN_*` / `SUPERNOVA_*` — easter egg settings
- `MOBILE_*` / `DESKTOP_*` — performance settings (particles, stars, DPR)
- `SCREENSHOT_BRAND_*` — screenshot branding
- `LS_KEY_ACHIEVEMENTS` — localStorage key for achievements
- `TIMELINE_SPOTLIGHT_TARGET_Z` — spotlight camera following
