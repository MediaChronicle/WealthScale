import type { StateCreator } from 'zustand'
import type { BillionaireListEntry, BillionaireProfile } from '@/types'

export interface BillionaireSlice {
  billionaires: BillionaireListEntry[]
  profiles: Record<string, BillionaireProfile>
  selectedUri: string | null

  setBillionaires: (data: BillionaireListEntry[]) => void
  selectBillionaire: (uri: string | null) => void
  addProfile: (uri: string, profile: BillionaireProfile) => void
}

export const createBillionaireSlice: StateCreator<
  BillionaireSlice,
  [],
  [],
  BillionaireSlice
> = (set) => ({
  billionaires: [],
  profiles: {},
  selectedUri: null,

  setBillionaires: (data) => set({ billionaires: data }),
  selectBillionaire: (uri) => set({ selectedUri: uri }),
  addProfile: (uri, profile) =>
    set((state) => ({
      profiles: { ...state.profiles, [uri]: profile },
    })),
})
