import { synchronizeProjection, synchronizeShadow } from './projection'
import type { DirectionalLight } from 'three'
import { probeWebGL } from './webgl'
import { useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode, RefObject } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { TOUCH, Vector2, Vector3, PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { StageBoundary } from '@/features/journey/StageBoundary'
import { renderPolicy } from './policy'
import type { Quality } from './policy'
export interface CaptureInfo {
  title: string
  legend: string
  source: string
}
export type Capture = () => Promise<void>
export interface CameraPose {
  position: [number, number, number]
  target: [number, number, number]
  radius?: number
  horizontalRadius?: number
}
interface SceneCanvasProps {
  children: ReactNode
  pose: CameraPose
  reset: number | string
  quality: Quality
  captureInfo: CaptureInfo
  onCapture: (capture: Capture | null) => void
  onFallback: () => void
}

function SceneServices({
  pose,
  reset,
  captureInfo,
  onCapture,
  onLost,
  onRestored,
  zoom,
  diagnostics,
}: Omit<SceneCanvasProps, 'children' | 'quality' | 'onFallback'> & {
  diagnostics: RefObject<HTMLOutputElement | null>
  zoom: number
  onRestored: () => void
  onLost: () => void
}): ReactElement {
  const { camera, gl, scene, invalidate, size } = useThree()
  const frames = useRef(0)
  useEffect(() => {
    if (!import.meta.env.DEV || !diagnostics.current) return
    const timer = setInterval(() => {
      if (diagnostics.current)
        diagnostics.current.textContent = `Frames: ${frames.current}; draw calls: ${gl.info.render.calls}; triangles: ${gl.info.render.triangles}; geometries: ${gl.info.memory.geometries}; textures: ${gl.info.memory.textures}`
    }, 500)
    return () => clearInterval(timer)
  }, [diagnostics, gl])
  const controls = useRef<OrbitControls | null>(null)
  const destination = useRef(new Vector3())
  const moving = useRef(false)
  const reducedMotion = useReducedMotion()
  const px = pose.position[0],
    py = pose.position[1],
    pz = pose.position[2]
  const tx = pose.target[0],
    ty = pose.target[1],
    tz = pose.target[2]
  useEffect(() => {
    const control = new OrbitControls(camera, gl.domElement)
    control.enablePan = false
    control.enableZoom = false
    control.touches.ONE = null
    control.touches.TWO = TOUCH.DOLLY_ROTATE
    gl.domElement.style.setProperty('touch-action', 'pan-y')
    control.minDistance = 0.0001
    control.maxDistance = 9000
    control.minPolarAngle = 0.15
    control.maxPolarAngle = Math.PI * 0.85
    control.enableDamping = !reducedMotion
    const onChange = (): void => invalidate()
    const onStart = (): void => {
      moving.current = false
    }
    control.addEventListener('start', onStart)
    control.addEventListener('change', onChange)
    controls.current = control
    invalidate()
    return () => {
      control.removeEventListener('start', onStart)
      control.removeEventListener('change', onChange)
      control.dispose()
      controls.current = null
    }
  }, [camera, gl, invalidate, reducedMotion])
  useFrame((_, delta) => {
    if (import.meta.env.DEV) frames.current += 1
    if (moving.current) {
      camera.position.lerp(
        destination.current,
        1 - Math.exp(-6 * Math.min(delta, 0.05)),
      )
      if (camera.position.distanceTo(destination.current) < 0.005) {
        camera.position.copy(destination.current)
        moving.current = false
      }
      invalidate()
    }
    if (controls.current?.update()) invalidate()
  })
  useEffect(() => {
    const target = new Vector3(tx, ty, tz)
    const direction = new Vector3(px, py, pz).sub(target)
    const aspect = size.width / Math.max(1, size.height)
    const radius = pose.radius ?? 7
    synchronizeProjection(camera, radius)
    const distance =
      pose.horizontalRadius === undefined
        ? radius /
          Math.sin(
            Math.atan(Math.tan((19 * Math.PI) / 180) * Math.min(1, aspect)),
          )
        : Math.max(radius, pose.horizontalRadius / aspect) /
          Math.sin((19 * Math.PI) / 180)
    destination.current.copy(
      direction
        .normalize()
        .multiplyScalar(distance * 1.12 * 1.2 ** zoom)
        .add(target),
    )
    if (reducedMotion) camera.position.copy(destination.current)
    moving.current = !reducedMotion
    controls.current?.target.set(tx, ty, tz)
    controls.current?.update()
    invalidate()
  }, [
    reset,
    camera,
    invalidate,
    px,
    py,
    pz,
    tx,
    ty,
    tz,
    reducedMotion,
    size.width,
    size.height,
    pose.radius,
    pose.horizontalRadius,
    zoom,
  ])
  useEffect(() => {
    const canvas = gl.domElement
    const lost = (event: Event): void => {
      event.preventDefault()
      onLost()
    }
    const restored = (): void => {
      onRestored()
      invalidate()
    }
    canvas.addEventListener('webglcontextlost', lost)
    canvas.addEventListener('webglcontextrestored', restored)
    return () => {
      canvas.removeEventListener('webglcontextlost', lost)
      canvas.removeEventListener('webglcontextrestored', restored)
    }
  }, [gl, onLost, onRestored, invalidate])
  useEffect(() => {
    onCapture(async (): Promise<void> => {
      // Render at export resolution, then restore the visible renderer before encoding.
      const canvas = document.createElement('canvas')
      const width = 1200,
        height = 800
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx)
        throw new Error('Image capture is not supported in this browser.')
      ctx.fillStyle = '#101918'
      ctx.fillRect(0, 0, width, height)
      const oldSize = gl.getSize(new Vector2())
      const oldDpr = gl.getPixelRatio()
      const oldAspect =
        camera instanceof PerspectiveCamera ? camera.aspect : null
      try {
        gl.setPixelRatio(1)
        gl.setSize(1200, 560, false)
        if (camera instanceof PerspectiveCamera) {
          camera.aspect = 1200 / 560
          camera.updateProjectionMatrix()
        }
        gl.render(scene, camera)
        ctx.drawImage(gl.domElement, 0, 80, 1200, 560)
      } finally {
        gl.setPixelRatio(oldDpr)
        gl.setSize(oldSize.x, oldSize.y, false)
        if (camera instanceof PerspectiveCamera && oldAspect !== null) {
          camera.aspect = oldAspect
          camera.updateProjectionMatrix()
        }
        invalidate()
      }
      ctx.fillStyle = '#b4ecd4'
      ctx.font = 'bold 28px sans-serif'
      ctx.fillText('WealthScale', 40, 52)
      ctx.fillStyle = '#edf2e8'
      ctx.font = '28px sans-serif'
      ctx.fillText(captureInfo.title, 40, 668, 1120)
      ctx.fillStyle = '#b4c8bb'
      ctx.font = '18px sans-serif'
      const words = captureInfo.legend.split(' ')
      let line = ''
      let lineY = 700
      for (const word of words) {
        const next = line ? `${line} ${word}` : word
        if (line && ctx.measureText(next).width > 1120) {
          ctx.fillText(line, 40, lineY)
          lineY += 22
          line = word
        } else line = next
      }
      ctx.fillText(line, 40, lineY)
      ctx.fillText(captureInfo.source, 40, 752, 1120)
      ctx.font = '14px sans-serif'
      ctx.fillText(
        'wealth-scale.vercel.app · USD · Estimates are not annual income',
        40,
        777,
      )
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error('Could not create image.')),
          'image/png',
        ),
      )
      const url = URL.createObjectURL(blob),
        link = document.createElement('a')
      link.href = url
      link.download = 'wealthscale-perspective.png'
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
    return () => onCapture(null)
  }, [camera, gl, scene, captureInfo, onCapture, invalidate])
  return <></>
}

