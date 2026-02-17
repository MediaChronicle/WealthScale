import { useQuery } from '@tanstack/react-query'
import { fetchJson } from './client'
import { endpoints } from './endpoints'
import {
  BillionaireListResponseSchema,
  BillionaireProfileSchema,
} from './schemas'
import type { BillionaireListEntry, BillionaireProfile } from '@/types'
import { TOP_BILLIONAIRES_COUNT, CACHE_TTL_PROFILE_MS } from '@/utils/constants'

/**
 * Fetch top billionaires list (top 10 extracted).
 */
export function useBillionaireList(limit = TOP_BILLIONAIRES_COUNT) {
  return useQuery({
    queryKey: ['billionaires', 'list', limit],
    queryFn: async (): Promise<BillionaireListEntry[]> => {
      const raw = await fetchJson<unknown>(endpoints.list)
      const validated = BillionaireListResponseSchema.parse(raw)
      return validated.list.slice(0, limit)
    },
  })
}

/**
 * Fetch individual billionaire profile (lazy, on-demand).
 */
export function useBillionaireProfile(uri: string | null) {
  return useQuery({
    queryKey: ['billionaires', 'profile', uri],
    queryFn: async (): Promise<BillionaireProfile> => {
      const raw = await fetchJson<unknown>(endpoints.profile(uri!))
      return BillionaireProfileSchema.parse(raw)
    },
    enabled: !!uri,
    staleTime: CACHE_TTL_PROFILE_MS,
  })
}
