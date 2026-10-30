import type { WealthPerson } from '@/api/snapshot'
export type World = 'cosmos' | 'towers' | 'ocean' | 'timeline'
export const WORLDS: {
  id: World
  name: string
  description: string
  legend: string
}[] = [
  {
    id: 'cosmos',
    name: 'Cosmos',
    description: 'Fortunes in orbit.',
    legend: 'Sphere volume = net worth. Orbital positions are illustrative.',
  },
  {
    id: 'towers',
    name: 'Towers',
    description: 'A skyline of scale.',
    legend: 'Equal footprints. Tower height = net worth, on one linear scale.',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Dive into the difference.',
    legend:
      'Depth below the surface = net worth. Marker sizes are illustrative.',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Wealth, through time.',
    legend:
      'Selected fortune over time. Bar height uses a fixed scale across all months. Gaps mean absent from that month’s top ten, not zero wealth.',
  },
]
export interface WorldObject {
  person: WealthPerson
  position: [number, number, number]
  size: number
}
export function worldLayout(
  world: Exclude<World, 'timeline'>,
  people: WealthPerson[],
  fixedMaximum?: number,
): WorldObject[] {
  const maximum =
    fixedMaximum ?? Math.max(1, ...people.map((person) => person.dollars))
  return people.map((person, index) => {
    const ratio = person.dollars / maximum
    if (world === 'cosmos') {
      const angle = (index / Math.max(people.length, 1)) * Math.PI * 2
      return {
        person,
        position: [Math.cos(angle) * 4.6, 0.8, Math.sin(angle) * 4.6],
        size: Math.cbrt(ratio) * 1.05,
      }
    }
    if (world === 'ocean')
      return {
        person,
        position: [(index - (people.length - 1) / 2) * 1.1, -ratio * 5, 0],
        size: 0.28,
      }
    return {
      person,
      position: [(index - (people.length - 1) / 2) * 1.05, (ratio * 5) / 2, 0],
      size: ratio * 5,
    }
  })
}
export function scoreGuess(guess: number, actual: number): number {
  if (
    !Number.isFinite(guess) ||
    !Number.isFinite(actual) ||
    guess <= 0 ||
    actual <= 0
  )
    return 0
  return Math.round((Math.min(guess, actual) / Math.max(guess, actual)) * 100)
}
export function guessCeiling(actual: number): number {
  return Math.max(100e9, Math.ceil(actual / 100e9) * 100e9 * 1.5)
}

export function shuffledPeople(
  people: WealthPerson[],
  random: () => number = Math.random,
): WealthPerson[] {
  const result = [...people]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
