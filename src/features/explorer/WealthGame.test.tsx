// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { WealthGame } from './WealthGame'
import { shuffledPeople } from './worlds'
const people = [
  { uri: 'a', name: 'Person A', industry: 'Technology', dollars: 200e9 },
  { uri: 'b', name: 'Person B', industry: 'Retail', dollars: 400e9 },
]
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function (): void {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (): void {
    this.removeAttribute('open')
  }
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('shuffles without mutating the source snapshot or losing people', () => {
  const result = shuffledPeople(people, () => 0)
  expect(result.map((p) => p.uri)).toEqual(['b', 'a'])
  expect(people.map((p) => p.uri)).toEqual(['a', 'b'])
})
it('hides the answer until reveal and accumulates one score per round', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.99)
  render(<WealthGame people={people} asOf="2026-08-31" onClose={vi.fn()} />)
  expect(screen.getByText(/Estimates as of 2026-08-31/)).toBeTruthy()
  expect(screen.queryByText(/The estimate is/)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Reveal the answer' }))
  expect(screen.getByText(/50 \/ 100/)).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Reveal the answer' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Next fortune' }))
  expect(screen.queryByText(/The estimate is/)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Reveal the answer' }))
  fireEvent.click(screen.getByRole('button', { name: 'See your score' }))
  expect(screen.getByText(/Your average score: 37.5/)).toBeTruthy()
})
