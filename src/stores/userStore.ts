import type { StateCreator } from 'zustand'

export interface UserSlice {
  netWorth: number
  currency: string
  showComparison: boolean
  comparisonTarget: string | null

  setNetWorth: (value: number) => void
  setCurrency: (code: string) => void
  toggleComparison: () => void
  setComparisonTarget: (uri: string | null) => void
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set,
) => ({
  netWorth: 0,
  currency: 'USD',
  showComparison: false,
  comparisonTarget: null,

  setNetWorth: (value) => set({ netWorth: value }),
  setCurrency: (code) => set({ currency: code }),
  toggleComparison: () => set((s) => ({ showComparison: !s.showComparison })),
  setComparisonTarget: (uri) => set({ comparisonTarget: uri }),
})
