import { useMemo, useEffect } from 'react'
import {
  TubeGeometry,
  CatmullRomCurve3,
  Vector3,
  MeshBasicMaterial,
  BackSide,
} from 'three'
import {
  TIMELINE_TUNNEL_RADIUS,
  TIMELINE_TUNNEL_SEGMENTS,
  TIMELINE_TUNNEL_COLOR,
  TIMELINE_TUNNEL_OPACITY,
  TIMELINE_TUNNEL_PADDING,
} from '@/utils/constants'

interface TimeTunnelProps {
  length: number
}

export function TimeTunnel({ length }: TimeTunnelProps) {
  const geometry = useMemo(() => {
    const path = new CatmullRomCurve3([
      new Vector3(0, 3, -TIMELINE_TUNNEL_PADDING),
      new Vector3(0, 3, length + TIMELINE_TUNNEL_PADDING),
    ])

    return new TubeGeometry(
      path,
      TIMELINE_TUNNEL_SEGMENTS,
      TIMELINE_TUNNEL_RADIUS,
      16,
      false,
    )
  }, [length])

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: TIMELINE_TUNNEL_COLOR,
        transparent: true,
        opacity: TIMELINE_TUNNEL_OPACITY,
        wireframe: true,
        side: BackSide,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <mesh geometry={geometry} material={material} />
}
