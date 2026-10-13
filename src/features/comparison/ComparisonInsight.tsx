import type { ReactElement } from 'react'
import { compareAmount, money, number } from '@/features/journey/scale'
import type { InputKind } from '@/features/journey/scale'
export function ComparisonInsight({
  amount,
  kind,
  target,
}: {
  amount: number | null
  kind: InputKind
  target: number | undefined
}): ReactElement | null {
  if (amount === null || !target || target <= 0) return null
  const result = compareAmount(amount, kind, target)
  const value = result.years ?? result.multiple
  return (
    <div className="comparison-insight" aria-live="polite">
      <span className="small-label">
        {kind === 'income'
          ? 'AT YOUR ANNUAL INCOME'
          : `RELATIVE TO YOUR ${money(amount)} REFERENCE`}
      </span>
      <strong>
        {value < 1000
          ? number(value)
          : new Intl.NumberFormat('en-US', {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(value)}
        <span>{kind === 'income' ? ' years' : ' ×'}</span>
      </strong>
      <p>
        {kind === 'income'
          ? 'Gross income only. Assumes every dollar is saved, with no tax, spending, inflation, or investment returns.'
          : 'That many copies of your reference make this amount. The scene legend explains how the values are drawn.'}
      </p>
    </div>
  )
}
