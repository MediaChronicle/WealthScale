import { motion } from 'motion/react'
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/stores'
import { LeaderboardRow } from './LeaderboardRow'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SIDEBAR_SLIDE_X,
  UI_SPRING_STIFFNESS,
  UI_SPRING_DAMPING,
} from '@/utils/constants'

interface LeaderboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: SIDEBAR_SLIDE_X },
}

const springTransition = {
  type: 'spring' as const,
  stiffness: UI_SPRING_STIFFNESS,
  damping: UI_SPRING_DAMPING,
}

export function LeaderboardSidebar({
  isOpen,
  onToggle,
}: LeaderboardSidebarProps) {
  const billionaires = useAppStore((s) => s.billionaires)
  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  return (
    <motion.div
      className="absolute top-20 left-4 bottom-4 z-20 flex w-80"
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      transition={springTransition}
    >
      {/* Panel */}
      <div
        className="glass-panel flex flex-1 flex-col overflow-hidden"
        inert={!isOpen || undefined}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-ws-border px-4 py-3">
          <Trophy className="h-4 w-4 text-ws-gold" />
          <h2 className="font-display text-sm font-semibold text-ws-text-primary">
            Wealth Rankings
          </h2>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          <ul role="list" className="space-y-1 p-2">
            {billionaires.map((entry) => (
              <li key={entry.uri}>
                <LeaderboardRow
                  entry={entry}
                  isSelected={selectedUri === entry.uri}
                  onSelect={selectBillionaire}
                />
              </li>
            ))}
          </ul>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-ws-border px-4 py-2">
          <p className="text-center text-xs text-ws-text-secondary">
            Top {billionaires.length} Billionaires
          </p>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Collapse leaderboard' : 'Expand leaderboard'}
        aria-expanded={isOpen}
        className="glass-panel -mr-3 mt-4 flex h-10 w-6 items-center justify-center self-start rounded-l-none rounded-r-lg transition-colors hover:bg-ws-glass-hover"
      >
        {isOpen ? (
          <ChevronLeft className="h-3 w-3 text-ws-text-secondary" />
        ) : (
          <ChevronRight className="h-3 w-3 text-ws-text-secondary" />
        )}
      </button>
    </motion.div>
  )
}
