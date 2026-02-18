# Phase 2: Full Cosmos Mode

> **Goal**: All 10 billionaires orbiting the WealthSun, orbit rings, hover/click interactions, camera fly-to, detail panel, leaderboard sidebar, and post-processing.
> **Deliverable**: A fully explorable Cosmos mode — orbit, click, inspect all 10 billionaires with cinematic camera, glass UI panels, and bloom effects.

---

## Table of Contents

1. [Prerequisites & Current State](#1-prerequisites--current-state)
2. [Step 1: Install Additional Dependencies](#step-1-install-additional-dependencies)
3. [Step 2: Sun Shader](#step-2-sun-shader)
4. [Step 3: WealthSun Component](#step-3-wealthsun-component)
5. [Step 4: OrbitRing Component](#step-4-orbitring-component)
6. [Step 5: Enhanced BillionairePlanet](#step-5-enhanced-billionaireplanet)
7. [Step 6: CameraController](#step-6-cameracontroller)
8. [Step 7: PostProcessing](#step-7-postprocessing)
9. [Step 8: CosmosMode Root](#step-8-cosmosmode-root)
10. [Step 9: DetailPanel](#step-9-detailpanel)
11. [Step 10: LeaderboardRow](#step-10-leaderboardrow)
12. [Step 11: LeaderboardSidebar](#step-11-leaderboardsidebar)
13. [Step 12: Updated SceneManager](#step-12-updated-scenemanager)
14. [Step 13: Updated App.tsx](#step-13-updated-apptsx)
15. [Acceptance Criteria](#acceptance-criteria)
16. [Files Created/Modified](#files-createdmodified)

---

## 1. Prerequisites & Current State

### Completed in Phase 1

- [x] Vite 7 + React 19 + TypeScript 5.9 scaffolded
- [x] Tailwind CSS v4, shadcn/ui, all 3D dependencies installed
- [x] Path alias `@/` configured
- [x] Fonts installed (Space Grotesk, Inter, JetBrains Mono)
- [x] `src/index.css` with WealthScale design tokens and glass-panel utility
- [x] TypeScript types (`src/types/index.ts`)
- [x] API client, endpoints, Zod schemas, transformers
- [x] TanStack Query hooks (`useBillionaireList`, `useBillionaireProfile`)
- [x] Zustand stores (billionaire, scene, user slices)
- [x] Utility functions (constants, colorByIndustry, formatWealth, wealthMath)
- [x] Basic `BillionairePlanet` with orbit, label, click handler
- [x] `CosmosLighting`, `SpaceBackground`, `SceneManager` with OrbitControls
- [x] `App.tsx` with Canvas shell and data pipeline

### Phase 2 Scope

- [ ] Custom sun shader with animated plasma effect
- [ ] WealthSun with corona sparkles and bloom trigger
- [ ] OrbitRing per billionaire
- [ ] Enhanced BillionairePlanet with hover spring animation + Zustand dispatch
- [ ] CameraController with spring-physics fly-to
- [ ] PostProcessing pipeline (Bloom, Vignette, ChromaticAberration)
- [ ] CosmosMode root component
- [ ] DetailPanel (glass overlay, profile data, motion slide-in)
- [ ] LeaderboardSidebar + LeaderboardRow
- [ ] Updated SceneManager routing to CosmosMode
- [ ] Updated App.tsx with 2D overlay layer and AnimatePresence

---

## Step 1: Install Additional Dependencies

shadcn/ui components needed for the detail panel and leaderboard:

```bash
pnpm dlx shadcn@latest add badge separator scroll-area avatar
```

No additional npm packages are needed — `@react-three/postprocessing`, `@react-spring/three`, `motion`, and `lucide-react` are already installed from Phase 1.

---

## Step 2: Sun Shader

### File: `src/scene/cosmos/shaders/sunShader.ts`

A custom GLSL shader that produces an animated plasma effect. The vertex shader passes UV coordinates and a time uniform; the fragment shader layers multiple `sin`/`cos` distortions to create swirling, fiery plasma.

```typescript
export const sunVertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Subtle vertex displacement for organic pulsing
    float displacement = sin(position.x * 4.0 + uTime * 2.0)
                       * sin(position.y * 4.0 + uTime * 1.5)
                       * sin(position.z * 4.0 + uTime * 1.8)
                       * 0.05;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

export const sunFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simplex-style noise hash
  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Gradient noise
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
            dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
        mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
            dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x),
        u.y
      ),
      mix(
        mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
            dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
        mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
            dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x),
        u.y
      ),
      u.z
    );
  }

  // Fractal Brownian Motion (3 octaves)
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 3; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    // Spherical UV with time-based animation
    vec3 pos = vPosition * 0.5 + vec3(uTime * 0.15, uTime * 0.1, uTime * 0.12);

    // Layered noise for plasma effect
    float n1 = fbm(pos * 2.0);
    float n2 = fbm(pos * 4.0 + vec3(5.2, 1.3, 2.8));
    float n3 = fbm(pos * 8.0 + vec3(n1, n2, uTime * 0.05));

    float plasma = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    plasma = plasma * 0.5 + 0.5; // Remap to 0-1

    // Solar color gradient: deep orange core -> bright yellow -> white hot
    vec3 colorDeep = vec3(0.8, 0.2, 0.0);    // Deep orange/red
    vec3 colorMid = vec3(1.0, 0.6, 0.1);     // Bright orange
    vec3 colorHot = vec3(1.0, 0.95, 0.7);    // White-hot yellow

    vec3 color = mix(colorDeep, colorMid, smoothstep(0.2, 0.5, plasma));
    color = mix(color, colorHot, smoothstep(0.6, 0.9, plasma));

    // Fresnel edge glow for corona feel
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    color += vec3(1.0, 0.7, 0.3) * fresnel * 0.5;

    // Apply emissive intensity to trigger bloom
    color *= uIntensity;

    gl_FragColor = vec4(color, 1.0);
  }
`
```

---

## Step 3: WealthSun Component

### File: `src/scene/cosmos/WealthSun.tsx`

The central sun representing combined wealth of the top 10. Uses the custom shader from Step 2, pulsing scale animation, and a `Sparkles` corona.

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import {
  ShaderMaterial,
  SphereGeometry,
  AdditiveBlending,
  FrontSide,
} from 'three'
import type { Mesh } from 'three'
import { SUN_RADIUS, SUN_SEGMENTS } from '@/utils/constants'
import { sunVertexShader, sunFragmentShader } from './shaders/sunShader'

export function WealthSun() {
  const meshRef = useRef<Mesh>(null)

  const geometry = useMemo(
    () => new SphereGeometry(SUN_RADIUS, SUN_SEGMENTS, SUN_SEGMENTS),
    [],
  )

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 3.0 },
        },
        transparent: false,
        side: FrontSide,
      }),
    [],
  )

  // Animate time uniform + pulsing scale
  useFrame((state) => {
    if (!meshRef.current) return

    const elapsed = state.clock.getElapsedTime()

    // Update shader time
    material.uniforms.uTime.value = elapsed

    // Pulsing scale: sin(time) * 0.02 offset around 1.0
    const pulse = 1.0 + Math.sin(elapsed) * 0.02
    meshRef.current.scale.setScalar(pulse)
  })

  return (
    <group>
      {/* Sun mesh */}
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Inner glow sphere (additive blending for bloom trigger) */}
      <mesh>
        <sphereGeometry args={[SUN_RADIUS * 1.02, 32, 32]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.15}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Corona particle system */}
      <Sparkles
        count={200}
        size={8}
        scale={[SUN_RADIUS * 3, SUN_RADIUS * 3, SUN_RADIUS * 3]}
        speed={0.4}
        opacity={0.6}
        color="#FFD700"
      />

      {/* Outer corona sparkles (wider, dimmer) */}
      <Sparkles
        count={100}
        size={4}
        scale={[SUN_RADIUS * 5, SUN_RADIUS * 5, SUN_RADIUS * 5]}
        speed={0.2}
        opacity={0.3}
        color="#FF8C00"
      />

      {/* Point light emanating from the sun */}
      <pointLight intensity={3} color="#FFE4B5" distance={200} decay={2} />
    </group>
  )
}
```

---

## Step 4: OrbitRing Component

### File: `src/scene/cosmos/OrbitRing.tsx`

A transparent ring at each billionaire's orbit radius, tinted to match their planet color at 30% brightness.

```tsx
import { useMemo } from 'react'
import { RingGeometry, MeshBasicMaterial, Color, DoubleSide } from 'three'

interface OrbitRingProps {
  radius: number
  color: string
}

export function OrbitRing({ radius, color }: OrbitRingProps) {
  const geometry = useMemo(
    () => new RingGeometry(radius - 0.02, radius + 0.02, 128),
    [radius],
  )

  const material = useMemo(() => {
    // 30% brightness of the planet color
    const ringColor = new Color(color).multiplyScalar(0.3)
    return new MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.15,
      side: DoubleSide,
      depthWrite: false,
    })
  }, [color])

  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
}
```

---

## Step 5: Enhanced BillionairePlanet

### File: `src/scene/cosmos/BillionairePlanet.tsx` (replace Phase 1 version)

Adds hover state with 10% grow via `@react-spring/three`, name/net-worth label fade on hover, and click dispatches `selectBillionaire` to Zustand.

```tsx
import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Billboard } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { SphereGeometry, MeshPhysicalMaterial, Color } from 'three'
import type { Mesh, Group } from 'three'
import type { PlanetConfig } from '@/types'
import { useAppStore } from '@/stores'
import { formatWealth } from '@/utils/formatWealth'

interface BillionairePlanetProps {
  config: PlanetConfig
}

export function BillionairePlanet({ config }: BillionairePlanetProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const orbitAngleRef = useRef(Math.random() * Math.PI * 2)

  const [hovered, setHovered] = useState(false)

  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  const isSelected = selectedUri === config.uri

  // Spring animation for hover scale (10% grow)
  const { scale } = useSpring({
    scale: hovered || isSelected ? 1.1 : 1.0,
    config: { mass: 1, tension: 200, friction: 20 },
  })

  // Spring animation for label opacity on hover
  const { labelOpacity } = useSpring({
    labelOpacity: hovered || isSelected ? 1 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  const geometry = useMemo(
    () => new SphereGeometry(config.radius, 32, 32),
    [config.radius],
  )

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(config.color),
        emissive: new Color(config.emissiveColor),
        emissiveIntensity: 0.15,
        roughness: 0.3,
        metalness: 0.7,
      }),
    [config.color, config.emissiveColor],
  )

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setHovered(true)
      document.body.style.cursor = 'pointer'
    },
    [],
  )

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      selectBillionaire(config.uri)
    },
    [selectBillionaire, config.uri],
  )

  // Animate orbit + self-rotation
  useFrame((_, delta) => {
    if (!groupRef.current) return

    orbitAngleRef.current += config.orbitSpeed * delta * 60
    const angle = orbitAngleRef.current

    groupRef.current.position.x = Math.cos(angle) * config.orbitRadius
    groupRef.current.position.z = Math.sin(angle) * config.orbitRadius

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
        <animated.mesh
          ref={meshRef}
          geometry={geometry}
          material={material}
          scale={scale}
          rotation={[0, 0, (config.tilt * Math.PI) / 180]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />

        {/* Name + net worth label (fades in on hover) */}
        <Billboard position={[0, config.radius + 0.8, 0]}>
          <animated.group
            // @ts-expect-error -- react-spring animated supports opacity via material
            position-y={0}
          >
            <Text
              fontSize={0.5}
              color="#e2e8f0"
              anchorX="center"
              anchorY="bottom"
              outlineWidth={0.02}
              outlineColor="#000000"
              fillOpacity={labelOpacity.get()}
            >
              {config.name}
            </Text>
            <Text
              fontSize={0.3}
              color={config.color}
              anchorX="center"
              anchorY="top"
              position={[0, -0.15, 0]}
              fillOpacity={labelOpacity.get()}
            >
              {formatWealth(config.networth)}
            </Text>
          </animated.group>
        </Billboard>
      </Float>
    </group>
  )
}
```

> **Note on label opacity**: The `fillOpacity` prop on drei `<Text>` controls text transparency. We read `labelOpacity.get()` inside the render so the spring value is consumed. For a fully reactive approach, you could wrap `<Text>` in a component that subscribes to the spring via `useFrame`, but this approach is simpler and sufficient since hovering triggers a React re-render anyway.

---

## Step 6: CameraController

### File: `src/scene/shared/CameraController.tsx`

Uses `@react-spring/three` to smoothly fly the camera to a selected planet's position. When a billionaire is selected, the camera animates to a nearby viewing position. Double-clicking empty space resets to the default overview.

```tsx
import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Vector3 } from 'three'
import { useAppStore } from '@/stores'
import { DEFAULT_CAMERA_POSITION } from '@/utils/constants'

interface CameraControllerProps {
  /** Ref to the OrbitControls instance so we can update its target */
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  /** Map of uri -> current world position (updated each frame by planets) */
  planetPositions: React.RefObject<Map<string, [number, number, number]>>
}

export function CameraController({
  controlsRef,
  planetPositions,
}: CameraControllerProps) {
  const { camera } = useThree()
  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  const isAnimatingRef = useRef(false)

  // Calculate target camera position: offset from planet so we look at it
  const getTargetPosition = useCallback(
    (uri: string): [number, number, number] => {
      const pos = planetPositions.current?.get(uri)
      if (!pos) return DEFAULT_CAMERA_POSITION

      // Position camera above and slightly behind the planet
      const [px, py, pz] = pos
      const dist = Math.sqrt(px * px + pz * pz)
      const dirX = dist > 0 ? px / dist : 0
      const dirZ = dist > 0 ? pz / dist : 0

      return [px + dirX * 6, py + 4, pz + dirZ * 6]
    },
    [planetPositions],
  )

  // Spring for camera position
  const [springValues, springApi] = useSpring(() => ({
    pos: DEFAULT_CAMERA_POSITION as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
    config: { mass: 1, tension: 170, friction: 26 },
    onChange: () => {
      isAnimatingRef.current = true
    },
    onRest: () => {
      isAnimatingRef.current = false
    },
  }))

  // React to selection changes
  useEffect(() => {
    if (selectedUri) {
      const camPos = getTargetPosition(selectedUri)
      const planetPos = planetPositions.current?.get(selectedUri) ?? [0, 0, 0]

      springApi.start({
        pos: camPos,
        target: planetPos as [number, number, number],
      })
    } else {
      // Reset to overview
      springApi.start({
        pos: DEFAULT_CAMERA_POSITION as [number, number, number],
        target: [0, 0, 0] as [number, number, number],
      })
    }
  }, [selectedUri, springApi, getTargetPosition, planetPositions])

  // Apply spring values to camera each frame
  useFrame(() => {
    if (!isAnimatingRef.current) return

    const pos = springValues.pos.get()
    const target = springValues.target.get()

    camera.position.set(pos[0], pos[1], pos[2])
    camera.lookAt(target[0], target[1], target[2])

    // Update OrbitControls target to match
    if (controlsRef.current) {
      controlsRef.current.target.set(target[0], target[1], target[2])
      controlsRef.current.update()
    }
  })

  // Double-click empty space to deselect
  const handleDoubleClick = useCallback(() => {
    if (selectedUri) {
      selectBillionaire(null)
    }
  }, [selectedUri, selectBillionaire])

  return (
    <mesh visible={false} onDoubleClick={handleDoubleClick}>
      {/* Invisible large sphere to capture double-click on "empty space" */}
      <sphereGeometry args={[500, 8, 8]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}
```

---

## Step 7: PostProcessing

### File: `src/scene/shared/PostProcessing.tsx`

Composes Bloom, Vignette, and ChromaticAberration effects from `@react-three/postprocessing`.

```tsx
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

const chromaticOffset = new Vector2(0.0005, 0.0005)

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.8}
        luminanceSmoothing={0.9}
        intensity={0.8}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={chromaticOffset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  )
}
```

---

## Step 8: CosmosMode Root

### File: `src/scene/cosmos/CosmosMode.tsx`

The mode root that composes the WealthSun, all BillionairePlanets with orbit rings, CameraController, and PostProcessing. It also maintains a ref-based map of planet world positions so the CameraController can fly to them.

```tsx
import { useRef, useCallback } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { PlanetConfig } from '@/types'
import { useAppStore } from '@/stores'
import { WealthSun } from './WealthSun'
import { BillionairePlanet } from './BillionairePlanet'
import { OrbitRing } from './OrbitRing'
import { CameraController } from '@/scene/shared/CameraController'
import { PostProcessing } from '@/scene/shared/PostProcessing'

interface CosmosModeProps {
  planets: PlanetConfig[]
}

export function CosmosMode({ planets }: CosmosModeProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const planetPositionsRef = useRef<Map<string, [number, number, number]>>(
    new Map(),
  )

  const showOrbits = useAppStore((s) => s.showOrbits)

  return (
    <>
      {/* Central sun */}
      <WealthSun />

      {/* Orbit rings */}
      {showOrbits &&
        planets.map((config) => (
          <OrbitRing
            key={`orbit-${config.uri}`}
            radius={config.orbitRadius}
            color={config.color}
          />
        ))}

      {/* Billionaire planets */}
      {planets.map((config) => (
        <BillionairePlanet key={config.uri} config={config} />
      ))}

      {/* Camera fly-to controller */}
      <CameraController
        controlsRef={controlsRef}
        planetPositions={planetPositionsRef}
      />

      {/* Post-processing effects */}
      <PostProcessing />

      {/* Orbit controls (user can still manually orbit/zoom) */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
      />
    </>
  )
}
```

### Wiring Planet Positions into CameraController

The `CameraController` needs to know each planet's current world position so it can fly the camera there. Since planets orbit in `useFrame`, their positions change every frame. We update the shared `planetPositionsRef` map from each `BillionairePlanet`.

**Update `BillionairePlanet`** to accept and write to a positions map. Add this prop and write in `useFrame`:

In `CosmosMode`, pass the ref down:

```tsx
{
  planets.map((config) => (
    <BillionairePlanet
      key={config.uri}
      config={config}
      planetPositions={planetPositionsRef}
    />
  ))
}
```

In `BillionairePlanet`, accept and use it:

```tsx
interface BillionairePlanetProps {
  config: PlanetConfig
  planetPositions?: React.RefObject<Map<string, [number, number, number]>>
}
```

Add this line inside the existing `useFrame` callback (after updating position):

```tsx
useFrame((_, delta) => {
  if (!groupRef.current) return

  orbitAngleRef.current += config.orbitSpeed * delta * 60
  const angle = orbitAngleRef.current

  const x = Math.cos(angle) * config.orbitRadius
  const z = Math.sin(angle) * config.orbitRadius

  groupRef.current.position.x = x
  groupRef.current.position.z = z

  // Report position to CameraController
  planetPositions?.current?.set(config.uri, [x, 0, z])

  if (meshRef.current) {
    meshRef.current.rotation.y += delta * 0.2
  }
})
```

Here is the **complete final version** of `BillionairePlanet.tsx` with positions reporting:

```tsx
import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Billboard } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { SphereGeometry, MeshPhysicalMaterial, Color } from 'three'
import type { Mesh, Group } from 'three'
import type { PlanetConfig } from '@/types'
import { useAppStore } from '@/stores'
import { formatWealth } from '@/utils/formatWealth'

interface BillionairePlanetProps {
  config: PlanetConfig
  planetPositions?: React.RefObject<Map<string, [number, number, number]>>
}

export function BillionairePlanet({
  config,
  planetPositions,
}: BillionairePlanetProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const orbitAngleRef = useRef(Math.random() * Math.PI * 2)

  const [hovered, setHovered] = useState(false)

  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  const isSelected = selectedUri === config.uri

  // Spring animation for hover scale (10% grow)
  const { scale } = useSpring({
    scale: hovered || isSelected ? 1.1 : 1.0,
    config: { mass: 1, tension: 200, friction: 20 },
  })

  // Spring animation for label opacity on hover
  const { labelOpacity } = useSpring({
    labelOpacity: hovered || isSelected ? 1 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  })

  const geometry = useMemo(
    () => new SphereGeometry(config.radius, 32, 32),
    [config.radius],
  )

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color(config.color),
        emissive: new Color(config.emissiveColor),
        emissiveIntensity: 0.15,
        roughness: 0.3,
        metalness: 0.7,
      }),
    [config.color, config.emissiveColor],
  )

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setHovered(true)
      document.body.style.cursor = 'pointer'
    },
    [],
  )

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      selectBillionaire(config.uri)
    },
    [selectBillionaire, config.uri],
  )

  // Animate orbit + self-rotation + report position
  useFrame((_, delta) => {
    if (!groupRef.current) return

    orbitAngleRef.current += config.orbitSpeed * delta * 60
    const angle = orbitAngleRef.current

    const x = Math.cos(angle) * config.orbitRadius
    const z = Math.sin(angle) * config.orbitRadius

    groupRef.current.position.x = x
    groupRef.current.position.z = z

    // Report position to CameraController
    planetPositions?.current?.set(config.uri, [x, 0, z])

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
        <animated.mesh
          ref={meshRef}
          geometry={geometry}
          material={material}
          scale={scale}
          rotation={[0, 0, (config.tilt * Math.PI) / 180]}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />

        {/* Name + net worth label (fades in on hover/select) */}
        <Billboard position={[0, config.radius + 0.8, 0]}>
          <Text
            fontSize={0.5}
            color="#e2e8f0"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000000"
            fillOpacity={labelOpacity.get()}
          >
            {config.name}
          </Text>
          <Text
            fontSize={0.3}
            color={config.color}
            anchorX="center"
            anchorY="top"
            position={[0, -0.15, 0]}
            fillOpacity={labelOpacity.get()}
          >
            {formatWealth(config.networth)}
          </Text>
        </Billboard>
      </Float>
    </group>
  )
}
```

---

## Step 9: DetailPanel

### File: `src/components/detail/DetailPanel.tsx`

A 2D glass overlay that slides in from the right when a billionaire is selected. Uses `motion/react` for spring animation, `useBillionaireProfile` for lazy data fetching, and glass-panel styling.

```tsx
import { motion } from 'motion/react'
import { X, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/stores'
import { useBillionaireProfile } from '@/api/queries'
import { formatWealth } from '@/utils/formatWealth'
import { getIndustryColor } from '@/utils/colorByIndustry'

export function DetailPanel() {
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  const { data: profile, isPending } = useBillionaireProfile(selectedUri)

  // Find list entry for net worth, change, rank
  const listEntry = billionaires.find((b) => b.uri === selectedUri)

  if (!listEntry) return null

  const industry = listEntry.industry[0] ?? 'other'
  const industryColor = getIndustryColor(industry)
  const dailyChange = listEntry.change
  const isPositive = dailyChange !== null && dailyChange >= 0

  // Country code to flag emoji
  const countryFlag = listEntry.citizenship
    ? listEntry.citizenship
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
        .join('')
    : ''

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="glass-panel fixed right-4 top-4 bottom-4 w-80 z-50 flex flex-col overflow-hidden"
    >
      {/* Close button */}
      <button
        onClick={() => selectBillionaire(null)}
        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-ws-glass-hover transition-colors z-10"
        aria-label="Close detail panel"
      >
        <X className="w-4 h-4 text-ws-text-secondary" />
      </button>

      <ScrollArea className="flex-1 p-5">
        {/* Profile photo */}
        {profile?.image && (
          <div className="flex justify-center mb-4">
            <img
              src={profile.image}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2"
              style={{ borderColor: industryColor.primary }}
            />
          </div>
        )}

        {isPending && !profile && (
          <div className="flex justify-center mb-4">
            <div
              className="w-24 h-24 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--ws-glass-hover)' }}
            />
          </div>
        )}

        {/* Name */}
        <h2 className="font-display text-xl text-center text-ws-text-primary mb-1">
          {listEntry.name}
        </h2>

        {/* Age + country */}
        <p className="text-sm text-center text-ws-text-secondary mb-4">
          {profile?.birthDate && (
            <span>
              Age {listEntry.age}
              {' \u00B7 '}
            </span>
          )}
          {countryFlag && <span>{countryFlag} </span>}
          {listEntry.citizenship?.toUpperCase()}
        </p>

        <Separator className="mb-4 bg-ws-border" />

        {/* Net worth with accent color */}
        <div className="text-center mb-4">
          <p className="text-xs text-ws-text-secondary uppercase tracking-wider mb-1">
            Net Worth
          </p>
          <p
            className="font-mono text-3xl font-bold"
            style={{ color: industryColor.primary }}
          >
            {formatWealth(listEntry.networth)}
          </p>
        </div>

        {/* Daily change */}
        {dailyChange !== null && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-ws-positive" />
            ) : (
              <TrendingDown className="w-4 h-4 text-ws-negative" />
            )}
            <span
              className={`font-mono text-sm ${
                isPositive ? 'text-ws-positive' : 'text-ws-negative'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatWealth(Math.abs(dailyChange))}
            </span>
            <span className="text-xs text-ws-text-secondary">today</span>
          </div>
        )}

        <Separator className="mb-4 bg-ws-border" />

        {/* Wealth sources as colored chips */}
        <div className="mb-4">
          <p className="text-xs text-ws-text-secondary uppercase tracking-wider mb-2">
            Sources of Wealth
          </p>
          <div className="flex flex-wrap gap-1.5">
            {listEntry.source.map((src) => (
              <Badge
                key={src}
                variant="outline"
                className="text-xs border-ws-border"
                style={{
                  color: industryColor.primary,
                  borderColor: `${industryColor.primary}33`,
                  backgroundColor: `${industryColor.primary}11`,
                }}
              >
                {src}
              </Badge>
            ))}
          </div>
        </div>

        {/* Industry badges */}
        <div className="mb-4">
          <p className="text-xs text-ws-text-secondary uppercase tracking-wider mb-2">
            Industry
          </p>
          <div className="flex flex-wrap gap-1.5">
            {listEntry.industry.map((ind) => {
              const color = getIndustryColor(ind)
              return (
                <Badge
                  key={ind}
                  variant="outline"
                  className="text-xs border-ws-border capitalize"
                  style={{
                    color: color.primary,
                    borderColor: `${color.primary}33`,
                    backgroundColor: `${color.primary}11`,
                  }}
                >
                  {ind}
                </Badge>
              )
            })}
          </div>
        </div>

        <Separator className="mb-4 bg-ws-border" />

        {/* Profile details from lazy-fetched data */}
        {profile && (
          <div className="space-y-3 text-sm">
            {profile.organization.name && (
              <div>
                <p className="text-xs text-ws-text-secondary uppercase tracking-wider">
                  Organization
                </p>
                <p className="text-ws-text-primary">
                  {profile.organization.title} at {profile.organization.name}
                </p>
              </div>
            )}

            {profile.residence.city && (
              <div>
                <p className="text-xs text-ws-text-secondary uppercase tracking-wider">
                  Residence
                </p>
                <p className="text-ws-text-primary">
                  {[
                    profile.residence.city,
                    profile.residence.state,
                    profile.residence.country,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

            {profile.education.length > 0 && (
              <div>
                <p className="text-xs text-ws-text-secondary uppercase tracking-wider">
                  Education
                </p>
                {profile.education.map((edu, i) => (
                  <p key={i} className="text-ws-text-primary">
                    {edu.degree} — {edu.school}
                  </p>
                ))}
              </div>
            )}

            {profile.selfMade._is && (
              <Badge
                variant="outline"
                className="text-xs text-ws-gold border-ws-gold/30 bg-ws-gold/10"
              >
                Self-Made
              </Badge>
            )}
          </div>
        )}

        <Separator className="my-4 bg-ws-border" />

        {/* Compare with me button */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                     bg-ws-accent/10 border border-ws-accent/30 text-ws-accent text-sm font-medium
                     hover:bg-ws-accent/20 transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Compare with me
        </button>
      </ScrollArea>
    </motion.div>
  )
}
```

---

## Step 10: LeaderboardRow

### File: `src/components/leaderboard/LeaderboardRow.tsx`

An individual row in the leaderboard sidebar. Shows rank, name, formatted net worth, and change indicator. Has hover glow and 2px lift effect.

```tsx
import { TrendingUp, TrendingDown, Crown } from 'lucide-react'
import type { BillionaireListEntry } from '@/types'
import { formatWealth } from '@/utils/formatWealth'
import { getIndustryColor } from '@/utils/colorByIndustry'

interface LeaderboardRowProps {
  entry: BillionaireListEntry
  isSelected: boolean
  onSelect: (uri: string) => void
}

export function LeaderboardRow({
  entry,
  isSelected,
  onSelect,
}: LeaderboardRowProps) {
  const industry = entry.industry[0] ?? 'other'
  const color = getIndustryColor(industry)
  const dailyChange = entry.change
  const isPositive = dailyChange !== null && dailyChange >= 0

  return (
    <button
      onClick={() => onSelect(entry.uri)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
        transition-all duration-200 ease-out
        hover:bg-ws-glass-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20
        ${isSelected ? 'bg-ws-glass-hover ring-1 ring-ws-accent/30' : ''}
      `}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-7 text-center">
        {entry.rank === 1 ? (
          <Crown className="w-5 h-5 text-ws-gold mx-auto" />
        ) : (
          <span className="font-mono text-sm text-ws-text-secondary">
            #{entry.rank}
          </span>
        )}
      </div>

      {/* Color indicator dot */}
      <div
        className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color.primary }}
      />

      {/* Name + net worth */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm text-ws-text-primary truncate">
          {entry.name}
        </p>
        <p className="font-mono text-xs" style={{ color: color.primary }}>
          {formatWealth(entry.networth)}
        </p>
      </div>

      {/* Change indicator */}
      {dailyChange !== null && (
        <div className="flex-shrink-0 flex items-center gap-0.5">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-ws-positive" />
          ) : (
            <TrendingDown className="w-3 h-3 text-ws-negative" />
          )}
        </div>
      )}
    </button>
  )
}
```

---

## Step 11: LeaderboardSidebar

### File: `src/components/leaderboard/LeaderboardSidebar.tsx`

A toggleable left sidebar that shows the ranked list of billionaires. Clicking a row flies the camera to that planet. Uses `motion/react` for enter/exit animation.

```tsx
import { motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { useAppStore } from '@/stores'
import { LeaderboardRow } from './LeaderboardRow'

interface LeaderboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function LeaderboardSidebar({
  isOpen,
  onToggle,
}: LeaderboardSidebarProps) {
  const billionaires = useAppStore((s) => s.billionaires)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  return (
    <div className="fixed left-0 top-0 bottom-0 z-40 flex items-stretch">
      {/* Sidebar panel */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="glass-panel w-72 flex flex-col m-4 mr-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ws-border">
          <Trophy className="w-4 h-4 text-ws-gold" />
          <h2 className="font-display text-sm font-semibold text-ws-text-primary">
            Wealth Leaderboard
          </h2>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {billionaires.map((entry) => (
            <LeaderboardRow
              key={entry.uri}
              entry={entry}
              isSelected={selectedUri === entry.uri}
              onSelect={selectBillionaire}
            />
          ))}
        </div>

        {/* Footer summary */}
        <div className="px-4 py-2.5 border-t border-ws-border">
          <p className="text-xs text-ws-text-secondary text-center">
            Top {billionaires.length} Billionaires
          </p>
        </div>
      </motion.div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="self-center glass-panel !rounded-l-none !rounded-r-xl px-1.5 py-4
                   hover:bg-ws-glass-hover transition-colors"
        aria-label={isOpen ? 'Close leaderboard' : 'Open leaderboard'}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-ws-text-secondary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-ws-text-secondary" />
        )}
      </button>
    </div>
  )
}
```

---

## Step 12: Updated SceneManager

### File: `src/scene/SceneManager.tsx` (replace Phase 1 version)

Routes to `CosmosMode`. In Phase 4, this will also route to `TowersMode`, `OceanMode`, and `TimelineMode`.

```tsx
import { Suspense } from 'react'
import { CosmosLighting } from './shared/Lighting'
import { SpaceBackground } from './shared/Background'
import { CosmosMode } from './cosmos/CosmosMode'
import type { PlanetConfig } from '@/types'

interface SceneManagerProps {
  planets: PlanetConfig[]
}

export function SceneManager({ planets }: SceneManagerProps) {
  return (
    <Suspense fallback={null}>
      {/* Background (shared across all modes) */}
      <SpaceBackground />

      {/* Lighting (shared across all modes) */}
      <CosmosLighting />

      {/* Active mode — for now, always Cosmos */}
      <CosmosMode planets={planets} />
    </Suspense>
  )
}
```

> **Phase 4 preview**: The `SceneManager` will read `useAppStore((s) => s.mode)` and conditionally render the appropriate mode component via `React.lazy` + `Suspense`.

---

## Step 13: Updated App.tsx

### File: `src/App.tsx` (replace Phase 1 version)

The root component now renders the 3D Canvas as a full-viewport background and overlays the 2D UI components on top. Uses `AnimatePresence` from `motion/react` for smooth panel transitions.

```tsx
import { useState, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence } from 'motion/react'
import { SceneManager } from '@/scene/SceneManager'
import { DetailPanel } from '@/components/detail/DetailPanel'
import { LeaderboardSidebar } from '@/components/leaderboard/LeaderboardSidebar'
import { useBillionaireList } from '@/api/queries'
import { toPlanetConfig } from '@/api/transformers'
import { useAppStore } from '@/stores'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/utils/constants'

export default function App() {
  const {
    data: billionaires,
    isPending,
    isError,
    error,
  } = useBillionaireList(10)
  const setBillionaires = useAppStore((s) => s.setBillionaires)
  const selectedUri = useAppStore((s) => s.selectedUri)

  const [leaderboardOpen, setLeaderboardOpen] = useState(true)

  // Sync API data into Zustand
  useEffect(() => {
    if (billionaires) {
      setBillionaires(billionaires)
    }
  }, [billionaires, setBillionaires])

  // Transform to planet configs
  const planets = useMemo(
    () => (billionaires ?? []).map(toPlanetConfig),
    [billionaires],
  )

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
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 3D Canvas — full viewport background */}
      <Canvas
        className="absolute inset-0"
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: DEFAULT_CAMERA_FOV,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <SceneManager planets={planets} />
      </Canvas>

      {/* 2D UI Overlay Layer */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Header placeholder (Phase 4: mode switcher tabs go here) */}
        <div className="pointer-events-auto flex items-center justify-center pt-4">
          <div className="glass-panel px-6 py-2">
            <h1 className="font-display text-lg font-bold tracking-wide">
              <span className="text-ws-accent">Wealth</span>
              <span className="text-ws-text-primary">Scale</span>
            </h1>
          </div>
        </div>

        {/* Leaderboard sidebar (left) */}
        <div className="pointer-events-auto">
          <LeaderboardSidebar
            isOpen={leaderboardOpen}
            onToggle={() => setLeaderboardOpen((prev) => !prev)}
          />
        </div>

        {/* Detail panel (right, shown on select) */}
        <div className="pointer-events-auto">
          <AnimatePresence>
            {selectedUri && <DetailPanel key="detail-panel" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
```

---

## Acceptance Criteria

- [ ] App loads without errors, all 10 planets visible and orbiting
- [ ] WealthSun renders at center with animated plasma shader
- [ ] WealthSun pulses (scale oscillates via `sin(time) * 0.02`)
- [ ] WealthSun has corona sparkle particles around it
- [ ] WealthSun emissive intensity (3.0) triggers bloom post-processing
- [ ] Orbit rings visible for all 10 billionaires, transparent at 15% opacity
- [ ] Orbit ring color matches corresponding planet at 30% brightness
- [ ] Hovering a planet grows it 10% (spring animation)
- [ ] Hovering a planet fades in the name + net worth label
- [ ] Clicking a planet dispatches `selectBillionaire(uri)` to Zustand
- [ ] Clicking a planet triggers camera fly-to animation (spring physics)
- [ ] Spring config: mass 1, tension 170, friction 26
- [ ] Double-clicking empty space resets camera to default overview and deselects
- [ ] Post-processing active: Bloom (threshold 0.8, intensity 0.8, mipmapBlur), Vignette (offset 0.3, darkness 0.7), ChromaticAberration (offset 0.0005)
- [ ] DetailPanel slides in from right with spring animation (stiffness 200, damping 25)
- [ ] DetailPanel shows: profile photo, name, age, country with flag emoji, net worth in accent color
- [ ] DetailPanel shows: wealth sources as colored chips, daily change (green/red), "Compare with me" button
- [ ] DetailPanel lazy-fetches profile data via `useBillionaireProfile` on select
- [ ] DetailPanel closes when X is clicked or billionaire is deselected
- [ ] LeaderboardSidebar toggleable from left side
- [ ] Leaderboard shows ranked list: rank #, color dot, name, net worth, change indicator
- [ ] Crown icon shown for rank #1
- [ ] Clicking a leaderboard row flies camera to that billionaire
- [ ] LeaderboardRow hover: subtle glow and 2px lift
- [ ] LeaderboardSidebar has enter/exit spring animation
- [ ] Header with "WealthScale" logo visible at top center
- [ ] AnimatePresence handles panel mount/unmount transitions
- [ ] No console errors or TypeScript errors
- [ ] Dev server runs with `pnpm dev`

---

## Files Created/Modified

### New Files (9)

| File                                                | Purpose                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/scene/cosmos/shaders/sunShader.ts`             | GLSL vertex + fragment shaders for animated plasma sun effect               |
| `src/scene/cosmos/WealthSun.tsx`                    | Central glowing sun with shader material, sparkle corona, pulsing animation |
| `src/scene/cosmos/OrbitRing.tsx`                    | Transparent ring at each billionaire's orbit radius                         |
| `src/scene/cosmos/CosmosMode.tsx`                   | Mode root composing WealthSun, planets, orbits, camera, post-processing     |
| `src/scene/shared/CameraController.tsx`             | Spring-physics camera fly-to on selection, double-click reset               |
| `src/scene/shared/PostProcessing.tsx`               | EffectComposer with Bloom, Vignette, ChromaticAberration                    |
| `src/components/detail/DetailPanel.tsx`             | Glass overlay detail panel with profile data, motion slide-in               |
| `src/components/leaderboard/LeaderboardSidebar.tsx` | Toggleable ranked list sidebar with spring animation                        |
| `src/components/leaderboard/LeaderboardRow.tsx`     | Individual leaderboard row with hover glow/lift effect                      |

### Modified Files (3)

| File                                     | Changes                                                                                                                                                              |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/scene/cosmos/BillionairePlanet.tsx` | Added hover spring scale (10% grow), label fade animation, Zustand dispatch on click, planet position reporting for CameraController                                 |
| `src/scene/SceneManager.tsx`             | Replaced direct planet rendering with `CosmosMode` composition, removed inline `OrbitControls` (now in `CosmosMode`)                                                 |
| `src/App.tsx`                            | Added 2D overlay layer with `LeaderboardSidebar`, `DetailPanel` with `AnimatePresence`, header placeholder, `pointer-events-none` layout for click-through to Canvas |

### shadcn/ui Components to Install

| Component     | Usage                                               |
| ------------- | --------------------------------------------------- |
| `badge`       | Source chips and industry tags in DetailPanel       |
| `separator`   | Section dividers in DetailPanel                     |
| `scroll-area` | Scrollable content in DetailPanel                   |
| `avatar`      | Profile photo (optional alternative to raw `<img>`) |
