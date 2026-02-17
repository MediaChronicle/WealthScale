import { MeshReflectorMaterial, Grid } from '@react-three/drei'
import {
  TOWER_GROUND_COLOR,
  TOWER_GROUND_SIZE,
  TOWER_GRID_CELL_SIZE,
  TOWER_GRID_SECTION_SIZE,
  TOWER_GRID_CELL_COLOR,
  TOWER_GRID_SECTION_COLOR,
  TOWER_GRID_FADE_DISTANCE,
} from '@/utils/constants'

export function GroundPlane() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[TOWER_GROUND_SIZE, TOWER_GROUND_SIZE]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color={TOWER_GROUND_COLOR}
          metalness={0.5}
          mirror={0.5}
        />
      </mesh>

      <Grid
        position={[0, 0.01, 0]}
        args={[TOWER_GROUND_SIZE, TOWER_GROUND_SIZE]}
        cellSize={TOWER_GRID_CELL_SIZE}
        cellThickness={0.5}
        cellColor={TOWER_GRID_CELL_COLOR}
        sectionSize={TOWER_GRID_SECTION_SIZE}
        sectionThickness={1}
        sectionColor={TOWER_GRID_SECTION_COLOR}
        fadeDistance={TOWER_GRID_FADE_DISTANCE}
        fadeStrength={1}
        infiniteGrid
      />
    </>
  )
}
