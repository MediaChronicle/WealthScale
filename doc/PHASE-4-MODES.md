# Phase 4: Additional Visualization Modes

> **Goal**: Towers + Ocean + Timeline modes, mode switcher UI, dimensional collapse transition system
> **Deliverable**: All 4 modes explorable and switchable with cinematic transitions between them.

---

## Table of Contents

1. [Overview & Goal](#1-overview--goal)
2. [Mode Switcher UI](#2-mode-switcher-ui)
3. [Towers Mode](#3-towers-mode)
4. [Ocean Mode](#4-ocean-mode)
5. [Timeline Mode](#5-timeline-mode)
6. [Transition System](#6-transition-system)
7. [Updated SceneManager](#7-updated-scenemanager)
8. [Acceptance Criteria](#acceptance-criteria)
9. [Complete File List](#complete-file-list)

---

## 1. Overview & Goal

### What Phases 1-3 Built

- **Phase 1**: Project foundation, data pipeline (RTB-API -> Zod -> TanStack Query -> Zustand), single planet rendering
- **Phase 2**: Full Cosmos mode with 10 billionaire planets, WealthSun, orbit rings, hover/click interactions, detail panel, leaderboard, post-processing
- **Phase 3**: Wealth comparison engine -- user particle, scale calculations, time-to-earn, wealth race animation, fun facts

### What Phase 4 Adds

Three new visualization modes, each offering a fundamentally different spatial metaphor for comprehending extreme wealth:

| Mode         | Metaphor                          | Key Insight                                                                       |
| ------------ | --------------------------------- | --------------------------------------------------------------------------------- |
| **Towers**   | Futuristic cityscape skyscrapers  | Height = wealth. Street-level perspective makes scale visceral.                   |
| **Ocean**    | Underwater depth visualization    | Depth = wealth. The deeper you go, the darker and more alien it gets.             |
| **Timeline** | Time-travel corridor along Z-axis | Wealth evolution over time. Fly through history and watch fortunes rise and fall. |

Plus:

- A floating **ModeTabs** component for switching between all 4 modes
- A **dimensional collapse** transition system for cinematic mode switching
- An updated **SceneManager** that routes between modes with lazy loading

### Prerequisites

- All Phase 1-3 components functional
- `sceneStore` already has `mode: VisualizationMode` and `setMode()` action
- `billionaireStore` populated with top 10 data
- `wealthMath.ts` already exports `towerHeight()` and `oceanDepth()`
- Industry color system operational via `colorByIndustry.ts`

---

## 2. Mode Switcher UI

### File: `src/components/modeSwitcher/ModeTabs.tsx`

A floating glass tab bar anchored at top-center of the viewport. Contains 4 mode icons with an animated underline glow that slides between tabs using spring physics.

```tsx
import { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Globe, Building2, Waves, Clock } from 'lucide-react'
import { useAppStore } from '@/stores'
import type { VisualizationMode } from '@/types'
import { cn } from '@/lib/utils'

interface ModeTab {
  mode: VisualizationMode
  icon: typeof Globe
  label: string
}

const TABS: ModeTab[] = [
  { mode: 'cosmos', icon: Globe, label: 'Cosmos' },
  { mode: 'towers', icon: Building2, label: 'Towers' },
  { mode: 'ocean', icon: Waves, label: 'Ocean' },
  { mode: 'timeline', icon: Clock, label: 'Timeline' },
]

export function ModeTabs() {
  const currentMode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const isTransitioning = useAppStore((s) => s.isTransitioning)
  const tabRefs = useRef<Map<VisualizationMode, HTMLButtonElement>>(new Map())
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  // Compute underline position from the active tab's DOM rect
  useEffect(() => {
    const activeTab = tabRefs.current.get(currentMode)
    if (!activeTab) return

    const container = activeTab.parentElement
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()

    setUnderlineStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    })
  }, [currentMode])

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={cn(
          'glass-panel relative flex items-center gap-1 px-2 py-2',
          'rounded-2xl',
        )}
      >
        {TABS.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            ref={(el) => {
              if (el) tabRefs.current.set(mode, el)
            }}
            onClick={() => {
              if (mode !== currentMode && !isTransitioning) {
                setMode(mode)
              }
            }}
            disabled={isTransitioning}
            className={cn(
              'relative flex items-center gap-2 rounded-xl px-4 py-2',
              'text-sm font-display transition-colors duration-200',
              'hover:bg-ws-glass-hover',
              'disabled:pointer-events-none disabled:opacity-50',
              currentMode === mode
                ? 'text-ws-accent'
                : 'text-ws-text-secondary hover:text-ws-text-primary',
            )}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        {/* Animated underline glow */}
        <motion.div
          className="absolute bottom-1 h-0.5 rounded-full bg-ws-accent"
          animate={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          style={{
            boxShadow: '0 0 12px 2px var(--ws-accent)',
          }}
        />
      </div>
    </div>
  )
}
```

### Design Notes

- **Glass panel**: Uses the project's `.glass-panel` CSS class for backdrop-blur glassmorphism.
- **Spring underline**: The `motion.div` underline uses spring physics (`stiffness: 400`, `damping: 30`) for a snappy but smooth slide between tabs.
- **Glow effect**: CSS `box-shadow` with the accent color creates the neon underline glow.
- **Responsive**: On small screens (`sm:` breakpoint), labels are hidden and only icons show.
- **Disabled during transition**: Buttons are disabled while `isTransitioning` is true to prevent rapid mode switching during the dimensional collapse animation.
- **Lucide icons**: `Globe`, `Building2`, `Waves`, `Clock` from `lucide-react`.

---

## 3. Towers Mode

A futuristic cityscape where each billionaire is a glowing glass skyscraper. Tower height maps to net worth logarithmically. The scene is viewed from street level with a reflective ground plane and atmospheric fog.

### 3.1 TowersMode (Scene Root)

#### File: `src/scene/towers/TowersMode.tsx`

```tsx
import { useMemo } from 'react'
import { useAppStore } from '@/stores'
import { towerHeight } from '@/utils/wealthMath'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { WealthTower } from './WealthTower'
import { TowerLabel } from './TowerLabel'
import { GroundPlane } from './GroundPlane'
import { EnergyParticles } from './EnergyParticles'
import { Environment, OrbitControls } from '@react-three/drei'
import type { BillionaireListEntry } from '@/types'

const TOWER_SPACING = 4

export function TowersMode() {
  const billionaires = useAppStore((s) => s.billionaires)

  const towers = useMemo(
    () =>
      billionaires.map((b, i) => {
        const height = towerHeight(b.networth)
        const industry = b.industry[0] ?? 'other'
        const colors = getIndustryColor(industry)
        const x = (i - (billionaires.length - 1) / 2) * TOWER_SPACING

        return { entry: b, height, colors, x }
      }),
    [billionaires],
  )

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[20, 40, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={50}
        shadow-camera-bottom={-10}
      />

      {/* Environment reflections */}
      <Environment preset="city" />

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#000000', 20, 80]} />

      {/* Ground */}
      <GroundPlane />

      {/* Towers with labels and particles */}
      {towers.map(({ entry, height, colors, x }) => (
        <group key={entry.uri} position={[x, 0, 0]}>
          <WealthTower
            height={height}
            color={colors.primary}
            emissiveColor={colors.emissive}
          />
          <TowerLabel
            name={entry.name}
            networth={entry.networth}
            height={height}
          />
          <EnergyParticles height={height} dailyChange={entry.change ?? 0} />
        </group>
      ))}

      {/* Camera controls -- street level */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        target={[0, 8, 0]}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  )
}
```

### 3.2 WealthTower

#### File: `src/scene/towers/WealthTower.tsx`

Each tower is a glass-effect box with `MeshPhysicalMaterial` transmission. Height is logarithmically scaled from net worth.

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  MeshPhysicalMaterial,
  Color,
  Mesh,
  FrontSide,
} from 'three'

interface WealthTowerProps {
  height: number
  color: string
  emissiveColor: string
}

export function WealthTower({
  height,
  color,
  emissiveColor,
}: WealthTowerProps) {
  const meshRef = useRef<Mesh>(null)

  const geometry = useMemo(() => new BoxGeometry(2, height, 2), [height])

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(color),
        emissive: new Color(emissiveColor),
        emissiveIntensity: 0.2,
        transmission: 0.3,
        roughness: 0.1,
        metalness: 0.1,
        thickness: 2,
        transparent: true,
        opacity: 0.9,
        side: FrontSide,
      }),
    [color, emissiveColor],
  )

  // Subtle idle pulse on emissive intensity
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as MeshPhysicalMaterial
    mat.emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 1.5) * 0.05
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, height / 2, 0]}
      castShadow
      receiveShadow
    />
  )
}
```

**Scaling formula** (from `wealthMath.ts`):

```
height = log10(networth / 10,000) * 10
```

- Musk (~774,601M): `log10(774601 / 10000) * 10` = ~18.9 units
- Smallest top 10 (~100,000M): `log10(100000 / 10000) * 10` = 10 units

### 3.3 TowerLabel

#### File: `src/scene/towers/TowerLabel.tsx`

Billboard text floating beside each tower showing name and formatted net worth.

```tsx
import { Billboard, Text } from '@react-three/drei'
import { formatWealth } from '@/utils/formatWealth'

interface TowerLabelProps {
  name: string
  networth: number
  height: number
}

export function TowerLabel({ name, networth, height }: TowerLabelProps) {
  return (
    <Billboard
      position={[2.2, height * 0.75, 0]}
      follow
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <Text
        fontSize={0.5}
        color="#e2e8f0"
        anchorX="left"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
        font="/fonts/SpaceGrotesk-Variable.woff2"
      >
        {name}
      </Text>
      <Text
        fontSize={0.35}
        color="#00d4ff"
        anchorX="left"
        anchorY="top"
        position={[0, -0.1, 0]}
        font="/fonts/JetBrainsMono-Regular.woff2"
      >
        {formatWealth(networth)}
      </Text>
    </Billboard>
  )
}
```

### 3.4 GroundPlane

#### File: `src/scene/towers/GroundPlane.tsx`

A reflective dark surface using drei's `MeshReflectorMaterial` with grid lines for scale reference.

```tsx
import { MeshReflectorMaterial, Grid } from '@react-three/drei'

export function GroundPlane() {
  return (
    <>
      {/* Reflective surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>

      {/* Grid overlay for scale reference */}
      <Grid
        position={[0, 0.01, 0]}
        args={[200, 200]}
        cellSize={4}
        cellThickness={0.5}
        cellColor="#1a1a3a"
        sectionSize={20}
        sectionThickness={1}
        sectionColor="#2a2a5a"
        fadeDistance={60}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  )
}
```

### 3.5 EnergyParticles

#### File: `src/scene/towers/EnergyParticles.tsx`

Per-tower particle system using `Instances`. Green particles for positive daily change, red for negative. Particle count is proportional to `abs(dailyChange)`. Particles flow upward and fade.

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import { Object3D, MathUtils } from 'three'

interface EnergyParticlesProps {
  height: number
  dailyChange: number
}

interface Particle {
  id: number
  x: number
  z: number
  speed: number
  offset: number
}

const MAX_PARTICLES = 30

export function EnergyParticles({ height, dailyChange }: EnergyParticlesProps) {
  const instanceRefs = useRef<(Object3D | null)[]>([])

  const isPositive = dailyChange >= 0
  const color = isPositive ? '#00ff88' : '#ff4466'

  // Particle count proportional to abs(change), clamped
  const count = useMemo(() => {
    const absChange = Math.abs(dailyChange)
    // Scale: 0 change = 2 particles, 10000+ change = MAX_PARTICLES
    return Math.max(2, Math.min(MAX_PARTICLES, Math.floor(absChange / 500) + 2))
  }, [dailyChange])

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 1.6,
        z: (Math.random() - 0.5) * 1.6,
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * height,
      })),
    [count, height],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    particles.forEach((p, i) => {
      const ref = instanceRefs.current[i]
      if (!ref) return

      // Particles loop upward along the tower height
      const y = (p.offset + t * p.speed) % (height + 2)
      ref.position.set(p.x, y, p.z)

      // Fade out near top
      const fadeZone = height * 0.8
      const opacity = y > fadeZone ? 1 - (y - fadeZone) / (height * 0.2 + 2) : 1
      ref.scale.setScalar(MathUtils.clamp(opacity, 0.05, 1) * 0.08)
    })
  })

  return (
    <Instances limit={MAX_PARTICLES}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
      {particles.map((p, i) => (
        <Instance
          key={p.id}
          ref={(el) => {
            instanceRefs.current[i] = el
          }}
        />
      ))}
    </Instances>
  )
}
```

---

## 4. Ocean Mode

An underwater scene where wealth is visualized as depth. The surface is at y=0, and each billionaire is a bioluminescent jellyfish-like creature positioned at a depth proportional to their net worth. The deeper you go, the darker it gets.

### 4.1 OceanMode (Scene Root)

#### File: `src/scene/ocean/OceanMode.tsx`

```tsx
import { useMemo } from 'react'
import { useAppStore } from '@/stores'
import { oceanDepth } from '@/utils/wealthMath'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { WealthCreature } from './WealthCreature'
import { WaterSurface } from './WaterSurface'
import { DepthMarker } from './DepthMarker'
import { CausticLights } from './CausticLights'
import { OrbitControls } from '@react-three/drei'

const DEPTH_MARKERS = [
  100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000,
]

export function OceanMode() {
  const billionaires = useAppStore((s) => s.billionaires)

  const creatures = useMemo(
    () =>
      billionaires.map((b, i) => {
        const depth = oceanDepth(b.networth)
        const industry = b.industry[0] ?? 'other'
        const colors = getIndustryColor(industry)
        // Spread creatures along X and Z
        const angle = (i / billionaires.length) * Math.PI * 2
        const spreadRadius = 6 + Math.random() * 4
        const x = Math.cos(angle) * spreadRadius
        const z = Math.sin(angle) * spreadRadius

        return { entry: b, depth, colors, x, z }
      }),
    [billionaires],
  )

  return (
    <>
      {/* Underwater color gradient via background and fog */}
      <color attach="background" args={['#001122']} />
      <fog attach="fog" args={['#000811', 5, 40]} />

      {/* Lighting */}
      <CausticLights />

      {/* Water surface */}
      <WaterSurface />

      {/* Depth markers */}
      {DEPTH_MARKERS.map((networth) => (
        <DepthMarker
          key={networth}
          depth={oceanDepth(networth)}
          label={`$${networth / 1000}B`}
        />
      ))}

      {/* Billionaire creatures */}
      {creatures.map(({ entry, depth, colors, x, z }) => (
        <WealthCreature
          key={entry.uri}
          name={entry.name}
          networth={entry.networth}
          position={[x, depth, z]}
          color={colors.primary}
          emissiveColor={colors.emissive}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        target={[0, -5, 0]}
        minDistance={3}
        maxDistance={40}
      />
    </>
  )
}
```

### 4.2 WealthCreature

#### File: `src/scene/ocean/WealthCreature.tsx`

A stylized bioluminescent jellyfish. The body is a sphere with `MeshPhysicalMaterial` transmission for translucency. Tentacles are simple cylinders that animate procedurally in `useFrame`. Size varies by net worth.

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import {
  SphereGeometry,
  CylinderGeometry,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  Color,
  Group,
  Mesh,
} from 'three'
import { formatWealth } from '@/utils/formatWealth'
import type { Vec3 } from '@/types'

interface WealthCreatureProps {
  name: string
  networth: number
  position: Vec3
  color: string
  emissiveColor: string
}

const TENTACLE_COUNT = 8

export function WealthCreature({
  name,
  networth,
  position,
  color,
  emissiveColor,
}: WealthCreatureProps) {
  const groupRef = useRef<Group>(null)
  const tentacleRefs = useRef<(Mesh | null)[]>([])

  // Size varies: larger net worth = larger creature
  const bodyRadius = useMemo(
    () => 0.3 + Math.log10(networth / 50_000) * 0.4,
    [networth],
  )

  const bodyGeometry = useMemo(
    () =>
      new SphereGeometry(bodyRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    [bodyRadius],
  )

  const bodyMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(color),
        emissive: new Color(emissiveColor),
        emissiveIntensity: 1.5,
        transmission: 0.6,
        roughness: 0.2,
        metalness: 0,
        thickness: 1,
        transparent: true,
        opacity: 0.7,
      }),
    [color, emissiveColor],
  )

  const tentacleGeometry = useMemo(
    () => new CylinderGeometry(0.02, 0.01, bodyRadius * 3, 4),
    [bodyRadius],
  )

  const tentacleMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity: 0.4,
      }),
    [color],
  )

  // Procedural tentacle animation + gentle bob
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime

    // Gentle floating bob
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3

    // Animate tentacles with sine wave sway
    tentacleRefs.current.forEach((tentacle, i) => {
      if (!tentacle) return
      const phase = (i / TENTACLE_COUNT) * Math.PI * 2
      tentacle.rotation.x = Math.sin(t * 0.8 + phase) * 0.3
      tentacle.rotation.z = Math.cos(t * 0.6 + phase) * 0.2
    })
  })

  // Generate tentacle positions around the body
  const tentaclePositions = useMemo(
    () =>
      Array.from({ length: TENTACLE_COUNT }, (_, i) => {
        const angle = (i / TENTACLE_COUNT) * Math.PI * 2
        const r = bodyRadius * 0.6
        return {
          x: Math.cos(angle) * r,
          z: Math.sin(angle) * r,
        }
      }),
    [bodyRadius],
  )

  return (
    <group ref={groupRef} position={position}>
      {/* Jellyfish bell (upper hemisphere) */}
      <mesh geometry={bodyGeometry} material={bodyMaterial} />

      {/* Inner glow point light */}
      <pointLight
        color={emissiveColor}
        intensity={0.8}
        distance={bodyRadius * 6}
        decay={2}
      />

      {/* Tentacles */}
      {tentaclePositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            tentacleRefs.current[i] = el
          }}
          geometry={tentacleGeometry}
          material={tentacleMaterial}
          position={[pos.x, -(bodyRadius * 1.5), pos.z]}
        />
      ))}

      {/* Name label */}
      <Billboard position={[0, bodyRadius + 0.6, 0]}>
        <Text
          fontSize={0.3}
          color="#e2e8f0"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {name}
        </Text>
        <Text
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="top"
          position={[0, -0.08, 0]}
        >
          {formatWealth(networth)}
        </Text>
      </Billboard>
    </group>
  )
}
```

### 4.3 WaterSurface

#### File: `src/scene/ocean/WaterSurface.tsx`

Animated plane at y=0 with semi-transparent blue material. Simple wave animation via vertex displacement in `useFrame`.

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, MeshPhysicalMaterial, Color, Mesh } from 'three'

export function WaterSurface() {
  const meshRef = useRef<Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(100, 100, 64, 64)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color('#0066aa'),
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.4,
        thickness: 0.5,
        side: 2, // DoubleSide
      }),
    [],
  )

  // Animate wave displacement
  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const positions = meshRef.current.geometry.attributes.position
    const t = clock.elapsedTime

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // Composite sine waves for natural-looking surface
      const y =
        Math.sin(x * 0.3 + t * 0.8) * 0.15 +
        Math.sin(z * 0.4 + t * 0.6) * 0.1 +
        Math.sin((x + z) * 0.2 + t * 1.2) * 0.08

      positions.setY(i, y)
    }

    positions.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[0, 0, 0]}
    />
  )
}
```

