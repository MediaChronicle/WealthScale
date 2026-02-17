import { useMemo, useEffect } from 'react'
import {
  BufferGeometry,
  Float32BufferAttribute,
  MeshBasicMaterial,
  Color,
  DoubleSide,
} from 'three'
import {
  TIMELINE_BAND_HEIGHT,
  TIMELINE_BAND_GAP,
  TIMELINE_MAX_BAND_WIDTH,
  TIMELINE_MAX_NETWORTH_FOR_SCALE,
  TIMELINE_BAND_OPACITY,
} from '@/utils/constants'
import type { BandDataPoint } from '@/types'

interface WealthBandProps {
  name: string
  color: string
  dataPoints: BandDataPoint[]
  bandIndex: number
  totalBands: number
  zScale: number
}

export function WealthBand({
  color,
  dataPoints,
  bandIndex,
  zScale,
}: WealthBandProps) {
  const yOffset = bandIndex * (TIMELINE_BAND_HEIGHT + TIMELINE_BAND_GAP)

  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    const vertices: number[] = []
    const indices: number[] = []

    dataPoints.forEach((point, i) => {
      const z = point.month * zScale
      const halfWidth =
        (point.networth / TIMELINE_MAX_NETWORTH_FOR_SCALE) *
        (TIMELINE_MAX_BAND_WIDTH / 2)

      const baseY = yOffset
      const topY = yOffset + TIMELINE_BAND_HEIGHT

      vertices.push(
        -halfWidth,
        baseY,
        z,
        halfWidth,
        baseY,
        z,
        -halfWidth,
        topY,
        z,
        halfWidth,
        topY,
        z,
      )

      if (i > 0) {
        const prev = (i - 1) * 4
        const curr = i * 4

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
        opacity: TIMELINE_BAND_OPACITY,
        side: DoubleSide,
      }),
    [color],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <mesh geometry={geometry} material={material} />
}
