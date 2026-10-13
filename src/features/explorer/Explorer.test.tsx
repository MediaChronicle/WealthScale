// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Explorer } from './Explorer'
import { DEFAULT_REFERENCE } from '@/features/comparison/reference'
const fixtures = vi.hoisted(() => ({
  error: false,
  refetch: vi.fn(),
  person: {
    uri: 'a',
    name: 'Example Person',
    dollars: 80e9,
    industry: 'Technology',
  },
}))
vi.mock('@/features/journey/useWealthSnapshot', () => ({
  useWealthSnapshot: () => ({
    data: { asOf: '2026-08-31', people: [fixtures.person] },
    isPending: false,
    isError: fixtures.error,
    refetch: fixtures.refetch,
  }),
}))
vi.mock('@/api/useWealthHistory', () => ({
  useWealthHistory: () => ({
    data: {
      months: ['2026-07', '2026-08'],
      snapshots: { '2026-07': [fixtures.person], '2026-08': [] },
    },
    isPending: false,
    isError: false,
  }),
}))
vi.mock('./WorldStage', () => ({
  default: ({ onSelect }: { onSelect: (uri: string) => void }) => (
    <div>
      Graphics seam
      <button onClick={() => onSelect('2026-08')}>Select scene month</button>
    </div>
  ),
}))
afterEach(() => {
  cleanup()
  fixtures.error = false
  vi.clearAllMocks()
})
it('renders source dates and changes historical selection without inventing missing wealth', async () => {
  render(
    <Explorer
      reference={DEFAULT_REFERENCE}
      onReferenceChange={vi.fn()}
      onBack={vi.fn()}
    />,
  )
  expect(screen.getByText(/Estimates as of 2026-08-31/)).toBeTruthy()
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Cosmos' }), { key: 'End' })
  expect(
    screen.getByRole('tab', { name: 'Timeline' }).getAttribute('aria-selected'),
  ).toBe('true')
  expect(screen.getByText(/No observations for this month/)).toBeTruthy()
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Travel through time' }),
    { target: { value: '2026-07' } },
  )
  expect(await screen.findByText('Graphics seam')).toBeTruthy()
  expect(screen.getByText(/Estimates as of 2026-07/)).toBeTruthy()
  fireEvent.change(screen.getByRole('combobox', { name: 'Choose a fortune' }), {
    target: { value: 'a' },
  })
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Travel through time' }),
    { target: { value: '2026-08' } },
  )
  expect(screen.getByRole('heading', { name: 'Example Person' })).toBeTruthy()
  expect(screen.getByText('No observation')).toBeTruthy()
  expect(screen.queryByText('$80B', { selector: 'strong' })).toBeNull()
})
it('offers a retry and the benchmark route on network failure', () => {
  fixtures.error = true
  const back = vi.fn()
  render(
    <Explorer
      reference={DEFAULT_REFERENCE}
      onReferenceChange={vi.fn()}
      onBack={back}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Retry data' }))
  expect(fixtures.refetch).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: 'Return to scale lab' }))
  expect(back).toHaveBeenCalledOnce()
})

it('routes a timeline scene selection to the month control', async () => {
  render(
    <Explorer
      reference={DEFAULT_REFERENCE}
      onReferenceChange={vi.fn()}
      onBack={vi.fn()}
    />,
  )
  fireEvent.click(screen.getByRole('tab', { name: 'Timeline' }))
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Travel through time' }),
    { target: { value: '2026-07' } },
  )
  fireEvent.click(
    await screen.findByRole('button', { name: 'Select scene month' }),
  )
  expect(screen.getByText(/No observations for this month/)).toBeTruthy()
})
