import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LS_KEY_ACHIEVEMENTS } from '@/utils/constants'

export type AchievementId =
  | 'first-orbit'
  | 'deep-diver'
  | 'time-traveler'
  | 'reality-check'
  | 'all-modes'
  | 'zoomed-in'
  | 'share-the-scale'

export interface AchievementDef {
  id: AchievementId
  name: string
  description: string
  icon: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-orbit',
    name: 'First Orbit',
    description: 'Explore the Cosmos mode',
    icon: 'Globe',
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Explore the Ocean mode',
    icon: 'Waves',
  },
  {
    id: 'time-traveler',
    name: 'Time Traveler',
    description: 'Explore the Timeline mode',
    icon: 'Clock',
  },
  {
    id: 'reality-check',
    name: 'Reality Check',
    description: 'Compare your wealth to a billionaire',
    icon: 'Scale',
  },
  {
    id: 'all-modes',
    name: 'All Modes',
    description: 'Visit all four visualization modes',
    icon: 'LayoutGrid',
  },
  {
    id: 'zoomed-in',
    name: 'Zoomed In',
    description: 'Click on all 10 billionaires',
    icon: 'Search',
  },
  {
    id: 'share-the-scale',
    name: 'Share the Scale',
    description: 'Take a screenshot of the visualization',
    icon: 'Share2',
  },
]

export interface UnlockedAchievement {
  unlockedAt: number
}

interface AchievementState {
  unlocked: Record<AchievementId, UnlockedAchievement | null>
  latestUnlock: AchievementId | null
}

interface AchievementActions {
  unlock: (id: AchievementId) => void
  clearLatest: () => void
  resetAll: () => void
  isUnlocked: (id: AchievementId) => boolean
}

type AchievementStore = AchievementState & AchievementActions

const INITIAL_UNLOCKED: Record<AchievementId, UnlockedAchievement | null> = {
  'first-orbit': null,
  'deep-diver': null,
  'time-traveler': null,
  'reality-check': null,
  'all-modes': null,
  'zoomed-in': null,
  'share-the-scale': null,
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      unlocked: { ...INITIAL_UNLOCKED },
      latestUnlock: null,

      unlock: (id) => {
        if (get().unlocked[id]) return
        set({
          unlocked: {
            ...get().unlocked,
            [id]: { unlockedAt: Date.now() },
          },
          latestUnlock: id,
        })
      },

      clearLatest: () => set({ latestUnlock: null }),

      resetAll: () =>
        set({ unlocked: { ...INITIAL_UNLOCKED }, latestUnlock: null }),

      isUnlocked: (id) => get().unlocked[id] !== null,
    }),
    {
      name: LS_KEY_ACHIEVEMENTS,
      partialize: (state) => ({ unlocked: state.unlocked }),
    },
  ),
)
