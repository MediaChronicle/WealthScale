import { useMemo } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { useAppStore } from '@/stores'
import { towerHeight } from '@/utils/wealthMath'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { WealthTower } from './WealthTower'
import { TowerLabel } from './TowerLabel'
import { GroundPlane } from './GroundPlane'
import { EnergyParticles } from './EnergyParticles'
import {
  TOWER_SPACING,
  TOWER_FOG_COLOR,
  TOWER_FOG_NEAR,
  TOWER_FOG_FAR,
  TOWER_AMBIENT_INTENSITY,
  TOWER_DIR_LIGHT_INTENSITY,
  TOWER_ORBIT_TARGET,
  TOWER_ORBIT_MIN_DISTANCE,
  TOWER_ORBIT_MAX_DISTANCE,
} from '@/utils/constants'

export function TowersMode() {
  const billionaires = useAppStore((s) => s.billionaires)

  const towers = useMemo(
    () =>
      billionaires.map((b, i) => {
        const height = towerHeight(b.networth)
        const industry = b.industry[0] ?? 'other'
        const colors = getIndustryColor(industry)
        const x = (i - (billionaires.length - 1) / 2) * TOWER_SPACING

        return { entry: b, height, colors, x }
      }),
    [billionaires],
  )

  return (
    <>
      <ambientLight intensity={TOWER_AMBIENT_INTENSITY} />
      <directionalLight
        position={[20, 40, 10]}
        intensity={TOWER_DIR_LIGHT_INTENSITY}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={50}
        shadow-camera-bottom={-10}
      />

      <Environment preset="city" />

      <fog
        attach="fog"
        args={[TOWER_FOG_COLOR, TOWER_FOG_NEAR, TOWER_FOG_FAR]}
      />

      <GroundPlane />

      {towers.map(({ entry, height, colors, x }) => (
        <group key={entry.uri} position={[x, 0, 0]}>
          <WealthTower
            height={height}
            color={colors.primary}
            emissiveColor={colors.emissive}
          />
          <TowerLabel
            name={entry.name}
            networth={entry.networth}
            height={height}
          />
          <EnergyParticles height={height} dailyChange={entry.change ?? 0} />
        </group>
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        target={TOWER_ORBIT_TARGET}
        minDistance={TOWER_ORBIT_MIN_DISTANCE}
        maxDistance={TOWER_ORBIT_MAX_DISTANCE}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  )
}
