import { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Globe, Building2, Waves, Clock } from 'lucide-react'
import { useAppStore } from '@/stores'
import { cn } from '@/lib/utils'
import { MODE_TAB_SPRING } from '@/utils/constants'
import type { VisualizationMode } from '@/types'
import type { LucideIcon } from 'lucide-react'

interface ModeTab {
  mode: VisualizationMode
  icon: LucideIcon
  label: string
}

const TABS: ModeTab[] = [
  { mode: 'cosmos', icon: Globe, label: 'Cosmos' },
  { mode: 'towers', icon: Building2, label: 'Towers' },
  { mode: 'ocean', icon: Waves, label: 'Ocean' },
  { mode: 'timeline', icon: Clock, label: 'Timeline' },
]

export function ModeTabs() {
  const mode = useAppStore((s) => s.mode)
  const pendingMode = useAppStore((s) => s.pendingMode)
  const setMode = useAppStore((s) => s.setMode)
  const isTransitioning = useAppStore((s) => s.isTransitioning)
  const tabRefs = useRef<Map<VisualizationMode, HTMLButtonElement>>(new Map())
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  const activeMode = pendingMode ?? mode

  useEffect(() => {
    const activeTab = tabRefs.current.get(activeMode)
    if (!activeTab) return

    const container = activeTab.parentElement
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()

    setUnderlineStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    })
  }, [activeMode])

  return (
    <div className="pointer-events-auto fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <div className="glass-panel relative flex items-center gap-1 rounded-2xl px-2 py-2">
        {TABS.map(({ mode: tabMode, icon: Icon, label }) => (
          <button
            key={tabMode}
            ref={(el) => {
              if (el) tabRefs.current.set(tabMode, el)
            }}
            onClick={() => {
              if (tabMode !== activeMode && !isTransitioning) {
                setMode(tabMode)
              }
            }}
            disabled={isTransitioning}
            className={cn(
              'relative flex items-center gap-2 rounded-xl px-4 py-2',
              'font-display text-sm transition-colors duration-200',
              'hover:bg-ws-glass-hover',
              'disabled:pointer-events-none disabled:opacity-50',
              activeMode === tabMode
                ? 'text-ws-accent'
                : 'text-ws-text-secondary hover:text-ws-text-primary',
            )}
          >
            <Icon size={18} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        <motion.div
          className="absolute bottom-1 h-0.5 rounded-full bg-ws-accent"
          animate={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
          transition={{
            type: 'spring',
            stiffness: MODE_TAB_SPRING.stiffness,
            damping: MODE_TAB_SPRING.damping,
          }}
          style={{
            boxShadow: '0 0 12px 2px var(--ws-accent)',
          }}
        />
      </div>
    </div>
  )
}
