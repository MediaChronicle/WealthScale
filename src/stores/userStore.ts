import type { StateCreator } from 'zustand'
import { RACE_DURATION_SECONDS } from '@/utils/constants'

export interface ComparisonResults {
  scalePercent: number
  ratio: string
  timeToEarn: string
  timeToEarnSeconds: number
  userStackFeet: number
  billionaireStackFeet: number
}

export type RaceStatus = 'idle' | 'running' | 'finished'

export interface WealthRaceState {
  status: RaceStatus
  elapsed: number
  userAccumulated: number
  billionaireAccumulated: number
  duration: number
}

const INITIAL_RACE: WealthRaceState = {
  status: 'idle',
  elapsed: 0,
  userAccumulated: 0,
  billionaireAccumulated: 0,
  duration: RACE_DURATION_SECONDS,
}

export interface UserSlice {
  netWorth: number
  currency: string
  showComparison: boolean
  comparisonTarget: string | null
  comparisonResults: ComparisonResults | null
  wealthRace: WealthRaceState

  setNetWorth: (value: number) => void
  setCurrency: (code: string) => void
  setShowComparison: (show: boolean) => void
  setComparisonTarget: (uri: string | null) => void
  setComparisonResults: (results: ComparisonResults | null) => void
  startRace: () => void
  updateRace: (elapsed: number, userAcc: number, billionaireAcc: number) => void
  finishRace: () => void
  resetRace: () => void
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set,
) => ({
  netWorth: 0,
  currency: 'USD',
  showComparison: false,
  comparisonTarget: null,
  comparisonResults: null,
  wealthRace: INITIAL_RACE,

  setNetWorth: (value) => set({ netWorth: value }),
  setCurrency: (code) => set({ currency: code }),
  setShowComparison: (show) => set({ showComparison: show }),
  setComparisonTarget: (uri) => set({ comparisonTarget: uri }),
  setComparisonResults: (results) => set({ comparisonResults: results }),
  startRace: () =>
    set({
      wealthRace: { ...INITIAL_RACE, status: 'running' },
    }),
  updateRace: (elapsed, userAcc, billionaireAcc) =>
    set({
      wealthRace: {
        status: 'running',
        elapsed,
        userAccumulated: userAcc,
        billionaireAccumulated: billionaireAcc,
        duration: RACE_DURATION_SECONDS,
      },
    }),
  finishRace: () =>
    set((s) => ({
      wealthRace: { ...s.wealthRace, status: 'finished' },
    })),
  resetRace: () => set({ wealthRace: INITIAL_RACE }),
})
