import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/api/client'
import { endpoints } from '@/api/endpoints'
import { Top10SnapshotSchema } from '@/api/schemas'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { CACHE_TTL_TOP10_MS } from '@/utils/constants'
import type { TimelineData, TimelineBillionaire, BandDataPoint } from '@/types'

export function useBillionaireTop10History() {
  return useQuery({
    queryKey: ['billionaires', 'top10'],
    queryFn: async (): Promise<TimelineData> => {
      const raw = await fetchJson<unknown>(endpoints.top10)
      const validated = Top10SnapshotSchema.parse(raw)
      return transformTop10ToTimeline(validated)
    },
    staleTime: CACHE_TTL_TOP10_MS,
  })
}

function transformTop10ToTimeline(
  raw: Record<
    string,
    Array<{
      rank: number
      uri: string
      name: string
      networth: number
      industry: string[]
    }>
  >,
): TimelineData {
  const months = Object.keys(raw).sort()

  const billionaireMap = new Map<
    string,
    { name: string; industry: string; dataPoints: BandDataPoint[] }
  >()

  months.forEach((date, monthIndex) => {
    const entries = raw[date]
    if (!entries) return

    entries.forEach((entry) => {
      if (!billionaireMap.has(entry.uri)) {
        billionaireMap.set(entry.uri, {
          name: entry.name,
          industry: entry.industry?.[0] ?? 'other',
          dataPoints: [],
        })
      }

      billionaireMap.get(entry.uri)!.dataPoints.push({
        month: monthIndex,
        networth: entry.networth,
      })
    })
  })

  const billionaires: TimelineBillionaire[] = Array.from(
    billionaireMap.entries(),
  )
    .map(([uri, data]) => {
      const colors = getIndustryColor(data.industry)
      return {
        uri,
        name: data.name,
        color: colors.primary,
        dataPoints: data.dataPoints,
      }
    })
    .sort((a, b) => {
      const aLast = a.dataPoints[a.dataPoints.length - 1]?.networth ?? 0
      const bLast = b.dataPoints[b.dataPoints.length - 1]?.networth ?? 0
      return bLast - aLast
    })
    .slice(0, 10)

  return { months, billionaires }
}
