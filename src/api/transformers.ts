import type { BillionaireListEntry, PlanetConfig, HistoryEntry } from '@/types'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { planetRadius, orbitRadius } from '@/utils/wealthMath'

function deterministicTilt(rank: number): number {
  const seed = (rank * 7919) % 1000
  return (seed / 1000 - 0.5) * 30
}

/**
 * Transform a billionaire list entry into 3D planet configuration.
 */
export function toPlanetConfig(entry: BillionaireListEntry): PlanetConfig {
  const industry = entry.industry[0] ?? 'other'
  const colors = getIndustryColor(industry)

  return {
    uri: entry.uri,
    name: entry.name,
    radius: planetRadius(entry.networth),
    orbitRadius: orbitRadius(entry.rank),
    orbitSpeed: 0.001 / entry.rank,
    color: colors.primary,
    emissiveColor: colors.emissive,
    tilt: deterministicTilt(entry.rank),
    rank: entry.rank,
    networth: entry.networth,
  }
}

/**
 * Parse CSV history data into typed entries.
 */
export function parseHistoryCsv(csv: string): HistoryEntry[] {
  const lines = csv.trim().split('\n')
  return lines
    .slice(1)
    .map((line) => {
      const [date, networth] = line.split(',')
      return {
        date: date.trim(),
        networth: parseFloat(networth),
      }
    })
    .filter((entry) => !isNaN(entry.networth))
}
