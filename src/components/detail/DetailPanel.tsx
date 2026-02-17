import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { X, ExternalLink, GraduationCap, Building2, MapPin } from 'lucide-react'
import { useAppStore } from '@/stores'
import { useSelectedBillionaire } from '@/hooks/useSelectedBillionaire'
import { useBillionaireProfile } from '@/api/queries'
import { formatWealth } from '@/utils/formatWealth'
import { getIndustryColor } from '@/utils/colorByIndustry'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DETAIL_PANEL_SLIDE_X,
  UI_SPRING_STIFFNESS,
  UI_SPRING_DAMPING,
} from '@/utils/constants'

function countryCodeToEmoji(code: string): string {
  if (!code || code.length !== 2) return ''
  const codePoints = [...code.toUpperCase()].map(
    (c) => 0x1f1e6 - 65 + c.charCodeAt(0),
  )
  return String.fromCodePoint(...codePoints)
}

export function DetailPanel() {
  const panelRef = useRef<HTMLDivElement>(null)
  const entry = useSelectedBillionaire()
  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  const { data: profile, isPending } = useBillionaireProfile(selectedUri)

  const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return

    const focusable =
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  useEffect(() => {
    panelRef.current?.focus()

    const panel = panelRef.current
    if (!panel) return

    panel.addEventListener('keydown', handleKeyDown)
    return () => panel.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!entry) return null

  const industryColor = getIndustryColor(entry.industry[0] ?? 'other').primary

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-label={`${entry.name} profile`}
      tabIndex={-1}
      className="glass-panel absolute top-20 right-4 bottom-4 z-20 flex w-full flex-col overflow-hidden outline-none sm:w-96"
      initial={{ x: DETAIL_PANEL_SLIDE_X, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: DETAIL_PANEL_SLIDE_X, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: UI_SPRING_STIFFNESS,
        damping: UI_SPRING_DAMPING,
      }}
    >
      {/* Close button */}
      <button
        onClick={() => selectBillionaire(null)}
        aria-label="Close detail panel"
        className="absolute top-3 right-3 z-10 rounded-full p-1.5 transition-colors hover:bg-ws-glass-hover"
      >
        <X className="h-4 w-4 text-ws-text-secondary" />
      </button>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            {profile?.image && (
              <img
                src={profile.image}
                alt={entry.name}
                className="h-16 w-16 rounded-full border-2 object-cover"
                style={{ borderColor: industryColor }}
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold text-ws-text-primary">
                {entry.name}
              </h2>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-ws-text-secondary">
                {profile?.birthDate && <span>Age {entry.age}</span>}
                {entry.citizenship && (
                  <span>{countryCodeToEmoji(entry.citizenship)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Net worth */}
          <div>
            <p className="text-xs uppercase tracking-wider text-ws-text-secondary">
              Net Worth
            </p>
            <p
              className="font-display text-2xl font-bold"
              style={{ color: industryColor }}
            >
              {formatWealth(entry.networth)}
            </p>
            {entry.change !== null && (
              <p
                className={`mt-0.5 text-sm ${entry.change >= 0 ? 'text-ws-positive' : 'text-ws-negative'}`}
              >
                {entry.change >= 0 ? '+' : ''}
                {formatWealth(Math.abs(entry.change))} today
              </p>
            )}
          </div>

          <Separator className="bg-ws-border" />

          {/* Sources */}
          {entry.source.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-ws-text-secondary">
                Sources
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.source.map((src) => (
                  <Badge
                    key={src}
                    variant="secondary"
                    className="bg-ws-glass text-ws-text-primary"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    {src}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Industries */}
          {entry.industry.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-ws-text-secondary">
                Industries
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.industry.map((ind) => (
                  <Badge
                    key={ind}
                    variant="outline"
                    className="border-ws-border text-ws-text-primary"
                    style={{
                      borderColor: getIndustryColor(ind).primary + '40',
                      color: getIndustryColor(ind).primary,
                    }}
                  >
                    {ind}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Profile details (lazy-loaded) */}
          {isPending && selectedUri && (
            <p className="animate-pulse text-sm text-ws-text-secondary">
              Loading profile...
            </p>
          )}

          {profile && (
            <>
              <Separator className="bg-ws-border" />

              {/* Organization */}
              {profile.organization?.name && (
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-ws-text-secondary" />
                  <div>
                    <p className="text-sm text-ws-text-primary">
                      {profile.organization.name}
                    </p>
                    {profile.organization.title && (
                      <p className="text-xs text-ws-text-secondary">
                        {profile.organization.title}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Residence */}
              {profile.residence?.city && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ws-text-secondary" />
                  <p className="text-sm text-ws-text-primary">
                    {[
                      profile.residence.city,
                      profile.residence.state,
                      profile.residence.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}

              {/* Education */}
              {profile.education?.length > 0 && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-ws-text-secondary" />
                  <div className="space-y-1">
                    {profile.education.map((edu, i) => (
                      <div key={i}>
                        <p className="text-sm text-ws-text-primary">
                          {edu.school}
                        </p>
                        {edu.degree && (
                          <p className="text-xs text-ws-text-secondary">
                            {edu.degree}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Self-made badge */}
              {profile.selfMade?._is && (
                <Badge
                  variant="secondary"
                  className="bg-ws-accent/10 text-ws-accent"
                >
                  Self-Made
                  {profile.selfMade.type && ` (${profile.selfMade.type})`}
                </Badge>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  )
}
