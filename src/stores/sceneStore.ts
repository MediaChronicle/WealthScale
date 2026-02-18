import type { StateCreator } from 'zustand'
import type { VisualizationMode } from '@/types'

export interface SceneSlice {
  mode: VisualizationMode
  pendingMode: VisualizationMode | null
  isTransitioning: boolean
  showOrbits: boolean
  leaderboardOpen: boolean

  setMode: (mode: VisualizationMode) => void
  commitMode: () => void
  setTransitioning: (value: boolean) => void
  toggleOrbits: () => void
  setLeaderboardOpen: (open: boolean) => void
}

export const createSceneSlice: StateCreator<SceneSlice, [], [], SceneSlice> = (
  set,
  get,
) => ({
  mode: 'cosmos',
  pendingMode: null,
  isTransitioning: false,
  showOrbits: true,
  leaderboardOpen: true,

  setMode: (mode) => {
    if (get().isTransitioning) return
    set({ pendingMode: mode, isTransitioning: true })
  },
  commitMode: () =>
    set((s) => ({ mode: s.pendingMode ?? s.mode, pendingMode: null })),
  setTransitioning: (value) => set({ isTransitioning: value }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  setLeaderboardOpen: (open) => set({ leaderboardOpen: open }),
})
