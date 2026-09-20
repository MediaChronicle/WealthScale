// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ScaleExhibit } from './ScaleExhibit'
const stage = vi.hoisted(() => ({ capture: vi.fn() }))
vi.mock('./ScaleStage', () => ({
  default: (props: { captureInfo: { legend: string } }) => {
    stage.capture(props.captureInfo)
    return <div>Graphics seam</div>
  },
}))
afterEach(cleanup)
const props = {
  step: 3,
  target: 100e9,
  unit: 1e9,
  predicted: true,
  reference: 1e5,
  referenceKind: 'netWorth',
  resetToken: 0,
}
it('discloses the placeholder prominently, without an invented source date', () => {
  render(<ScaleExhibit {...props} />)
  expect(screen.getByText('ILLUSTRATIVE BENCHMARK')).toBeTruthy()
  expect(screen.queryByText(/Estimate as of/)).toBeNull()
})
it('renders the observation date beside the real fortune', () => {
  render(
    <ScaleExhibit {...props} personName="Example Person" asOf="2026-08-31" />,
  )
  expect(screen.getByText('Example Person')).toBeTruthy()
  expect(screen.getByText(/Estimate as of 2026-08-31/)).toBeTruthy()
})
it('does not label a trillion-dollar starting reference as a hypothetical benchmark', () => {
  render(<ScaleExhibit {...props} step={0} target={1e12} />)
  expect(screen.getByText('YOUR STARTING POINT')).toBeTruthy()
  expect(screen.queryByText('HYPOTHETICAL BENCHMARK')).toBeNull()
})
it('describes a large starting reference as one cube', () => {
  render(<ScaleExhibit {...props} step={0} target={2e6} unit={2e6} />)
  expect(screen.getByText(/One reference cube/)).toBeTruthy()
  expect(screen.queryByText(/1,000 million-dollar cubes/)).toBeNull()
})
it('does not present a fallback amount as an entered starting point', () => {
  render(<ScaleExhibit {...props} step={0} reference={null} target={1e5} />)
  expect(screen.getByText('Enter an amount')).toBeTruthy()
  expect(screen.queryByText('$100K')).toBeNull()
})

it('includes close-up disclosure in export metadata', async () => {
  render(<ScaleExhibit {...props} step={0} target={999} unit={999} />)
  await screen.findByText('Graphics seam')
  expect(stage.capture.mock.lastCall?.[0].legend).toContain(
    'Introductory close-up',
  )
})
