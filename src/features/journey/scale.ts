export type InputKind = 'netWorth' | 'income'
export const MAX_REFERENCE = 1_000_000_000_000

export function compareAmount(
  amount: number,
  kind: InputKind,
  target: number,
): { multiple: number; years: number | null; volumeScale: number } {
  if (
    !Number.isFinite(amount) ||
    amount < 1 ||
    amount > MAX_REFERENCE ||
    !Number.isFinite(target) ||
    target <= 0
  ) {
    throw new RangeError('Enter an amount between $1 and $1 trillion.')
  }
  return {
    multiple: target / amount,
    years: kind === 'income' ? target / amount : null,
    volumeScale: Math.cbrt(amount / target),
  }
}

export interface ScaleBlock {
  position: [number, number, number]
  scale: number
  value: number
}

/** A bounded 10 × 10 × 10 grid. A partial block preserves volume, not edge length. */
export function blockLayout(total: number, unit: number): ScaleBlock[] {
  const ratio = total / unit
  const nearest = Math.round(ratio)
  const count = Math.abs(ratio - nearest) < 1e-10 ? nearest : Math.ceil(ratio)
  if (!Number.isFinite(count) || total <= 0 || unit <= 0 || count > 1000)
    throw new RangeError('Scale requires between 1 and 1,000 blocks.')
  const width = Math.min(10, Math.ceil(Math.cbrt(count)))
  return Array.from({ length: count }, (_, index) => {
    const value = Math.min(unit, total - index * unit)
    return {
      position: [
        (index % width) - (width - 1) / 2,
        Math.floor(index / (width * width)),
        (Math.floor(index / width) % width) - (width - 1) / 2,
      ],
      scale: Math.cbrt(value / unit),
      value,
    }
  })
}

export interface JourneyState {
  step: number
  prediction: number | null
}
export type JourneyAction =
  | { type: 'next' | 'back' | 'explore' | 'reset' }
  | { type: 'predict'; value: number }
  | { type: 'go'; step: number }
export const INITIAL_JOURNEY: JourneyState = { step: 0, prediction: null }
export function journeyReducer(
  state: JourneyState,
  action: JourneyAction,
): JourneyState {
  switch (action.type) {
    case 'next':
      return { ...state, step: Math.min(5, state.step + 1) }
    case 'back':
      return { ...state, step: Math.max(0, state.step - 1) }
    case 'explore':
      return { ...state, step: 5 }
    case 'reset':
      return INITIAL_JOURNEY
    case 'predict':
      return { ...state, prediction: action.value }
    case 'go':
      return { ...state, step: Math.max(0, Math.min(5, action.step)) }
  }
}

export function money(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: value > 0 && value < 1 ? 6 : 2,
  }).format(value)
}
export function number(value: number): string {
  return new Intl.NumberFormat(
    'en-US',
    value !== 0 && Math.abs(value) < 1
      ? { maximumSignificantDigits: 4 }
      : { maximumFractionDigits: 1 },
  ).format(value)
}

/** A world-space edge length, shared by the assembly and reference geometry. */
export function unitSide(dollars: number): number {
  return Math.cbrt(dollars / 1e6)
}

/** Keep the million-dollar unit through a billion, then group into billions. */
export function scaleUnit(target: number): number {
  if (!Number.isFinite(target) || target <= 0)
    throw new RangeError('Positive finite amount required')
  if (target <= 1e9) return 1e6
  return target <= 1e12 ? 1e9 : 10 ** (Math.ceil(Math.log10(target)) - 3)
}
