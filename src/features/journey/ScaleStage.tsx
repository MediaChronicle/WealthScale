import { useMemo, useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D } from 'three'
import { SceneCanvas } from '@/scene/lab/SceneCanvas'
import type { Capture, CaptureInfo } from '@/scene/lab/SceneCanvas'
import type { Quality } from '@/scene/lab/policy'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { blockLayout, unitSide } from './scale'
import { scaleFrame } from './scaleFrame'
import { SceneLabel } from '@/scene/lab/SceneLabel'
interface StageProps {
  introductory?: boolean
  total: number
  unit: number
  exploded: boolean
  reset: number
  reference: number | null
  quality: Quality
  captureInfo: CaptureInfo
  onCapture: (capture: Capture | null) => void
  onFallback: () => void
}
function Blocks({
  total,
  unit,
  exploded,
}: Pick<StageProps, 'total' | 'unit' | 'exploded'>): ReactElement {
  const mesh = useRef<InstancedMesh>(null)
  const blocks = useMemo(() => blockLayout(total, unit), [total, unit])
  const matrix = useMemo(() => new Object3D(), [])
  const progress = useRef(0)
  const reduced = useReducedMotion()
  const invalidate = useThree((state) => state.invalidate)
  const active = useRef(true)
  useEffect(() => {
    progress.current = 0
    active.current = true
    invalidate()
  }, [blocks, exploded, reduced, invalidate])
  useFrame((_, delta) => {
    if (!mesh.current || !active.current) return
    progress.current = reduced
      ? 1
      : Math.min(1, progress.current + Math.min(delta, 0.05) / 0.9)
    const side = unitSide(unit)
    const spacing = side * (exploded ? 1.22 : 1.025)
    blocks.forEach((block, index) => {
      const t = Math.max(
        0,
        Math.min(1, (progress.current - (index / blocks.length) * 0.3) / 0.7),
      )
      const ease = 1 - (1 - t) ** 3
      matrix.position.set(
        block.position[0] * spacing,
        block.position[1] * spacing +
          (side * block.scale) / 2 +
          (1 - ease) * side * 2,
        block.position[2] * spacing,
      )
      matrix.scale.setScalar(side * block.scale * ease)
      matrix.updateMatrix()
      mesh.current?.setMatrixAt(index, matrix.matrix)
    })
    mesh.current.count = blocks.length
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.computeBoundingSphere()
    active.current = progress.current < 1
    if (active.current) invalidate()
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 1000]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#83d4bb" roughness={0.78} />
    </instancedMesh>
  )
}
export default function ScaleStage(props: StageProps): ReactElement {
  const side = unitSide(props.unit)
  const { pose, anchors, referenceSide, referenceX, referenceZ } = useMemo(
    () =>
      scaleFrame(
        props.total,
        props.unit,
        props.exploded,
        props.reference,
        props.introductory,
      ),
    [
      props.total,
      props.unit,
      props.exploded,
      props.reference,
      props.introductory,
    ],
  )
  const radius = pose.radius ?? 18
  return (
    <SceneCanvas
      pose={pose}
      reset={props.reset}
      quality={props.quality}
      captureInfo={props.captureInfo}
      onCapture={props.onCapture}
      onFallback={props.onFallback}
    >
      <Blocks total={props.total} unit={props.unit} exploded={props.exploded} />
      {anchors.map((anchor) => (
        <group key={anchor.label} position={[anchor.x, 0, 0]}>
          <mesh
            position={[0, anchor.side / 2, 0]}
            scale={anchor.side}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#d5eee1" roughness={0.85} />
          </mesh>
          <mesh
            position={[
              0,
              anchor.side +
                radius *
                  (props.total > 1e9 && anchor.label === '$1M' ? 0.15 : 0.06),
              0,
            ]}
          >
            <boxGeometry
              args={[
                radius * 0.002,
                radius *
                  (props.total > 1e9 && anchor.label === '$1M' ? 0.3 : 0.12),
                radius * 0.002,
              ]}
            />
            <meshBasicMaterial color="#d5eee1" />
          </mesh>
          <SceneLabel
            text={anchor.label}
            position={[
              0,
              anchor.side +
                radius *
                  (props.total > 1e9 && anchor.label === '$1M' ? 0.3 : 0.12),
              0,
            ]}
            size={radius * 0.18}
          />
        </group>
      ))}
      {referenceSide > 0 && (
        <mesh
          position={[referenceX, referenceSide / 2, referenceZ]}
          scale={referenceSide}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f3bd78" roughness={0.85} />
        </mesh>
      )}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -Math.min(side * 0.001, 0.001), 0]}
        receiveShadow
      >
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial color="#2d4942" roughness={1} />
      </mesh>
      <fog attach="fog" args={['#172720', radius * 12, radius * 30]} />
    </SceneCanvas>
  )
}
