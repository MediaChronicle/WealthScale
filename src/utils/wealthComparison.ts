import {
  USER_PARTICLE_MIN_RADIUS,
  USER_PARTICLE_MAX_RADIUS,
} from '@/utils/constants'

export const SECONDS_PER_YEAR = 365.25 * 24 * 3600

export interface TimeToEarnResult {
  label: string
  totalSeconds: number
}

/** User's net worth as percentage of billionaire's (millions). */
export function scaleRatioPercent(
  userDollars: number,
  billionaireMillions: number,
): number {
  if (billionaireMillions <= 0) return 0
  return (userDollars / (billionaireMillions * 1_000_000)) * 100
}

/** Human-readable ratio string: "1 : 10,345,678" */
export function ratioString(
  userDollars: number,
  billionaireMillions: number,
): string {
  if (userDollars <= 0) return '—'
  const ratio = Math.round((billionaireMillions * 1_000_000) / userDollars)
  return `1 : ${ratio.toLocaleString()}`
}

/** How long it takes to earn a billionaire's fortune at a given annual income. */
export function timeToEarn(
  userAnnualIncome: number,
  billionaireMillions: number,
): TimeToEarnResult {
  if (userAnnualIncome <= 0) return { label: 'Forever', totalSeconds: Infinity }
  const totalSeconds =
    ((billionaireMillions * 1_000_000) / userAnnualIncome) * SECONDS_PER_YEAR

  if (totalSeconds < 60)
    return { label: `${totalSeconds.toFixed(1)} seconds`, totalSeconds }
  if (totalSeconds < 3600)
    return {
      label: `${(totalSeconds / 60).toFixed(1)} minutes`,
      totalSeconds,
    }
  if (totalSeconds < 86400)
    return {
      label: `${(totalSeconds / 3600).toFixed(1)} hours`,
      totalSeconds,
    }
  if (totalSeconds < SECONDS_PER_YEAR)
    return {
      label: `${(totalSeconds / 86400).toFixed(0)} days`,
      totalSeconds,
    }

  const years = totalSeconds / SECONDS_PER_YEAR
  if (years >= 1_000_000)
    return { label: `${(years / 1_000_000).toFixed(1)}M years`, totalSeconds }
  if (years >= 1_000)
    return {
      label: `${Math.round(years).toLocaleString()} years`,
      totalSeconds,
    }
  return { label: `${years.toFixed(1)} years`, totalSeconds }
}

/** Earnings per second from annual income. */
export function earningsPerSecond(annualIncome: number): number {
  return annualIncome / SECONDS_PER_YEAR
}

/** Accumulated wealth over elapsed seconds at a given per-second rate. */
export function accumulatedWealth(
  perSecond: number,
  elapsedSeconds: number,
): number {
  return perSecond * elapsedSeconds
}

/** Height in feet of a stack of $100 bills totaling `dollars`. */
export function hundredBillStackFeet(dollars: number): number {
  // A $100 bill is 0.0043 inches thick. 1 foot = 12 inches.
  const billCount = dollars / 100
  return (billCount * 0.0043) / 12
}

/** Height in miles of a stack of $1 bills totaling `dollars`. */
export function dollarBillStackMiles(dollars: number): number {
  // A $1 bill is 0.0043 inches thick. 1 mile = 63,360 inches.
  return (dollars * 0.0043) / 63_360
}

/** Size the user particle relative to a billionaire planet. */
export function userParticleRadius(
  userDollars: number,
  billionaireMillions: number,
  billionairePlanetRadius: number,
): number {
  if (billionaireMillions <= 0 || userDollars <= 0)
    return USER_PARTICLE_MIN_RADIUS
  const ratio = userDollars / (billionaireMillions * 1_000_000)
  const raw = ratio * billionairePlanetRadius
  return Math.max(
    USER_PARTICLE_MIN_RADIUS,
    Math.min(USER_PARTICLE_MAX_RADIUS, raw),
  )
}
