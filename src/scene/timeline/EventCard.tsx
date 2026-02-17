import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import {
  TIMELINE_EVENT_VISIBILITY_RANGE,
  WS_ACCENT_COLOR_30,
  WS_ACCENT_GLOW,
} from '@/utils/constants'

interface EventCardProps {
  label: string
  date: string
  z: number
}

export function EventCard({ label, date, z }: EventCardProps) {
  const opacityRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { camera } = useThree()

  useFrame(() => {
    const distance = Math.abs(camera.position.z - z)
    const visible = distance < TIMELINE_EVENT_VISIBILITY_RANGE

    if (visible) {
      opacityRef.current = Math.max(
        0,
        1 - distance / TIMELINE_EVENT_VISIBILITY_RANGE,
      )
    } else {
      opacityRef.current = 0
    }

    if (containerRef.current) {
      containerRef.current.style.opacity = String(opacityRef.current)
      containerRef.current.style.display =
        opacityRef.current > 0.01 ? 'block' : 'none'
    }
  })

  return (
    <group position={[5, 4, z]}>
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div
          ref={containerRef}
          className="glass-panel min-w-[220px] px-4 py-3"
          style={{
            borderColor: WS_ACCENT_COLOR_30,
            boxShadow: `0 0 20px ${WS_ACCENT_GLOW}`,
            transition: 'opacity 0.3s ease',
          }}
        >
          <p className="mb-1 font-mono text-xs text-ws-accent">{date}</p>
          <p className="font-display text-sm leading-tight text-ws-text-primary">
            {label}
          </p>
        </div>
      </Html>
    </group>
  )
}
