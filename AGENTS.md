# WealthScale Agent Guidelines

This file provides guidance for AI agents operating in the WealthScale codebase.

## Project Overview

WealthScale is a 3D interactive wealth visualization app that renders billionaire fortunes as explorable 3D worlds (solar system, city skyline, ocean depths, time tunnel). It's a pure client-side SPA built with React, TypeScript, Vite, Three.js, and Zustand.

## Build & Development Commands

### Core Commands

```bash
pnpm dev              # Start dev server (Vite 7, port 5173)
pnpm build            # Type-check (tsc -b) then build for production
pnpm lint             # ESLint on all .ts/.tsx files
pnpm preview          # Preview production build locally
```

### Testing (Vitest configured but not yet in use)

```bash
pnpm vitest           # Run tests in watch mode
pnpm vitest run       # Run tests once
pnpm vitest run <file>  # Run single test file
```

### Formatting & Git Hooks

```bash
pnpm format           # Format all source files with Prettier
pnpm format:check     # Check formatting without modifying files
```

**Husky** is configured with the following hooks:

- **pre-commit**: Runs lint-staged (ESLint fix + Prettier on staged files)
- **pre-push**: Executes pre-push scripts

**lint-staged** runs on staged files:

- `.ts/.tsx`: ESLint --fix then Prettier --write
- `.json/.md/.css/.html`: Prettier --write only

### Adding Components

```bash
pnpm dlx shadcn@latest add <component>  # Add shadcn/ui components
```

## Code Style Guidelines

### Imports

- **Always use `@/` path alias** (maps to `src/`). Never use relative paths beyond one level.
  - ✅ `import { cn } from "@/lib/utils"`
  - ❌ `import { cn } from "../../lib/utils"`
- **Use `import type`** for type-only imports (required due to `verbatimModuleSyntax`).
  - ✅ `import type { ClassValue } from "clsx"`
  - ❌ `import { type ClassValue } from "clsx"`
- **Don't use full qualifier names** — use direct imports.
  - ✅ `import { Mesh } from "three"`
  - ❌ `import * as THREE from "three"`

### TypeScript

- **Strict mode enabled** — all TypeScript rules are enforced.
- **`verbatimModuleSyntax`** is enabled — must use `import type` for types.
- **No type suppression** — never use `as any`, `@ts-ignore`, or `@ts-expect-error`.
- **Always define return types** for functions, especially in utilities and hooks.
- **Use explicit types** for function parameters, especially in public APIs.

### Naming Conventions

| Element          | Convention       | Example                 |
| ---------------- | ---------------- | ----------------------- |
| Components       | PascalCase       | `BillionaireCard.tsx`   |
| Hooks            | useCamelCase     | `useBillionaireData.ts` |
| Stores           | camelCase        | `sceneStore.ts`         |
| Utils/Shaders    | camelCase        | `formatWealth.ts`       |
| Types/Interfaces | PascalCase       | `BillionaireProfile`    |
| Constants        | UPPER_SNAKE_CASE | `MAX_ZOOM_LEVEL`        |

### React Patterns

- **Use functional components** with arrow functions or `function` keyword.
- **Use hooks** for all state and side effects.
- **Never set state in `useFrame`** (R3F) — mutate refs directly for 60fps.
- **Use memoization** (`useMemo`, `useCallback`) for expensive operations.
- **Prefer granular Zustand selectors**: `useAppStore(s => s.mode)` over `useAppStore()`.

### Three.js / React Three Fiber

- **Never set state in `useFrame`** — mutate refs directly for performance.
- **Reuse geometries/materials** via `useMemo`. Dispose on unmount.
- **Use `<Instances>`** for repeated meshes (particles, stars).
- **Disable post-processing** on mobile devices.
- **Always dispose** geometries and materials on unmount.

### State Management (Zustand)

- **Use slice pattern** — each domain has a `StateCreator`, combined in `src/stores/index.ts`.
- **Include `devtools` middleware** in store configuration.
- **Use granular selectors** for reading state.

