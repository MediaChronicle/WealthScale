# WealthScale — Technical Architecture & Conventions

> Living reference for all architectural decisions, coding patterns, and library conventions.

---

## 1. Project Overview

| Item                | Value                                        |
| ------------------- | -------------------------------------------- |
| **Framework**       | React 19 + TypeScript 5.9                    |
| **Build**           | Vite 7.3 (`@vitejs/plugin-react`)            |
| **3D Engine**       | Three.js 0.182 via React Three Fiber 9.5     |
| **Styling**         | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| **UI Kit**          | shadcn/ui (New York style, neutral base)     |
| **State**           | Zustand 5 (slices pattern)                   |
| **Data Fetching**   | TanStack Query 5                             |
| **Validation**      | Zod 4                                        |
| **Animation**       | Motion 12, @react-spring/three 10, GSAP 3    |
| **Package Manager** | pnpm                                         |

---

## 2. Path Aliases

```json
// tsconfig.json
{ "@/*": ["./src/*"] }
```

All imports use `@/` prefix. Never use relative `../../` beyond one level.

```typescript
// Good
import { useBillionaires } from '@/hooks/useBillionaires'
import { BillionairePlanet } from '@/scene/cosmos/BillionairePlanet'

// Bad
import { useBillionaires } from '../../hooks/useBillionaires'
```

---

## 3. Tailwind CSS v4 Configuration

Tailwind v4 uses **CSS-first configuration**. No `tailwind.config.js` needed.

### Vite Plugin (already configured)

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Custom Theme Tokens

All WealthScale design tokens are defined in `src/index.css` via `@theme`:

```css
@theme {
  /* Fonts */
  --font-display: 'Space Grotesk Variable', sans-serif;
  --font-body: 'Inter Variable', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* WealthScale Colors */
  --color-ws-bg: #0a0a1a;
  --color-ws-glass: rgba(10, 10, 30, 0.7);
  --color-ws-glass-hover: rgba(20, 20, 50, 0.8);
  --color-ws-border: rgba(255, 255, 255, 0.08);
  --color-ws-accent: #00d4ff;
  --color-ws-positive: #00ff88;
  --color-ws-negative: #ff4466;
  --color-ws-gold: #ffd700;
}
```

Usage in components:

```tsx
<div className="bg-ws-glass border border-ws-border backdrop-blur-xl rounded-2xl">
  <h1 className="font-display text-ws-accent">WealthScale</h1>
  <p className="font-mono text-ws-positive">+$4.2B</p>
</div>
```

### Dark Mode

WealthScale is **dark-first**. The app always has `.dark` on the root element.

```css
@custom-variant dark (&:is(.dark *));
```

---

## 4. React Three Fiber Conventions

### Canvas Setup

```tsx
<Canvas
  camera={{ position: [0, 15, 40], fov: 60 }}
  dpr={[1, 2]}
  shadows
  gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
  onCreated={({ gl }) => {
    gl.setClearColor('#0a0a1a')
  }}
>
  <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)}>
    {/* Scene contents */}
  </PerformanceMonitor>
</Canvas>
```

### Performance Rules

1. **Ref mutations in `useFrame`, never `setState`**

   ```tsx
   // Good — mutate ref in animation loop
   useFrame((_, delta) => {
     meshRef.current.rotation.y += delta * 0.5
   })

   // Bad — triggers React re-render every frame
   useFrame(() => {
     setRotation((r) => r + 0.01)
   })
   ```

2. **Reuse geometries and materials via `useMemo`**

   ```tsx
   const geometry = useMemo(() => new SphereGeometry(1, 32, 32), [])
   const material = useMemo(
     () => new MeshPhysicalMaterial({ roughness: 0.3, metalness: 0.7 }),
     [],
   )
   ```

3. **Use `<Instances>` for repeated objects (particles, stars)**

   ```tsx
   <Instances limit={1000}>
     <sphereGeometry args={[0.05, 8, 8]} />
     <meshBasicMaterial />
     {particles.map((p) => (
       <Instance key={p.id} position={p.pos} color={p.color} />
     ))}
   </Instances>
   ```

4. **Dispose resources on unmount**

   ```tsx
   useEffect(() => {
     return () => {
       geometry.dispose()
       material.dispose()
     }
   }, [geometry, material])
   ```

5. **Lazy load scene modes with `React.lazy` + `<Suspense>`**
   ```tsx
   const TowersMode = lazy(() => import('@/scene/towers/TowersMode'))
   ```

### drei Helpers We Use

| Component         | Purpose                                |
| ----------------- | -------------------------------------- |
| `<Float>`         | Ambient floating animation on planets  |
| `<Text>`          | SDF text labels in 3D                  |
| `<Billboard>`     | Labels always face camera              |
| `<Stars>`         | Background starfield                   |
| `<Environment>`   | IBL ambient lighting                   |
| `<Sparkles>`      | Particle sparkle effects               |
| `<Html>`          | Embedded DOM elements in 3D (tooltips) |
| `<OrbitControls>` | Camera orbit/zoom/pan                  |
| `<useProgress>`   | Loading progress tracking              |
| `<AdaptiveDpr>`   | Dynamic resolution scaling             |
| `<Instances>`     | Instanced mesh rendering               |

---

## 5. Zustand Store Pattern

### Slices Architecture

Each domain has its own slice creator. Combined into a single store with devtools.

```
src/stores/
├── billionaireStore.ts    # Billionaire data + selection
├── sceneStore.ts          # Visualization mode, camera, scene config
├── userStore.ts           # User's wealth input, comparison state
├── achievementStore.ts    # Achievement tracking
└── index.ts               # Combined store export
```

### TypeScript Pattern

