import { memo } from 'react'
import { Crown, TrendingUp, TrendingDown } from 'lucide-react'
import type { BillionaireListEntry } from '@/types'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { formatWealth } from '@/utils/formatWealth'
import { cn } from '@/lib/utils'

interface LeaderboardRowProps {
  entry: BillionaireListEntry
  isSelected: boolean
  onSelect: (uri: string) => void
}

export const LeaderboardRow = memo(function LeaderboardRow({
  entry,
  isSelected,
  onSelect,
}: LeaderboardRowProps) {
  const industryColor = getIndustryColor(entry.industry[0] ?? 'other').primary

  return (
    <button
      onClick={() => onSelect(entry.uri)}
      aria-label={`Rank ${entry.rank}: ${entry.name}, ${formatWealth(entry.networth)}`}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
        'hover:bg-ws-glass-hover hover:-translate-y-0.5 hover:shadow-lg',
        isSelected && 'bg-ws-glass-hover ring-1 ring-ws-accent/30',
      )}
    >
      {/* Rank */}
      <div className="flex w-6 shrink-0 items-center justify-center">
        {entry.rank === 1 ? (
          <Crown className="h-4 w-4 text-ws-gold" aria-hidden="true" />
        ) : (
          <span className="font-mono text-xs text-ws-text-secondary">
            {entry.rank}
          </span>
        )}
      </div>

      {/* Industry color dot */}
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: industryColor }}
        aria-hidden="true"
      />

      {/* Name + net worth */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ws-text-primary">
          {entry.name}
        </p>
        <p className="text-xs text-ws-text-secondary">
          {formatWealth(entry.networth)}
        </p>
      </div>

      {/* Daily change */}
      {entry.change !== null && (
        <div
          className={cn(
            'flex shrink-0 items-center gap-0.5 text-xs',
            entry.change >= 0 ? 'text-ws-positive' : 'text-ws-negative',
          )}
          aria-hidden="true"
        >
          {entry.change >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
        </div>
      )}
    </button>
  )
})
