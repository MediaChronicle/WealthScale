import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { fetchJson } from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { BillionaireListResponseSchema } from '@/api/schemas'
import { toWealthSnapshot } from '@/api/snapshot'
import type { WealthSnapshot } from '@/api/snapshot'

export function useWealthSnapshot(
  enabled = true,
): UseQueryResult<WealthSnapshot, Error> {
  return useQuery({
    queryKey: ['wealth-snapshot'],
    enabled,
    queryFn: async ({ signal }): Promise<WealthSnapshot> =>
      toWealthSnapshot(
        BillionaireListResponseSchema.parse(
          await fetchJson<unknown>(endpoints.list, signal),
        ),
      ),
  })
}
