// ===== API Response Types =====

export interface BillionaireListEntry {
  rank: number
  uri: string
  name: string
  gender: 'm' | 'f'
  age: number
  networth: number // In millions USD
  change: number | null // Daily change in millions
  diff: number // Rank change
  flag: 'up' | 'down' | 'unchanged' | 'new'
  citizenship: string // ISO country code
  industry: string[]
  source: string[]
}

export interface BillionaireProfile {
  uri: string
  name: string
  birthDate: string
  gender: 'm' | 'f'
  citizenship: string
  residence: {
    country: string
    state: string
    city: string
  }
  industry: string[]
  source: string[]
  image: string
  children: number
  maritalStatus: string
  education: Array<{ school: string; degree: string }>
  organization: { name: string; title: string }
  selfMade: { _is: boolean; type: string; rank: number }
}

export interface BillionaireAssets {
  uri: string
  assets: Array<{
    name: string
    value: number
    type: string
  }>
}

export interface HistoryEntry {
  date: string
  networth: number
}

// ===== App Domain Types =====

export type VisualizationMode = 'cosmos' | 'towers' | 'ocean' | 'timeline'

export type IndustryType =
  | 'technology'
  | 'fashion & retail'
  | 'finance & investments'
  | 'automotive'
  | 'energy'
  | 'telecom'
  | 'healthcare'
  | 'diversified'
  | 'media & entertainment'
  | 'other'

export interface IndustryColor {
  primary: string
  emissive: string
}

// ===== 3D Scene Types =====

export type Vec3 = [number, number, number]

export interface PlanetConfig {
  uri: string
  name: string
  radius: number
  orbitRadius: number
  orbitSpeed: number
  color: string
  emissiveColor: string
  tilt: number
  rank: number
  networth: number
}
