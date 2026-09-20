import type { ReactElement } from 'react'
import type { Quality } from '@/scene/lab/policy'
export function QualitySelect({
  value,
  onChange,
  label = 'Graphics quality',
}: {
  value: Quality
  onChange: (value: Quality) => void
  label?: string
}): ReactElement {
  return (
    <label className="quality-select">
      Graphics{' '}
      <select
        aria-label={label}
        value={value}
        onChange={(event) =>
          onChange(event.target.value === 'economy' ? 'economy' : 'standard')
        }
      >
        <option value="standard">Standard</option>
        <option value="economy">Economy · fewer pixels</option>
      </select>
    </label>
  )
}
