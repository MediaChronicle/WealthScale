import { useMemo, useEffect, memo } from 'react'
import type { ReactElement } from 'react'
import { BoxGeometry, SphereGeometry, MeshStandardMaterial } from 'three'
import { SceneLabel } from '@/scene/lab/SceneLabel'
import { SceneCanvas } from '@/scene/lab/SceneCanvas'
import type { Capture, CaptureInfo } from '@/scene/lab/SceneCanvas'
import { renderPolicy } from '@/scene/lab/policy'
import type { Quality } from '@/scene/lab/policy'
import { useIsMobile } from '@/hooks/useIsMobile'
import { worldLayout } from './worlds'
import type { World } from './worlds'
import type { WealthPerson } from '@/api/snapshot'
interface Props {
  timeline: { date: string; person: WealthPerson | undefined }[] | null
  world: World
  people: WealthPerson[]
  selected: string
  onSelect: (uri: string) => void
  reset: number
  quality: Quality
  maximum: number
  onFallback: () => void
  onCapture: (capture: Capture | null) => void
  captureInfo: CaptureInfo
}

function WorldStage(props: Props): ReactElement {
  const objects = useMemo(
    () =>
      props.timeline
        ? props.timeline.flatMap((entry, index) =>
            entry.person
              ? [
                  {
                    person: {
                      ...entry.person,
                      uri: entry.date,
                      name: entry.date,
                    },
                    position: [
                      (index - (props.timeline!.length - 1) / 2) * 1.05,
                      (entry.person.dollars / props.maximum) * 2.5,
                      0,
                    ] as [number, number, number],
                    size: (entry.person.dollars / props.maximum) * 5,
                  },
                ]
              : [],
          )
        : props.world === 'timeline'
          ? []
          : worldLayout(props.world, props.people, props.maximum),
    [props.world, props.people, props.maximum, props.timeline],
  )
  const mobile = useIsMobile()
  const { segments } = renderPolicy(props.quality, mobile)
  const geometry = useMemo(
    () =>
      props.world === 'cosmos' || props.world === 'ocean'
        ? new SphereGeometry(1, segments, segments / 2)
        : new BoxGeometry(1, 1, 1),
    [props.world, segments],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  const materials = useMemo(
    () =>
      ['#71ac9a', '#9ccbbe', '#e3f4ed'].map(
        (color) => new MeshStandardMaterial({ color, roughness: 0.8 }),
      ),
    [],
  )
  useEffect(
    () => () => materials.forEach((material) => material.dispose()),
    [materials],
  )
  const ocean = props.world === 'ocean',
    cosmos = props.world === 'cosmos'
  const pose = useMemo(() => {
    // Include billboard label widths in the horizontal bounds, even on phones.
    const minX = Math.min(
      -1,
      ...objects.map(
        (o) =>
          o.position[0] - (cosmos ? o.size + 0.3 : props.timeline ? 1.8 : 0.7),
      ),
    )
    const maxX = Math.max(
      1,
      ...objects.map(
        (o) =>
          o.position[0] + (cosmos ? o.size + 0.3 : props.timeline ? 1.8 : 0.7),
      ),
    )
    const minY = ocean ? -5.6 : 0
    const maxY = ocean
      ? 1.4
      : Math.max(
          1,
          ...objects.map(
            (o) => o.position[1] + (cosmos ? o.size : o.size / 2) + 1.2,
          ),
        )
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    return {
      position: [centerX + 0, centerY + (cosmos ? 12 : ocean ? 0 : 2), 16] as [
        number,
        number,
        number,
      ],
      target: [centerX, centerY, 0] as [number, number, number],
      radius: Math.max((maxY - minY) / 2, cosmos ? 4.8 : 0),
      horizontalRadius: (maxX - minX) / 2,
    }
  }, [objects, ocean, cosmos, props.timeline])
  return (
    <SceneCanvas
      pose={pose}
      reset={`${props.world}:${props.reset}`}
      quality={props.quality}
      captureInfo={props.captureInfo}
      onCapture={props.onCapture}
      onFallback={props.onFallback}
    >
      {objects.map((object, index) => (
        <group key={object.person.uri} position={object.position}>
          {(!props.timeline ||
            index % (mobile ? 4 : 2) === 0 ||
            index === objects.length - 1) && (
            <SceneLabel
              text={props.timeline ? object.person.name : String(index + 1)}
              wide={!!props.timeline}
              position={[
                0,
                cosmos
                  ? 0
                  : ocean
                    ? 0.8 + (index % 2) * 0.8
                    : object.size / 2 + 0.5 + (index % 2) * 0.65,
                0,
              ]}
            />
          )}
          <mesh
            geometry={geometry}
            material={
              materials[props.selected === object.person.uri ? 2 : index % 2]
            }
            dispose={null}
            castShadow
            receiveShadow
            onClick={(event) => {
              event.stopPropagation()
              props.onSelect(object.person.uri)
            }}
            scale={
              cosmos
                ? [object.size, object.size, object.size]
                : ocean
                  ? [0.28, 0.28, 0.28]
                  : [0.7, Math.max(object.size, 0.001), 0.7]
            }
          ></mesh>
          {props.selected === object.person.uri && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[
                0,
                cosmos
                  ? -object.size - 0.06
                  : ocean
                    ? -0.4
                    : -object.size / 2 - 0.03,
                0,
              ]}
            >
              <ringGeometry
                args={[
                  cosmos ? object.size + 0.1 : 0.45,
                  cosmos ? object.size + 0.15 : 0.5,
                  48,
                ]}
              />
              <meshBasicMaterial color="#dcefe7" />
            </mesh>
          )}
        </group>
      ))}
      {ocean &&
        objects.map((object) => (
          <mesh
            key={`depth-${object.person.uri}`}
            position={[
              object.position[0],
              object.position[1] / 2,
              object.position[2],
            ]}
          >
            <boxGeometry args={[0.025, Math.abs(object.position[1]), 0.025]} />
            <meshBasicMaterial color="#688d9b" />
          </mesh>
        ))}
      {cosmos && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[4.58, 4.62, 96]} />
            <meshBasicMaterial color="#456458" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.25, 16, 8]} />
            <meshBasicMaterial color="#dcefe7" />
          </mesh>
        </>
      )}
      {ocean && <gridHelper args={[12, 12, '#739caa', '#344f5b']} />}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ocean ? -5.55 : -0.07, 0]}
        receiveShadow
      >
        <planeGeometry args={[5000, 5000]} />
        <meshStandardMaterial
          color={ocean ? '#304c59' : '#2d4942'}
          roughness={1}
        />
      </mesh>
      <gridHelper
        args={[14, 14, '#3d514b', '#293b35']}
        position={[0, ocean ? -5.5 : -0.04, 0]}
      />
    </SceneCanvas>
  )
}

export default memo(WorldStage)