### 4.4 DepthMarker

#### File: `src/scene/ocean/DepthMarker.tsx`

Floating text at depth intervals. Markers get dimmer the deeper they are.

```tsx
import { useMemo } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { MathUtils } from 'three'

interface DepthMarkerProps {
  depth: number // Negative Y value
  label: string // e.g. "$100B"
}

export function DepthMarker({ depth, label }: DepthMarkerProps) {
  // Opacity decreases with depth (deeper = dimmer)
  const opacity = useMemo(() => {
    const absDepth = Math.abs(depth)
    return MathUtils.clamp(1 - absDepth / 20, 0.15, 0.9)
  }, [depth])

  return (
    <Billboard position={[-12, depth, 0]}>
      <Text
        fontSize={0.6}
        color="#4488cc"
        anchorX="left"
        anchorY="middle"
        fillOpacity={opacity}
        outlineWidth={0.01}
        outlineColor="#001122"
      >
        {label}
      </Text>
      {/* Horizontal depth line */}
      <mesh position={[3, 0, 0]}>
        <boxGeometry args={[20, 0.005, 0.005]} />
        <meshBasicMaterial
          color="#224466"
          transparent
          opacity={opacity * 0.3}
        />
      </mesh>
    </Billboard>
  )
}
```

### 4.5 CausticLights

