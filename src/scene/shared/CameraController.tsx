import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSpring } from '@react-spring/three'
import { SphereGeometry, MeshBasicMaterial, BackSide } from 'three'
import type { OrbitControls } from '@react-three/drei'
import { useAppStore } from '@/stores'
import {
  DEFAULT_CAMERA_POSITION,
  CAMERA_FLY_OFFSET,
  CAMERA_FLY_HEIGHT,
  CAMERA_SPRING,
  EMPTY_SPACE_SPHERE_RADIUS,
} from '@/utils/constants'

type OrbitControlsRef = React.ComponentRef<typeof OrbitControls>

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsRef | null>
  planetPositions: React.RefObject<Map<string, [number, number, number]>>
}

export function CameraController({
  controlsRef,
  planetPositions,
}: CameraControllerProps) {
  const { camera } = useThree()
  const selectedUri = useAppStore((s) => s.selectedUri)
  const selectBillionaire = useAppStore((s) => s.selectBillionaire)
  const isAnimatingRef = useRef(false)

  const [defaultX, defaultY, defaultZ] = DEFAULT_CAMERA_POSITION

  const [springs, api] = useSpring(() => ({
    camX: defaultX,
    camY: defaultY,
    camZ: defaultZ,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    config: CAMERA_SPRING,
    onChange: () => {
      isAnimatingRef.current = true
    },
    onRest: () => {
      isAnimatingRef.current = false
    },
  }))

  useEffect(() => {
    if (selectedUri && planetPositions.current) {
      const pos = planetPositions.current.get(selectedUri)
      if (pos) {
        const [px, py, pz] = pos
        // Calculate camera offset direction from planet to origin
        const dist = Math.sqrt(px * px + pz * pz) || 1
        const dirX = px / dist
        const dirZ = pz / dist

        api.start({
          camX: px + dirX * CAMERA_FLY_OFFSET,
          camY: py + CAMERA_FLY_HEIGHT,
          camZ: pz + dirZ * CAMERA_FLY_OFFSET,
          targetX: px,
          targetY: py,
          targetZ: pz,
        })
      }
    } else {
      api.start({
        camX: defaultX,
        camY: defaultY,
        camZ: defaultZ,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
      })
    }
  }, [selectedUri, api, defaultX, defaultY, defaultZ, planetPositions])

  useFrame(() => {
    if (!isAnimatingRef.current) return

    camera.position.set(
      springs.camX.get(),
      springs.camY.get(),
      springs.camZ.get(),
    )

    const controls = controlsRef.current
    if (controls) {
      controls.target.set(
        springs.targetX.get(),
        springs.targetY.get(),
        springs.targetZ.get(),
      )
      controls.update()
    }
  })

  // Invisible sphere for empty-space double-click deselection
  const sphereGeo = useMemo(
    () => new SphereGeometry(EMPTY_SPACE_SPHERE_RADIUS, 16, 16),
    [],
  )
  const sphereMat = useMemo(
    () => new MeshBasicMaterial({ visible: false, side: BackSide }),
    [],
  )

  useEffect(() => {
    return () => {
      sphereGeo.dispose()
      sphereMat.dispose()
    }
  }, [sphereGeo, sphereMat])

  return (
    <mesh
      geometry={sphereGeo}
      material={sphereMat}
      onDoubleClick={() => selectBillionaire(null)}
    />
  )
}
