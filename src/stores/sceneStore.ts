import type { StateCreator } from 'zustand'
import type { VisualizationMode, Vec3 } from '@/types'

export interface SceneSlice {
  mode: VisualizationMode
  pendingMode: VisualizationMode | null
  cameraTarget: Vec3
  isTransitioning: boolean
  showLabels: boolean
  showOrbits: boolean
  leaderboardOpen: boolean

  setMode: (mode: VisualizationMode) => void
  commitMode: () => void
  setCameraTarget: (target: Vec3) => void
  setTransitioning: (value: boolean) => void
  toggleLabels: () => void
  toggleOrbits: () => void
  setLeaderboardOpen: (open: boolean) => void
}

export const createSceneSlice: StateCreator<SceneSlice, [], [], SceneSlice> = (
  set,
  get,
) => ({
  mode: 'cosmos',
  pendingMode: null,
  cameraTarget: [0, 0, 0],
  isTransitioning: false,
  showLabels: true,
  showOrbits: true,
  leaderboardOpen: true,

  setMode: (mode) => {
    if (get().isTransitioning) return
    set({ pendingMode: mode, isTransitioning: true })
  },
  commitMode: () =>
    set((s) => ({ mode: s.pendingMode ?? s.mode, pendingMode: null })),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setTransitioning: (value) => set({ isTransitioning: value }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  setLeaderboardOpen: (open) => set({ leaderboardOpen: open }),
})
