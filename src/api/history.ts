import { z } from 'zod'
import type { WealthPerson } from './snapshot'

const MonthlyHistorySchema = z.object({
  profiles: z.record(
    z.string(),
    z.object({ name: z.string(), source: z.array(z.string()).optional() }),
  ),
  list: z.record(
    z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    z.array(
      z.object({
        rank: z.number().int().positive(),
        uri: z.string(),
        networth: z.number().nonnegative(),
      }),
    ),
  ),
})
export interface WealthHistory {
  months: string[]
  snapshots: Record<string, WealthPerson[]>
}

export function parseHistory(raw: unknown): WealthHistory {
  const validated = MonthlyHistorySchema.parse(raw)
  const dates = Object.keys(validated.list).sort()
  if (!dates.length) return { months: [], snapshots: {} }
  const months: string[] = []
  const first = dates[0].split('-').map(Number)
  const last = dates[dates.length - 1].split('-').map(Number)
  const from = first[0] * 12 + first[1] - 1
  const to = last[0] * 12 + last[1] - 1
  if (to - from > 2400) throw new Error('History date range is too large.')
  for (let index = from; index <= to; index++)
    months.push(
      `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`,
    )
  const snapshots = Object.fromEntries(
    dates.map((date) => [
      date,
      [...validated.list[date]]
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 10)
        .map((entry) => ({
          uri: entry.uri,
          name:
            validated.profiles[entry.uri]?.name ??
            `Name unavailable (${entry.uri})`,
          dollars: entry.networth * 1_000_000,
          industry: 'Historical estimate',
          source:
            validated.profiles[entry.uri]?.source?.join(', ') ??
            'Source unavailable',
        })),
    ]),
  )
  return { months, snapshots }
}

export function historyMonth(
  history: WealthHistory,
  month: string,
): WealthPerson[] {
  return history.snapshots[month] ?? []
}
