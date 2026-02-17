import { useMemo } from 'react'
import { Billboard, Text } from '@react-three/drei'
import { MathUtils } from 'three'
import {
  OCEAN_DEPTH_MARKER_COLOR,
  OCEAN_DEPTH_LINE_COLOR,
} from '@/utils/constants'

interface DepthMarkerProps {
  depth: number
  label: string
}

export function DepthMarker({ depth, label }: DepthMarkerProps) {
  const opacity = useMemo(() => {
    const absDepth = Math.abs(depth)
    return MathUtils.clamp(1 - absDepth / 20, 0.15, 0.9)
  }, [depth])

  return (
    <Billboard position={[-12, depth, 0]}>
      <Text
        fontSize={0.6}
        color={OCEAN_DEPTH_MARKER_COLOR}
        anchorX="left"
        anchorY="middle"
        fillOpacity={opacity}
        outlineWidth={0.01}
        outlineColor="#001122"
      >
        {label}
      </Text>
      <mesh position={[3, 0, 0]}>
        <boxGeometry args={[20, 0.005, 0.005]} />
        <meshBasicMaterial
          color={OCEAN_DEPTH_LINE_COLOR}
          transparent
          opacity={opacity * 0.3}
        />
      </mesh>
    </Billboard>
  )
}
