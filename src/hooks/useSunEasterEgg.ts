import { useState, useRef, useCallback } from 'react'
import {
  SUPERNOVA_CLICK_THRESHOLD,
  SUPERNOVA_RESET_TIMEOUT_MS,
  SUPERNOVA_EXPLOSION_DURATION_MS,
  SUPERNOVA_REFORM_DURATION_MS,
} from '@/utils/constants'

export type SupernovaPhase = 'idle' | 'exploding' | 'reforming'

interface SunEasterEggResult {
  supernovaPhase: SupernovaPhase
  handleSunClick: () => void
  isExploding: boolean
  isReforming: boolean
}

export function useSunEasterEgg(): SunEasterEggResult {
  const [supernovaPhase, setSupernovaPhase] = useState<SupernovaPhase>('idle')
  const clickCountRef = useRef(0)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSunClick = useCallback(() => {
    if (supernovaPhase !== 'idle') return

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)

    clickCountRef.current++

    if (clickCountRef.current >= SUPERNOVA_CLICK_THRESHOLD) {
      clickCountRef.current = 0
      setSupernovaPhase('exploding')

      setTimeout(() => {
        setSupernovaPhase('reforming')
        setTimeout(() => {
          setSupernovaPhase('idle')
        }, SUPERNOVA_REFORM_DURATION_MS)
      }, SUPERNOVA_EXPLOSION_DURATION_MS)
    } else {
      resetTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, SUPERNOVA_RESET_TIMEOUT_MS)
    }
  }, [supernovaPhase])

  return {
    supernovaPhase,
    handleSunClick,
    isExploding: supernovaPhase === 'exploding',
    isReforming: supernovaPhase === 'reforming',
  }
}
