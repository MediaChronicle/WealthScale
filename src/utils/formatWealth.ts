/**
 * Format net worth (in millions) to human-readable string.
 * 774601.062 -> "$774.6B"
 * 59.0 -> "$59M"
 * 0.075 -> "$75K"
 */
export function formatWealth(millionsUsd: number): string {
  if (millionsUsd >= 1_000_000) {
    return `$${(millionsUsd / 1_000_000).toFixed(1)}T`
  }
  if (millionsUsd >= 1_000) {
    return `$${(millionsUsd / 1_000).toFixed(1)}B`
  }
  if (millionsUsd >= 1) {
    return `$${millionsUsd.toFixed(0)}M`
  }
  return `$${(millionsUsd * 1_000).toFixed(0)}K`
}

/**
 * Format an absolute dollar amount (not millions).
 * 75000 -> "$75K"
 */
export function formatDollars(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `$${(amount / 1_000_000_000_000).toFixed(1)}T`
  }
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return `$${amount.toFixed(0)}`
}
