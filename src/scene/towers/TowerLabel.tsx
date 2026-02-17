import { Billboard, Text } from '@react-three/drei'
import { formatWealth } from '@/utils/formatWealth'
import {
  TEXT_COLOR,
  TEXT_OUTLINE_COLOR,
  TOWER_LABEL_OFFSET_X,
  TOWER_LABEL_HEIGHT_FACTOR,
} from '@/utils/constants'

interface TowerLabelProps {
  name: string
  networth: number
  height: number
}

export function TowerLabel({ name, networth, height }: TowerLabelProps) {
  return (
    <Billboard
      position={[TOWER_LABEL_OFFSET_X, height * TOWER_LABEL_HEIGHT_FACTOR, 0]}
      follow
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <Text
        fontSize={0.5}
        color={TEXT_COLOR}
        anchorX="left"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor={TEXT_OUTLINE_COLOR}
      >
        {name}
      </Text>
      <Text
        fontSize={0.35}
        color="#00d4ff"
        anchorX="left"
        anchorY="top"
        position={[0, -0.1, 0]}
      >
        {formatWealth(networth)}
      </Text>
    </Billboard>
  )
}
