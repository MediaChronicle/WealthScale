import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence, motion } from 'motion/react'
import { LoadingCoin } from '@/scene/shared/LoadingCoin'

interface LoadingScreenProps {
  ready: boolean
}

export function LoadingScreen({ ready }: LoadingScreenProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setDismissed(true), 600)
    return () => clearTimeout(timer)
  }, [ready])

  if (dismissed) return null

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ws-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="h-[40vh] w-[40vh]">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <LoadingCoin />
            </Canvas>
          </div>

          <div className="mt-4 text-center">
            <p className="animate-pulse font-display text-xl font-bold text-ws-accent">
              {ready ? 'Ready' : 'Loading WealthScale'}
            </p>
          </div>

          <p className="absolute bottom-12 font-body text-sm text-ws-text-secondary">
            Visualize billionaire wealth in 3D
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
