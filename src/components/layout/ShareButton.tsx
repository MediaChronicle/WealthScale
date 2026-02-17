import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Camera, Download, Copy, Check } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  onDownload: () => void
  onCopy: () => void
}

export function ShareButton({ onDownload, onCopy }: ShareButtonProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [onCopy])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                'hover:bg-ws-glass-hover',
                'focus-visible:ring-2 focus-visible:ring-ws-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ws-bg outline-none',
                expanded
                  ? 'text-ws-accent'
                  : 'text-ws-text-secondary hover:text-ws-text-primary',
              )}
            >
              <Camera size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Screenshot</TooltipContent>
        </Tooltip>

        <AnimatePresence>
          {expanded && (
            <motion.div
              className="flex items-center gap-1 overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onDownload}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ws-text-secondary transition-colors hover:bg-ws-glass-hover hover:text-ws-text-primary focus-visible:ring-2 focus-visible:ring-ws-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ws-bg outline-none"
                  >
                    <Download size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Download</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopy}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ws-text-secondary transition-colors hover:bg-ws-glass-hover hover:text-ws-text-primary focus-visible:ring-2 focus-visible:ring-ws-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ws-bg outline-none"
                  >
                    {copied ? (
                      <Check size={14} className="text-ws-positive" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
