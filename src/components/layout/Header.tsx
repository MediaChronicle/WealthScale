import { Gamepad2 } from 'lucide-react'
import { ModeTabs } from '@/components/modeSwitcher/ModeTabs'
import { AchievementBar } from '@/components/achievements/AchievementBadge'
import { ShareButton } from '@/components/layout/ShareButton'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onOpenGame: () => void
  onScreenshotDownload: () => Promise<boolean>
  onScreenshotCopy: () => Promise<boolean>
}

export function Header({
  onOpenGame,
  onScreenshotDownload,
  onScreenshotCopy,
}: HeaderProps) {
  const isMobile = useIsMobile()

  return (
    <header className="pointer-events-auto fixed left-4 right-4 top-4 z-40">
      <div className="glass-panel flex items-center justify-between px-4 py-2.5">
        {/* Left: Logo */}
        <h1 className="shrink-0 font-display text-lg font-bold tracking-wide text-ws-text-primary">
          Wealth<span className="text-ws-accent">Scale</span>
        </h1>

        {/* Center: Mode Tabs (desktop only) */}
        {!isMobile && (
          <div className="flex-1 flex justify-center">
            <ModeTabs embedded />
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Achievement bar (desktop only) */}
          {!isMobile && <AchievementBar size="sm" />}

          {!isMobile && <div className="mx-1 h-5 w-px bg-ws-border" />}

          <button
            onClick={onOpenGame}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              'text-ws-text-secondary hover:bg-ws-glass-hover hover:text-ws-text-primary',
              'focus-visible:ring-2 focus-visible:ring-ws-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ws-bg outline-none',
            )}
            aria-label="Play Guess the Wealth"
          >
            <Gamepad2 size={16} />
          </button>

          <ShareButton
            onDownload={onScreenshotDownload}
            onCopy={onScreenshotCopy}
          />
        </div>
      </div>
    </header>
  )
}
