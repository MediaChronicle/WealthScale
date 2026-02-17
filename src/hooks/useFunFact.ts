import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { dollarBillStackMiles } from '@/utils/wealthComparison'
import {
  FUN_FACT_ROTATION_MS,
  MEDIAN_US_HOME_PRICE,
  MEDIAN_US_SALARY,
  MOON_DISTANCE_MILES,
  PRIVATE_JET_PRICE,
  MEGA_YACHT_PRICE,
  GOLD_PRICE_PER_OUNCE,
  OUNCES_PER_METRIC_TON,
  GDP_COMPARISONS,
} from '@/utils/constants'

interface FunFactResult {
  fact: string
  total: number
  index: number
  next: () => void
  previous: () => void
  goToIndex: (i: number) => void
}

function generateFacts(networthMillions: number): string[] {
  const dollars = networthMillions * 1_000_000
  const facts: string[] = []

  // Dollar bill stack
  const stackMiles = dollarBillStackMiles(dollars)
  if (stackMiles > 0) {
    facts.push(
      `A stack of $1 bills equaling this fortune would be ${stackMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })} miles tall — ${(stackMiles / MOON_DISTANCE_MILES).toFixed(1)}x the distance to the Moon.`,
    )
  }

  // Home purchases
  const homes = Math.floor(dollars / MEDIAN_US_HOME_PRICE)
  if (homes > 0) {
    facts.push(
      `This fortune could buy ${homes.toLocaleString()} median US homes ($${(MEDIAN_US_HOME_PRICE / 1000).toFixed(0)}K each).`,
    )
  }

  // Country GDPs
  for (const { country, gdp } of GDP_COMPARISONS) {
    const multiple = dollars / gdp
    if (multiple >= 1.5) {
      facts.push(
        `This wealth equals ${multiple.toFixed(1)}x the entire GDP of ${country}.`,
      )
    }
  }

  // Spending rate
  facts.push(
    `Spending $1 every second non-stop, it would take ${(dollars / (365.25 * 24 * 3600)).toFixed(0)} years to exhaust this fortune.`,
  )

  // Private jets
  const jets = Math.floor(dollars / PRIVATE_JET_PRICE)
  if (jets > 1) {
    facts.push(
      `This fortune could buy ${jets.toLocaleString()} private Boeing 787 Dreamliners ($${(PRIVATE_JET_PRICE / 1_000_000).toFixed(0)}M each).`,
    )
  }

  // Super yachts
  const yachts = Math.floor(dollars / MEGA_YACHT_PRICE)
  if (yachts > 1) {
    facts.push(
      `This fortune could buy ${yachts.toLocaleString()} mega-yachts rivaling Jeff Bezos's Koru ($${(MEGA_YACHT_PRICE / 1_000_000).toFixed(0)}M each).`,
    )
  }

  // Weight in gold
  const ounces = dollars / GOLD_PRICE_PER_OUNCE
  const tons = ounces / OUNCES_PER_METRIC_TON
  if (tons >= 1) {
    facts.push(
      `Converted to gold, this fortune would weigh ${tons.toLocaleString(undefined, { maximumFractionDigits: 0 })} metric tons.`,
    )
  }

  // Average salary years
  const salaryYears = dollars / MEDIAN_US_SALARY
  facts.push(
    `A median US worker ($${(MEDIAN_US_SALARY / 1000).toFixed(0)}K/yr) would need to work ${salaryYears.toLocaleString(undefined, { maximumFractionDigits: 0 })} years to earn this — since before the dinosaurs went extinct.`,
  )

  return facts
}

export function useFunFact(networthMillions: number): FunFactResult {
  const [indexState, setIndexState] = useState({
    index: 0,
    networth: networthMillions,
  })
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset index when networthMillions changes (setState during render — React-approved)
  if (indexState.networth !== networthMillions) {
    setIndexState({ index: 0, networth: networthMillions })
  }

  const index = indexState.index
  const setIndex = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setIndexState((prev) => ({
        ...prev,
        index: typeof updater === 'function' ? updater(prev.index) : updater,
      }))
    },
    [],
  )

  const facts = useMemo(
    () => generateFacts(networthMillions),
    [networthMillions],
  )

  const restartTimer = useCallback(() => {
    if (timerIdRef.current) clearInterval(timerIdRef.current)
    if (facts.length <= 1) return
    timerIdRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % facts.length)
    }, FUN_FACT_ROTATION_MS)
  }, [facts, setIndex])

  // Auto-rotation timer
  useEffect(() => {
    restartTimer()
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current)
    }
  }, [restartTimer])

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % facts.length)
    restartTimer()
  }, [facts.length, restartTimer, setIndex])

  const previous = useCallback(() => {
    setIndex((prev) => (prev - 1 + facts.length) % facts.length)
    restartTimer()
  }, [facts.length, restartTimer, setIndex])

  const goToIndex = useCallback(
    (i: number) => {
      setIndex(i)
      restartTimer()
    },
    [restartTimer, setIndex],
  )

  return {
    fact: facts[index] ?? '',
    total: facts.length,
    index,
    next,
    previous,
    goToIndex,
  }
}
