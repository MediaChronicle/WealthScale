import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles, Billboard, Text, Line } from '@react-three/drei'
import { SphereGeometry, MeshStandardMaterial, Color, type Mesh } from 'three'
import { useAppStore } from '@/stores'
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
  TEXT_COLOR,
  TEXT_OUTLINE_COLOR,
} from '@/utils/constants'

interface UserParticleProps {
  planetPositions: React.RefObject<Map<string, [number, number, number]>>
}

export function UserParticle({ planetPositions }: UserParticleProps) {
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<import('three').Group>(null)

  const showComparison = useAppStore((s) => s.showComparison)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  const target = useMemo(
    () => billionaires.find((b) => b.uri === selectedUri),
    [billionaires, selectedUri],
  )

  const radius = useMemo(() => {
    if (!target || netWorth <= 0) return 0
    const pRadius = planetRadius(target.networth)
    return userParticleRadius(netWorth, target.networth, pRadius)
  }, [target, netWorth])

  const percent = useMemo(() => {
    if (!target || netWorth <= 0) return 0
    return scaleRatioPercent(netWorth, target.networth)
  }, [target, netWorth])

  const geometry = useMemo(
    () =>
      new SphereGeometry(
        radius || 0.05,
        USER_PARTICLE_SEGMENTS,
        USER_PARTICLE_SEGMENTS,
      ),
    [radius],
  )

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#ffffff'),
        emissive: new Color('#ffffff'),
        emissiveIntensity: 0.8,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

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
      <Float speed={2} floatIntensity={0.5} rotationIntensity={0}>
        <mesh ref={meshRef} geometry={geometry} material={material} />
        <Sparkles
          count={USER_PARTICLE_SPARKLE_COUNT}
          size={USER_PARTICLE_SPARKLE_SIZE}
          color="#ffffff"
          scale={0.5}
        />
      </Float>

      <Billboard>
        <Text
          fontSize={USER_PARTICLE_LABEL_FONT_SIZE}
          color={TEXT_COLOR}
          anchorX="center"
          anchorY="bottom"
          position={[0, radius + 0.3, 0]}
          outlineWidth={USER_PARTICLE_LABEL_OUTLINE}
          outlineColor={TEXT_OUTLINE_COLOR}
        >
          You: {formatDollars(netWorth)}
        </Text>
        <Text
          fontSize={USER_PARTICLE_SUB_LABEL_FONT_SIZE}
          color="#00d4ff"
          anchorX="center"
          anchorY="top"
          position={[0, radius + 0.25, 0]}
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
        color="#ffffff"
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.15}
        opacity={0.4}
        transparent
      />
    </group>
  )
}
