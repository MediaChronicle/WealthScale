// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ComparisonInsight } from './ComparisonInsight'
afterEach(cleanup)
it('preserves a nonzero ratio when the reference exceeds the target', () => {
  render(<ComparisonInsight amount={1e12} target={1e6} kind="netWorth" />)
  expect(screen.getByText('0.000001')).toBeTruthy()
})
it('compacts large ratios without a long string of digits', () => {
  render(<ComparisonInsight amount={1e5} target={891e9} kind="netWorth" />)
  expect(screen.getByText('8.9M')).toBeTruthy()
})
