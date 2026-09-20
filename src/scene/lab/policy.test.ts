import { expect, it } from 'vitest'
import { renderPolicy } from './policy'
it('caps pixel density and geometry for mobile or economy mode', () => {
  expect(renderPolicy('standard', false)).toEqual({ dpr: 1.5, segments: 24 })
  expect(renderPolicy('standard', true)).toEqual({ dpr: 1, segments: 16 })
  expect(renderPolicy('economy', false)).toEqual({ dpr: 1, segments: 16 })
})
