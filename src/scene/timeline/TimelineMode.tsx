import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3, SpotLight } from 'three'
import { useBillionaireTop10History } from '@/hooks/useBillionaireTop10History'
import { WealthBand } from './WealthBand'
import { TimeTunnel } from './TimeTunnel'
import { EventCard } from './EventCard'
import { DateMarker } from './DateMarker'
import {
  TIMELINE_Z_SCALE,
  TIMELINE_SCROLL_SPEED,
  TIMELINE_BG_COLOR,
  TIMELINE_FOG_NEAR,
  TIMELINE_FOG_FAR,
  TIMELINE_AMBIENT_INTENSITY,
  TIMELINE_SPOTLIGHT_INTENSITY,
  TIMELINE_SPOTLIGHT_COLOR,
  TIMELINE_SPOTLIGHT_POSITION,
  TIMELINE_SPOTLIGHT_ANGLE,
  TIMELINE_SPOTLIGHT_PENUMBRA,
  TIMELINE_SPOTLIGHT_DISTANCE,
  TIMELINE_CAMERA_LERP_FACTOR,
  TIMELINE_CAMERA_Y,
  TIMELINE_CAMERA_LOOK_AHEAD,
} from '@/utils/constants'

const NOTABLE_EVENTS = [
  { date: '2020-03', label: 'COVID crash wipes $400B from top 10' },
  { date: '2021-01', label: 'Musk becomes worlds richest person' },
  { date: '2021-10', label: 'Combined top 10 wealth surpasses $1.5T' },
  { date: '2022-11', label: 'Crypto winter — Zuckerberg drops from top 10' },
  { date: '2023-06', label: 'AI boom lifts tech billionaires' },
  { date: '2024-03', label: 'Musk surpasses $200B again' },
  { date: '2024-11', label: 'Zuckerberg re-enters top 3' },
  { date: '2025-01', label: 'Musk crosses $400B for the first time' },
]

const targetVec = new Vector3()

export function TimelineMode() {
  const { data: history, isPending } = useBillionaireTop10History()
  const cameraZRef = useRef(0)
  const spotlightRef = useRef<SpotLight>(null)
  const { camera, gl } = useThree()

  const totalMonths = history?.months.length ?? 0
  const corridorLength = totalMonths * TIMELINE_Z_SCALE

  const dateLabels = useMemo(
    () =>
      (history?.months ?? []).map((month, i) => ({
        label: month,
        z: i * TIMELINE_Z_SCALE,
      })),
    [history],
  )

  const monthIndexMap = useMemo(
    () => new Map((history?.months ?? []).map((m, i) => [m, i] as const)),
    [history],
  )

  const events = useMemo(() => {
    if (!history) return []
    return NOTABLE_EVENTS.map((event) => {
      const monthIndex = monthIndexMap.get(event.date) ?? -1
      return {
        ...event,
        z: monthIndex >= 0 ? monthIndex * TIMELINE_Z_SCALE : -1,
      }
    }).filter((e) => e.z >= 0)
  }, [history, monthIndexMap])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      cameraZRef.current = MathUtils.clamp(
        cameraZRef.current + e.deltaY * TIMELINE_SCROLL_SPEED * 0.01,
        0,
        corridorLength,
      )
    },
    [corridorLength],
  )

  // Bind wheel listener in useEffect with cleanup
  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [gl, handleWheel])

  useFrame(() => {
    targetVec.set(0, TIMELINE_CAMERA_Y, cameraZRef.current)
    camera.position.lerp(targetVec, TIMELINE_CAMERA_LERP_FACTOR)
    camera.lookAt(
      0,
      TIMELINE_CAMERA_Y,
      cameraZRef.current + TIMELINE_CAMERA_LOOK_AHEAD,
    )

    if (spotlightRef.current) {
      spotlightRef.current.position.z = cameraZRef.current
    }
  })

  if (isPending || !history) {
    return null
  }

  return (
    <>
      <color attach="background" args={[TIMELINE_BG_COLOR]} />
      <fog
        attach="fog"
        args={[TIMELINE_BG_COLOR, TIMELINE_FOG_NEAR, TIMELINE_FOG_FAR]}
      />

      <ambientLight intensity={TIMELINE_AMBIENT_INTENSITY} />
      <spotLight
        ref={spotlightRef}
        position={TIMELINE_SPOTLIGHT_POSITION}
        angle={TIMELINE_SPOTLIGHT_ANGLE}
        penumbra={TIMELINE_SPOTLIGHT_PENUMBRA}
        intensity={TIMELINE_SPOTLIGHT_INTENSITY}
        color={TIMELINE_SPOTLIGHT_COLOR}
        distance={TIMELINE_SPOTLIGHT_DISTANCE}
      />

      <TimeTunnel length={corridorLength} />

      {dateLabels
        .filter((_, i) => i % 3 === 0)
        .map(({ label, z }) => (
          <DateMarker key={label} label={label} z={z} />
        ))}

      {history.billionaires.map((billionaire, i) => (
        <WealthBand
          key={billionaire.uri}
          color={billionaire.color}
          dataPoints={billionaire.dataPoints}
          bandIndex={i}
          zScale={TIMELINE_Z_SCALE}
        />
      ))}

      {events.map((event) => (
        <EventCard
          key={event.date}
          label={event.label}
          date={event.date}
          z={event.z}
        />
      ))}
    </>
  )
}
