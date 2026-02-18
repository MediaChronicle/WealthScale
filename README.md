# WealthScale

> Turn incomprehensible billionaire fortunes into visceral, tangible, explorable 3D worlds.

WealthScale is a client-side 3D interactive wealth visualization app. It renders the top 10 billionaires' net worths as explorable 3D environments — a solar system, a city skyline, ocean depths, and a historical time corridor — powered by live Forbes data and rendered in the browser with React Three Fiber.

---

## Features

### Four Visualization Modes

| Mode         | Metaphor      | Description                                                                                            |
| ------------ | ------------- | ------------------------------------------------------------------------------------------------------ |
| **Cosmos**   | Solar system  | Billionaires as orbiting planets, sized by net worth. Click a planet for a cinematic fly-through.      |
| **Towers**   | City skyline  | Glowing skyscrapers with heights proportional to wealth. Energy particles flow upward for daily gains. |
| **Ocean**    | Depth dive    | Bioluminescent deep-sea creatures positioned by depth proportional to wealth.                          |
| **Timeline** | Time corridor | A 4D tunnel showing wealth evolution from 2020 to present with event markers for key milestones.       |

### Wealth Comparison Engine

Enter your net worth or annual salary to:

- See yourself as a grain of sand next to a billionaire's planet
- View a "Time to Earn" counter — how long it takes a billionaire to make your entire net worth
- Watch a live **Wealth Race** animation — your income vs. theirs over 10 seconds
- Get dynamically generated **Fun Facts** (GDP comparisons, physical stacks, etc.)

### Gamification

- **7 Achievements** — unlocked through exploration, persisted to `localStorage`
- **Guess the Wealth** mini-game — identify billionaires by their visualization and guess their net worth with a slider
- **Easter Eggs** — Konami Code triggers a money rain; clicking the sun 5 times triggers a supernova explosion

### Screenshot & Share

Capture the current 3D scene with WealthScale branding. Download as PNG or copy to clipboard with a single click.

---

## Tech Stack

| Layer           | Technology                                                           |
| --------------- | -------------------------------------------------------------------- |
| Framework       | React 19 + TypeScript 5.9 + Vite 7                                   |
| 3D Engine       | Three.js 0.182 via React Three Fiber 9.5 + drei 10.7                 |
| Post-Processing | @react-three/postprocessing (Bloom, Vignette, Chromatic Aberration)  |
| 3D Animation    | @react-spring/three (camera fly-to, mode transitions, hover springs) |
| 2D Animation    | Motion (Framer Motion) + GSAP                                        |
| State           | Zustand 5 (slices pattern)                                           |
| Data Fetching   | TanStack Query 5 (6h staleTime, CDN-cached API)                      |
| Validation      | Zod 4                                                                |
| Styling         | Tailwind CSS v4 (CSS-first) + shadcn/ui (New York style)             |
| Accessibility   | @react-three/a11y + Radix UI primitives                              |
| Package Manager | pnpm                                                                 |

---

## Data Source