#### File: `src/scene/ocean/CausticLights.tsx`

Lighting setup that simulates sunlight penetrating water from above. Includes a directional light (sun rays), volumetric spot lights (visible beams), and depth-attenuated ambient light.

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SpotLight } from 'three'

export function CausticLights() {
  const spotRef1 = useRef<SpotLight>(null)
  const spotRef2 = useRef<SpotLight>(null)

  // Animate light to simulate water caustic shimmer
  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (spotRef1.current) {
      spotRef1.current.position.x = Math.sin(t * 0.3) * 3
      spotRef1.current.position.z = Math.cos(t * 0.2) * 3
    }
    if (spotRef2.current) {
      spotRef2.current.position.x = Math.cos(t * 0.25) * 4
      spotRef2.current.position.z = Math.sin(t * 0.35) * 2
    }
  })

  return (
    <>
      {/* Sunlight from above -- primary directional */}
      <directionalLight position={[5, 15, 5]} intensity={0.8} color="#aaddff" />

      {/* Volumetric light cone 1 */}
      <spotLight
        ref={spotRef1}
        position={[2, 10, 0]}
        angle={0.3}
        penumbra={0.8}
        intensity={2}
        color="#88ccff"
        distance={25}
        decay={2}
        target-position={[0, -15, 0]}
      />

      {/* Volumetric light cone 2 */}
      <spotLight
        ref={spotRef2}
        position={[-3, 12, 2]}
        angle={0.25}
        penumbra={0.9}
        intensity={1.5}
        color="#66aadd"
        distance={20}
        decay={2}
        target-position={[0, -15, 0]}
      />

      {/* Very dim ambient -- darkness is the point */}
      <ambientLight intensity={0.05} color="#223344" />
    </>
  )
}
```

---

## 5. Timeline Mode

A time-travel corridor stretching along the Z-axis. Each cross-section is a point in time (monthly data from 2020-present). Billionaire wealth is shown as colored ribbon bands that expand and contract. The camera flies through the tunnel, and event cards appear at key moments.

### 5.1 TimelineMode (Scene Root)

#### File: `src/scene/timeline/TimelineMode.tsx`

```tsx
import { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useBillionaireTop10History } from '@/hooks/useBillionaireTop10History'
import { WealthBand } from './WealthBand'
import { TimeTunnel } from './TimeTunnel'
import { EventCard } from './EventCard'
import { DateMarker } from './DateMarker'
import { MathUtils, Vector3 } from 'three'