### Styling (Tailwind CSS v4)

- **CSS-first config** — no `tailwind.config.js`. Tokens in `src/index.css` via `@theme`.
- **WealthScale colors** use `--ws-*` CSS variables, mapped as `ws-*` utilities.
  - Example: `bg-ws-glass`, `text-ws-accent`
- **Glass panel pattern**: `bg-ws-glass backdrop-blur-xl border border-ws-border rounded-2xl`
- **Dark theme only** — `.dark` is permanently on `<html>`.

### Error Handling

- **Never use empty catch blocks** (`catch(e) {}`).
- **Always handle async errors** with try/catch or `.catch()`.
- **Use proper error boundaries** for React components.
- **Log errors appropriately** — use `console.error` for errors, not `console.log`.

### Testing

- **No test runner configured** yet, but Vitest is installed.
- **When adding tests**, follow Vitest patterns:
  - `describe()` for test suites
  - `it()` or `test()` for individual tests
  - Use `@testing-library/react` for component tests

### Linting & Formatting

- **Run `pnpm lint`** before committing.
- **Run `pnpm format`** or `pnpm format:check`\*\* for formatting.
- **ESLint config** extends: `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`, `reactRefresh.configs.vite`.

**Prettier config** (`.prettierrc.json`):

- `semi: false` — no semicolons
- `singleQuote: true` — single quotes
- `trailingComma: "all"` — trailing commas everywhere
- `printWidth: 80` — 80 character line width
- `arrowParens: "always"` — always include parens on arrow functions

## Project Architecture

### Directory Structure

```
src/
├── api/           # Fetch client, endpoints, Zod schemas, TanStack Query hooks
├── components/   # 2D DOM UI (detail/, leaderboard/, comparison/, layout/, modeSwitcher/, funFacts/, achievements/, ui/)
├── scene/        # R3F 3D components organized by mode (cosmos/, towers/, ocean/, timeline/, shared/)
├── stores/       # Zustand slices (billionaire, scene, user, achievement)
├── utils/        # Pure functions (formatWealth.ts, wealthMath.ts, colorByIndustry.ts, constants.ts)
├── types/        # Shared TypeScript types
└── lib/          # Utilities (utils.ts, etc.)
```

### Dual-Layer Rendering

The app uses two layers:

1. **3D Canvas** (React Three Fiber) — full-viewport `<Canvas>` with 3D scene
2. **2D HUD Overlay** — DOM elements positioned absolutely over canvas with `pointer-events-none`

State is shared through Zustand. The 3D scene reads from store and mutates refs in `useFrame`; 2D UI reads from store and dispatches actions.

### Visualization Modes

Four mutually exclusive modes: `cosmos | towers | ocean | timeline`. Only one mounted at a time. Mode switching goes through `sceneStore.mode`.

### Data Flow

```
RTB-API (CDN) → TanStack Query (6h staleTime) → Zod validation → Zustand store → R3F scene + 2D UI
```

API data is lazy-fetched on planet click via `enabled: !!uri` in `useQuery`.

## Dependencies

### Key Libraries

- **React 19** + React DOM 19
- **TypeScript 5.9** (strict mode)
- **Vite 7** (build tool)
- **Three.js 0.182** + React Three Fiber + Drei + Postprocessing
- **Tailwind CSS 4** (styling)
- **Zustand 5** (state management)
- **TanStack Query 5** (data fetching)
- **Zod 4** (validation)
- **Motion 12** (animations)
- **GSAP** (counter animations)
- **shadcn/ui** (component library)

## Best Practices

1. **Performance first** — optimize for 60fps in 3D scenes
2. **Use code splitting** — mode components are lazy-loaded
3. **Follow existing patterns** — match the codebase style exactly
4. **Keep components small** — single responsibility principle
5. **Use TypeScript properly** — avoid `any`, use proper types
6. **Accessibility** — use `@react-three/a11y` for 3D accessibility
7. **Mobile-first** — disable expensive effects on mobile
