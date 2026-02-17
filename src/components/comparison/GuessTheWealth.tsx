import { useState, useMemo, useCallback } from 'react'
import { motion } from 'motion/react'
import { X, ChevronRight, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/stores'
import { formatWealth } from '@/utils/formatWealth'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import {
  GUESS_MIN_MILLIONS,
  GUESS_MAX_MILLIONS,
  GUESS_STEP_MILLIONS,
  GUESS_DEFAULT_MILLIONS,
  GUESS_ROUND_COUNT,
} from '@/utils/constants'

interface GuessTheWealthProps {
  onClose: () => void
}

interface RoundResult {
  name: string
  actual: number
  guessed: number
  accuracy: number
}

function getAccuracyLabel(accuracy: number): { label: string; color: string } {
  if (accuracy >= 90) return { label: 'Incredible!', color: 'text-ws-positive' }
  if (accuracy >= 70) return { label: 'Close!', color: 'text-ws-accent' }
  if (accuracy >= 40) return { label: 'Not bad', color: 'text-[#FFD700]' }
  return { label: 'Way off', color: 'text-ws-negative' }
}

function calculateAccuracy(guessed: number, actual: number): number {
  const diff = Math.abs(guessed - actual)
  const maxDiff = Math.max(actual, GUESS_MAX_MILLIONS)
  return Math.max(0, (1 - diff / maxDiff) * 100)
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function GuessTheWealth({ onClose }: GuessTheWealthProps) {
  const billionaires = useAppStore((s) => s.billionaires)
  const [round, setRound] = useState(0)
  const [guess, setGuess] = useState(GUESS_DEFAULT_MILLIONS)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<RoundResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const [shuffled, setShuffled] = useState(() =>
    shuffleArray(billionaires).slice(0, GUESS_ROUND_COUNT),
  )

  const current = shuffled[round]

  const handleSubmit = useCallback(() => {
    if (!current || submitted) return
    const accuracy = calculateAccuracy(guess, current.networth)
    setResults((prev) => [
      ...prev,
      {
        name: current.name,
        actual: current.networth,
        guessed: guess,
        accuracy,
      },
    ])
    setSubmitted(true)
  }, [current, guess, submitted])

  const handleNext = useCallback(() => {
    if (round + 1 >= GUESS_ROUND_COUNT) {
      setShowResults(true)
    } else {
      setRound((r) => r + 1)
      setGuess(GUESS_DEFAULT_MILLIONS)
      setSubmitted(false)
    }
  }, [round])

  const handlePlayAgain = useCallback(() => {
    setShuffled(shuffleArray(billionaires).slice(0, GUESS_ROUND_COUNT))
    setRound(0)
    setGuess(GUESS_DEFAULT_MILLIONS)
    setSubmitted(false)
    setResults([])
    setShowResults(false)
  }, [billionaires])

  const avgAccuracy =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.accuracy, 0) / results.length
      : 0

  const sortedResults = useMemo(
    () => [...results].sort((a, b) => b.accuracy - a.accuracy),
    [results],
  )

  if (!current && !showResults) return null

  return (
    <motion.div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-panel relative mx-4 w-full max-w-md space-y-5 p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-ws-text-secondary transition-colors hover:bg-ws-glass-hover hover:text-ws-text-primary"
          aria-label="Close game"
        >
          <X size={18} />
        </button>

        <h2 className="font-display text-lg font-bold text-ws-text-primary">
          Guess the Wealth
        </h2>

        {showResults ? (
          // Results screen
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-ws-accent">
                {avgAccuracy.toFixed(0)}%
              </p>
              <p className="text-sm text-ws-text-secondary">Average Accuracy</p>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {sortedResults.map((r: RoundResult, i: number) => {
                const { label, color } = getAccuracyLabel(r.accuracy)
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-ws-border bg-ws-glass p-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ws-text-primary">
                        {r.name}
                      </p>
                      <p className="text-xs text-ws-text-secondary">
                        Actual: {formatWealth(r.actual)} | Guess:{' '}
                        {formatWealth(r.guessed)}
                      </p>
                    </div>
                    <span className={cn('text-xs font-semibold', color)}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handlePlayAgain}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ws-accent px-4 py-2.5 font-display text-sm font-semibold text-ws-bg transition-opacity hover:opacity-80"
            >
              <RotateCcw size={14} />
              Play Again
            </button>
          </div>
        ) : (
          // Game round
          <>
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: GUESS_ROUND_COUNT }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-2 w-2 rounded-full transition-colors',
                    i < round
                      ? 'bg-ws-accent'
                      : i === round
                        ? 'bg-ws-accent/60'
                        : 'bg-ws-border',
                  )}
                />
              ))}
            </div>

            {/* Billionaire info */}
            <div className="space-y-2 text-center">
              <p className="font-display text-xl font-bold text-ws-text-primary">
                {current.name}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: getIndustryColor(
                      current.industry[0] ?? 'other',
                    ).primary,
                  }}
                />
                <span className="text-sm text-ws-text-secondary">
                  {current.industry[0] ?? 'Unknown'}
                </span>
                {current.citizenship && (
                  <>
                    <span className="text-ws-text-secondary">|</span>
                    <span className="text-sm text-ws-text-secondary">
                      {current.citizenship}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Guess slider */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="font-mono text-2xl font-bold text-ws-accent">
                  {formatWealth(guess)}
                </p>
              </div>

              <Slider
                value={[guess]}
                min={GUESS_MIN_MILLIONS}
                max={GUESS_MAX_MILLIONS}
                step={GUESS_STEP_MILLIONS}
                onValueChange={([v]) => !submitted && setGuess(v)}
                disabled={submitted}
              />

              <div className="flex justify-between text-xs text-ws-text-secondary">
                <span>{formatWealth(GUESS_MIN_MILLIONS)}</span>
                <span>{formatWealth(GUESS_MAX_MILLIONS)}</span>
              </div>
            </div>

            {/* Submit / feedback */}
            {submitted ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-ws-border bg-ws-glass p-3 text-center">
                  <p className="text-xs text-ws-text-secondary">
                    Actual net worth
                  </p>
                  <p className="font-mono text-lg font-bold text-ws-text-primary">
                    {formatWealth(current.networth)}
                  </p>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      getAccuracyLabel(
                        results[results.length - 1]?.accuracy ?? 0,
                      ).color,
                    )}
                  >
                    {
                      getAccuracyLabel(
                        results[results.length - 1]?.accuracy ?? 0,
                      ).label
                    }
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-ws-accent px-4 py-2.5 font-display text-sm font-semibold text-ws-bg transition-opacity hover:opacity-80"
                >
                  {round + 1 >= GUESS_ROUND_COUNT ? 'See Results' : 'Next'}
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-ws-accent px-4 py-2.5 font-display text-sm font-semibold text-ws-bg transition-opacity hover:opacity-80"
              >
                Submit Guess
              </button>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
