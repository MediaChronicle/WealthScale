import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { fetchJson } from './client'
import { endpoints } from './endpoints'
import { parseHistory } from './history'
import type { WealthHistory } from './history'

export function useWealthHistory(
  enabled: boolean,
): UseQueryResult<WealthHistory, Error> {
  return useQuery({
    queryKey: ['wealth-history'],
    enabled,
    queryFn: async ({ signal }): Promise<WealthHistory> =>
      parseHistory(await fetchJson<unknown>(endpoints.top10, signal)),
  })
}
