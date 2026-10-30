// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { probeWebGL } from './webgl'
afterEach(() => vi.restoreAllMocks())
it('routes a missing WebGL2 context to the alternative before mounting Fiber', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  expect(probeWebGL()).toBe(false)
})
it('handles context creation throwing rather than leaving a blank stage', () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    throw new Error('GPU unavailable')
  })
  expect(probeWebGL()).toBe(false)
})