Live data from the [RTB-API](https://github.com/komed3/rtb-api) — a free, MIT-licensed, CDN-hosted API mirroring Forbes Real-Time Billionaires data. No API key required.

```
Base URL: https://raw.githubusercontent.com/komed3/rtb-api/main/api
Refresh: Monthly (cached in-browser for 6 hours via TanStack Query)
```

Net worth values are in **millions USD** (e.g., `774601.062` = $774.6B).

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Installation

```bash
git clone https://github.com/your-username/WealthScale.git
cd WealthScale
pnpm install
```

### Development

```bash
pnpm dev          # Start dev server at http://localhost:5173
```

### Build

```bash
pnpm build        # Type-check (tsc -b) then build for production
pnpm preview      # Preview the production build locally
```

### Other Commands

```bash
pnpm lint               # ESLint on all .ts/.tsx files
pnpm format             # Format code with Prettier
pnpm format:check       # Check formatting without writing
pnpm build:analyze      # Build + open bundle visualizer
pnpm dlx shadcn@latest add <component>   # Add a shadcn/ui component
```

### Pre-commit Hooks

Husky + lint-staged run automatically on `git commit`:

- ESLint `--fix` on `.ts/.tsx`
- Prettier on `.ts/.tsx`, `.json`, `.md`, `.css`, `.html`

Commits are blocked if hooks fail. Fix the reported issues and retry.

---

## Project Structure

```
src/
├── api/                  # RTB-API client, Zod schemas, TanStack Query hooks, transformers
├── components/           # 2D DOM UI (HUD layer)
│   ├── achievements/     # Achievement badges and toast notifications
│   ├── comparison/       # Wealth comparison panels (bar, results, race, fun facts)
│   ├── detail/           # Billionaire detail panel with profile data
│   ├── layout/           # Header, loading screen, share button, mobile sheets
│   ├── leaderboard/      # Ranked sidebar and rows
│   ├── modeSwitcher/     # Mode tab bar (Cosmos / Towers / Ocean / Timeline)
│   └── ui/               # shadcn/ui primitives (button, input, slider, sheet, etc.)
├── hooks/                # Custom hooks (mobile, performance, achievements, screenshot, easter eggs)
├── scene/                # React Three Fiber 3D components
│   ├── cosmos/           # Cosmos mode: WealthSun, BillionairePlanet, OrbitRing
│   ├── towers/           # Towers mode: WealthTower, EnergyParticles, GroundPlane
│   ├── ocean/            # Ocean mode: WealthCreature, WaterSurface (GPU shader), CausticLights
│   ├── timeline/         # Timeline mode: WealthBand (BufferGeometry), TimeTunnel, EventCard
│   └── shared/           # SceneManager, ModeTransition, CameraController, PostProcessing, UserParticle
├── stores/               # Zustand stores (billionaire, scene, user slices + achievement store)
├── types/                # Shared TypeScript types
└── utils/                # Pure utilities: formatWealth, wealthMath, colorByIndustry, constants
```

---

## Architecture

### Dual-Layer Rendering

The app renders two layers simultaneously:

- **3D Canvas** (React Three Fiber) — full-viewport `<Canvas>` driven by Zustand state
- **2D HUD Overlay** — DOM elements positioned absolutely over the canvas (`pointer-events-none` by default, re-enabled on interactive elements)

### Mode Switching

Four modes are code-split via `React.lazy`. Mode transitions use a two-phase spring animation: the outgoing scene collapses to a point, then the new scene expands outward. The transition respects `prefers-reduced-motion`.

### Performance

- Unit geometries (`SphereGeometry(1, …)`) reused across all planets — size controlled via `mesh.scale`
- Geometries and materials disposed on unmount
- `<PerformanceMonitor>` + `<AdaptiveDpr>` dynamically adjust pixel ratio
- Post-processing disabled on mobile
- `seededRandom()` used instead of `Math.random()` in render paths (React 19 purity)
- `useFrame` mutations via refs — never `setState` in animation loops

### State Management

Three Zustand slices combined in `src/stores/index.ts`:

- `billionaireStore` — API data + selected billionaire
- `sceneStore` — active mode, transition state, leaderboard visibility
- `userStore` — net worth input, comparison results, wealth race state

`useAchievementStore` is a standalone store with `persist` middleware (incompatible with the slices combiner).

---

## Accessibility

- `@react-three/a11y` wraps all interactive 3D objects with screen reader descriptions and keyboard support
- Full ARIA tab pattern on `ModeTabs`
- Keyboard focus trap in `DetailPanel`
- `aria-live="polite"` regions for dynamic wealth figures
- Skip-to-content link
- All `prefers-reduced-motion` preferences respected (disables orbit animation, mode transition spin, Float components)
- shadcn/ui / Radix UI primitives ensure accessible 2D UI

---

## License

MIT
