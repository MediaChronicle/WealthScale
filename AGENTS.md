# WealthScale agent guidelines

## Working rules

Inspect branch, staged and unstaged changes, instructions, and runtime before editing. Preserve unrelated work. Reviews are read-only unless implementation is requested. Never stage, commit, push, merge, delete unrelated work, or delegate silently. Only use subagents when explicitly requested by the user; delegation stays one level deep. Verify completion with fresh evidence and describe limitations.

For multi-component features, document a concise Mermaid architecture diagram, followed by production and test call stacks, implementation steps, risks, and verification criteria. Keep implementation simple and within the authorized scope.

## Active architecture

WealthScale is a client-side React 19 / TypeScript / Vite application. The guided journey leads into Cosmos, Towers, Ocean, and a selected-person monthly Timeline. React owns local state; TanStack Query owns validated remote data. No application Zustand store, motion framework, shadcn layer, or Tailwind utilities are used.

- `src/features/journey`: chapter flow, scale math, instanced assembly and comparisons.
- `src/features/explorer`: worlds, timeline, inspector and guessing game.
- `src/features/comparison`: shared reference validation and input.
- `src/features/shared`: shared visual shell.
- `src/api`: abortable fetch, schemas, ranked USD snapshots, history and fixtures.
- `src/scene/lab`: shared canvas, finite camera transitions, labels and WebGL fallback.

Read README.md and the review remediation plan for product/data semantics.

## Development

Use Node 24 and pnpm 12.4.2, pinned in the repository. `pnpm dev`, `pnpm preflight`, `pnpm build:analyze`, `pnpm brand:build`. Preflight runs typecheck, ESLint, Prettier, Vitest and the production build. Preserve frozen-lockfile reproducibility and verify peers after dependency changes.

## Code conventions

Use `@/` aliases across feature boundaries; relative imports within a directory are fine. Use direct and type-only imports, explicit function return types, strict TypeScript, and no type suppression. Components are PascalCase; hooks start with use; utilities camelCase; constants UPPER_SNAKE_CASE. Prettier: single quotes, no semicolons, trailing commas, 80 columns.

## Rendering and interaction

Use demand rendering, bounded geometry and instancing. Never set React state in useFrame. Finite animations mutate refs and invalidate only while active. Share geometry and dispose manually created resources. Native OrbitControls owns the camera; avoid competing writers. Wheel and one-finger gestures scroll the page; zoom is explicit and two fingers orbit. Disable scroll-driven Canvas resize measurement. Keep reduced-motion behavior and mobile/economy limits. Do not add perpetual decorative effects.

Million-dollar unit size stays fixed through the billion reveal. Larger units must disclose regrouping and retain a labelled scale anchor. Dollar volume, linear height, and depth must match their legends; camera framing is illustrative. Missing data is not zero wealth. Never silently present benchmark values as real fortunes or net worth as income.

## UI and accessibility

Plain CSS uses shared `--lab-*` tokens in shell.css and font variables in index.css. Preserve charcoal/mint identity, readable prose (at least 12px), targets at least 44px, focus-visible indicators, semantic buttons, keyboard tabs, native dialog focus restoration, and source dates. DOM selectors and labelled scene keys provide keyboard equivalents for pointer-only meshes; do not reintroduce separate React roots for each mesh. Keep input before the exhibit on mobile chapter zero. Preserve page scrolling and safe areas.

## Validation

Test behavior at domain seams and DOM contracts: ordering/units, missing observations, provenance, input gating, game state, rendering availability and gestures. Browser-review changed visual paths and measure idle counters after animations settle. Do not claim physical-device FPS, touch, context restoration or remote CI without testing those exact paths. Handle async failures; no empty catch blocks or silent data fabrication.
