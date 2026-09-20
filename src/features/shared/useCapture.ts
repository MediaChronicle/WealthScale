import { useCallback, useState } from 'react'
import type { Capture } from '@/scene/lab/SceneCanvas'
export function useCapture(): {
  capture: Capture | null
  registerCapture: (action: Capture | null) => void
  saving: boolean
  message: string
  save: () => Promise<void>
} {
  const [capture, setCapture] = useState<Capture | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const registerCapture = useCallback((action: Capture | null): void => {
    setCapture(() => action)
    setMessage('')
  }, [])
  const save = async (): Promise<void> => {
    if (!capture) return
    setSaving(true)
    try {
      await capture()
      setMessage('Image saved to your device.')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not save image.',
      )
    } finally {
      setSaving(false)
    }
  }
  return { capture, registerCapture, saving, message, save }
}
