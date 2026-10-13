import { expect, it } from 'vitest'
import { DirectionalLight, PerspectiveCamera, Vector3 } from 'three'
import { synchronizeProjection, synchronizeShadow } from './projection'
it('updates an already mounted camera from trillion overview to a tiny close-up', () => {
  const camera = new PerspectiveCamera(38, 1, 1.1, 10000)
  synchronizeProjection(camera, 0.03)
  expect(camera.near).toBeCloseTo(0.0003)
  const visible = new Vector3(0, 0, -0.01).applyMatrix4(camera.projectionMatrix)
  expect(Math.abs(visible.z)).toBeLessThan(1)
})
it('updates existing shadow projection in both directions and includes wide worlds', () => {
  const light = new DirectionalLight()
  synchronizeShadow(light, 1.8)
  const before = light.shadow.camera.projectionMatrix.clone()
  synchronizeShadow(light, 110)
  expect(light.shadow.camera.projectionMatrix.equals(before)).toBe(false)
  const point = new Vector3(100, 100, -400).applyMatrix4(
    light.shadow.camera.projectionMatrix,
  )
  expect(
    Math.max(Math.abs(point.x), Math.abs(point.y), Math.abs(point.z)),
  ).toBeLessThan(1)
  synchronizeShadow(light, 1.8)
  expect(light.shadow.camera.projectionMatrix.equals(before)).toBe(true)
})