const Z_SCALE = 2 // Units per month
const SCROLL_SPEED = 0.3

/** Known notable events to highlight in the corridor */
const NOTABLE_EVENTS = [
  { date: '2020-03', label: 'COVID crash wipes $400B from top 10' },
  { date: '2021-01', label: "Musk becomes world's richest person" },
  { date: '2021-10', label: 'Combined top 10 wealth surpasses $1.5T' },
  { date: '2022-11', label: 'Crypto winter -- Zuckerberg drops from top 10' },
  { date: '2023-06', label: 'AI boom lifts tech billionaires' },
  { date: '2024-03', label: 'Musk surpasses $200B again' },
  { date: '2024-11', label: 'Zuckerberg re-enters top 3' },
  { date: '2025-01', label: 'Musk crosses $400B for the first time' },
]

export function TimelineMode() {
  const { data: history, isPending } = useBillionaireTop10History()
  const cameraZRef = useRef(0)
  const { camera } = useThree()

  // Compute total corridor length from data
  const totalMonths = history?.months.length ?? 0
  const corridorLength = totalMonths * Z_SCALE

  // Date strings for markers
  const dateLabels = useMemo(
    () =>
      (history?.months ?? []).map((month, i) => ({
        label: month,
        z: i * Z_SCALE,
      })),
    [history],
  )

  // Map events to Z positions
  const events = useMemo(() => {
    if (!history) return []
    return NOTABLE_EVENTS.map((event) => {
      const monthIndex = history.months.indexOf(event.date)
      return {
        ...event,
        z: monthIndex >= 0 ? monthIndex * Z_SCALE : -1,
      }
    }).filter((e) => e.z >= 0)
  }, [history])

  // Camera fly-through controlled by scroll/drag
  const handleWheel = useCallback(
    (deltaY: number) => {
      cameraZRef.current = MathUtils.clamp(
        cameraZRef.current + deltaY * SCROLL_SPEED * 0.01,
        0,
        corridorLength,
      )
    },
    [corridorLength],
  )

  // Register wheel listener
  useFrame(({ gl }) => {
    const canvas = gl.domElement

    // Update camera position along Z
    camera.position.lerp(new Vector3(0, 2, cameraZRef.current), 0.05)
    camera.lookAt(0, 2, cameraZRef.current + 10)

    // Wheel event forwarding (only bind once via effect in real impl)
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      handleWheel(e.deltaY)
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })

    return () => canvas.removeEventListener('wheel', onWheel)
  })

  if (isPending || !history) {
    return null
  }

  return (
    <>
      {/* Scene background */}
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 5, 60]} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <spotLight
        position={[0, 5, cameraZRef.current]}
        angle={0.5}
        penumbra={0.8}
        intensity={1}
        color="#ffffff"
        distance={30}
      />

      {/* Tunnel shell */}
      <TimeTunnel length={corridorLength} />

      {/* Date markers on the floor */}
      {dateLabels
        .filter((_, i) => i % 3 === 0) // Every 3 months to reduce clutter
        .map(({ label, z }) => (
          <DateMarker key={label} label={label} z={z} />
        ))}

      {/* Wealth bands -- one per billionaire */}
      {history.billionaires.map((billionaire, i) => (
        <WealthBand
          key={billionaire.uri}
          name={billionaire.name}
          color={billionaire.color}
          dataPoints={billionaire.dataPoints}
          bandIndex={i}
          totalBands={history.billionaires.length}
          zScale={Z_SCALE}
        />
      ))}

      {/* Event cards at notable moments */}
      {events.map((event) => (
        <EventCard
          key={event.date}
          label={event.label}
          date={event.date}
          z={event.z}
          cameraZ={cameraZRef.current}
        />
      ))}
    </>
  )
}
```

### 5.2 WealthBand

#### File: `src/scene/timeline/WealthBand.tsx`

Each billionaire is a colored ribbon stretching along Z. The band's width at each Z position represents their net worth at that month. Built with custom `BufferGeometry`.

```tsx
import { useMemo } from 'react'
import {
  BufferGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
  Color,
  DoubleSide,
} from 'three'

