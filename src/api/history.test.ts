import { describe, expect, it } from 'vitest'
import fixture from './fixtures/top10.json'
import { parseHistory, historyMonth } from './history'

describe('monthly top-ten envelope', () => {
  it('joins profile names, preserves dates and converts millions once', () => {
    const history = parseHistory(fixture)
    const first = historyMonth(history, '2019-11')
    expect(first[0].name).toBe('Jeff Bezos')
    expect(first[0].dollars).toBe(112205597000)
    expect(history.months).toEqual(['2019-11', '2019-12', '2020-01'])
  })
  it('keeps missing months and missing people as missing observations', () => {
    const history = parseHistory({
      profiles: { a: { name: 'A' } },
      list: { '2020-01': [{ rank: 1, uri: 'a', networth: 1 }], '2020-03': [] },
    })
    expect(history.months).toEqual(['2020-01', '2020-02', '2020-03'])
    expect(historyMonth(history, '2020-02')).toEqual([])
    expect(historyMonth(history, '2020-03')).toEqual([])
  })
  it('uses an explicit missing-name label rather than failing or inventing identity', () => {
    expect(
      historyMonth(
        parseHistory({
          profiles: {},
          list: { '2020-01': [{ rank: 1, uri: 'a', networth: 1 }] },
        }),
        '2020-01',
      )[0].name,
    ).toBe('Name unavailable (a)')
  })
  it('does not rank old observations in a newer month', () => {
    const history = parseHistory({
      profiles: {},
      list: {
        '2020-01': [{ rank: 1, uri: 'old', networth: 999 }],
        '2020-02': [{ rank: 1, uri: 'new', networth: 1 }],
      },
    })
    expect(historyMonth(history, '2020-02').map((p) => p.uri)).toEqual(['new'])
  })
  it.each([
    {},
    { profiles: {}, list: { '2020-99': [] } },
    {
      profiles: {},
      list: { '2020-01': [{ rank: 1, uri: 'a', networth: -1 }] },
    },
  ])('rejects malformed data', (raw) => {
    expect(() => parseHistory(raw)).toThrow()
  })
})
