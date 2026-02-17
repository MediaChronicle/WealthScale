import { useMemo } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useAppStore } from '@/stores'
import { oceanDepth } from '@/utils/wealthMath'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { WealthCreature } from './WealthCreature'
import { WaterSurface } from './WaterSurface'
import { DepthMarker } from './DepthMarker'
import { CausticLights } from './CausticLights'
import {
  OCEAN_BG_COLOR,
  OCEAN_FOG_COLOR,
  OCEAN_FOG_NEAR,
  OCEAN_FOG_FAR,
  OCEAN_DEPTH_MARKERS,
  OCEAN_ORBIT_TARGET,
  OCEAN_ORBIT_MIN_DISTANCE,
  OCEAN_ORBIT_MAX_DISTANCE,
  OCEAN_SPREAD_RADIUS_BASE,
  OCEAN_SPREAD_RADIUS_RAND,
} from '@/utils/constants'

export function OceanMode() {
  const billionaires = useAppStore((s) => s.billionaires)

  const creatures = useMemo(
    () =>
      billionaires.map((b, i) => {
        const depth = oceanDepth(b.networth)
        const industry = b.industry[0] ?? 'other'
        const colors = getIndustryColor(industry)
        const angle = (i / billionaires.length) * Math.PI * 2
        const spreadRadius =
          OCEAN_SPREAD_RADIUS_BASE +
          (((i * 7919) % 1000) / 1000) * OCEAN_SPREAD_RADIUS_RAND
        const x = Math.cos(angle) * spreadRadius
        const z = Math.sin(angle) * spreadRadius

        return { entry: b, depth, colors, x, z }
      }),
    [billionaires],
  )

  return (
    <>
      <color attach="background" args={[OCEAN_BG_COLOR]} />
      <fog
        attach="fog"
        args={[OCEAN_FOG_COLOR, OCEAN_FOG_NEAR, OCEAN_FOG_FAR]}
      />

      <CausticLights />

      <WaterSurface />

      {OCEAN_DEPTH_MARKERS.map((networth) => (
        <DepthMarker
          key={networth}
          depth={oceanDepth(networth)}
          label={`$${networth / 1000}B`}
        />
      ))}

      {creatures.map(({ entry, depth, colors, x, z }) => (
        <WealthCreature
          key={entry.uri}
          name={entry.name}
          networth={entry.networth}
          position={[x, depth, z]}
          color={colors.primary}
          emissiveColor={colors.emissive}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        target={OCEAN_ORBIT_TARGET}
        minDistance={OCEAN_ORBIT_MIN_DISTANCE}
        maxDistance={OCEAN_ORBIT_MAX_DISTANCE}
      />
    </>
  )
}
