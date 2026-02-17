import type { BillionaireListEntry, PlanetConfig, HistoryEntry } from '@/types'
import { getIndustryColor } from '@/utils/colorByIndustry'

// Generate a deterministic tilt based on rank
function deterministicTilt(rank: number): number {
  // Use rank to generate a pseudo-random tilt between -15 and +15 degrees
  const seed = (rank * 7919) % 1000 // Prime number for better distribution
  return (seed / 1000 - 0.5) * 30
}

/**
 * Transform a billionaire list entry into 3D planet configuration.
 */
export function toPlanetConfig(entry: BillionaireListEntry): PlanetConfig {
  const industry = entry.industry[0] ?? 'other'
  const colors = getIndustryColor(industry)
  const radius = 0.3 + Math.log10(entry.networth / 100_000) * 0.8
  const orbitRadius = 8 + entry.rank * 3
  const orbitSpeed = 0.001 / entry.rank
  const tilt = deterministicTilt(entry.rank)

  return {
    uri: entry.uri,
    name: entry.name,
    radius: Math.max(0.3, radius),
    orbitRadius,
    orbitSpeed,
    color: colors.primary,
    emissiveColor: colors.emissive,
    tilt,
    rank: entry.rank,
    networth: entry.networth,
  }
}

/**
 * Parse CSV history data into typed entries.
 */
export function parseHistoryCsv(csv: string): HistoryEntry[] {
  const lines = csv.trim().split('\n')
  // Skip header row
  return lines.slice(1).map((line) => {
    const [date, networth] = line.split(',')
    return {
      date: date.trim(),
      networth: parseFloat(networth),
    }
  })
}
