import type { StateCreator } from 'zustand'
import type { VisualizationMode, Vec3 } from '@/types'

export interface SceneSlice {
  mode: VisualizationMode
  cameraTarget: Vec3
  isTransitioning: boolean
  showLabels: boolean
  showOrbits: boolean

  setMode: (mode: VisualizationMode) => void
  setCameraTarget: (target: Vec3) => void
  setTransitioning: (value: boolean) => void
  toggleLabels: () => void
  toggleOrbits: () => void
}

export const createSceneSlice: StateCreator<SceneSlice, [], [], SceneSlice> = (
  set,
) => ({
  mode: 'cosmos',
  cameraTarget: [0, 0, 0],
  isTransitioning: false,
  showLabels: true,
  showOrbits: true,

  setMode: (mode) => set({ mode, isTransitioning: true }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setTransitioning: (value) => set({ isTransitioning: value }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
})
