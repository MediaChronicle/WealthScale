import { useRef, useEffect } from 'react'
import { useSpring, animated } from '@react-spring/three'
import { useAppStore } from '@/stores'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  TRANSITION_COLLAPSE_SPRING,
  TRANSITION_EXPAND_SPRING,
  TRANSITION_REDUCED_CONFIG,
} from '@/utils/constants'
import type { Group } from 'three'
import type { ReactNode } from 'react'

interface ModeTransitionProps {
  children: ReactNode
}

export function ModeTransition({ children }: ModeTransitionProps) {
  const isTransitioning = useAppStore((s) => s.isTransitioning)
  const commitMode = useAppStore((s) => s.commitMode)
  const setTransitioning = useAppStore((s) => s.setTransitioning)
  const groupRef = useRef<Group>(null)
  const phaseRef = useRef<'idle' | 'collapsing' | 'expanding'>('idle')
  const reducedMotion = useReducedMotion()

  const [spring, springApi] = useSpring(() => ({
    scale: 1,
    rotationY: 0,
    config: { mass: 1, tension: 200, friction: 26 },
  }))

  useEffect(() => {
    if (isTransitioning && phaseRef.current === 'idle') {
      phaseRef.current = 'collapsing'

      springApi.start({
        scale: 0,
        rotationY: reducedMotion ? 0 : Math.PI * 2,
        config: reducedMotion
          ? TRANSITION_REDUCED_CONFIG
          : TRANSITION_COLLAPSE_SPRING,
        onRest: () => {
          commitMode()
          phaseRef.current = 'expanding'

          springApi.start({
            scale: 1,
            rotationY: reducedMotion ? 0 : Math.PI * 4,
            config: reducedMotion
              ? TRANSITION_REDUCED_CONFIG
              : TRANSITION_EXPAND_SPRING,
            onRest: () => {
              phaseRef.current = 'idle'
              setTransitioning(false)
              springApi.set({ rotationY: 0 })
            },
          })
        },
      })
    }
  }, [isTransitioning, springApi, commitMode, setTransitioning, reducedMotion])

  return (
    <animated.group
      ref={groupRef}
      scale={spring.scale}
      rotation-y={spring.rotationY}
    >
      {children}
    </animated.group>
  )
}
