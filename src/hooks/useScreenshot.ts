import { useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import {
  SCREENSHOT_BRAND_PADDING,
  SCREENSHOT_BRAND_HEIGHT,
  SCREENSHOT_BRAND_BG,
  SCREENSHOT_BRAND_TEXT,
  SCREENSHOT_BRAND_ACCENT,
} from '@/utils/constants'

function addBranding(source: HTMLCanvasElement): HTMLCanvasElement {
  const pad = SCREENSHOT_BRAND_PADDING
  const barH = SCREENSHOT_BRAND_HEIGHT
  const w = source.width
  const h = source.height + barH

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0)

  // Bottom branding bar
  ctx.fillStyle = SCREENSHOT_BRAND_BG
  ctx.fillRect(0, source.height, w, barH)

  ctx.font = 'bold 14px "Space Grotesk", sans-serif'
  ctx.fillStyle = SCREENSHOT_BRAND_TEXT
  ctx.textBaseline = 'middle'
  const y = source.height + barH / 2

  // Left: brand name
  ctx.fillText('Wealth', pad, y)
  const wealthWidth = ctx.measureText('Wealth').width
  ctx.fillStyle = SCREENSHOT_BRAND_ACCENT
  ctx.fillText('Scale', pad + wealthWidth, y)

  // Right: URL
  ctx.fillStyle = SCREENSHOT_BRAND_TEXT
  ctx.font = '12px "Inter", sans-serif'
  const url = 'wealthscale.app'
  const urlWidth = ctx.measureText(url).width
  ctx.fillText(url, w - urlWidth - pad, y)

  return canvas
}

interface ScreenshotActions {
  capture: () => Promise<Blob>
  download: () => Promise<void>
  copyToClipboard: () => Promise<void>
}

export function useScreenshot(): ScreenshotActions {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)

  const capture = useCallback(async (): Promise<Blob> => {
    gl.render(scene, camera)
    const branded = addBranding(gl.domElement)
    return new Promise<Blob>((resolve, reject) => {
      branded.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('Failed to capture')),
        'image/png',
      )
    })
  }, [gl, scene, camera])

  const download = useCallback(async () => {
    const blob = await capture()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wealthscale-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, [capture])

  const copyToClipboard = useCallback(async () => {
    try {
      const blob = await capture()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
    } catch {
      // Fallback to download if clipboard API unavailable
      await download()
    }
  }, [capture, download])

  return { capture, download, copyToClipboard }
}
