import {
  Globe,
  Waves,
  Clock,
  Scale,
  LayoutGrid,
  Search,
  Share2,
  Trophy,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAchievementStore, ACHIEVEMENTS } from '@/stores/achievementStore'
import { cn } from '@/lib/utils'
import type { AchievementId, AchievementDef } from '@/stores/achievementStore'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Waves,
  Clock,
  Scale,
  LayoutGrid,
  Search,
  Share2,
}

interface AchievementBadgeProps {
  achievement: AchievementDef
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const

const ICON_SIZES = {
  sm: 14,
  md: 16,
  lg: 20,
} as const

function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const unlocked = useAchievementStore(
    (s) => s.unlocked[achievement.id as AchievementId],
  )
  const Icon = ICON_MAP[achievement.icon] ?? Trophy
  const isUnlocked = unlocked !== null

  return (
    <TooltipTrigger asChild>
      <div
        className={cn(
          'flex items-center justify-center rounded-full border transition-all',
          SIZE_CLASSES[size],
          isUnlocked
            ? 'border-[#FFD700]/40 bg-[#FFD700]/15 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
            : 'border-ws-border bg-ws-glass opacity-40',
        )}
      >
        <Icon
          size={ICON_SIZES[size]}
          className={cn(
            isUnlocked ? 'text-[#FFD700]' : 'text-ws-text-secondary',
          )}
        />
      </div>
    </TooltipTrigger>
  )
}

interface AchievementBarProps {
  size?: 'sm' | 'md' | 'lg'
}

export function AchievementBar({ size = 'sm' }: AchievementBarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5">
        {ACHIEVEMENTS.map((achievement) => (
          <Tooltip key={achievement.id}>
            <AchievementBadge achievement={achievement} size={size} />
            <TooltipContent side="bottom" className="max-w-48">
              <BadgeTooltipContent achievementId={achievement.id} />
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

function BadgeTooltipContent({
  achievementId,
}: {
  achievementId: AchievementId
}) {
  const unlocked = useAchievementStore((s) => s.unlocked[achievementId])
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId)!

  return (
    <div>
      <p className="font-display text-xs font-semibold">{achievement.name}</p>
      <p className="text-xs text-muted-foreground">{achievement.description}</p>
      {unlocked && (
        <p className="mt-1 text-xs text-[#FFD700]">
          Unlocked {new Date(unlocked.unlockedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
