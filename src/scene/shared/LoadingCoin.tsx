import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CylinderGeometry,
  CircleGeometry,
  MeshStandardMaterial,
  Color,
  DoubleSide,
} from 'three'
import type { Mesh } from 'three'
import {
  LOADING_COIN_SPIN_SPEED,
  LOADING_COIN_FLOAT_SPEED,
  LOADING_COIN_FLOAT_AMP,
  LOADING_COIN_COLOR,
  LOADING_COIN_EMISSIVE,
  LOADING_COIN_RADIUS,
  LOADING_COIN_HEIGHT,
  LOADING_COIN_SEGMENTS,
  LOADING_COIN_METALNESS,
  LOADING_COIN_ROUGHNESS,
} from '@/utils/constants'

export function LoadingCoin() {
  const groupRef = useRef<Mesh>(null)

  const coinGeometry = useMemo(
    () =>
      new CylinderGeometry(
        LOADING_COIN_RADIUS,
        LOADING_COIN_RADIUS,
        LOADING_COIN_HEIGHT,
        LOADING_COIN_SEGMENTS,
      ),
    [],
  )

  const faceGeometry = useMemo(
    () => new CircleGeometry(LOADING_COIN_RADIUS * 0.8, LOADING_COIN_SEGMENTS),
    [],
  )

  const coinMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(LOADING_COIN_COLOR),
        emissive: new Color(LOADING_COIN_EMISSIVE),
        emissiveIntensity: 0.3,
        metalness: LOADING_COIN_METALNESS,
        roughness: LOADING_COIN_ROUGHNESS,
      }),
    [],
  )

  const faceMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(LOADING_COIN_COLOR),
        emissive: new Color(LOADING_COIN_EMISSIVE),
        emissiveIntensity: 0.5,
        metalness: LOADING_COIN_METALNESS,
        roughness: LOADING_COIN_ROUGHNESS,
        side: DoubleSide,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      coinGeometry.dispose()
      faceGeometry.dispose()
      coinMaterial.dispose()
      faceMaterial.dispose()
    }
  }, [coinGeometry, faceGeometry, coinMaterial, faceMaterial])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * LOADING_COIN_SPIN_SPEED
    groupRef.current.position.y =
      Math.sin(t * LOADING_COIN_FLOAT_SPEED) * LOADING_COIN_FLOAT_AMP
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight
        position={[3, 3, 3]}
        intensity={1.5}
        color={LOADING_COIN_COLOR}
      />
      <pointLight position={[-2, -1, 2]} intensity={0.5} color="#ffffff" />

      <group ref={groupRef as React.RefObject<never>}>
        {/* Coin body */}
        <mesh
          geometry={coinGeometry}
          material={coinMaterial}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Front face emblem */}
        <mesh
          geometry={faceGeometry}
          material={faceMaterial}
          position={[0, 0, LOADING_COIN_HEIGHT / 2 + 0.001]}
        />
        {/* Back face emblem */}
        <mesh
          geometry={faceGeometry}
          material={faceMaterial}
          position={[0, 0, -(LOADING_COIN_HEIGHT / 2 + 0.001)]}
          rotation={[0, Math.PI, 0]}
        />
      </group>
    </>
  )
}
