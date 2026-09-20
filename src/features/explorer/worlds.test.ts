import { describe, expect, it } from 'vitest'
import { worldLayout, scoreGuess, guessCeiling } from './worlds'
const people = [
  { uri: 'a', name: 'A', dollars: 800e9, industry: 'Tech' },
  { uri: 'b', name: 'B', dollars: 100e9, industry: 'Tech' },
]
describe('honest world encodings', () => {
  it('uses cube-root sphere radii for volume encoding', () => {
    const objects = worldLayout('cosmos', people)
    expect(objects[0].size / objects[1].size).toBeCloseTo(2)
  })
  it('uses proportional tower heights and ocean depths', () => {
    expect(
      worldLayout('towers', people)[0].size /
        worldLayout('towers', people)[1].size,
    ).toBeCloseTo(8)
    const ocean = worldLayout('ocean', people)
    expect(ocean[0].position[1] / ocean[1].position[1]).toBeCloseTo(8)
  })
  it('returns no fabricated objects for missing snapshot', () => {
    expect(worldLayout('towers', [])).toEqual([])
  })
})
describe('wealth prediction', () => {
  it('scores multiplicative error symmetrically and allows new highs', () => {
    expect(scoreGuess(100, 100)).toBe(100)
    expect(scoreGuess(200, 100)).toBe(50)
    expect(scoreGuess(50, 100)).toBe(50)
    expect(scoreGuess(0, 100)).toBe(0)
    expect(guessCeiling(891.9e9)).toBeGreaterThanOrEqual(891.9e9)
  })
})