function KeyLight({ radius }: { radius: number }): ReactElement {
  const light = useRef<DirectionalLight>(null)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    if (light.current) synchronizeShadow(light.current, radius)
    invalidate()
  }, [radius, invalidate])
  return (
    <directionalLight
      ref={light}
      position={[radius * 2, radius * 3, radius * 2]}
      intensity={3}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.00005}
      color="#fff4dc"
    />
  )
}

export function SceneCanvas(props: SceneCanvasProps): ReactElement {
  const diagnostics = useRef<HTMLOutputElement>(null)
  const debug =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('diagnostics')
  const [supported] = useState(probeWebGL)
  const [initializationFailed, setInitializationFailed] = useState(false)
  const ready = useRef(false)
  const [generation, setGeneration] = useState(0)
  const contextControl = useRef<WEBGL_lose_context | null>(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready.current) setInitializationFailed(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [generation])
  const [zoomState, setZoom] = useState({ reset: props.reset, value: 0 })
  const zoom = zoomState.reset === props.reset ? zoomState.value : 0
  const [lost, setLost] = useState(false)
  const mobile = useIsMobile()
  const policy = renderPolicy(props.quality, mobile)
  const retry = (): void => {
    ready.current = false
    setInitializationFailed(false)
    setLost(false)
    setGeneration((value) => value + 1)
  }
  if (!supported || initializationFailed)
    return (
      <div className="stage-fallback" role="status">
        <p>
          {initializationFailed
            ? '3D is taking longer than expected to start.'
            : '3D is unavailable on this device.'}
        </p>
        {initializationFailed && <button onClick={retry}>Retry 3D</button>}
        <button onClick={props.onFallback}>Use illustrated view</button>
      </div>
    )
  return (
    <StageBoundary key={generation} onFallback={props.onFallback}>
      {lost && (
        <div className="context-overlay" role="alert">
          <p>Graphics paused. Waiting for your device to restore the view.</p>
          <button onClick={retry}>Retry 3D</button>
          <button onClick={props.onFallback}>Use illustrated view</button>
        </div>
      )}
      <div className="canvas-zoom" aria-label="Camera zoom">
        <button
          aria-label="Zoom in"
          disabled={zoom <= -2}
          onClick={() => setZoom({ reset: props.reset, value: zoom - 1 })}
        >
          +
        </button>
        <button
          aria-label="Zoom out"
          disabled={zoom >= 8}
          onClick={() => setZoom({ reset: props.reset, value: zoom + 1 })}
        >
          −
        </button>
      </div>
      {debug && (
        <button
          className="diagnostic-loss"
          onClick={() => {
            contextControl.current?.loseContext()
            setTimeout(() => contextControl.current?.restoreContext(), 3000)
          }}
        >
          Test graphics recovery
        </button>
      )}
      {debug && (
        <output
          ref={diagnostics}
          aria-label="Scene diagnostics"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            zIndex: 2,
            fontSize: 10,
          }}
        >
          Collecting renderer statistics…
        </output>
      )}
      <Canvas
        onCreated={({ gl }) => {
          ready.current = true
          contextControl.current = gl
            .getContext()
            .getExtension('WEBGL_lose_context')
        }}
        role="img"
        frameloop="demand"
        resize={{ scroll: false }}
        shadows={!mobile && props.quality === 'standard'}
        aria-label="Interactive wealth model. Drag or use two fingers to orbit; zoom with buttons."
        dpr={[1, policy.dpr]}
        camera={{
          position: props.pose.position,
          fov: 38,
          near: Math.max(0.0001, (props.pose.radius ?? 7) / 100),
          far: 10000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
        }}
      >
        <hemisphereLight args={['#c8e9df', '#23332c', 0.6]} />
        <KeyLight
          radius={Math.max(
            props.pose.radius ?? 7,
            props.pose.horizontalRadius ?? 0,
          )}
        />
        <directionalLight
          position={[-5, 3, -4]}
          intensity={0.6}
          color="#83d4bb"
        />
        {props.children}
        <SceneServices
          pose={props.pose}
          reset={props.reset}
          captureInfo={props.captureInfo}
          onCapture={props.onCapture}
          onLost={() => setLost(true)}
          onRestored={() => setLost(false)}
          zoom={zoom}
          diagnostics={diagnostics}
        />
      </Canvas>
    </StageBoundary>
  )
}
