import { scaleUnit } from './scale'
import { describe, expect, it } from 'vitest'
import {
  compareAmount,
  blockLayout,
  journeyReducer,
  INITIAL_JOURNEY,
  number,
  money,
  unitSide,
} from './scale'

describe('wealth units and comparisons', () => {
  it('compares dollar net worth without treating it as income', () => {
    expect(compareAmount(100_000, 'netWorth', 1_000_000_000)).toEqual({
      multiple: 10_000,
      years: null,
      volumeScale: Math.cbrt(0.0001),
    })
  })
  it('only annual income produces years and recalculates for another target', () => {
    expect(compareAmount(50_000, 'income', 1_000_000).years).toBe(20)
    expect(compareAmount(50_000, 'income', 1_000_000_000).years).toBe(20_000)
  })
  it.each([0, 0.5, -1, Infinity, NaN, 1e16])(
    'rejects invalid reference %s',
    (amount) => {
      expect(() => compareAmount(amount, 'netWorth', 1e9)).toThrow()
    },
  )
  it('preserves literal volume even when the reference exceeds the target', () => {
    expect(compareAmount(8e9, 'netWorth', 1e9).volumeScale).toBe(2)
  })
})

describe('bounded scale assembly', () => {
  it('represents a billion with exactly a thousand million-dollar blocks', () => {
    const layout = blockLayout(1e9, 1e6)
    expect(layout).toHaveLength(1000)
    expect(layout.reduce((sum, block) => sum + block.value, 0)).toBe(1e9)
  })
  it('uses a fractional volume for the final block', () => {
    const layout = blockLayout(2.5e9, 1e9)
    expect(layout.map((block) => block.value)).toEqual([1e9, 1e9, 0.5e9])
    expect(layout[2].scale ** 3).toBeCloseTo(0.5)
  })
  it('rejects unbounded meshes and invalid amounts', () => {
    expect(() => blockLayout(1e12, 1)).toThrow()
    expect(() => blockLayout(1, 0)).toThrow()
  })
})

describe('journey navigation', () => {
  it('supports skip, reset, and bounded navigation', () => {
    expect(journeyReducer(INITIAL_JOURNEY, { type: 'back' }).step).toBe(0)
    const explore = journeyReducer(INITIAL_JOURNEY, { type: 'explore' })
    expect(explore.step).toBe(5)
    expect(journeyReducer(explore, { type: 'next' }).step).toBe(5)
    expect(journeyReducer(explore, { type: 'reset' })).toEqual(INITIAL_JOURNEY)
  })
  it('remembers a prediction when revisiting the lesson and clears it on reset', () => {
    const predicted = journeyReducer(INITIAL_JOURNEY, {
      type: 'predict',
      value: 100,
    })
    expect(predicted.prediction).toBe(100)
    expect(journeyReducer(predicted, { type: 'next' }).prediction).toBe(100)
    expect(journeyReducer(predicted, { type: 'reset' }).prediction).toBeNull()
  })
})

it('keeps tiny nonzero comparison ratios visible', () => {
  expect(number(0.000001)).toBe('0.000001')
})

it('labels sub-cent unit blocks without rounding their value to zero', () => {
  expect(money(0.001)).toBe('$0.001')
})

it('preserves scene volume ratios without normalizing away the growth', () => {
  expect(unitSide(1e9) / unitSide(1e6)).toBeCloseTo(10)
  expect(unitSide(1e12) / unitSide(1e6)).toBeCloseTo(100)
  expect(unitSide(1e5) ** 3 / (1000 * unitSide(1e6) ** 3)).toBeCloseTo(0.0001)
  expect(unitSide(1e12) ** 3 / unitSide(1e6) ** 3).toBeCloseTo(1e6)
})

it('keeps bounded block counts and a fixed billion-dollar unit above a billion', () => {
  for (const target of [
    1e9 - 0.1,
    1e9,
    1e9 + 100,
    1e10,
    1e10 + 100,
    1e11,
    1e12,
  ]) {
    const count = target / scaleUnit(target)
    expect(count).toBeGreaterThanOrEqual(1)
    expect(count).toBeLessThanOrEqual(1000)
  }
  expect(scaleUnit(1e6)).toBe(scaleUnit(1e9))
  expect(scaleUnit(1e9 + 100)).toBe(1e9)
  expect(scaleUnit(1e11)).toBe(scaleUnit(1e12))
})
