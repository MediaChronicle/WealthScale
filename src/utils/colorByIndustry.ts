import type { IndustryColor } from '@/types'

const INDUSTRY_COLORS: Record<string, IndustryColor> = {
  technology: { primary: '#00D4FF', emissive: '#0066FF' },
  'fashion & retail': { primary: '#FFD700', emissive: '#CC9900' },
  'finance & investments': { primary: '#00FF88', emissive: '#009955' },
  automotive: { primary: '#C0C0C0', emissive: '#888888' },
  energy: { primary: '#AA44FF', emissive: '#7722CC' },
  telecom: { primary: '#FF44AA', emissive: '#CC2288' },
  healthcare: { primary: '#00CCAA', emissive: '#009977' },
  diversified: { primary: '#FF2244', emissive: '#CC0022' },
  'media & entertainment': { primary: '#FF8844', emissive: '#CC5500' },
}

const DEFAULT_COLOR: IndustryColor = { primary: '#FFFFFF', emissive: '#AAAAAA' }

export function getIndustryColor(industry: string): IndustryColor {
  const key = industry.toLowerCase()
  return INDUSTRY_COLORS[key] ?? DEFAULT_COLOR
}
