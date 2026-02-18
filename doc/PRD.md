# WealthScale - Product Requirements Document

> **A 3D-powered interactive wealth visualization experience**
> Turn incomprehensible billionaire fortunes into visceral, tangible, explorable 3D worlds.

---

## Table of Contents

1. [Vision & Problem Statement](#1-vision--problem-statement)
2. [Core Concept: The Wealth Cosmos](#2-core-concept-the-wealth-cosmos)
3. [Data Sources & API Strategy](#3-data-sources--api-strategy)
4. [Tech Stack](#4-tech-stack)
5. [Architecture & System Design](#5-architecture--system-design)
6. [Feature Specification](#6-feature-specification)
7. [3D Visualization Design System](#7-3d-visualization-design-system)
8. [UI/UX Design System](#8-uiux-design-system)
9. [Gamification & Interaction Design](#9-gamification--interaction-design)
10. [Performance Strategy](#10-performance-strategy)
11. [Responsive & Accessibility](#11-responsive--accessibility)
12. [File & Folder Structure](#12-file--folder-structure)
13. [Implementation Phases](#13-implementation-phases)

---

## 1. Vision & Problem Statement

### The Problem

Human brains cannot comprehend the scale of a billion dollars. The difference between $1 million and $775 billion is not just numerical --- it's _conceptual_. A million dollars stacked in $1 bills reaches 358 feet (the Statue of Liberty). A billion reaches 358,000 feet --- into the mesosphere. Elon Musk's $775 billion? That stack would stretch **277 million feet** --- roughly to the Moon.

Existing wealth trackers (Bloomberg Billionaires Index, Forbes Real-Time) show numbers in tables. WealthScale makes those numbers **physical, spatial, and visceral** by rendering them as explorable 3D environments.

### The Vision

WealthScale is a **3D interactive cosmos** where each billionaire's wealth is a celestial body --- a planet whose size, glow, orbit, and gravitational pull are proportional to their net worth. Users orbit this wealth galaxy, zoom into individual planets to see wealth breakdowns, and --- most powerfully --- drop their own net worth into the scene as a tiny particle to viscerally feel the scale difference.

### Target Users

- Data visualization enthusiasts
- Students and educators exploring wealth inequality
- Journalists and content creators needing shareable visuals
- Anyone curious about the true scale of extreme wealth

---

## 2. Core Concept: The Wealth Cosmos

### 2.1 The Metaphor: A Solar System of Wealth

The primary visualization is a **Wealth Solar System**:

| Element               | Represents                             | Visual                                                   |
| --------------------- | -------------------------------------- | -------------------------------------------------------- |
| **Sun** (center)      | Total combined wealth of top 10        | Massive glowing sphere with corona                       |
| **Planets**           | Individual billionaires                | Spheres sized by net worth, unique textures per industry |
| **Orbit rings**       | Wealth ranking                         | Inner orbits = higher rank                               |
| **Moons**             | Wealth sources (Tesla, LVMH, etc.)     | Small orbiting spheres around each planet                |
| **Asteroid belt**     | "Your wealth" comparison               | Tiny particle the user places                            |
| **Particle trails**   | Daily wealth change (up/down)          | Green rising particles = gains, red falling = losses     |
| **Nebula background** | Total global billionaire wealth ($16T) | Atmospheric fog/particle cloud                           |

### 2.2 Alternative Visualization Modes (Switchable)

Users can toggle between **4 distinct visualization modes**:

#### Mode 1: Wealth Cosmos (Default)

Solar system metaphor described above. Each billionaire orbits the center, their planet size logarithmically scaled to net worth. Clicking a planet zooms in with a cinematic camera fly-through.

#### Mode 2: Wealth Towers (Skyline City)

A futuristic **cityscape** where each billionaire is a glowing skyscraper. Tower height = net worth. Towers have:

- Glass/metallic materials with industry-specific color coding
- Holographic name plates floating beside them
- Animated "wealth particles" flowing upward like energy
- The user's wealth is a tiny house at ground level for scale

#### Mode 3: Wealth Ocean (Depth Visualization)

An **underwater scene** where wealth is shown as depth:

- Surface level = $0
- Each billionaire is a luminescent deep-sea creature at a depth proportional to their wealth
- The user's wealth is a snorkeler near the surface
- Bioluminescent particles and volumetric light rays
- The deeper you go, the darker and more alien it gets

#### Mode 4: Wealth Timeline (4D)

A **time-travel corridor** showing wealth evolution:

- A tunnel/corridor stretching into the distance
- Each cross-section is a point in time (monthly data from 2020-present)
- Billionaire wealth shown as colored light bands that expand/contract
- User can "fly" through time and see who overtook whom
- Dramatic moments (e.g., Musk surpassing Bezos) highlighted with particle bursts

### 2.3 The "Your Wealth" Comparison Engine

The killer feature. User enters their net worth (or annual salary), and the app:

1. **Drops a grain of sand** into the solar system next to the planets
2. Shows a **split-screen comparison**: user's wealth as a physical cube of $100 bills vs. the billionaire's warehouse-filling stack
3. Calculates **"Time to Earn" ratios**: "Elon Musk earns your annual salary every X seconds"
4. Displays a **percentage ring** around the user's particle showing what fraction of each billionaire's wealth theirs represents
5. Animates a **"wealth race"** --- user's income accumulates at real speed while the billionaire's net worth bar sits there, immovable

---

## 3. Data Sources & API Strategy

### 3.1 Primary API: RTB-API (Forbes Real-Time Billionaires)

**Base URL:** `https://cdn.statically.io/gh/komed3/rtb-api@main/api/`

This is a free, MIT-licensed, CDN-hosted API with Forbes real-time billionaire data updated monthly. No API key required. No rate limits documented (CDN-cached).

#### Endpoints We'll Use

| Endpoint                     | Purpose                                                    | Format |
| ---------------------------- | ---------------------------------------------------------- | ------ |
| `list/rtb/latest`            | Top billionaires with rank, net worth, industry, source    | JSON   |
| `profile/{uri}/info`         | Detailed profile: name, photo, citizenship, education, org | JSON   |
| `profile/{uri}/bio`          | Biography text                                             | JSON   |
| `profile/{uri}/assets`       | Asset breakdown                                            | JSON   |
| `profile/{uri}/history`      | Historical net worth over time                             | CSV    |
| `profile/{uri}/rank`         | Rank history                                               | JSON   |
| `stats/top10`                | Monthly top 10 with historical data                        | JSON   |
| `movers/value/winner/latest` | Biggest daily gainers                                      | JSON   |
| `movers/value/loser/latest`  | Biggest daily losers                                       | JSON   |
| `stats/map`                  | Country distribution                                       | JSON   |
| `filter/industry/_index`     | Industry breakdown                                         | JSON   |

#### Data Shape (from API)

```typescript
// List entry
interface BillionaireListEntry {
  rank: number
  uri: string // "elon-musk"
  name: string // "Elon Musk"
  gender: 'm' | 'f'
  age: number
  networth: number // In millions USD (e.g., 774601.062 = $774.6B)
  change: number | null
  diff: number // Rank change
  flag: 'up' | 'down' | 'unchanged' | 'new'
  citizenship: string // ISO country code
  industry: string[] // ["technology"]
  source: string[] // ["Tesla", "SpaceX"]
}

// Profile info
interface BillionaireProfile {
  uri: string
  name: string
  birthDate: string // "1971-06-28"
  gender: 'm' | 'f'
  citizenship: string
  residence: {
    country: string
    state: string
    city: string
  }
  industry: string[]
  source: string[]
  image: string // Forbes CDN image URL
  children: number
  maritalStatus: string
  education: Array<{ school: string; degree: string }>
  organization: { name: string; title: string }
  selfMade: { _is: boolean; type: string; rank: number }
}
```

### 3.2 Supplementary Data Sources

| Source                               | Data                           | Usage                                         |
| ------------------------------------ | ------------------------------ | --------------------------------------------- |
| **RTB-API `/stats/top10`**           | Monthly top 10 since 2019      | Timeline mode historical data                 |
| **RTB-API `/profile/{uri}/history`** | Individual net worth over time | Sparkline charts, timeline corridor           |
| **Exchange Rates API** (free)        | Currency conversion            | Allow users to enter wealth in local currency |
| **REST Countries API**               | Country flags, names           | Billionaire country display                   |

### 3.3 Caching Strategy

```
User Request -> Check localStorage (TTL: 6 hours)
  -> If stale, fetch from CDN API
  -> Transform & normalize data
  -> Cache in localStorage + Zustand store
  -> Render 3D scene
```

- API data cached in `localStorage` with 6-hour TTL (data updates monthly anyway)
- Zustand store holds the current session's data
- Profile details fetched lazily on click/hover (cached individually)
- Historical data fetched once and persisted in `IndexedDB` for timeline mode

---

## 4. Tech Stack

### 4.1 Core Framework

| Technology     | Version | Purpose                 |
| -------------- | ------- | ----------------------- |
| **React**      | 19.x    | UI framework            |
| **Vite**       | 6.x     | Build tool & dev server |
| **TypeScript** | 5.7+    | Type safety             |

### 4.2 3D Engine

| Technology                      | Purpose                                                      |
| ------------------------------- | ------------------------------------------------------------ |
| **Three.js**                    | 3D rendering engine                                          |
| **React Three Fiber (R3F)**     | Declarative React renderer for Three.js                      |
| **@react-three/drei**           | Helper components (Float, Text, Environment, Sparkles, etc.) |
| **@react-three/postprocessing** | Bloom, selective glow, depth of field, vignette              |

### 4.3 Animation & Interaction

| Technology                 | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| **Motion (framer-motion)** | 2D UI animations + `motion/three` for 3D          |
| **@react-spring/three**    | Spring-physics 3D animations (camera transitions) |
| **GSAP + ScrollTrigger**   | Scroll-driven animations for comparison section   |

### 4.4 State & Data

| Technology                       | Purpose                                                     |
| -------------------------------- | ----------------------------------------------------------- |
| **Zustand**                      | Global state (billionaire data, selected mode, user wealth) |
| **TanStack Query (React Query)** | API data fetching, caching, refetching                      |
| **Zod**                          | Runtime API response validation                             |

### 4.5 Styling & UI

| Technology          | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| **Tailwind CSS v4** | Utility-first CSS                                      |
| **shadcn/ui**       | Accessible UI primitives (Dialog, Slider, Input, Tabs) |
| **Lucide React**    | Icons                                                  |

### 4.6 Dev & Quality

| Technology            | Purpose                            |
| --------------------- | ---------------------------------- |
| **ESLint + Prettier** | Code quality                       |
| **Vitest**            | Unit testing                       |
| **Playwright**        | E2E testing (optional)             |
| **Leva**              | Dev-only 3D parameter tweaking GUI |

### 4.7 Rationale: Why These Choices?

**React Three Fiber over vanilla Three.js**: R3F gives us declarative, component-based 3D. Each billionaire planet is a `<BillionairePlanet />` component with props. State changes (hover, click, data update) trigger re-renders naturally. The pmndrs ecosystem (drei, postprocessing, spring) is battle-tested and composable.

**Zustand over Redux/Context**: Zustand is ~1KB, works seamlessly with R3F (no provider wrapping needed), and supports selective subscriptions to prevent unnecessary re-renders of 3D objects.

**Vite over Next.js**: This is a client-side 3D app with no SSR needs. Vite gives us faster HMR, simpler config, and no framework overhead. The API is a static CDN --- no server-side data fetching needed.

**Tailwind v4**: Zero-config with Vite plugin, CSS-first configuration (no `tailwind.config.js`), and native dark mode support with `@custom-variant`.

---

## 5. Architecture & System Design

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    WealthScale App                    │
├──────────────┬──────────────────────────────────────┤
│   2D UI      │           3D Canvas (R3F)             │
│   Layer      │                                       │
│              │  ┌─────────────────────────────────┐  │
│  - Header    │  │  Scene Manager                  │  │
│  - Controls  │  │  ├── Cosmos Mode                │  │
│  - Panels    │  │  │   ├── WealthSun              │  │
│  - Inputs    │  │  │   ├── BillionairePlanet[]    │  │
│  - Modals    │  │  │   ├── OrbitRings             │  │
│              │  │  │   ├── UserParticle           │  │
│              │  │  │   └── Nebula                 │  │
│              │  │  ├── Towers Mode                │  │
│              │  │  ├── Ocean Mode                 │  │
│              │  │  └── Timeline Mode              │  │
│              │  │                                  │  │
│              │  │  Shared: Camera, Lights, Post   │  │
│              │  └─────────────────────────────────┘  │
├──────────────┴──────────────────────────────────────┤
│                    State Layer (Zustand)              │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐ │
│  │ Data    │ │ UI State │ │ User      │ │ Scene  │ │
│  │ Store   │ │ Store    │ │ Wealth    │ │ Config │ │
│  │         │ │          │ │ Store     │ │ Store  │ │
│  └─────────┘ └──────────┘ └───────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│              Data Layer (TanStack Query)              │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ RTB API     │  │ Cache    │  │ Transformers   │ │
│  │ Client      │  │ (6h TTL) │  │ (Zod + Map)    │ │
│  └─────────────┘  └──────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 5.2 State Management Design

```typescript
// stores/billionaireStore.ts
interface BillionaireStore {
  billionaires: BillionaireListEntry[]
  profiles: Map<string, BillionaireProfile>
  selectedUri: string | null
  isLoading: boolean

  // Actions
  setBillionaires: (data: BillionaireListEntry[]) => void
  selectBillionaire: (uri: string | null) => void
  addProfile: (uri: string, profile: BillionaireProfile) => void
}

// stores/sceneStore.ts
type VisualizationMode = 'cosmos' | 'towers' | 'ocean' | 'timeline'

interface SceneStore {
  mode: VisualizationMode
  cameraTarget: [number, number, number]
  isTransitioning: boolean
  showLabels: boolean
  showOrbits: boolean
  particleDensity: 'low' | 'medium' | 'high'

  setMode: (mode: VisualizationMode) => void
  setCameraTarget: (target: [number, number, number]) => void
}

// stores/userStore.ts
interface UserStore {
  netWorth: number
  currency: string
  showComparison: boolean
  comparisonTarget: string | null // billionaire uri

  setNetWorth: (value: number) => void
  setCurrency: (code: string) => void
  toggleComparison: () => void
}
```

### 5.3 Data Flow

```
1. App mounts
2. TanStack Query fetches `/list/rtb/latest` -> Zod validates -> top 10 extracted
3. Data flows into Zustand `billionaireStore`
4. R3F scene reads from store -> generates 3D objects
5. User clicks planet -> `selectBillionaire(uri)` called
6. TanStack Query lazy-fetches `/profile/{uri}/info` + `/profile/{uri}/assets`
7. Detail panel slides in (Framer Motion) + camera flies to planet (@react-spring/three)
8. User enters wealth -> `userStore.setNetWorth(value)` -> UserParticle re-renders at scale
```

---

## 6. Feature Specification

### 6.1 Feature: Landing & Loading Experience

**Entry animation**: The app opens to a deep-space void. Stars fade in. Then, one by one, wealth "planets" materialize with a burst of particles, accompanied by a soft chime. The largest planet (Musk) appears last with a dramatic corona flare. Total sequence: ~4 seconds.

**Loading state**: A custom 3D loading indicator --- a spinning golden coin that fills up like a progress bar using drei's `useProgress`.

### 6.2 Feature: Wealth Cosmos Explorer

**Default view**: Camera positioned at a 45-degree angle above the orbital plane. All 10 planets visible. Slow ambient rotation.

**Interactions**:

- **Hover planet**: Planet grows 10%, name + net worth label fades in (drei `<Html>` or `<Billboard>` + `<Text>`)
- **Click planet**: Camera smoothly flies to a close orbit around the planet (spring animation, ~1.5s). Detail panel slides in from right.
- **Drag/orbit**: OrbitControls for free camera movement
- **Scroll wheel**: Zoom in/out with damping
- **Double-click empty space**: Reset camera to default overview

**Detail panel** (2D overlay on right side):

- Profile photo (from API)
- Name, age, country (with flag emoji)
- Net worth with animated counter
- Wealth sources as colored chips
- Daily change (green/red arrow)
- "Compare with me" button
- Mini sparkline chart of net worth history (last 12 months)
- Self-made badge if applicable

### 6.3 Feature: Mode Switcher

A floating tab bar at top-center with 4 mode icons:

- Cosmos (planet icon)
- Towers (building icon)
- Ocean (waves icon)
- Timeline (clock icon)

Switching modes triggers a **dimensional collapse** transition:

1. Current scene objects shrink to points
2. Points swirl into a vortex at center
3. New scene elements expand outward from center
4. Camera repositions for new mode

Transition time: ~2 seconds. Uses `@react-spring/three` for physics-based interpolation.

### 6.4 Feature: Wealth Comparison Panel

Triggered by user entering their wealth. A sliding panel with:

**Input section**:

- Number input with currency selector
- Quick presets: "Median US Salary ($59K)", "Median US Household ($75K)", "Top 1% ($5.8M)"
- Slider for quick adjustment

**Comparison visualizations** (within the 3D scene):

- **Scale overlay**: User's wealth rendered as a glowing particle next to the selected billionaire's planet. A dotted line connects them with the ratio displayed.
- **Time comparison**: Animated text: "Elon Musk made your entire net worth in the last `X` seconds"
- **Physical stack**: Side-by-side 3D stacks of $100 bills --- user's stack vs billionaire's (which extends beyond the visible scene)
- **Percentage ring**: A glowing ring around the user's particle showing what % of the billionaire's wealth they represent

### 6.5 Feature: Wealth Leaderboard

A toggleable sidebar showing the ranked list:

- Rank number with crown icon for #1
- Thumbnail photo
- Name
- Net worth (formatted: $774.6B)
- Change indicator (arrow + absolute change)
- Clicking an entry flies camera to that billionaire

### 6.6 Feature: Fun Facts & Context Popups

Contextual facts that appear as floating holographic cards:

- "This wealth could buy every home in [city]"
- "Stacked in $1 bills, this would reach [planet]"
- "This is more than the GDP of [country]"
- Facts computed dynamically from the net worth value

### 6.7 Feature: Share / Screenshot

- "Capture" button renders the current 3D view to a canvas screenshot
- Overlay with WealthScale branding
- Download as PNG or copy to clipboard
- Pre-formatted share text for social media

---

## 7. 3D Visualization Design System

### 7.1 Cosmos Mode --- Detailed Specification

#### The Wealth Sun

```
- Geometry: SphereGeometry(5, 64, 64)
- Material: Custom ShaderMaterial with animated plasma texture
- Emissive intensity: 3.0 (triggers bloom)
- Corona: Particle system (500 particles) with radial velocity
- Glow: UnrealBloomPass with luminanceThreshold=0.8, strength=1.5, radius=0.4
- Pulsing animation: sin(time) * 0.02 scale oscillation
- Represents: Sum of all top 10 net worths (~$3T)
```

#### Billionaire Planets

```
- Geometry: SphereGeometry(radius, 32, 32)
- Radius formula: 0.3 + log10(networth / 100000) * 0.8
  (This gives Musk ~2.2 units, smallest ~0.7 units)
- Material: MeshPhysicalMaterial with:
  - Roughness: 0.3
  - Metalness: 0.7
  - Color: Industry-based (see color system below)
  - Emissive: Same color at 0.15 intensity
  - Normal map: Procedural noise for surface detail
- Orbit radius: 8 + (rank * 3) --- inner orbits for higher ranks
- Orbit speed: 0.001 / rank --- higher ranks orbit faster
- Axial tilt: random(-15, 15) degrees for visual variety
- Float animation: drei <Float speed={0.5} floatIntensity={0.2}>
```

#### Industry Color Palette

| Industry          | Primary Color | Hex       | Emissive  |
| ----------------- | ------------- | --------- | --------- |
| Technology        | Electric Blue | `#00D4FF` | `#0066FF` |
| Luxury/Fashion    | Royal Gold    | `#FFD700` | `#CC9900` |
| Finance           | Emerald Green | `#00FF88` | `#009955` |
| Retail/E-commerce | Warm Orange   | `#FF8844` | `#CC5500` |
| Automotive        | Silver Chrome | `#C0C0C0` | `#888888` |
| Energy            | Plasma Purple | `#AA44FF` | `#7722CC` |
| Telecom           | Neon Pink     | `#FF44AA` | `#CC2288` |
| Conglomerate      | Deep Red      | `#FF2244` | `#CC0022` |
| Healthcare        | Teal          | `#00CCAA` | `#009977` |
| Other             | White         | `#FFFFFF` | `#AAAAAA` |

#### Orbit Rings

```
- Geometry: RingGeometry(radius - 0.02, radius + 0.02, 128)
- Material: MeshBasicMaterial with opacity 0.15, transparent
- Color: Same as planet but at 30% brightness
- Dashed line effect via custom shader
```

#### User Wealth Particle

```
- Geometry: SphereGeometry(0.05, 16, 16)  // Tiny!
- Material: MeshStandardMaterial color="#FFFFFF" emissive="#FFFFFF"
- Wrapped in <Float speed={2} floatIntensity={0.5}>
- Sparkles around it: <Sparkles count={20} size={2} color="#FFFFFF">
- Position: Next to selected billionaire's planet for comparison
- Label: drei <Text> showing user's net worth
```

#### Nebula Background

```
- <Stars radius={300} depth={100} count={5000} factor={6} />
- Custom particle fog using Points + BufferGeometry
- Subtle color gradient: deep navy (#0a0a2e) -> dark purple (#1a0a3e)
- <Environment preset="night" /> for ambient lighting
```

### 7.2 Towers Mode --- Detailed Specification

```
Scene: Ground plane with reflective dark surface (MeshReflectorMaterial from drei)
Camera: Perspective, looking at skyline from street level

Towers:
- Geometry: BoxGeometry(width, height, depth)
  - Width: 2 units (all same)
  - Height: log10(networth / 10000) * 10 (Musk ~18u, smallest ~8u)
  - Depth: 2 units
- Material: MeshPhysicalMaterial
  - Transmission: 0.3 (glass effect)
  - Roughness: 0.1
  - Color: Industry-based palette
  - Emissive edges: Custom shader for edge glow
- Spacing: 4 units apart
- Name plates: <Billboard> <Text3D> floating beside each tower
- Energy particles: Per-tower particle system flowing upward
  - Green particles for positive daily change
  - Red particles for negative daily change
  - Particle count proportional to abs(daily change)

User's "house":
- Geometry: BoxGeometry(0.3, 0.2, 0.3)
- Positioned at ground level between towers
- Spotlight pointing at it
- Label: "Your wealth"
- Scale comparison is immediately visceral

Ground:
- Reflective dark surface using drei MeshReflectorMaterial
- Grid lines for scale reference
- Fog for depth: <fog attach="fog" args={['#000', 20, 80]} />
```

### 7.3 Ocean Mode --- Detailed Specification

```
Scene: Underwater environment with caustic light patterns

Water surface:
- Animated plane at y=0 with custom wave shader
- Light rays penetrating from above (volumetric light cones)

Billionaire creatures:
- Position.y = -(networth / 50000) --- depth proportional to wealth
- Geometry: Stylized jellyfish/deep-sea creature shapes
- Material: MeshPhysicalMaterial with transmission (translucent)
- Bioluminescent glow: Emissive + selective bloom
- Tentacle animations: Procedural vertex displacement in useFrame
- Each creature size varies by net worth

Depth markers:
- Floating text at intervals: "$100B", "$200B", etc.
- Get dimmer and more sparse as you go deeper

User position:
- Small diver/snorkeler figure near surface
- Flashlight beam (SpotLight) pointing downward
- "You are here" label

Ambient:
- Particle "plankton" floating everywhere
- Color gradient: light blue surface -> pitch black depths
- Sound design cue: deeper = lower ambient hum (optional)
```

### 7.4 Timeline Mode --- Detailed Specification

```
Scene: A tunnel/corridor stretching along the Z-axis

Time axis:
- Z position maps to date (2020 -> present)
- Monthly cross-sections visible as translucent planes
- Date labels on the floor/walls

Wealth bands:
- Each billionaire is a colored ribbon/band
- Band width at each Z = net worth at that month
- Bands arranged vertically (stacked)
- Overtaking events: Where two bands cross, particle burst effect

Camera:
- Flies along the Z-axis (user controls speed with scroll/drag)
- Can look around within the tunnel (limited OrbitControls)

Notable events:
- Floating holographic cards at key moments:
  - "Mar 2024: Musk surpasses $200B"
  - "Nov 2024: Zuckerberg enters top 3"
- Triggered when camera passes the Z-position

Data source: `/stats/top10` provides monthly snapshots since 2019
```

### 7.5 Post-Processing Pipeline

```
<EffectComposer>
  <Bloom
    luminanceThreshold={0.8}
    luminanceSmoothing={0.9}
    intensity={0.8}
  />
  <Vignette
    offset={0.3}
    darkness={0.7}
  />
  <ChromaticAberration offset={[0.0005, 0.0005]} />
  <ToneMapping mode={ACESFilmicToneMapping} />
</EffectComposer>
```

### 7.6 Lighting Setup

```
Cosmos Mode:
- PointLight at center (sun) intensity=2, color=#FFE4B5
- AmbientLight intensity=0.15
- Each planet has a dim PointLight for self-illumination

Towers Mode:
- DirectionalLight from above, angle 45deg, with shadows
- SpotLights on individual towers
- AmbientLight intensity=0.1
- Ground-level fog lights

Ocean Mode:
- DirectionalLight from above (sunlight through water)
- Volumetric light cones (spotlight with visible beam)
- No ambient light at depth (darkness is the point)
- Bioluminescent creatures self-illuminate

Timeline Mode:
- AmbientLight intensity=0.3
- SpotLight following camera
- Emissive materials on the wealth bands
```

---

## 8. UI/UX Design System

### 8.1 Design Philosophy

**Dark-first, glass-heavy, space-themed**. The 2D UI sits on top of the 3D canvas like a heads-up display (HUD). All panels are translucent with backdrop blur (glassmorphism), so the 3D scene is always visible underneath.

### 8.2 Color Tokens

```css
/* CSS Custom Properties (Tailwind v4 compatible) */
--color-bg-primary: #0a0a1a; /* Deep space black */
--color-bg-glass: rgba(10, 10, 30, 0.7);
--color-bg-glass-hover: rgba(20, 20, 50, 0.8);
--color-border-glass: rgba(255, 255, 255, 0.08);
--color-text-primary: #e2e8f0; /* Slate 200 */
--color-text-secondary: #94a3b8; /* Slate 400 */
--color-text-accent: #00d4ff; /* Electric blue */
--color-positive: #00ff88; /* Wealth gain green */
--color-negative: #ff4466; /* Wealth loss red */
--color-gold: #ffd700; /* Crown/rank gold */
```

### 8.3 Typography

```
Headings: "Space Grotesk" (Google Fonts) - geometric, modern, space-y
Body: "Inter" (Google Fonts) - highly readable, variable weight
Monospace numbers: "JetBrains Mono" - for net worth figures
3D Text: "Space Grotesk" via drei <Text3D> with typeface.json
```

### 8.4 Glass Panel Component

Every UI panel follows this pattern:

```css
.glass-panel {
  background: rgba(10, 10, 30, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### 8.5 Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]  [Mode Tabs: Cosmos|Towers|Ocean|Timeline]       │
│                                                  [Menu]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              3D CANVAS (full viewport)                    │
│                                                          │
│  ┌─────────┐                         ┌────────────────┐  │
│  │ Leader- │                         │  Detail Panel  │  │
│  │ board   │                         │  (on select)   │  │
│  │ Sidebar │                         │                │  │
│  │ (toggle)│                         │  Photo         │  │
│  │         │                         │  Name / Worth  │  │
│  │ #1 Musk │                         │  Sources       │  │
│  │ #2 Page │                         │  History       │  │
│  │ ...     │                         │  Compare btn   │  │
│  └─────────┘                         └────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  "Compare Your Wealth" Input Bar (bottom)         │    │
│  │  [$___________] [Median Salary] [Top 1%] [Go]     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│                         [Fun Fact Card]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 8.6 Responsive Breakpoints

| Breakpoint          | Layout Change                                                             |
| ------------------- | ------------------------------------------------------------------------- |
| Desktop (>1280px)   | Full layout with sidebar + detail panel                                   |
| Tablet (768-1279px) | Sidebar collapses to bottom sheet, detail panel becomes modal             |
| Mobile (<768px)     | Minimal HUD, bottom sheet for all panels, simplified 3D (fewer particles) |

### 8.7 Micro-Interactions

- **Number counters**: Net worth values animate up/down when data changes (spring animation)
- **Hover on leaderboard row**: Subtle glow, row lifts 2px with shadow
- **Mode tab switch**: Active tab has an underline glow that slides with spring physics
- **Input focus**: Border transitions from glass to accent blue glow
- **Panel enter**: Slide in from side with spring bounce (stiffness: 200, damping: 25)
- **Comparison result reveal**: Numbers "type" in character by character

---

## 9. Gamification & Interaction Design

### 9.1 Achievement System

Unlock achievements as users explore:

| Achievement       | Trigger                                     | Badge          |
| ----------------- | ------------------------------------------- | -------------- |
| "First Orbit"     | Complete one full orbit around the cosmos   | Rocket icon    |
| "Deep Diver"      | Reach the deepest billionaire in Ocean mode | Submarine icon |
| "Time Traveler"   | View the full timeline from 2020 to present | Clock icon     |
| "Reality Check"   | Complete your first wealth comparison       | Mirror icon    |
| "All Modes"       | Visit all 4 visualization modes             | Rainbow icon   |
| "Zoomed In"       | Click into every billionaire's detail panel | Magnifier icon |
| "Share the Scale" | Take and share a screenshot                 | Camera icon    |

Achievements stored in `localStorage`. Shown as subtle toast notifications with confetti particles.

### 9.2 Interactive Challenges

**"Guess the Wealth" Mini-Game**:

- Show a billionaire's planet/tower without labels
- User guesses net worth with a slider
- Score based on accuracy (percentage error)
- After guessing all 10, show a leaderboard of accuracy

**"Wealth Race" Animation**:

- User clicks "Race" and sees their income accumulate in real-time (salary / seconds-in-year)
- Meanwhile, a running counter shows how much each billionaire made in the same time
- Runs for 10 seconds, then displays the staggering difference

### 9.3 Easter Eggs

- **Konami Code**: Activates a "rain of money" particle effect across the entire scene
- **Click the sun 5 times**: Triggers a supernova explosion animation, then scene reforms
- **Scroll past the bottom**: In comparison mode, show "Still scrolling? That's how much wealth we're talking about."

### 9.4 Sound Design (Optional, Off by Default)

- Ambient space drone for cosmos mode
- Underwater ambiance for ocean mode
- Wind/city sounds for towers
- Ethereal hum for timeline
- Subtle click/whoosh on interactions
- Use Web Audio API with Howler.js, lazy-loaded

---

## 10. Performance Strategy

### 10.1 Core Principles

1. **On-demand rendering**: Use `frameloop="demand"` where possible, `invalidate()` on interaction
2. **Instanced meshes**: All particles use `<Instances>`, not individual meshes
3. **LOD (Level of Detail)**: Distant objects use simpler geometry
4. **Ref mutations over state**: 3D object updates happen in `useFrame` with refs, never React state
5. **Lazy scene loading**: Only the active mode's components are mounted (React.lazy + Suspense)

### 10.2 Performance Budget

| Metric                         | Target                                           |
| ------------------------------ | ------------------------------------------------ |
| Initial bundle                 | < 500KB gzipped                                  |
| First Contentful Paint         | < 2s                                             |
| Time to Interactive (3D ready) | < 4s                                             |
| Frame rate                     | 60fps on modern devices, 30fps minimum on mobile |
| Memory                         | < 200MB GPU memory                               |
| Draw calls per frame           | < 50                                             |

### 10.3 Optimization Techniques

```typescript
// 1. Reuse geometries and materials
const sharedSphereGeo = useMemo(() => new SphereGeometry(1, 32, 32), []);
const sharedMaterial = useMemo(() => new MeshPhysicalMaterial({...}), []);

// 2. Use instanced rendering for particles
<Instances limit={1000}>
  <sphereGeometry args={[0.05, 8, 8]} />
  <meshBasicMaterial />
  {particles.map(p => <Instance key={p.id} position={p.pos} />)}
</Instances>

// 3. Dispose of resources on unmount
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, []);

// 4. Use adaptive DPR
<Canvas dpr={[1, 2]}> // Caps at 2x, adapts to device
  <AdaptiveDpr pixelated /> // From drei, reduces DPR under load
</Canvas>

// 5. Conditional rendering based on distance
const { camera } = useThree();
useFrame(() => {
  const dist = camera.position.distanceTo(meshRef.current.position);
  meshRef.current.visible = dist < 100; // Frustum culling aid
});
```

### 10.4 Code Splitting Strategy

```
Route/Mode splitting:
- Main scene shell: loaded immediately
- Cosmos mode: default, bundled with main
- Towers mode: React.lazy(() => import('./modes/TowersMode'))
- Ocean mode: React.lazy(() => import('./modes/OceanMode'))
- Timeline mode: React.lazy(() => import('./modes/TimelineMode'))
- Detail panel: React.lazy (loaded on first click)
- Comparison engine: React.lazy (loaded on first wealth input)
```

---

## 11. Responsive & Accessibility

### 11.1 Mobile Strategy

On mobile devices (< 768px):

- Reduce particle counts by 50%
- Disable post-processing (no bloom/vignette)
- Use touch gestures for orbit/zoom (built into OrbitControls)
- Simplify Ocean mode (no volumetric lights)
- Replace Timeline corridor with simplified 2D chart overlay
- Use `AdaptiveDpr` to lower resolution under load

### 11.2 Accessibility

- All 2D UI components from shadcn/ui (built on Radix) are fully accessible
- `@react-three/a11y` wraps interactive 3D objects with screen reader descriptions
- Keyboard navigation for leaderboard and detail panels
- `aria-live` regions for dynamically updating wealth figures
- `prefers-reduced-motion` media query disables all animations
- High-contrast mode disables glassmorphism, uses solid backgrounds
- Color choices pass WCAG AA contrast ratios for text

### 11.3 Fallback for No WebGL

If WebGL is not available:

- Detect with `WebGLRenderer.isWebGLAvailable()`
- Render a beautiful 2D fallback with CSS animations
- Bar chart comparison using CSS transforms
- Maintain all data and comparison functionality

---

## 12. File & Folder Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root component, Canvas setup
├── index.css                         # Tailwind imports, global styles
│
├── api/                              # API layer
│   ├── client.ts                     # Fetch wrapper with caching logic
│   ├── endpoints.ts                  # API URL builder
│   ├── queries.ts                    # TanStack Query hooks
│   ├── schemas.ts                    # Zod validation schemas
│   └── transformers.ts               # Raw API -> app data transformers
│
├── stores/                           # Zustand stores
│   ├── billionaireStore.ts
│   ├── sceneStore.ts
│   ├── userStore.ts
│   └── achievementStore.ts
│
├── components/                       # 2D UI components
│   ├── ui/                           # shadcn/ui primitives
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── GlassPanel.tsx
│   │   └── MobileSheet.tsx
│   ├── leaderboard/
│   │   ├── LeaderboardSidebar.tsx
│   │   └── LeaderboardRow.tsx
│   ├── detail/
│   │   ├── DetailPanel.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── WealthSparkline.tsx
│   │   └── SourceChips.tsx
│   ├── comparison/
│   │   ├── ComparisonBar.tsx
│   │   ├── ComparisonResults.tsx
│   │   ├── TimeToEarn.tsx
│   │   └── WealthRace.tsx
│   ├── modeSwitcher/
│   │   └── ModeTabs.tsx
│   ├── funFacts/
│   │   └── FunFactCard.tsx
│   └── achievements/
│       ├── AchievementToast.tsx
│       └── AchievementBadge.tsx
│
├── scene/                            # 3D scene components
│   ├── SceneManager.tsx              # Mode router, camera manager
│   ├── shared/
│   │   ├── CameraController.tsx      # Animated camera with spring
│   │   ├── PostProcessing.tsx        # Bloom, vignette, etc.
│   │   ├── Lighting.tsx              # Per-mode lighting
│   │   ├── UserParticle.tsx          # User's wealth visualization
│   │   └── LoadingCoin.tsx           # 3D loading spinner
│   ├── cosmos/
│   │   ├── CosmosMode.tsx            # Mode root
│   │   ├── WealthSun.tsx             # Central glowing sun
│   │   ├── BillionairePlanet.tsx     # Individual planet
│   │   ├── OrbitRing.tsx             # Orbital path
│   │   ├── WealthMoon.tsx            # Source-representing moons
│   │   ├── Nebula.tsx                # Background particles
│   │   └── shaders/
│   │       ├── sunShader.ts          # Plasma sun shader
│   │       └── nebulaShader.ts       # Nebula fog shader
│   ├── towers/
│   │   ├── TowersMode.tsx
│   │   ├── WealthTower.tsx
│   │   ├── TowerLabel.tsx
│   │   ├── GroundPlane.tsx
│   │   └── EnergyParticles.tsx
│   ├── ocean/
│   │   ├── OceanMode.tsx
│   │   ├── WealthCreature.tsx
│   │   ├── WaterSurface.tsx
│   │   ├── DepthMarker.tsx
│   │   └── CausticLights.tsx
│   └── timeline/
│       ├── TimelineMode.tsx
│       ├── WealthBand.tsx
│       ├── TimeTunnel.tsx
│       ├── EventCard.tsx
│       └── DateMarker.tsx
│
├── hooks/                            # Custom hooks
│   ├── useBillionaires.ts            # Data fetching + caching
│   ├── useWealthScale.ts             # Net worth -> 3D scale math
│   ├── useCameraAnimation.ts         # Spring-based camera fly-to
│   ├── useAchievements.ts            # Achievement tracker
│   ├── useFunFact.ts                 # Dynamic fact generation
│   └── useScreenshot.ts              # Canvas -> image capture
│
├── utils/                            # Utility functions
│   ├── formatWealth.ts               # "$774.6B", "$59K", etc.
│   ├── wealthMath.ts                 # Scale calculations, comparisons
│   ├── colorByIndustry.ts            # Industry -> hex color map
│   ├── countryFlags.ts               # ISO code -> flag emoji
│   └── constants.ts                  # Magic numbers, API URLs
│
├── types/                            # TypeScript types
│   └── index.ts                      # All shared types
│
└── assets/
    ├── fonts/                        # Typeface JSON for Text3D
    └── textures/                     # Planet textures, skybox
```

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Boilerplate + data pipeline + one planet spinning

- [x] Scaffold Vite + React + TypeScript project
- [ ] Install and configure Tailwind v4, shadcn/ui
- [ ] Set up R3F Canvas with basic scene (camera, lights, orbit controls)
- [ ] Build API client with TanStack Query for RTB-API
- [ ] Define Zod schemas, transform raw data to app types
- [ ] Set up Zustand stores (billionaire, scene, user)
- [ ] Render a single `<BillionairePlanet />` from live API data
- [ ] Basic `<Environment>` and `<Stars>` background

**Deliverable**: A spinning planet in space, sized by Elon Musk's net worth, with his name label.

### Phase 2: Cosmos Mode (Week 2)

**Goal**: Full solar system with all 10 billionaires

- [ ] Generate all 10 planets with correct sizes, colors, orbits
- [ ] Implement WealthSun with bloom glow
- [ ] Add orbit rings
- [ ] Hover interactions (grow, label)
- [ ] Click interaction (camera fly-to with spring animation)
- [ ] Detail panel (2D glass overlay with profile data)
- [ ] Leaderboard sidebar
- [ ] Post-processing pipeline (bloom, vignette)

**Deliverable**: Full Cosmos mode --- orbit, click, explore all 10 billionaires.

### Phase 3: Wealth Comparison (Week 3)

**Goal**: "Your wealth vs theirs" feature complete

- [ ] Comparison input bar UI
- [ ] UserParticle 3D component (grain of sand next to planet)
- [ ] Scale calculations (net worth ratio, time-to-earn)
- [ ] Comparison results panel with animations
- [ ] "Wealth Race" animation
- [ ] Fun facts engine (dynamic context generation)
- [ ] Preset buttons (median salary, etc.)

**Deliverable**: Enter your salary, see yourself as a speck next to Musk's planet.

### Phase 4: Additional Modes (Week 4-5)

**Goal**: Towers + Ocean + Timeline modes

- [ ] Mode switcher UI with transition animation
- [ ] Towers Mode: skyscrapers, ground plane, labels
- [ ] Ocean Mode: depth visualization, creatures, caustics
- [ ] Timeline Mode: historical data, time corridor, event cards
- [ ] Dimensional collapse transitions between modes

**Deliverable**: All 4 modes explorable and switchable.

### Phase 5: Polish & Gamification (Week 6)

**Goal**: Delight layer

- [ ] Achievement system
- [ ] "Guess the Wealth" mini-game
- [ ] Easter eggs (Konami code, sun click)
- [ ] Sound design (optional toggle)
- [ ] Screenshot/share feature
- [ ] Loading experience (golden coin)
- [ ] Mobile responsive adjustments
- [ ] Performance optimization pass
- [ ] Accessibility audit

**Deliverable**: A polished, shareable, delightful experience.

---

## Appendix A: API Response Examples

### `/list/rtb/latest` (Top entries)

```json
[
  {
    "rank": 1,
    "uri": "elon-musk",
    "name": "Elon Musk",
    "gender": "m",
    "age": 54,
    "networth": 774601.062,
    "change": null,
    "diff": 0,
    "flag": "unchanged",
    "citizenship": "us",
    "industry": ["technology"],
    "source": ["Tesla", "SpaceX"]
  }
]
```

### `/profile/elon-musk/info`

```json
{
  "uri": "elon-musk",
  "name": "Elon Musk",
  "birthDate": "1971-06-28",
  "gender": "m",
  "citizenship": "us",
  "residence": { "country": "us", "state": "Texas", "city": "Austin" },
  "industry": ["automotive"],
  "source": ["Tesla", "SpaceX"],
  "image": "https://specials-images.forbesimg.com/imageserve/62d700cd6094d2c180f269b9/416x416.jpg",
  "children": 11,
  "maritalStatus": "Divorced",
  "education": [
    {
      "school": "University of Pennsylvania",
      "degree": "Bachelor of Arts/Science"
    }
  ],
  "organization": { "name": "Tesla", "title": "CEO" },
  "selfMade": { "_is": true, "type": "self-made", "rank": 8 }
}
```

## Appendix B: Key Scaling Formulas

```typescript
// Planet radius from net worth (in millions)
const planetRadius = (networth: number) =>
  0.3 + Math.log10(networth / 100_000) * 0.8

// Orbit radius from rank (1-10)
const orbitRadius = (rank: number) => 8 + rank * 3

// Tower height from net worth
const towerHeight = (networth: number) => Math.log10(networth / 10_000) * 10

// Ocean depth from net worth
const oceanDepth = (networth: number) => -(networth / 50_000)

// User particle scale relative to billionaire
const userScale = (userWealth: number, billionaireWealth: number) =>
  Math.max(
    0.01,
    (userWealth / billionaireWealth) * planetRadius(billionaireWealth),
  )

// "Time to earn" calculation (seconds)
const timeToEarn = (userAnnualIncome: number, billionaireNetworth: number) =>
  (billionaireNetworth * 1_000_000) / (userAnnualIncome / (365.25 * 24 * 3600))
```

## Appendix C: Reference Links

- [RTB-API (Forbes Real-Time Billionaires)](https://github.com/komed3/rtb-api) --- Free, MIT licensed
- [React Three Fiber Docs](https://r3f.docs.pmnd.rs/)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [React Postprocessing](https://react-postprocessing.docs.pmnd.rs/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Motion for R3F](https://motion.dev/docs/react-three-fiber)
- [React Spring for R3F](https://react-spring.dev/docs/guides/react-three-fiber)
- ["Wealth, shown to scale"](https://eattherichtextformat.github.io/1-pixel-wealth/) --- Inspiration
- ["How Rich is Elon Musk?"](https://engaging-data.com/how-rich-is-elon-musk/) --- Inspiration
- [R3F Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [100 Three.js Performance Tips (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips)

---

_Document authored for WealthScale project. Last updated: February 2026._
