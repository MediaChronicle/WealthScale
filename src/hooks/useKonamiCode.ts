import { useEffect, useRef } from 'react'

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
]

const TIMEOUT_MS = 2_000

export function useKonamiCode(onActivate: () => void): void {
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (timerRef.current) clearTimeout(timerRef.current)

      if (e.code === KONAMI_SEQUENCE[indexRef.current]) {
        indexRef.current++
        if (indexRef.current === KONAMI_SEQUENCE.length) {
          indexRef.current = 0
          onActivate()
          return
        }
        timerRef.current = setTimeout(() => {
          indexRef.current = 0
        }, TIMEOUT_MS)
      } else {
        indexRef.current = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onActivate])
}
