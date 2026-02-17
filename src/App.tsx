import { Canvas } from '@react-three/fiber'
import { SceneManager } from '@/scene/SceneManager'
import { useBillionaireList } from '@/api/queries'
import { toPlanetConfig } from '@/api/transformers'
import { useAppStore } from '@/stores'
import { DEFAULT_CAMERA_POSITION, DEFAULT_CAMERA_FOV } from '@/utils/constants'
import { useMemo, useEffect } from 'react'
import { ZodError } from 'zod'

/**
 * Get a user-friendly error message from various error types
 */
function getErrorMessage(error: Error): string {
  if (error instanceof ZodError) {
    return 'Failed to parse billionaire data. The API format may have changed.'
  }
  if (error.message.includes('fetch')) {
    return 'Unable to connect to the wealth data API. Please check your connection.'
  }
  return error.message || 'An unexpected error occurred.'
}

export default function App() {
  const {
    data: billionaires,
    isPending,
    isError,
    error,
    refetch,
  } = useBillionaireList(10)
  const setBillionaires = useAppStore((s) => s.setBillionaires)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)

  // Sync API data into Zustand
  useEffect(() => {
    if (billionaires) {
      setBillionaires(billionaires)
    }
  }, [billionaires, setBillionaires])

  // Transform to planet configs
  const planets = useMemo(
    () => (billionaires ?? []).map(toPlanetConfig),
    [billionaires],
  )

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ws-bg">
        <p className="animate-pulse font-display text-xl text-ws-accent">
          Loading WealthScale...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-ws-bg">
        <p className="font-display text-xl text-ws-negative">
          {getErrorMessage(error)}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-ws-accent px-4 py-2 font-body text-sm text-ws-bg transition-opacity hover:opacity-80"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen">
      <Canvas
        camera={{
          position: DEFAULT_CAMERA_POSITION,
          fov: DEFAULT_CAMERA_FOV,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
      >
        <SceneManager planets={planets} onSelectPlanet={selectBillionaire} />
      </Canvas>
    </div>
  )
}
