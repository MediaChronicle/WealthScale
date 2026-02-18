import { useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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
import { useAchievementStore, ACHIEVEMENTS } from '@/stores/achievementStore'
import { seededRandom } from '@/utils/seededRandom'
import {
  ACHIEVEMENT_TOAST_DURATION_MS,
  ACHIEVEMENT_TOAST_SPRING,
  ACHIEVEMENT_CONFETTI_COUNT,
} from '@/utils/constants'
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

function ConfettiParticle({ index }: { index: number }) {
  const angle = (index / ACHIEVEMENT_CONFETTI_COUNT) * Math.PI * 2
  const distance = 40 + seededRandom(index * 3) * 60
  const x = Math.cos(angle) * distance
  const y = -seededRandom(index * 3 + 1) * 120 - 40
  const rotation = seededRandom(index * 3 + 2) * 720 - 360
  const colors = ['#FFD700', '#00d4ff', '#ff44aa', '#00ff88']
  const color = colors[index % colors.length]

  return (
    <motion.div
      className="absolute left-1/2 top-0 h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        x,
        y,
        opacity: 0,
        rotate: rotation,
        scale: 0,
      }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    />
  )
}

export function AchievementToast() {
  const latestUnlock = useAchievementStore((s) => s.latestUnlock)
  const clearLatest = useAchievementStore((s) => s.clearLatest)

  const achievement = latestUnlock
    ? ACHIEVEMENTS.find((a) => a.id === latestUnlock)
    : null

  const dismiss = useCallback(() => {
    setTimeout(clearLatest, 300)
  }, [clearLatest])

  useEffect(() => {
    if (!latestUnlock) return
    const timer = setTimeout(dismiss, ACHIEVEMENT_TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [latestUnlock, dismiss])

  const Icon = achievement ? (ICON_MAP[achievement.icon] ?? Trophy) : Trophy

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="pointer-events-auto fixed bottom-8 left-1/2 z-50 -translate-x-1/2 cursor-pointer"
          initial={{ opacity: 0, y: 60, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 60, x: '-50%' }}
          transition={{
            type: 'spring',
            stiffness: ACHIEVEMENT_TOAST_SPRING.stiffness,
            damping: ACHIEVEMENT_TOAST_SPRING.damping,
          }}
          onClick={dismiss}
        >
          {/* Confetti burst */}
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: ACHIEVEMENT_CONFETTI_COUNT }, (_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#FFD700]/30 bg-[#FFD700]/10 px-5 py-3 shadow-lg backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700]/20">
              <Icon className="h-5 w-5 text-[#FFD700]" />
            </div>
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-wider text-[#FFD700]">
                Achievement Unlocked
              </p>
              <p className="font-body text-sm font-medium text-ws-text-primary">
                {achievement.name}
              </p>
              <p className="font-body text-xs text-ws-text-secondary">
                {achievement.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
