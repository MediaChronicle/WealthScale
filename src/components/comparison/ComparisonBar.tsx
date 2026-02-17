import { useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { DollarSign, X } from 'lucide-react'
import { useAppStore } from '@/stores'
import type { ComparisonResults } from '@/stores/userStore'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  scaleRatioPercent,
  ratioString,
  timeToEarn,
  hundredBillStackFeet,
} from '@/utils/wealthComparison'
import {
  COMPARISON_SLIDER_MAX,
  COMPARISON_SLIDER_STEP,
  COMPARISON_PRESETS,
  COMPARISON_BAR_SPRING,
} from '@/utils/constants'

function computeResults(
  dollars: number,
  billionaireMillions: number,
): ComparisonResults {
  const tte = timeToEarn(dollars, billionaireMillions)
  return {
    scalePercent: scaleRatioPercent(dollars, billionaireMillions),
    ratio: ratioString(dollars, billionaireMillions),
    timeToEarn: tte.label,
    timeToEarnSeconds: tte.totalSeconds,
    userStackFeet: hundredBillStackFeet(dollars),
    billionaireStackFeet: hundredBillStackFeet(billionaireMillions * 1_000_000),
  }
}

export function ComparisonBar() {
  const [inputValue, setInputValue] = useState('')
  const [sliderValue, setSliderValue] = useState(0)

  const showComparison = useAppStore((s) => s.showComparison)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)
  const setNetWorth = useAppStore((s) => s.setNetWorth)
  const setShowComparison = useAppStore((s) => s.setShowComparison)
  const setComparisonResults = useAppStore((s) => s.setComparisonResults)
  const setLeaderboardOpen = useAppStore((s) => s.setLeaderboardOpen)
  const resetRace = useAppStore((s) => s.resetRace)

  const target = billionaires.find((b) => b.uri === selectedUri)

  const handleCompare = useCallback(
    (dollars: number) => {
      if (!target || dollars <= 0) return
      setNetWorth(dollars)
      const results = computeResults(dollars, target.networth)
      setComparisonResults(results)
      setShowComparison(true)
      setLeaderboardOpen(false)
    },
    [
      target,
      setNetWorth,
      setComparisonResults,
      setShowComparison,
      setLeaderboardOpen,
    ],
  )

  const handleClose = useCallback(() => {
    setShowComparison(false)
    setComparisonResults(null)
    setNetWorth(0)
    resetRace()
    setInputValue('')
    setSliderValue(0)
  }, [setShowComparison, setComparisonResults, setNetWorth, resetRace])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '')
      setInputValue(raw)
      const num = parseInt(raw, 10) || 0
      setSliderValue(Math.min(num, COMPARISON_SLIDER_MAX))
    },
    [],
  )

  const handleSliderChange = useCallback((values: number[]) => {
    const val = values[0]
    setSliderValue(val)
    setInputValue(val.toString())
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const dollars = parseInt(inputValue, 10) || 0
      if (dollars > 0) handleCompare(dollars)
    },
    [inputValue, handleCompare],
  )

  const handlePreset = useCallback(
    (value: number) => {
      setInputValue(value.toString())
      setSliderValue(value)
      handleCompare(value)
    },
    [handleCompare],
  )

  // Auto-recompute when target changes while comparison is active
  useEffect(() => {
    if (showComparison && netWorth > 0 && target) {
      const results = computeResults(netWorth, target.networth)
      setComparisonResults(results)
    }
  }, [selectedUri, showComparison, netWorth, target, setComparisonResults])

  if (!selectedUri) return null

  return (
    <motion.div
      className="fixed bottom-0 right-0 left-0 z-50 p-4"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{
        type: 'spring',
        stiffness: COMPARISON_BAR_SPRING.stiffness,
        damping: COMPARISON_BAR_SPRING.damping,
      }}
    >
      <div className="glass-panel mx-auto max-w-2xl px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-ws-accent" />
              <span className="font-display text-sm font-semibold text-ws-text-primary">
                Compare Your Wealth
              </span>
            </div>
            {showComparison && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClose}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Input + Button row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ws-text-secondary">
                $
              </span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter your net worth or salary"
                value={inputValue ? parseInt(inputValue).toLocaleString() : ''}
                onChange={handleInputChange}
                className="pl-7 font-mono"
              />
            </div>
            <Button type="submit" size="sm" className="shrink-0">
              Compare
            </Button>
          </div>

          {/* Slider */}
          <Slider
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            max={COMPARISON_SLIDER_MAX}
            step={COMPARISON_SLIDER_STEP}
            className="py-1"
          />

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {COMPARISON_PRESETS.map((preset) => (
              <Badge
                key={preset.value}
                variant="secondary"
                className="cursor-pointer transition-colors hover:bg-ws-accent hover:text-ws-bg"
                onClick={() => handlePreset(preset.value)}
              >
                {preset.label} ({preset.display})
              </Badge>
            ))}
          </div>
        </form>
      </div>
    </motion.div>
  )
}
