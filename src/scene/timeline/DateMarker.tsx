import { Text } from '@react-three/drei'
import {
  TIMELINE_DATE_MARKER_COLOR,
  TIMELINE_DATE_LINE_COLOR,
  TIMELINE_DATE_LINE_OPACITY,
} from '@/utils/constants'

interface DateMarkerProps {
  label: string
  z: number
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function formatDateLabel(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-')
  const monthIndex = parseInt(month, 10) - 1
  return `${MONTHS[monthIndex] ?? month} ${year}`
}

export function DateMarker({ label, z }: DateMarkerProps) {
  const formatted = formatDateLabel(label)

  return (
    <group position={[0, 0.05, z]}>
      <Text
        fontSize={0.4}
        color={TIMELINE_DATE_MARKER_COLOR}
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {formatted}
      </Text>

      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.02, 2, 0.02]} />
        <meshBasicMaterial
          color={TIMELINE_DATE_LINE_COLOR}
          transparent
          opacity={TIMELINE_DATE_LINE_OPACITY}
        />
      </mesh>
    </group>
  )
}
