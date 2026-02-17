import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

const LOG_INTERVAL_MS = 3_000

export function usePerformanceDebug(enabled: boolean): void {
  const gl = useThree((s) => s.gl)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    if (!import.meta.env.DEV || !enabled) return

    lastTimeRef.current = performance.now()
    let rafId: number

    const tick = (): void => {
      frameCountRef.current++
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    const interval = setInterval(() => {
      const now = performance.now()
      const elapsed = (now - lastTimeRef.current) / 1000
      const fps = elapsed > 0 ? frameCountRef.current / elapsed : 0

      const info = gl.info
      console.log(
        `[Perf] FPS: ${fps.toFixed(1)} | Draw calls: ${info.render.calls} | Triangles: ${info.render.triangles} | Geometries: ${info.memory.geometries} | Textures: ${info.memory.textures}`,
      )

      frameCountRef.current = 0
      lastTimeRef.current = now
    }, LOG_INTERVAL_MS)

    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(interval)
    }
  }, [enabled, gl])
}
