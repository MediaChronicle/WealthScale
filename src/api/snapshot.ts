import type { z } from 'zod'
import { BillionaireListResponseSchema } from './schemas'

export interface WealthPerson {
  uri: string
  name: string
  dollars: number
  industry: string
  source?: string
}
export interface WealthSnapshot {
  asOf: string
  people: WealthPerson[]
}

export function toWealthSnapshot(
  response: z.infer<typeof BillionaireListResponseSchema>,
): WealthSnapshot {
  return {
    asOf: response.date,
    people: response.list
      .filter(
        (person) => Number.isFinite(person.networth) && person.networth > 0,
      )
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10)
      .map((person) => ({
        uri: person.uri,
        name: person.name,
        dollars: person.networth * 1_000_000,
        industry: (person.industry[0] ?? 'Diversified')
          .replaceAll('-', ' ')
          .replace(/^./, (letter) => letter.toUpperCase()),
        source: person.source?.join(', '),
      })),
  }
}
