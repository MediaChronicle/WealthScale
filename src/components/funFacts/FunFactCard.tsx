import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { useAppStore } from '@/stores'
import { useFunFact } from '@/hooks/useFunFact'
import { FUN_FACT_SLIDE_DELAY } from '@/utils/constants'

export function FunFactCard() {
  const showComparison = useAppStore((s) => s.showComparison)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const billionaires = useAppStore((s) => s.billionaires)

  const target = billionaires.find((b) => b.uri === selectedUri)
  const { fact, total, index, next, previous } = useFunFact(
    target?.networth ?? 0,
  )

  if (!showComparison || !target || !fact) return null

  return (
    <motion.div
      className="glass-panel fixed bottom-28 left-4 z-40 max-w-sm overflow-hidden p-5"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: FUN_FACT_SLIDE_DELAY,
      }}
    >
      {/* Holographic shimmer overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          background:
            'linear-gradient(135deg, #00d4ff 0%, #ffd700 25%, #ff44aa 50%, #00ff88 75%, #00d4ff 100%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 6s ease infinite',
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-ws-gold" />
          <h3 className="font-display text-sm font-semibold text-ws-text-primary">
            Did You Know?
          </h3>
        </div>

        {/* Fact text with crossfade */}
        <div className="mt-3 min-h-[4rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              className="font-body text-sm leading-relaxed text-ws-text-secondary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {fact}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={previous}
            className="rounded-full p-1 text-ws-text-secondary transition-colors hover:text-ws-accent"
            aria-label="Previous fact"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dot indicators */}
          <div className="flex gap-1">
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? 'bg-ws-accent' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="rounded-full p-1 text-ws-text-secondary transition-colors hover:text-ws-accent"
            aria-label="Next fact"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
