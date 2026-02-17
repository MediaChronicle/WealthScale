import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/stores'
import { useAchievementStore } from '@/stores/achievementStore'
import type { VisualizationMode } from '@/types'

export function useAchievements(): {
  unlockFirstOrbit: () => void
  unlockDeepDiver: () => void
  unlockTimeTraveler: () => void
  unlockShareTheScale: () => void
} {
  const mode = useAppStore((s) => s.mode)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const showComparison = useAppStore((s) => s.showComparison)

  const visitedModes = useRef(new Set<VisualizationMode>())
  const clickedUris = useRef(new Set<string>())

  // Track mode visits
  useEffect(() => {
    visitedModes.current.add(mode)
    const store = useAchievementStore.getState()

    if (mode === 'cosmos' && !store.isUnlocked('first-orbit')) {
      store.unlock('first-orbit')
    }
    if (mode === 'ocean' && !store.isUnlocked('deep-diver')) {
      store.unlock('deep-diver')
    }
    if (mode === 'timeline' && !store.isUnlocked('time-traveler')) {
      store.unlock('time-traveler')
    }
    if (visitedModes.current.size >= 4 && !store.isUnlocked('all-modes')) {
      store.unlock('all-modes')
    }
  }, [mode])

  // Track billionaire clicks
  useEffect(() => {
    if (!selectedUri) return
    clickedUris.current.add(selectedUri)

    const store = useAchievementStore.getState()
    if (clickedUris.current.size >= 10 && !store.isUnlocked('zoomed-in')) {
      store.unlock('zoomed-in')
    }
  }, [selectedUri])

  // Track comparison toggle
  useEffect(() => {
    if (!showComparison) return
    const store = useAchievementStore.getState()
    if (!store.isUnlocked('reality-check')) {
      store.unlock('reality-check')
    }
  }, [showComparison])

  const unlockFirstOrbit = useCallback(() => {
    useAchievementStore.getState().unlock('first-orbit')
  }, [])

  const unlockDeepDiver = useCallback(() => {
    useAchievementStore.getState().unlock('deep-diver')
  }, [])

  const unlockTimeTraveler = useCallback(() => {
    useAchievementStore.getState().unlock('time-traveler')
  }, [])

  const unlockShareTheScale = useCallback(() => {
    useAchievementStore.getState().unlock('share-the-scale')
  }, [])

  return {
    unlockFirstOrbit,
    unlockDeepDiver,
    unlockTimeTraveler,
    unlockShareTheScale,
  }
}