interface DataPoint {
  month: number // Index
  networth: number // In millions
}

interface WealthBandProps {
  name: string
  color: string
  dataPoints: DataPoint[]
  bandIndex: number
  totalBands: number
  zScale: number
}

const BAND_HEIGHT = 0.4
const MAX_BAND_WIDTH = 3
const MAX_NETWORTH_FOR_SCALE = 800_000 // ~$800B for full width

export function WealthBand({
  name,
  color,
  dataPoints,
  bandIndex,
  totalBands,
  zScale,
}: WealthBandProps) {
  // Vertical offset: bands stacked on top of each other
  const yOffset = bandIndex * (BAND_HEIGHT + 0.05)

  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    const vertices: number[] = []
    const indices: number[] = []

    dataPoints.forEach((point, i) => {
      const z = point.month * zScale
      const halfWidth =
        (point.networth / MAX_NETWORTH_FOR_SCALE) * (MAX_BAND_WIDTH / 2)

      // Bottom-left and bottom-right vertices for this cross-section
      const baseY = yOffset
      const topY = yOffset + BAND_HEIGHT

      // 4 vertices per cross-section: BL, BR, TL, TR
      const vi = i * 4
      vertices.push(
        -halfWidth,
        baseY,
        z, // BL
        halfWidth,
        baseY,
        z, // BR
        -halfWidth,
        topY,
        z, // TL
        halfWidth,
        topY,
        z, // TR
      )

      // Connect quads between this section and the next
      if (i > 0) {
        const prev = (i - 1) * 4
        const curr = vi

        // Bottom face
        indices.push(prev + 0, prev + 1, curr + 1)
        indices.push(prev + 0, curr + 1, curr + 0)

        // Top face
        indices.push(prev + 2, curr + 2, curr + 3)
        indices.push(prev + 2, curr + 3, prev + 3)

        // Left face
        indices.push(prev + 0, curr + 0, curr + 2)
        indices.push(prev + 0, curr + 2, prev + 2)

        // Right face
        indices.push(prev + 1, prev + 3, curr + 3)
        indices.push(prev + 1, curr + 3, curr + 1)
      }
    })

    geo.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    return geo
  }, [dataPoints, zScale, yOffset])

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity: 0.7,
        side: DoubleSide,
      }),
    [color],
  )

  return <mesh geometry={geometry} material={material} />
}
```

### 5.3 TimeTunnel

#### File: `src/scene/timeline/TimeTunnel.tsx`

The outer tunnel shell -- a large tube stretching along Z. Semi-transparent walls with date labels on the floor.

```tsx
import { useMemo } from 'react'
import {
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
  MeshBasicMaterial,
  BackSide,
} from 'three'

interface TimeTunnelProps {
  length: number
}

const TUNNEL_RADIUS = 8
const TUNNEL_SEGMENTS = 128

export function TimeTunnel({ length }: TimeTunnelProps) {
  const geometry = useMemo(() => {
    // Straight path along Z
    const path = new CatmullRomCurve3([
      new Vector3(0, 3, -5),
      new Vector3(0, 3, length + 5),
    ])

    return new TubeGeometry(path, TUNNEL_SEGMENTS, TUNNEL_RADIUS, 16, false)
  }, [length])

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: '#0a0a2e',
        transparent: true,
        opacity: 0.15,
        wireframe: true,
        side: BackSide,
      }),
    [],
  )

  return <mesh geometry={geometry} material={material} />
}
```

### 5.4 EventCard

#### File: `src/scene/timeline/EventCard.tsx`

Floating holographic cards at key moments in the timeline. Uses drei's `Html` component for DOM content that renders in 3D space. Cards become visible when the camera is within proximity.

```tsx
import { useMemo } from 'react'
import { Html } from '@react-three/drei'

interface EventCardProps {
  label: string
  date: string
  z: number
  cameraZ: number
}

const VISIBILITY_RANGE = 15 // Show when camera is within 15 units

