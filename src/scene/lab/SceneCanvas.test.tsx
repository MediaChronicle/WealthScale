// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SceneCanvas } from './SceneCanvas'
vi.mock('./webgl', () => ({ probeWebGL: () => true }))
vi.mock('@/hooks/useIsMobile', () => ({ useIsMobile: () => false }))
vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div>Initializing renderer</div>,
}))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
it('allows a slow renderer to retry with a fresh timeout', () => {
  vi.useFakeTimers()
  render(
    <SceneCanvas
      pose={{ position: [1, 1, 1], target: [0, 0, 0] }}
      reset={0}
      quality="standard"
      captureInfo={{ title: 'test', legend: 'test', source: 'test' }}
      onCapture={vi.fn()}
      onFallback={vi.fn()}
    >
      {null}
    </SceneCanvas>,
  )
  act(() => vi.advanceTimersByTime(8000))
  expect(screen.getByText(/taking longer than expected/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Retry 3D' }))
  expect(screen.getByText('Initializing renderer')).toBeTruthy()
  act(() => vi.advanceTimersByTime(7999))
  expect(screen.queryByText(/taking longer than expected/)).toBeNull()
  act(() => vi.advanceTimersByTime(1))
  expect(screen.getByText(/taking longer than expected/)).toBeTruthy()
})
