import { QueryClient } from '@tanstack/react-query'
import { ZodError } from 'zod'
import { CACHE_TTL_MS } from '@/utils/constants'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_TTL_MS,
        gcTime: 1000 * 60 * 60 * 24,
        retry: (count, error) => !(error instanceof ZodError) && count < 2,
        refetchOnWindowFocus: false,
      },
    },
  })
}
