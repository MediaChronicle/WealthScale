import type { StateCreator } from 'zustand'
import type { BillionaireListEntry } from '@/types'

export interface BillionaireSlice {
  billionaires: BillionaireListEntry[]
  selectedUri: string | null

  setBillionaires: (data: BillionaireListEntry[]) => void
  selectBillionaire: (uri: string | null) => void
}

export const createBillionaireSlice: StateCreator<
  BillionaireSlice,
  [],
  [],
  BillionaireSlice
> = (set) => ({
  billionaires: [],
  selectedUri: null,

  setBillionaires: (data) => set({ billionaires: data }),
  selectBillionaire: (uri) => set({ selectedUri: uri }),
})
