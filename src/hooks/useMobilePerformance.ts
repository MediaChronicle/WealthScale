import { useMemo } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  MOBILE_PARTICLE_COUNT,
  DESKTOP_PARTICLE_COUNT,
  MOBILE_STAR_COUNT,
  DESKTOP_STAR_COUNT,
  MOBILE_SPHERE_SEGMENTS,
  DESKTOP_SPHERE_SEGMENTS,
  MOBILE_DPR_RANGE,
  DESKTOP_DPR_RANGE,
} from '@/utils/constants'

export interface PerformanceConfig {
  particleCount: number
  starCount: number
  enablePostProcessing: boolean
  enableVolumetricLights: boolean
  sphereSegments: number
  dprRange: [number, number]
}

export function useMobilePerformance(): PerformanceConfig {
  const isMobile = useIsMobile()

  return useMemo<PerformanceConfig>(
    () =>
      isMobile
        ? {
            particleCount: MOBILE_PARTICLE_COUNT,
            starCount: MOBILE_STAR_COUNT,
            enablePostProcessing: false,
            enableVolumetricLights: false,
            sphereSegments: MOBILE_SPHERE_SEGMENTS,
            dprRange: MOBILE_DPR_RANGE,
          }
        : {
            particleCount: DESKTOP_PARTICLE_COUNT,
            starCount: DESKTOP_STAR_COUNT,
            enablePostProcessing: true,
            enableVolumetricLights: true,
            sphereSegments: DESKTOP_SPHERE_SEGMENTS,
            dprRange: DESKTOP_DPR_RANGE,
          },
    [isMobile],
  )
}
