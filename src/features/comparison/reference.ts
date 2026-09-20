import type { InputKind } from '@/features/journey/scale'
import { MAX_REFERENCE } from '@/features/journey/scale'
export interface Reference {
  text: string
  kind: InputKind
}
export const DEFAULT_REFERENCE: Reference = { text: '100000', kind: 'netWorth' }
export function referenceValue(reference: Reference): number | null {
  const value = Number(reference.text)
  return Number.isFinite(value) && value >= 1 && value <= MAX_REFERENCE
    ? value
    : null
}
