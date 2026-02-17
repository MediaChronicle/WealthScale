import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, Billboard, Text, Line } from '@react-three/drei'
import { SphereGeometry, MeshStandardMaterial, Color, type Mesh } from 'three'
import { useAppStore } from '@/stores'
import { useSelectedBillionaire } from '@/hooks/useSelectedBillionaire'
import { userParticleRadius, scaleRatioPercent } from '@/utils/wealthComparison'
import { planetRadius } from '@/utils/wealthMath'
import { formatDollars } from '@/utils/formatWealth'
import {
  USER_PARTICLE_OFFSET_X,
  USER_PARTICLE_OFFSET_Y,
  USER_PARTICLE_SPARKLE_COUNT,
  USER_PARTICLE_SPARKLE_SIZE,
  USER_PARTICLE_LABEL_FONT_SIZE,
  USER_PARTICLE_SUB_LABEL_FONT_SIZE,
  USER_PARTICLE_LABEL_OUTLINE,
  USER_PARTICLE_SEGMENTS,
  USER_PARTICLE_FALLBACK_RADIUS,
  USER_PARTICLE_MATERIAL_COLOR,
  USER_PARTICLE_EMISSIVE_INTENSITY,
  USER_PARTICLE_FLOAT_SPEED,
  USER_PARTICLE_FLOAT_INTENSITY,
  USER_PARTICLE_SPARKLE_SCALE,
  USER_PARTICLE_LABEL_Y_GAP,
  USER_PARTICLE_SUB_LABEL_Y_GAP,
  USER_PARTICLE_SUB_LABEL_COLOR,
  USER_PARTICLE_LINE_DASH_SIZE,
  USER_PARTICLE_LINE_GAP_SIZE,
  USER_PARTICLE_LINE_OPACITY,
  TEXT_COLOR,
  TEXT_OUTLINE_COLOR,
} from '@/utils/constants'

interface UserParticleProps {
  planetPositions: React.RefObject<Map<string, [number, number, number]>>
}

// Unit sphere created once, scaled per-instance via mesh scale
const UNIT_GEOMETRY = new SphereGeometry(
  1,
  USER_PARTICLE_SEGMENTS,
  USER_PARTICLE_SEGMENTS,
)

export function UserParticle({ planetPositions }: UserParticleProps) {
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<import('three').Group>(null)

  const showComparison = useAppStore((s) => s.showComparison)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)

  const target = useSelectedBillionaire()

  const radius = useMemo(() => {
    if (!target || netWorth <= 0) return 0
    const pRadius = planetRadius(target.networth)
    return userParticleRadius(netWorth, target.networth, pRadius)
  }, [target, netWorth])

  const percent = useMemo(() => {
    if (!target || netWorth <= 0) return 0
    return scaleRatioPercent(netWorth, target.networth)
  }, [target, netWorth])

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(USER_PARTICLE_MATERIAL_COLOR),
        emissive: new Color(USER_PARTICLE_MATERIAL_COLOR),
        emissiveIntensity: USER_PARTICLE_EMISSIVE_INTENSITY,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  const meshScale = radius || USER_PARTICLE_FALLBACK_RADIUS

  useFrame(() => {
    if (!groupRef.current || !selectedUri || !planetPositions.current) return
    const pos = planetPositions.current.get(selectedUri)
    if (!pos) return
    groupRef.current.position.set(
      pos[0] + USER_PARTICLE_OFFSET_X,
      pos[1] + USER_PARTICLE_OFFSET_Y,
      pos[2],
    )
  })

  if (!showComparison || !target || netWorth <= 0) return null

  return (
    <group ref={groupRef}>
      <Float
        speed={USER_PARTICLE_FLOAT_SPEED}
        floatIntensity={USER_PARTICLE_FLOAT_INTENSITY}
        rotationIntensity={0}
      >
        <mesh
          ref={meshRef}
          geometry={UNIT_GEOMETRY}
          material={material}
          scale={meshScale}
        />
        <Sparkles
          count={USER_PARTICLE_SPARKLE_COUNT}
          size={USER_PARTICLE_SPARKLE_SIZE}
          color={USER_PARTICLE_MATERIAL_COLOR}
          scale={USER_PARTICLE_SPARKLE_SCALE}
        />
      </Float>

      <Billboard>
        <Text
          fontSize={USER_PARTICLE_LABEL_FONT_SIZE}
          color={TEXT_COLOR}
          anchorX="center"
          anchorY="bottom"
          position={[0, radius + USER_PARTICLE_LABEL_Y_GAP, 0]}
          outlineWidth={USER_PARTICLE_LABEL_OUTLINE}
          outlineColor={TEXT_OUTLINE_COLOR}
        >
          You: {formatDollars(netWorth)}
        </Text>
        <Text
          fontSize={USER_PARTICLE_SUB_LABEL_FONT_SIZE}
          color={USER_PARTICLE_SUB_LABEL_COLOR}
          anchorX="center"
          anchorY="top"
          position={[0, radius + USER_PARTICLE_SUB_LABEL_Y_GAP, 0]}
        >
          {percent < 0.01 ? '<0.01' : percent.toFixed(2)}% of{' '}
          {target.name.split(' ').pop()}
        </Text>
      </Billboard>

      <Line
        points={[
          [0, 0, 0],
          [-USER_PARTICLE_OFFSET_X, -USER_PARTICLE_OFFSET_Y, 0],
        ]}
        color={USER_PARTICLE_MATERIAL_COLOR}
        lineWidth={1}
        dashed
        dashSize={USER_PARTICLE_LINE_DASH_SIZE}
        gapSize={USER_PARTICLE_LINE_GAP_SIZE}
        opacity={USER_PARTICLE_LINE_OPACITY}
        transparent
      />
    </group>
  )
}
