// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import type { ReactElement } from 'react'
import { Journey } from './Journey'
import { useWealthSnapshot } from './useWealthSnapshot'
import { DEFAULT_REFERENCE } from '@/features/comparison/reference'
vi.mock('./ScaleExhibit', () => ({
  ScaleExhibit: () => <div>Graphics test seam</div>,
}))
vi.mock('./useWealthSnapshot', () => ({
  useWealthSnapshot: vi.fn(() => ({
    data: { asOf: '2026-09-17', people: [] },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
}))
afterEach(cleanup)
function Harness(): ReactElement {
  const [reference, setReference] = useState(DEFAULT_REFERENCE)
  return (
    <Journey
      referenceInput={reference}
      onReferenceChange={setReference}
      initialStep={0}
      onOpenWorlds={vi.fn()}
    />
  )
}
it('pauses invalid comparisons and gates the billion reveal on a prediction', () => {
  render(<Harness />)
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } })
  expect(
    screen.getByRole('button', { name: /Let’s feel/ }).hasAttribute('disabled'),
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: '$50K' }))
  fireEvent.click(screen.getByRole('button', { name: /Let’s feel/ }))
  expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
    'a million',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Keep going' }))
  expect(
    screen.getByRole('button', { name: 'Keep going' }).hasAttribute('disabled'),
  ).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: '100 blocks' }))
  expect(screen.getByRole('status').textContent).toContain('1,000 millions')
  expect(
    screen.getByRole('button', { name: 'Keep going' }).hasAttribute('disabled'),
  ).toBe(false)
})
it('labels income assumptions and discloses unavailable fortunes', () => {
  render(<Harness />)
  fireEvent.click(screen.getByRole('button', { name: 'Annual income' }))
  fireEvent.click(screen.getByRole('button', { name: '02 A million' }))
  expect(screen.getByText(/Gross income only/).textContent).toContain('no tax')
  fireEvent.click(screen.getByRole('button', { name: '04 A real fortune' }))
  expect(screen.getByText(/Live estimates unavailable/)).toBeTruthy()
})

it('does not request fortune data until a chapter needs it', () => {
  vi.mocked(useWealthSnapshot).mockClear()
  render(<Harness />)
  expect(useWealthSnapshot).toHaveBeenLastCalledWith(false)
  fireEvent.click(screen.getByRole('button', { name: '02 A million' }))
  expect(useWealthSnapshot).toHaveBeenLastCalledWith(false)
  fireEvent.click(screen.getByRole('button', { name: '03 A billion' }))
  expect(useWealthSnapshot).toHaveBeenLastCalledWith(true)
  fireEvent.click(screen.getByRole('button', { name: '04 A real fortune' }))
  expect(useWealthSnapshot).toHaveBeenLastCalledWith(true)
  expect(
    screen.getByText(/This is an illustrative billion-dollar benchmark/),
  ).toBeTruthy()
})

it('describes pending estimates as loading, not unavailable', () => {
  vi.mocked(useWealthSnapshot).mockReturnValueOnce({
    data: undefined,
    isPending: true,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useWealthSnapshot>)
  render(
    <Journey
      referenceInput={DEFAULT_REFERENCE}
      onReferenceChange={vi.fn()}
      initialStep={3}
      onOpenWorlds={vi.fn()}
    />,
  )
  expect(screen.getByText(/Loading a dated fortune/)).toBeTruthy()
  expect(screen.queryByText(/No dated fortune/)).toBeNull()
})