export function EventCard({ label, date, z, cameraZ }: EventCardProps) {
  const distance = Math.abs(cameraZ - z)
  const isVisible = distance < VISIBILITY_RANGE

  // Opacity fades based on distance
  const opacity = useMemo(() => {
    if (!isVisible) return 0
    return Math.max(0, 1 - distance / VISIBILITY_RANGE)
  }, [isVisible, distance])

  if (!isVisible) return null

  return (
    <group position={[5, 4, z]}>
      <Html
        center
        distanceFactor={10}
        style={{
          opacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        <div
          className="glass-panel px-4 py-3 min-w-[220px]"
          style={{
            borderColor: 'rgba(0, 212, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.15)',
          }}
        >
          <p className="font-mono text-xs text-ws-accent mb-1">{date}</p>
          <p className="font-display text-sm text-ws-text-primary leading-tight">
            {label}
          </p>
        </div>
      </Html>
    </group>
  )
}
```

### 5.5 DateMarker

#### File: `src/scene/timeline/DateMarker.tsx`

Text markers along the tunnel floor at monthly intervals.

```tsx
import { Text } from '@react-three/drei'

interface DateMarkerProps {
  label: string // e.g. "2024-03"
  z: number
}

export function DateMarker({ label, z }: DateMarkerProps) {
  // Format "2024-03" -> "Mar 2024"
  const formatted = formatDateLabel(label)

  return (
    <group position={[0, 0.05, z]}>
      <Text
        fontSize={0.4}
        color="#334466"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {formatted}
      </Text>

      {/* Thin vertical line marker */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshBasicMaterial color="#1a2a44" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function formatDateLabel(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-')
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const monthIndex = parseInt(month, 10) - 1
  return `${months[monthIndex] ?? month} ${year}`
}
```

### 5.6 Timeline Data Hook

#### File: `src/hooks/useBillionaireTop10History.ts`

Fetches the `/stats/top10` endpoint and transforms monthly snapshots into timeline band data structures.

```tsx
import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { getIndustryColor } from '@/utils/colorByIndustry'

/** Raw shape from the RTB-API /stats/top10 endpoint */
interface Top10Snapshot {
  [date: string]: Array<{
    rank: number
    uri: string
    name: string
    networth: number
    industry?: string[]
  }>
}

/** Processed data point for a single month */
interface BandDataPoint {
  month: number // Index into the months array
  networth: number // In millions
}

/** Processed billionaire band for the timeline */
interface TimelineBillionaire {
  uri: string
  name: string
  color: string
  dataPoints: BandDataPoint[]
}

/** Full processed timeline data */
export interface TimelineData {
  months: string[] // Sorted date strings ["2020-01", "2020-02", ...]
  billionaires: TimelineBillionaire[] // One band per billionaire
}

/**
 * Fetches top 10 historical data and transforms it into
 * timeline band data for the TimelineMode visualization.
 */
export function useBillionaireTop10History() {
  return useQuery({
    queryKey: ['billionaires', 'top10'],
    queryFn: async (): Promise<TimelineData> => {
      const raw = await fetchJson<Top10Snapshot>(endpoints.top10)
      return transformTop10ToTimeline(raw)
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (historical data doesn't change)
  })
}

/**
 * Transform the raw /stats/top10 response into timeline band structures.
 *
 * The API returns an object keyed by date string, each containing
 * an array of the top 10 at that point. We need to:
 * 1. Sort the dates chronologically
 * 2. Collect all unique billionaires who ever appeared
 * 3. For each billionaire, create a data point array with their net worth at each month
 *    (0 if not in the top 10 that month)
 */
function transformTop10ToTimeline(raw: Top10Snapshot): TimelineData {
  // Sort date keys chronologically
  const months = Object.keys(raw).sort()

  // Collect all unique billionaires across all months
  const billionaireMap = new Map<
    string,
    { name: string; industry: string; dataPoints: BandDataPoint[] }
  >()

  months.forEach((date, monthIndex) => {
    const entries = raw[date]
    if (!entries) return

    entries.forEach((entry) => {
      if (!billionaireMap.has(entry.uri)) {
        billionaireMap.set(entry.uri, {
          name: entry.name,
          industry: entry.industry?.[0] ?? 'other',
          dataPoints: [],
        })
      }

      billionaireMap.get(entry.uri)!.dataPoints.push({
        month: monthIndex,
        networth: entry.networth,
      })
    })
  })

  // Convert to array, sorted by most recent net worth (descending)
  const billionaires: TimelineBillionaire[] = Array.from(
    billionaireMap.entries(),
  )
    .map(([uri, data]) => {
      const colors = getIndustryColor(data.industry)
      return {
        uri,
        name: data.name,
        color: colors.primary,
        dataPoints: data.dataPoints,
      }
    })
    .sort((a, b) => {
      const aLast = a.dataPoints[a.dataPoints.length - 1]?.networth ?? 0
      const bLast = b.dataPoints[b.dataPoints.length - 1]?.networth ?? 0
      return bLast - aLast
    })
    .slice(0, 10) // Keep top 10 most recent

  return { months, billionaires }
}
```

---

## 6. Transition System

### 6.1 Concept: Dimensional Collapse

When the user switches modes, the scene performs a "dimensional collapse" animation:

1. **Collapse** (0-0.8s): Current scene objects shrink to points and accelerate toward the center
2. **Vortex** (0.8-1.2s): Points swirl in a brief vortex at the origin
3. **Expand** (1.2-2.0s): New scene elements expand outward from the center into their final positions

Total transition time: **2 seconds**.

### 6.2 Implementation

The transition is orchestrated via `@react-spring/three` springs and coordinated through `sceneStore.isTransitioning`.

#### File: `src/scene/shared/ModeTransition.tsx`

```tsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpring, animated } from '@react-spring/three'
import { useAppStore } from '@/stores'
import { Group, MathUtils } from 'three'

interface ModeTransitionProps {
  children: React.ReactNode
}

/**
 * Wraps the active mode's scene content and applies the
 * dimensional collapse/expand transition when modes switch.
 *
 * Flow:
 * 1. sceneStore.setMode() sets isTransitioning = true
 * 2. This component animates scale 1 -> 0 (collapse)
 * 3. On collapse complete, the mode actually switches (children change)
 * 4. Animate scale 0 -> 1 (expand)
 * 5. Set isTransitioning = false
 */
export function ModeTransition({ children }: ModeTransitionProps) {
  const isTransitioning = useAppStore((s) => s.isTransitioning)
  const setTransitioning = useAppStore((s) => s.setTransitioning)
  const groupRef = useRef<Group>(null)
  const phaseRef = useRef<'idle' | 'collapsing' | 'expanding'>('idle')

  const [spring, springApi] = useSpring(() => ({
    scale: 1,
    rotationY: 0,
    config: { mass: 1, tension: 200, friction: 26 },
  }))

  useEffect(() => {
    if (isTransitioning && phaseRef.current === 'idle') {
      phaseRef.current = 'collapsing'

      // Phase 1: Collapse to zero with a spin
      springApi.start({
        scale: 0,
        rotationY: Math.PI * 2,
        config: { mass: 1, tension: 280, friction: 24 },
        onRest: () => {
          // Phase 2: Brief pause at zero, then expand
          phaseRef.current = 'expanding'

          springApi.start({
            scale: 1,
            rotationY: Math.PI * 4,
            config: { mass: 1.2, tension: 170, friction: 28 },
            onRest: () => {
              phaseRef.current = 'idle'
              setTransitioning(false)

              // Reset rotation accumulator
              springApi.set({ rotationY: 0 })
            },
          })
        },
      })
    }
  }, [isTransitioning, springApi, setTransitioning])

  return (
    <animated.group
      ref={groupRef}
      scale={spring.scale}
      rotation-y={spring.rotationY}
    >
      {children}
    </animated.group>
  )
}
```

### 6.3 Transition Timing Breakdown

| Phase    | Time       | Spring Config              | Effect                              |
| -------- | ---------- | -------------------------- | ----------------------------------- |
| Collapse | 0 - 0.8s   | tension: 280, friction: 24 | Scale 1 -> 0, rotate 360deg         |
| Expand   | 0.8 - 2.0s | tension: 170, friction: 28 | Scale 0 -> 1, rotate another 360deg |

The vortex effect is implicit: the rotation combined with the scale-to-zero creates the visual impression of objects spiraling into a point. The spring physics ensure the motion feels organic rather than mechanical.

### 6.4 Camera Reset During Transition

Each mode has a different optimal camera position. The camera resets are handled in the `SceneManager` (see section 7) by animating to the mode's default camera target during the expand phase.

| Mode     | Camera Position | Camera Target |
| -------- | --------------- | ------------- |
| Cosmos   | `[0, 15, 40]`   | `[0, 0, 0]`   |
| Towers   | `[0, 8, 25]`    | `[0, 8, 0]`   |
| Ocean    | `[0, 0, 15]`    | `[0, -5, 0]`  |
| Timeline | `[0, 2, 0]`     | `[0, 2, 10]`  |

---

## 7. Updated SceneManager

The `SceneManager` is significantly expanded from Phase 1. It now:

1. Routes between 4 modes using `React.lazy` + `Suspense` for code splitting
2. Only mounts the active mode's components (unmounts others)
3. Wraps the active mode in the `ModeTransition` component
4. Manages per-mode camera positions

### File: `src/scene/SceneManager.tsx` (updated)

```tsx
import { lazy, Suspense, useMemo } from 'react'
import { useAppStore } from '@/stores'
import { ModeTransition } from './shared/ModeTransition'
import type { VisualizationMode } from '@/types'

// Lazy-load non-default modes for code splitting
const CosmosMode = lazy(() =>
  import('@/scene/cosmos/CosmosMode').then((m) => ({ default: m.CosmosMode })),
)
const TowersMode = lazy(() =>
  import('@/scene/towers/TowersMode').then((m) => ({ default: m.TowersMode })),
)
const OceanMode = lazy(() =>
  import('@/scene/ocean/OceanMode').then((m) => ({ default: m.OceanMode })),
)
const TimelineMode = lazy(() =>
  import('@/scene/timeline/TimelineMode').then((m) => ({
    default: m.TimelineMode,
  })),
)

/** Map each mode to its lazy component */
const MODE_COMPONENTS: Record<
  VisualizationMode,
  React.LazyExoticComponent<React.ComponentType>
> = {
  cosmos: CosmosMode,
  towers: TowersMode,
  ocean: OceanMode,
  timeline: TimelineMode,
}

export function SceneManager() {
  const mode = useAppStore((s) => s.mode)

  // Resolve the active mode component
  const ActiveMode = useMemo(() => MODE_COMPONENTS[mode], [mode])

  return (
    <Suspense fallback={<SceneLoadingFallback />}>
      <ModeTransition>
        <ActiveMode />
      </ModeTransition>
    </Suspense>
  )
}

/**
 * Minimal 3D fallback while a mode chunk loads.
 * Shows a pulsing sphere at the origin.
 */
function SceneLoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#00d4ff" wireframe />
    </mesh>
  )
}
```

### Updated `src/App.tsx`

The App component is also updated to include the `ModeTabs` overlay alongside the Canvas:

```tsx
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  ToneMapping,
} from '@react-three/postprocessing'
import { SceneManager } from '@/scene/SceneManager'
import { ModeTabs } from '@/components/modeSwitcher/ModeTabs'
import { useBillionaireList } from '@/api/queries'
import { useAppStore } from '@/stores'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/utils/constants'
import { useEffect, useState } from 'react'

export default function App() {
  const {
    data: billionaires,
    isPending,
    isError,
    error,
  } = useBillionaireList(10)
  const setBillionaires = useAppStore((s) => s.setBillionaires)
  const [dpr, setDpr] = useState(2)

  // Sync API data into Zustand
  useEffect(() => {
    if (billionaires) {
      setBillionaires(billionaires)
    }
  }, [billionaires, setBillionaires])

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ws-bg">
        <p className="font-display text-xl text-ws-accent animate-pulse">
          Loading WealthScale...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ws-bg">
        <p className="font-display text-xl text-ws-negative">
          Error: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen">
      {/* 2D UI Overlay */}
      <ModeTabs />

      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: DEFAULT_CAMERA_FOV,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, dpr]}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a1a')
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(2)}
        >
          <AdaptiveDpr pixelated />

          {/* Scene routing */}
          <SceneManager />

          {/* Post-processing */}
          <EffectComposer>
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
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
```

### Key Architectural Decisions

1. **Only the active mode is mounted.** When the user switches from Cosmos to Towers, the Cosmos component tree fully unmounts. This ensures only one mode's 3D objects are in the scene graph at a time, keeping draw calls low.

2. **Lazy loading via `React.lazy`.** Towers, Ocean, and Timeline modes are separate webpack chunks. The Cosmos mode is the default and bundled with the main chunk. This keeps the initial load fast.

3. **Post-processing is shared.** The `EffectComposer` (Bloom, Vignette, etc.) stays mounted across all modes. Each mode's emissive materials interact with Bloom automatically.

4. **Data flows through Zustand.** Each mode reads `billionaires` from `useAppStore`. The Timeline mode additionally fetches historical data via its own hook. No data is passed as props through the SceneManager.

5. **Each mode owns its own camera controls.** The `OrbitControls` (or custom camera logic for Timeline) are defined inside each mode component, not shared. This allows each mode to have different constraints (e.g., Towers limits polar angle to prevent going underground).

---

## Acceptance Criteria

### Mode Switcher UI

- [ ] ModeTabs renders at top-center of viewport with glass panel styling
- [ ] 4 tabs visible: Cosmos (Globe icon), Towers (Building2 icon), Ocean (Waves icon), Timeline (Clock icon)
- [ ] Active tab text is accent blue, inactive tabs are secondary gray
- [ ] Underline glow slides between tabs with spring animation on mode switch
- [ ] Labels hidden on mobile (< 640px), only icons shown
- [ ] Tabs disabled during mode transitions (no rapid switching)
- [ ] Clicking a tab updates `sceneStore.mode`

### Dimensional Collapse Transition

- [ ] Switching modes triggers collapse animation (scene shrinks to point)
- [ ] Vortex spin visible during collapse
- [ ] New mode expands outward from center
- [ ] Total transition ~2 seconds with spring physics
- [ ] `isTransitioning` flag prevents interaction during animation
- [ ] Camera resets to mode-appropriate position after transition

### Towers Mode

- [ ] 10 towers visible, arranged in a line with 4-unit spacing
- [ ] Tower height logarithmically scaled from net worth
- [ ] Glass-effect material (transmission, low roughness)
- [ ] Industry color coding matches Cosmos mode
- [ ] Reflective ground plane with grid lines
- [ ] Atmospheric fog for depth
- [ ] Billboard name + net worth labels beside each tower
- [ ] Green energy particles flow up for positive daily change
- [ ] Red energy particles flow up for negative daily change
- [ ] Particle count proportional to change magnitude
- [ ] OrbitControls with street-level perspective (max polar angle prevents underground)

### Ocean Mode

- [ ] Underwater scene with dark blue/black color gradient
- [ ] Water surface at y=0 with animated wave displacement
- [ ] 10 jellyfish creatures at depths proportional to net worth
- [ ] Creatures have translucent body (MeshPhysicalMaterial with transmission)
- [ ] Bioluminescent glow (emissive + bloom interaction)
- [ ] Procedural tentacle animation (sine wave sway)
- [ ] Creature size varies by net worth
- [ ] Depth markers at intervals ("$100B", "$200B", etc.) getting dimmer with depth
- [ ] Caustic light rays from above with animated position
- [ ] Minimal ambient light (darkness increases with depth)
- [ ] Name + net worth labels on creatures

### Timeline Mode

- [ ] Tunnel/corridor visible along Z-axis
- [ ] Wealth bands (colored ribbons) for each billionaire
- [ ] Band width at each Z position = net worth at that month
- [ ] Date markers on tunnel floor (every 3 months to reduce clutter)
- [ ] Scroll/wheel controls camera Z position (fly through time)
- [ ] Event cards appear near notable moments when camera is within range
- [ ] Event cards use glass panel styling with DOM content (drei Html)
- [ ] Fog for depth along the corridor
- [ ] Spotlight follows camera position

### SceneManager & Code Splitting

- [ ] Only active mode's component tree is mounted
- [ ] Towers, Ocean, Timeline modes are lazy-loaded chunks
- [ ] Suspense fallback shows while chunk loads
- [ ] Post-processing shared across all modes
- [ ] No errors switching between all 4 modes in any order

### Performance

- [ ] Towers mode: < 50 draw calls
- [ ] Ocean mode: < 50 draw calls
- [ ] Timeline mode: < 50 draw calls
- [ ] Transitions maintain > 30fps
- [ ] No memory leaks when switching modes (geometries/materials disposed on unmount)

---

## Complete File List

### New Files (18)

| #   | File                                       | Purpose                                              |
| --- | ------------------------------------------ | ---------------------------------------------------- |
| 1   | `src/components/modeSwitcher/ModeTabs.tsx` | Floating mode switcher tab bar with spring underline |
| 2   | `src/scene/shared/ModeTransition.tsx`      | Dimensional collapse/expand transition wrapper       |
| 3   | `src/scene/towers/TowersMode.tsx`          | Towers mode scene root                               |
| 4   | `src/scene/towers/WealthTower.tsx`         | Glass skyscraper per billionaire                     |
| 5   | `src/scene/towers/TowerLabel.tsx`          | Billboard name + net worth labels                    |
| 6   | `src/scene/towers/GroundPlane.tsx`         | Reflective surface + grid                            |
| 7   | `src/scene/towers/EnergyParticles.tsx`     | Per-tower gain/loss particle system                  |
| 8   | `src/scene/ocean/OceanMode.tsx`            | Ocean mode scene root                                |
| 9   | `src/scene/ocean/WealthCreature.tsx`       | Bioluminescent jellyfish per billionaire             |
| 10  | `src/scene/ocean/WaterSurface.tsx`         | Animated wave surface at y=0                         |
| 11  | `src/scene/ocean/DepthMarker.tsx`          | Depth interval labels                                |
| 12  | `src/scene/ocean/CausticLights.tsx`        | Underwater lighting setup                            |
| 13  | `src/scene/timeline/TimelineMode.tsx`      | Timeline mode scene root                             |
| 14  | `src/scene/timeline/WealthBand.tsx`        | Custom BufferGeometry wealth ribbons                 |
| 15  | `src/scene/timeline/TimeTunnel.tsx`        | Tube corridor shell                                  |
| 16  | `src/scene/timeline/EventCard.tsx`         | Holographic event cards (drei Html)                  |
| 17  | `src/scene/timeline/DateMarker.tsx`        | Floor date labels                                    |
| 18  | `src/hooks/useBillionaireTop10History.ts`  | Timeline data fetching + transformation              |

### Modified Files (3)

| #   | File                              | Changes                                                                                          |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | `src/scene/SceneManager.tsx`      | Full rewrite: lazy mode routing, ModeTransition wrapper, loading fallback                        |
| 2   | `src/App.tsx`                     | Add ModeTabs overlay, shared post-processing, PerformanceMonitor                                 |
| 3   | `src/scene/cosmos/CosmosMode.tsx` | Extract from old SceneManager into standalone mode (owns its own lighting, background, controls) |

### File Tree

```
src/
├── components/
│   └── modeSwitcher/
│       └── ModeTabs.tsx                    # NEW
├── hooks/
│   └── useBillionaireTop10History.ts       # NEW
├── scene/
│   ├── SceneManager.tsx                    # MODIFIED
│   ├── shared/
│   │   └── ModeTransition.tsx              # NEW
│   ├── cosmos/
│   │   └── CosmosMode.tsx                  # MODIFIED (extracted)
│   ├── towers/
│   │   ├── TowersMode.tsx                  # NEW
│   │   ├── WealthTower.tsx                 # NEW
│   │   ├── TowerLabel.tsx                  # NEW
│   │   ├── GroundPlane.tsx                 # NEW
│   │   └── EnergyParticles.tsx             # NEW
│   ├── ocean/
│   │   ├── OceanMode.tsx                   # NEW
│   │   ├── WealthCreature.tsx              # NEW
│   │   ├── WaterSurface.tsx                # NEW
│   │   ├── DepthMarker.tsx                 # NEW
│   │   └── CausticLights.tsx               # NEW
│   └── timeline/
│       ├── TimelineMode.tsx                # NEW
│       ├── WealthBand.tsx                  # NEW
│       ├── TimeTunnel.tsx                  # NEW
│       ├── EventCard.tsx                   # NEW
│       └── DateMarker.tsx                  # NEW
└── App.tsx                                 # MODIFIED
```

---

_Document authored for WealthScale Phase 4. Last updated: February 2026._
