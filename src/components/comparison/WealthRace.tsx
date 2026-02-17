import { useRef, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { Play, RotateCcw, Zap } from 'lucide-react'
import gsap from 'gsap'
import { useAppStore } from '@/stores'
import { Button } from '@/components/ui/button'
import { earningsPerSecond, accumulatedWealth } from '@/utils/wealthComparison'
import { formatDollars } from '@/utils/formatWealth'
import {
  RACE_DURATION_SECONDS,
  WEALTH_RACE_SLIDE_DELAY,
} from '@/utils/constants'

export function WealthRace() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const stateRef = useRef({ elapsed: 0 })

  // Direct DOM refs for 60fps mutation (D4 — no Zustand in onUpdate)
  const userDisplayRef = useRef<HTMLSpanElement>(null)
  const billionaireDisplayRef = useRef<HTMLSpanElement>(null)
  const userBarRef = useRef<HTMLDivElement>(null)
  const billionaireBarRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLSpanElement>(null)

  const showComparison = useAppStore((s) => s.showComparison)
  const netWorth = useAppStore((s) => s.netWorth)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)
  const wealthRace = useAppStore((s) => s.wealthRace)
  const startRace = useAppStore((s) => s.startRace)
  const updateRace = useAppStore((s) => s.updateRace)
  const finishRace = useAppStore((s) => s.finishRace)
  const resetRace = useAppStore((s) => s.resetRace)

  const target = billionaires.find((b) => b.uri === selectedUri)

  const handleStart = useCallback(() => {
    if (!target || netWorth <= 0) return

    startRace()

    const userPerSec = earningsPerSecond(netWorth)
    const billionairePerSec = earningsPerSecond(target.networth * 1_000_000)
    stateRef.current.elapsed = 0

    timelineRef.current?.kill()

    const tl = gsap.timeline()
    tl.to(stateRef.current, {
      elapsed: RACE_DURATION_SECONDS,
      duration: RACE_DURATION_SECONDS,
      ease: 'none',
      onUpdate: () => {
        const elapsed = stateRef.current.elapsed
        const userAcc = accumulatedWealth(userPerSec, elapsed)
        const billionaireAcc = accumulatedWealth(billionairePerSec, elapsed)
        const maxAcc = billionaireAcc || 1

        // Direct DOM mutations — no Zustand calls at 60fps
        if (userDisplayRef.current)
          userDisplayRef.current.textContent = formatDollars(userAcc)
        if (billionaireDisplayRef.current)
          billionaireDisplayRef.current.textContent =
            formatDollars(billionaireAcc)
        if (userBarRef.current)
          userBarRef.current.style.width = `${Math.min((userAcc / maxAcc) * 100, 100)}%`
        if (billionaireBarRef.current)
          billionaireBarRef.current.style.width = `${Math.min((billionaireAcc / maxAcc) * 100, 100)}%`
        if (timerRef.current)
          timerRef.current.textContent = `${elapsed.toFixed(1)}s`
      },
      onComplete: () => {
        const finalUserAcc = accumulatedWealth(
          userPerSec,
          RACE_DURATION_SECONDS,
        )
        const finalBillionaireAcc = accumulatedWealth(
          billionairePerSec,
          RACE_DURATION_SECONDS,
        )
        updateRace(RACE_DURATION_SECONDS, finalUserAcc, finalBillionaireAcc)
        finishRace()
      },
    })

    timelineRef.current = tl
  }, [target, netWorth, startRace, updateRace, finishRace])

  const handleReset = useCallback(() => {
    timelineRef.current?.kill()
    resetRace()
  }, [resetRace])

  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  if (!showComparison || !target || netWorth <= 0 || !selectedUri) return null

  const multiplier =
    wealthRace.status === 'finished' && wealthRace.userAccumulated > 0
      ? Math.round(
          wealthRace.billionaireAccumulated / wealthRace.userAccumulated,
        )
      : 0

  return (
    <motion.div
      className="glass-panel fixed right-4 bottom-28 z-40 w-80 p-5"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: WEALTH_RACE_SLIDE_DELAY,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-ws-gold" />
          <h3 className="font-display text-sm font-semibold text-ws-text-primary">
            {RACE_DURATION_SECONDS}s Wealth Race
          </h3>
        </div>
        {wealthRace.status !== 'idle' && (
          <span
            ref={timerRef}
            className="font-mono text-xs text-ws-text-secondary"
          >
            0.0s
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {/* You */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ws-text-secondary">You</span>
            <span ref={userDisplayRef} className="font-mono text-ws-accent">
              $0
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              ref={userBarRef}
              className="h-full rounded-full bg-ws-accent transition-none"
              style={{ width: '0%' }}
            />
          </div>
        </div>

        {/* Billionaire */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ws-text-secondary">
              {target.name.split(' ').pop()}
            </span>
            <span
              ref={billionaireDisplayRef}
              className="font-mono text-ws-gold"
            >
              $0
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              ref={billionaireBarRef}
              className="h-full rounded-full bg-ws-gold transition-none"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons / Results */}
      <div className="mt-4">
        {wealthRace.status === 'idle' && (
          <Button onClick={handleStart} size="sm" className="w-full gap-2">
            <Play className="h-3 w-3" />
            Start Race
          </Button>
        )}

        {wealthRace.status === 'running' && (
          <p className="animate-pulse text-center font-mono text-xs text-ws-accent">
            Racing...
          </p>
        )}

        {wealthRace.status === 'finished' && (
          <div className="space-y-2">
            {multiplier > 0 && (
              <p className="text-center font-mono text-sm text-ws-gold">
                They earned{' '}
                <span className="text-lg font-bold">
                  {multiplier.toLocaleString()}x
                </span>{' '}
                more
              </p>
            )}
            <div className="flex justify-between text-xs text-ws-text-secondary">
              <span>You: {formatDollars(wealthRace.userAccumulated)}</span>
              <span>
                Them: {formatDollars(wealthRace.billionaireAccumulated)}
              </span>
            </div>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
              className="w-full gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
