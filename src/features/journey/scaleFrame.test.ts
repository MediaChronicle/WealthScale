import { expect, it } from 'vitest'
import { scaleFrame } from './scaleFrame'

it('keeps the upper overview fixed as dollar volume grows', () => {
  const small = scaleFrame(10e9, 1e9, true, null)
  const large = scaleFrame(1e12, 1e9, true, null)
  expect(large.pose).toEqual(small.pose)
  expect(large.extent).toBeGreaterThan(small.extent * 3)
  expect(large.anchors).toEqual(small.anchors)
  expect(large.anchors.map((a) => a.side)).toEqual([1, 10])
})
it('fits all corners of a trillion reference beside a million', () => {
  const frame = scaleFrame(1e6, 1e6, false, 1e12)
  const [cx, cy, cz] = frame.pose.target
  const cubes = [
    { x: 0, side: frame.extent, z: 0 },
    { x: frame.referenceX, side: frame.referenceSide, z: frame.referenceZ },
    ...frame.anchors.map((a) => ({ ...a, z: 0 })),
  ]
  for (const cube of cubes) {
    for (const x of [cube.x - cube.side / 2, cube.x + cube.side / 2])
      for (const y of [0, cube.side])
        for (const z of [cube.z - cube.side / 2, cube.z + cube.side / 2])
          expect(Math.hypot(x - cx, y - cy, z - cz)).toBeLessThanOrEqual(
            frame.pose.radius! + 0.001,
          )
  }
  expect(frame.anchors[0].label).toBe('$1M')
})
it('shares introductory framing so an ordinary reference grows into a million', () => {
  expect(scaleFrame(1e5, 1e5, false, null).pose.radius).toBe(
    scaleFrame(1e6, 1e6, false, null).pose.radius,
  )
})

it('has continuous introductory framing across former cutoffs', () => {
  for (const boundary of [1000, 1e6, 1e9]) {
    const before = scaleFrame(boundary - 1, boundary - 1, false, null, true)
    const after = scaleFrame(boundary + 1, boundary + 1, false, null, true)
    expect(after.pose.radius! / before.pose.radius!).toBeCloseTo(1, 2)
  }
})
it('keeps a small reference laterally outside the assembly in the default camera', () => {
  const frame = scaleFrame(1e9, 1e6, true, 1e5)
  expect(frame.pose.position[0]).toBe(frame.pose.target[0])
  expect(frame.referenceZ - frame.referenceSide / 2).toBeGreaterThan(
    frame.extent / 2,
  )
  expect(frame.referenceX - frame.referenceSide / 2).toBeGreaterThan(
    frame.extent / 2,
  )
})
