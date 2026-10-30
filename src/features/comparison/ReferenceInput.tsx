import type { ReactElement } from 'react'
import type { Reference } from './reference'
import { referenceValue } from './reference'
import { MAX_REFERENCE, money } from '@/features/journey/scale'
export function ReferenceInput({
  reference,
  onChange,
}: {
  reference: Reference
  onChange: (value: Reference) => void
}): ReactElement {
  const value = referenceValue(reference)
  return (
    <div className="reference-form">
      <div className="segmented" aria-label="Reference type">
        <button
          aria-pressed={reference.kind === 'netWorth'}
          onClick={() => onChange({ ...reference, kind: 'netWorth' })}
        >
          Net worth
        </button>
        <button
          aria-pressed={reference.kind === 'income'}
          onClick={() => onChange({ ...reference, kind: 'income' })}
        >
          Annual income
        </button>
      </div>
      <label htmlFor="reference-amount">
        {reference.kind === 'income'
          ? 'Your yearly income'
          : 'Your reference amount'}{' '}
        <span>USD</span>
      </label>
      <div className="amount-input">
        <span>$</span>
        <input
          id="reference-amount"
          type="number"
          inputMode="decimal"
          min={1}
          max={MAX_REFERENCE}
          step="any"
          value={reference.text}
          onChange={(event) =>
            onChange({ ...reference, text: event.target.value })
          }
          aria-invalid={value === null}
          aria-describedby="amount-help"
        />
      </div>
      <p
        id="amount-help"
        className={value === null ? 'input-error' : 'input-help'}
      >
        {value === null
          ? 'Enter $1 to $1 trillion. Comparisons pause until corrected.'
          : 'An example is enough. Your amount stays in this page.'}
      </p>
      <div className="presets">
        {[50000, 100000, 1000000].map((amount) => (
          <button
            key={amount}
            aria-pressed={value === amount}
            onClick={() => onChange({ ...reference, text: String(amount) })}
          >
            {money(amount)}
          </button>
        ))}
      </div>
    </div>
  )
}
