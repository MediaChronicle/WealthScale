import { useMemo, useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import {
  CanvasTexture,
  SRGBColorSpace,
  Sprite,
  Vector3,
  PerspectiveCamera,
} from 'three'
import { useFrame } from '@react-three/fiber'
export function SceneLabel({
  text,
  position,
  wide = false,
  size = 0.7,
}: {
  text: string
  position: [number, number, number]
  wide?: boolean
  size?: number
}): ReactElement {
  const aspect = wide ? 3 : text.length > 2 ? 1.8 : 1
  const sprite = useRef<Sprite>(null)
  const point = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size: viewport }) => {
    if (!sprite.current || !(camera instanceof PerspectiveCamera)) return
    sprite.current.getWorldPosition(point)
    point.applyMatrix4(camera.matrixWorldInverse)
    const pixels = 28
    const height =
      (2 *
        Math.abs(point.z) *
        Math.tan((camera.fov * Math.PI) / 360) *
        pixels) /
      Math.max(1, viewport.height)
    sprite.current.scale.set(height * aspect, height, 1)
  })
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(96 * aspect)
    canvas.height = 96
    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = '#14251f'
      context.beginPath()
      context.roundRect(0, 0, canvas.width, 96, 14)
      context.fill()
      context.font = '46px sans-serif'
      context.fillStyle = '#e3f4ed'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(text, canvas.width / 2, 48, canvas.width - 20)
    }
    const result = new CanvasTexture(canvas)
    result.colorSpace = SRGBColorSpace
    return result
  }, [text, aspect])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <sprite
      ref={sprite}
      position={position}
      scale={[wide ? size * 5.43 : size * 1.5, size, 1]}
    >
      <spriteMaterial map={texture} depthTest={false} />
    </sprite>
  )
}