```typescript
import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

// Slice type
interface SceneSlice {
  mode: 'cosmos' | 'towers' | 'ocean' | 'timeline'
  setMode: (mode: SceneSlice['mode']) => void
}

// Slice creator
const createSceneSlice: StateCreator<
  AppStore,
  [['zustand/devtools', never]],
  [],
  SceneSlice
> = (set) => ({
  mode: 'cosmos',
  setMode: (mode) => set({ mode }, undefined, 'scene/setMode'),
})
```

### Selector Pattern (prevent unnecessary re-renders)

```typescript
// Good — granular selector
const mode = useAppStore((s) => s.mode)

// Bad — selects entire store
const store = useAppStore()
```

---

## 6. TanStack Query Conventions

### QueryClient Config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 6, // 6 hours (data updates monthly)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Query Key Convention

```typescript
// Pattern: [domain, ...params]
;['billionaires', 'list'][('billionaires', 'profile', uri)][ // Top billionaire list // Individual profile
  ('billionaires', 'history', uri)
][('billionaires', 'top10')][('movers', 'winners')][('movers', 'losers')] // Net worth history // Monthly top 10 stats // Daily gainers // Daily losers
```

### Lazy Fetching Pattern

Profile data is fetched on-demand when user clicks a planet:

```typescript
const { data: profile } = useQuery({
  queryKey: ['billionaires', 'profile', uri],
  queryFn: () => fetchProfile(uri),
  enabled: !!uri, // Only fetch when uri is selected
})
```

---

## 7. Zod Validation

Every API response is validated at the boundary:

```typescript
import { z } from 'zod'

const BillionaireListEntrySchema = z.object({
  rank: z.number(),
  uri: z.string(),
  name: z.string(),
  networth: z.number(),
  change: z.number().nullable(),
  citizenship: z.string(),
  industry: z.array(z.string()),
  source: z.array(z.string()),
})

// Usage in fetch wrapper
const data = BillionaireListSchema.parse(await response.json())
```

---

## 8. Animation Strategy

| Library                      | Use Case                                                |
| ---------------------------- | ------------------------------------------------------- |
| **`useFrame` (R3F)**         | Per-frame 3D animations (rotation, orbit, pulsing)      |
| **`@react-spring/three`**    | Camera fly-to transitions, spring-physics interpolation |
| **`motion` (framer-motion)** | 2D UI panels (slide in/out, fade, scale)                |
| **GSAP + ScrollTrigger**     | Scroll-driven comparison section animations             |

### Camera Transitions (react-spring)

```typescript
import { useSpring, animated } from "@react-spring/three";

const { position } = useSpring({
  position: isSelected ? [targetX, targetY, targetZ] : [0, 15, 40],
  config: { mass: 1, tension: 170, friction: 26 },
});

<animated.group position={position}>
  <PerspectiveCamera makeDefault />
</animated.group>
```

### 2D Panel Animations (motion)

```tsx
import { motion, AnimatePresence } from 'motion/react'

;<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      <DetailPanel />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 9. Post-Processing Pipeline

```tsx
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  ToneMapping,
} from '@react-three/postprocessing'

;<EffectComposer>
  <Bloom
    luminanceThreshold={0.8}
    luminanceSmoothing={0.9}
    intensity={0.8}
    mipmapBlur
  />
  <Vignette offset={0.3} darkness={0.7} />
  <ChromaticAberration offset={[0.0005, 0.0005]} />
  <ToneMapping />
</EffectComposer>
```

**Mobile**: Disable post-processing entirely (check `navigator.hardwareConcurrency < 4`).

---

## 10. File Naming Conventions

| Type             | Pattern                | Example                 |
| ---------------- | ---------------------- | ----------------------- |
| React components | PascalCase `.tsx`      | `BillionairePlanet.tsx` |
| Hooks            | camelCase `use*.ts`    | `useBillionaires.ts`    |
| Stores           | camelCase `*Store.ts`  | `billionaireStore.ts`   |
| Utils            | camelCase `.ts`        | `formatWealth.ts`       |
| Types            | `index.ts` in `types/` | `types/index.ts`        |
| Shaders          | camelCase `.ts`        | `sunShader.ts`          |
| Constants        | camelCase `.ts`        | `constants.ts`          |

---

## 11. shadcn/ui Configuration

```json
// components.json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "css": "src/index.css", "baseColor": "neutral" },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "hooks": "@/hooks",
    "lib": "@/lib"
  }
}
```

Install components as needed:

```bash
pnpm dlx shadcn@latest add dialog tabs slider input sheet tooltip
```

All shadcn components land in `src/components/ui/`. Custom WealthScale components live in their domain folders alongside.

---

## 12. Testing Strategy

| Layer     | Tool                     | Scope                            |
| --------- | ------------------------ | -------------------------------- |
| Unit      | Vitest                   | Utils, transformers, store logic |
| Component | Vitest + Testing Library | 2D UI components                 |
| 3D Scene  | Manual + Leva            | Visual verification with dev GUI |
| E2E       | Playwright (optional)    | Critical user flows              |

### Vitest Config

```typescript
// vitest.config.ts (or in vite.config.ts)
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.ts"],
}
```

---

## 13. Performance Budget

| Metric           | Target                      |
| ---------------- | --------------------------- |
| Bundle (gzipped) | < 500KB                     |
| FCP              | < 2s                        |
| TTI (3D ready)   | < 4s                        |
| Frame rate       | 60fps desktop, 30fps mobile |
| GPU memory       | < 200MB                     |
| Draw calls/frame | < 50                        |

### Code Splitting

```
Main bundle:     App shell + Cosmos mode (default)
Lazy chunks:     TowersMode, OceanMode, TimelineMode
On-demand:       DetailPanel, ComparisonEngine, Achievements
```
