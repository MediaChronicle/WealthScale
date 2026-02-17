import { useState, useMemo, useEffect, useCallback } from 'react'
import { dollarBillStackMiles } from '@/utils/wealthComparison'
import { FUN_FACT_ROTATION_MS } from '@/utils/constants'

interface FunFactResult {
  fact: string
  total: number
  index: number
  next: () => void
  previous: () => void
}

function generateFacts(networthMillions: number): string[] {
  const dollars = networthMillions * 1_000_000
  const facts: string[] = []

  // Dollar bill stack
  const stackMiles = dollarBillStackMiles(dollars)
  if (stackMiles > 0) {
    facts.push(
      `A stack of $1 bills equaling this fortune would be ${stackMiles.toLocaleString(undefined, { maximumFractionDigits: 0 })} miles tall — ${(stackMiles / 238_900).toFixed(1)}x the distance to the Moon.`,
    )
  }

  // Home purchases
  const medianHomePrice = 420_000
  const homes = Math.floor(dollars / medianHomePrice)
  if (homes > 0) {
    facts.push(
      `This fortune could buy ${homes.toLocaleString()} median US homes ($420K each).`,
    )
  }

  // Country GDPs
  const gdpComparisons = [
    { country: 'Tuvalu', gdp: 60_000_000 },
    { country: 'Nauru', gdp: 150_000_000 },
    { country: 'Palau', gdp: 260_000_000 },
    { country: 'Iceland', gdp: 28_000_000_000 },
    { country: 'Luxembourg', gdp: 85_000_000_000 },
  ]
  for (const { country, gdp } of gdpComparisons) {
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
  const jetPrice = 70_000_000
  const jets = Math.floor(dollars / jetPrice)
  if (jets > 1) {
    facts.push(
      `This fortune could buy ${jets.toLocaleString()} private Boeing 787 Dreamliners ($70M each).`,
    )
  }

  // Super yachts
  const yachtPrice = 600_000_000
  const yachts = Math.floor(dollars / yachtPrice)
  if (yachts > 1) {
    facts.push(
      `This fortune could buy ${yachts.toLocaleString()} mega-yachts rivaling Jeff Bezos's Koru ($600M each).`,
    )
  }

  // Weight in gold
  const goldPerOunce = 2_000
  const ounces = dollars / goldPerOunce
  const tons = ounces / 32_150
  if (tons >= 1) {
    facts.push(
      `Converted to gold, this fortune would weigh ${tons.toLocaleString(undefined, { maximumFractionDigits: 0 })} metric tons.`,
    )
  }

  // Average salary years
  const avgSalary = 59_000
  const salaryYears = dollars / avgSalary
  facts.push(
    `A median US worker ($59K/yr) would need to work ${salaryYears.toLocaleString(undefined, { maximumFractionDigits: 0 })} years to earn this — since before the dinosaurs went extinct.`,
  )

  return facts
}

export function useFunFact(networthMillions: number): FunFactResult {
  const [index, setIndex] = useState(0)

  const facts = useMemo(
    () => generateFacts(networthMillions),
    [networthMillions],
  )

  // Auto-rotation — resets index when networthMillions changes (via deps)
  useEffect(() => {
    setIndex(0)
    if (facts.length <= 1) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % facts.length)
    }, FUN_FACT_ROTATION_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networthMillions])

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % facts.length)
  }, [facts.length])

  const previous = useCallback(() => {
    setIndex((prev) => (prev - 1 + facts.length) % facts.length)
  }, [facts.length])

  return {
    fact: facts[index] ?? '',
    total: facts.length,
    index,
    next,
    previous,
  }
}
