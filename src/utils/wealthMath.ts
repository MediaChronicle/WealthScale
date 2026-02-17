import {
  PLANET_BASE_RADIUS,
  PLANET_SCALE_FACTOR,
  ORBIT_BASE_RADIUS,
  ORBIT_SPACING,
} from '@/utils/constants'

/**
 * Calculate planet radius from net worth (in millions USD).
 * Musk (~774,601M) -> ~2.2 units
 * Smallest top 10 (~100,000M) -> ~0.7 units
 */
export function planetRadius(networth: number): number {
  return Math.max(
    PLANET_BASE_RADIUS,
    PLANET_BASE_RADIUS + Math.log10(networth / 100_000) * PLANET_SCALE_FACTOR,
  )
}

/**
 * Calculate orbit radius from rank (1-indexed).
 */
export function orbitRadius(rank: number): number {
  return ORBIT_BASE_RADIUS + rank * ORBIT_SPACING
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
