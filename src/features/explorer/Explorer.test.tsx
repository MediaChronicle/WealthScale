// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { Explorer } from './Explorer'
import { DEFAULT_REFERENCE } from '@/features/comparison/reference'
import type { WealthHistory } from '@/api/history'
const fixtures = vi.hoisted(() => ({
  error: false,
  history: null as WealthHistory | null,
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
    data: fixtures.history ?? {
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
      <button onClick={() => onSelect('2026-07')}>
        Select earlier scene month
      </button>
    </div>
  ),
}))
afterEach(() => {
  cleanup()
  fixtures.error = false
  fixtures.history = null
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

it.each(['dropdown', 'range', 'scene', 'scene key', 'illustrated row'])(
  'keeps the default fortune through rank changes and missing months using the %s',
  async (control) => {
    const other = {
      uri: 'b',
      name: 'Other Person',
      dollars: 100e9,
      industry: 'Retail',
    }
    fixtures.history = {
      months: ['2026-06', '2026-07', '2026-08'],
      snapshots: {
        '2026-06': [other],
        '2026-07': [other, { ...fixtures.person, dollars: 70e9 }],
        '2026-08': [fixtures.person, { ...other, dollars: 60e9 }],
      },
    }
    render(
      <Explorer
        reference={DEFAULT_REFERENCE}
        onReferenceChange={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Timeline' }))
    const fortune = screen.getByRole('combobox', {
      name: 'Choose a fortune',
    }) as HTMLSelectElement
    const inspector = within(
      screen.getByRole('complementary', { name: 'Wealth inspector' }),
    )
    expect(fortune.value).toBe('a')

    if (control === 'dropdown') {
      fireEvent.change(
        screen.getByRole('combobox', { name: 'Travel through time' }),
        { target: { value: '2026-07' } },
      )
    } else if (control === 'range') {
      fireEvent.change(screen.getByRole('slider', { name: 'History month' }), {
        target: { value: '1' },
      })
    } else if (control === 'scene') {
      fireEvent.click(
        await screen.findByRole('button', {
          name: 'Select earlier scene month',
        }),
      )
    } else if (control === 'scene key') {
      fireEvent.click(screen.getByRole('button', { name: /2\. 2026-07/ }))
    } else {
      fireEvent.click(
        screen.getByRole('button', { name: 'Use illustrated view' }),
      )
      fireEvent.click(
        within(screen.getByLabelText('Net worth comparison')).getByRole(
          'button',
          { name: /^2026-07\s*\$70B$/ },
        ),
      )
    }

    expect(fortune.value).toBe('a')
    expect(
      inspector.getByRole('heading', { name: 'Example Person' }),
    ).toBeTruthy()
    expect(inspector.getByText('$70B', { selector: 'strong' })).toBeTruthy()
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Travel through time' }),
      { target: { value: '2026-06' } },
    )
    expect(fortune.value).toBe('a')
    expect(
      inspector.getByRole('heading', { name: 'Example Person' }),
    ).toBeTruthy()
    expect(inspector.getByText('No observation')).toBeTruthy()
    expect(inspector.queryByText('$100B', { selector: 'strong' })).toBeNull()

    fireEvent.change(fortune, { target: { value: 'b' } })
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Travel through time' }),
      { target: { value: '2026-08' } },
    )
    expect(fortune.value).toBe('b')
    expect(
      inspector.getByRole('heading', { name: 'Other Person' }),
    ).toBeTruthy()
  },
)
