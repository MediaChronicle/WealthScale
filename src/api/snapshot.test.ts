import { describe, expect, it } from 'vitest'
import { BillionaireListResponseSchema } from './schemas'
import { toWealthSnapshot } from './snapshot'

describe('dated wealth snapshot', () => {
  const response = {
    date: '2026-09-01',
    count: 1,
    total: 125000,
    list: [
      { rank: 1, uri: 'example', name: 'Example person', networth: 125000 },
    ],
  }
  it('preserves the source date and converts millions to dollars once', () => {
    const result = toWealthSnapshot(
      BillionaireListResponseSchema.parse(response),
    )
    expect(result.asOf).toBe('2026-09-01')
    expect(result.people[0].dollars).toBe(125_000_000_000)
  })
  it('handles an empty list without inventing a person', () => {
    expect(
      toWealthSnapshot(
        BillionaireListResponseSchema.parse({ ...response, list: [] }),
      ).people,
    ).toEqual([])
  })
  it('rejects malformed data instead of showing it as a fortune', () => {
    expect(() =>
      BillionaireListResponseSchema.parse({
        ...response,
        list: [{ ...response.list[0], networth: 'large' }],
      }),
    ).toThrow()
  })
})

it('selects by rank even when the provider changes array order', () => {
  const list = Array.from({ length: 12 }, (_, i) => ({
    rank: 12 - i,
    uri: String(i),
    name: `Person ${12 - i}`,
    networth: 1000,
  }))
  const result = toWealthSnapshot(
    BillionaireListResponseSchema.parse({ date: '2026-09-18', list }),
  )
  expect(result.people.map((person) => person.name)).toEqual(
    Array.from({ length: 10 }, (_, i) => `Person ${i + 1}`),
  )
})

it('retains a company source and human-readable industry from the list', () => {
  const snapshot = toWealthSnapshot(
    BillionaireListResponseSchema.parse({
      date: '2026-09-19',
      list: [
        {
          rank: 1,
          uri: 'example',
          name: 'Example',
          networth: 200,
          industry: ['fashion-retail'],
          source: ['Example company'],
        },
      ],
    }),
  )
  expect(snapshot.people[0].source).toBe('Example company')
  expect(snapshot.people[0].industry).toBe('Fashion retail')
})
