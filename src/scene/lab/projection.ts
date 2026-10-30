import { Camera, DirectionalLight, PerspectiveCamera } from 'three'

/** Three requires explicit matrix updates after imperative frustum changes. */
export function synchronizeProjection(camera: Camera, radius: number): void {
  if (camera instanceof PerspectiveCamera) {
    camera.near = Math.max(0.00001, radius / 100)
    camera.updateProjectionMatrix()
  }
}

export function synchronizeShadow(
  light: DirectionalLight,
  radius: number,
): void {
  const camera = light.shadow.camera
  camera.left = camera.bottom = -radius * 2
  camera.right = camera.top = radius * 2
  camera.near = Math.max(0.00001, radius / 100)
  camera.far = radius * 10
  camera.updateProjectionMatrix()
  light.shadow.needsUpdate = true
}
