import { useMemo } from 'react'
import { useAppStore } from '@/stores'
import type { BillionaireListEntry } from '@/types'

export function useSelectedBillionaire(): BillionaireListEntry | undefined {
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  return useMemo(
    () => billionaires.find((b) => b.uri === selectedUri),
    [billionaires, selectedUri],
  )
}
