/**
 * Calculate planet radius from net worth (in millions USD).
 * Musk (~774,601M) -> ~2.2 units
 * Smallest top 10 (~100,000M) -> ~0.7 units
 */
export function planetRadius(networth: number): number {
  return Math.max(0.3, 0.3 + Math.log10(networth / 100_000) * 0.8)
}

/**
 * Calculate orbit radius from rank (1-indexed).
 */
export function orbitRadius(rank: number): number {
  return 8 + rank * 3
}

/**
 * Calculate tower height from net worth.
 */
export function towerHeight(networth: number): number {
  return Math.log10(networth / 10_000) * 10
}

/**
 * Calculate ocean depth from net worth.
 */
export function oceanDepth(networth: number): number {
  return -(networth / 50_000)
}
