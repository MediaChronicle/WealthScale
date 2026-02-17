import { useRef, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { Clock } from 'lucide-react'
import gsap from 'gsap'
import { useAppStore } from '@/stores'
import { SECONDS_PER_YEAR } from '@/utils/wealthComparison'
import {
  TIME_TO_EARN_SLIDE_DELAY,
  TIME_TO_EARN_COUNTER_DURATION,
} from '@/utils/constants'

function formatCounterValue(seconds: number): { value: number; unit: string } {
  if (seconds < 60) return { value: seconds, unit: 'seconds' }
  if (seconds < 3600) return { value: seconds / 60, unit: 'minutes' }
  if (seconds < 86400) return { value: seconds / 3600, unit: 'hours' }
  if (seconds < SECONDS_PER_YEAR)
    return { value: seconds / 86400, unit: 'days' }
  return { value: seconds / SECONDS_PER_YEAR, unit: 'years' }
}

export function TimeToEarn() {
  const displayRef = useRef<HTMLSpanElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const counterObj = useRef({ value: 0 })

  const comparisonResults = useAppStore((s) => s.comparisonResults)

  const formatted = useMemo(() => {
    if (!comparisonResults) return null
    return formatCounterValue(comparisonResults.timeToEarnSeconds)
  }, [comparisonResults])

  useEffect(() => {
    if (!formatted || !displayRef.current) return

    tweenRef.current?.kill()
    counterObj.current.value = 0

    tweenRef.current = gsap.to(counterObj.current, {
      value: formatted.value,
      duration: TIME_TO_EARN_COUNTER_DURATION,
      ease: 'power2.out',
      onUpdate: () => {
        if (displayRef.current) {
          const val = counterObj.current.value
          displayRef.current.textContent =
            val >= 1000
              ? Math.round(val).toLocaleString()
              : val.toFixed(val < 10 ? 1 : 0)
        }
      },
    })

    return () => {
      tweenRef.current?.kill()
    }
  }, [formatted])

  return (
    <motion.div
      className="glass-panel pointer-events-auto fixed top-24 left-4 z-40 max-w-xs p-5"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: TIME_TO_EARN_SLIDE_DELAY,
      }}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-ws-gold" />
        <h3 className="font-display text-sm font-semibold text-ws-text-primary">
          Time to Earn
        </h3>
      </div>

      <div className="mt-3 text-center" role="status" aria-live="polite">
        <span
          ref={displayRef}
          className="font-mono text-4xl font-bold tabular-nums text-ws-gold"
        >
          0
        </span>
        <p className="mt-1 font-body text-sm text-ws-text-secondary">
          {formatted?.unit ?? 'years'}
        </p>
      </div>

      <p className="mt-2 text-center text-xs text-ws-text-secondary">
        at your current income
      </p>
    </motion.div>
  )
}
