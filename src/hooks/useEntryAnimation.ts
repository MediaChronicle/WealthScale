import { useState, useEffect, useRef } from 'react'
import {
  ENTRY_STARS_DELAY_MS,
  ENTRY_PLANET_START_MS,
  ENTRY_PLANET_STAGGER_MS,
  ENTRY_COMPLETE_BUFFER_MS,
} from '@/utils/constants'

// Module-level sentinel — animation plays ONCE per session
let hasPlayedEntry = false

interface EntryAnimationResult {
  starsVisible: boolean
  revealedCount: number
  sequenceComplete: boolean
}

export function useEntryAnimation(totalPlanets: number): EntryAnimationResult {
  const [starsVisible, setStarsVisible] = useState(hasPlayedEntry)
  const [revealedCount, setRevealedCount] = useState(
    hasPlayedEntry ? totalPlanets : 0,
  )
  const [sequenceComplete, setSequenceComplete] = useState(hasPlayedEntry)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (hasPlayedEntry || totalPlanets === 0) return

    const timers: ReturnType<typeof setTimeout>[] = []

    // Stars appear first
    timers.push(setTimeout(() => setStarsVisible(true), ENTRY_STARS_DELAY_MS))

    // Planets stagger in one at a time
    for (let i = 0; i <= totalPlanets; i++) {
      const delay = ENTRY_PLANET_START_MS + i * ENTRY_PLANET_STAGGER_MS
      timers.push(setTimeout(() => setRevealedCount(i + 1), delay))
    }

    // Sequence complete (all planets + sun + buffer)
    const totalDuration =
      ENTRY_PLANET_START_MS +
      totalPlanets * ENTRY_PLANET_STAGGER_MS +
      ENTRY_COMPLETE_BUFFER_MS
    timers.push(
      setTimeout(() => {
        setSequenceComplete(true)
        hasPlayedEntry = true
      }, totalDuration),
    )

    timersRef.current = timers
    return () => timers.forEach(clearTimeout)
  }, [totalPlanets])

  return { starsVisible, revealedCount, sequenceComplete }
}
