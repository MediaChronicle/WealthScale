import { motion } from 'motion/react'
import { Scale, Clock, Layers, Percent } from 'lucide-react'
import { useAppStore } from '@/stores'
import {
  COMPARISON_RESULTS_STAGGER_DELAY,
  PERCENT_RING_RADIUS,
  PERCENT_RING_SIZE,
  PERCENT_RING_STROKE,
  PERCENT_RING_MIN_DISPLAY,
  PERCENT_RING_BG_STROKE,
  PERCENT_RING_FG_STROKE,
  FEET_PER_MILE,
} from '@/utils/constants'

function PercentRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * PERCENT_RING_RADIUS
  const displayPercent = Math.max(percent, PERCENT_RING_MIN_DISPLAY)
  const offset = circumference - (displayPercent / 100) * circumference

  return (
    <svg
      width={PERCENT_RING_SIZE}
      height={PERCENT_RING_SIZE}
      viewBox={`0 0 ${PERCENT_RING_SIZE} ${PERCENT_RING_SIZE}`}
      className="mx-auto"
    >
      {/* Background ring */}
      <circle
        cx={PERCENT_RING_SIZE / 2}
        cy={PERCENT_RING_SIZE / 2}
        r={PERCENT_RING_RADIUS}
        fill="none"
        stroke={PERCENT_RING_BG_STROKE}
        strokeWidth={PERCENT_RING_STROKE}
      />
      {/* Animated foreground ring */}
      <motion.circle
        cx={PERCENT_RING_SIZE / 2}
        cy={PERCENT_RING_SIZE / 2}
        r={PERCENT_RING_RADIUS}
        fill="none"
        stroke={PERCENT_RING_FG_STROKE}
        strokeWidth={PERCENT_RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform={`rotate(-90 ${PERCENT_RING_SIZE / 2} ${PERCENT_RING_SIZE / 2})`}
      />
      {/* Center text */}
      <text
        x={PERCENT_RING_SIZE / 2}
        y={PERCENT_RING_SIZE / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ws-text-primary font-mono text-sm font-bold"
      >
        {percent < 0.01 ? '<0.01' : percent.toFixed(2)}%
      </text>
    </svg>
  )
}

interface StatRowProps {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
  index: number
}

function StatRow({ icon, label, value, highlight, index }: StatRowProps) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-lg border border-ws-border bg-ws-glass p-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * COMPARISON_RESULTS_STAGGER_DELAY }}
    >
      <div className="text-ws-accent">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-ws-text-secondary">{label}</p>
        <p
          className={`font-mono text-sm font-semibold tabular-nums ${highlight ? 'text-ws-gold' : 'text-ws-text-primary'}`}
        >
          {value}
        </p>
      </div>
    </motion.div>
  )
}

export function ComparisonResults() {
  const comparisonResults = useAppStore((s) => s.comparisonResults)

  return (
    <motion.div
      className="glass-panel pointer-events-auto fixed top-1/2 right-4 z-40 w-80 -translate-y-1/2 space-y-4 p-5"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {comparisonResults && (
        <>
          <h3 className="text-center font-display text-sm font-semibold text-ws-text-primary">
            Your Wealth vs Theirs
          </h3>

          <PercentRing percent={comparisonResults.scalePercent} />

          <div className="space-y-2">
            <StatRow
              icon={<Scale className="h-4 w-4" />}
              label="Ratio"
              value={comparisonResults.ratio}
              index={0}
            />
            <StatRow
              icon={<Clock className="h-4 w-4" />}
              label="Time to earn their fortune"
              value={comparisonResults.timeToEarn}
              highlight
              index={1}
            />
            <StatRow
              icon={<Layers className="h-4 w-4" />}
              label="Your $100 bill stack"
              value={`${comparisonResults.userStackFeet.toFixed(1)} ft`}
              index={2}
            />
            <StatRow
              icon={<Percent className="h-4 w-4" />}
              label="Their $100 bill stack"
              value={
                comparisonResults.billionaireStackFeet >= FEET_PER_MILE
                  ? `${(comparisonResults.billionaireStackFeet / FEET_PER_MILE).toFixed(1)} miles`
                  : `${comparisonResults.billionaireStackFeet.toFixed(0)} ft`
              }
              index={3}
            />
          </div>
        </>
      )}
    </motion.div>
  )
}
