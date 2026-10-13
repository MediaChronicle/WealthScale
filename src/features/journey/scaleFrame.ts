import { unitSide } from './scale'
import type { CameraPose } from '@/scene/lab/SceneCanvas'

export interface ScaleAnchor {
  label: string
  side: number
  x: number
}

/** Upper chapters share one overview. Comparisons fit the union, not just mint. */
export function scaleFrame(
  total: number,
  unit: number,
  exploded: boolean,
  reference: number | null,
  introductory = false,
): {
  pose: CameraPose
  extent: number
  anchors: ScaleAnchor[]
  referenceX: number
  referenceZ: number
  referenceSide: number
} {
  const extent =
    Math.ceil(Math.cbrt(total / unit)) *
    unitSide(unit) *
    (exploded ? 1.22 : 1.025)
  const upper = total > 1e9 && !introductory
  const anchors = upper
    ? [
        { label: '$1M', side: 1, x: -100 },
        { label: '$1B', side: 10, x: -68 },
      ]
    : [{ label: '$1M', side: 1, x: -extent / 2 - 1.5 }]
  // Introductory magnification changes continuously and meets the million
  // frame at $1M, avoiding discontinuities at arbitrary dollar thresholds.
  let radius = introductory
    ? 1.8 * unitSide(total) ** 0.8
    : total <= 1e6
      ? 1.8
      : upper
        ? Math.max(110, extent * 0.9)
        : Math.max(1.8, extent * 1.475)
  let centerZ = 0
  let centerX = 0
  let centerY = introductory ? unitSide(total) / 2 : upper ? 48 : extent / 2
  if (introductory && total < 1e6) anchors.length = 0
  const referenceSide = reference ? unitSide(reference) : 0
  const referenceX =
    extent / 2 +
    Math.max(unitSide(unit), referenceSide * 0.15) +
    referenceSide / 2
  const referenceZ = reference
    ? extent / 2 + referenceSide / 2 + unitSide(unit)
    : 0
  if (reference) {
    const minX = Math.min(-extent / 2, ...anchors.map((a) => a.x - a.side / 2))
    const maxX = referenceX + referenceSide / 2
    const height = Math.max(extent, referenceSide, 1)
    const minZ = -Math.max(extent, 1) / 2
    const maxZ = referenceZ + referenceSide / 2
    const depth = maxZ - minZ
    centerZ = (minZ + maxZ) / 2
    centerX = (minX + maxX) / 2
    centerY = height / 2
    radius = Math.hypot(maxX - minX, height, depth) / 2
  }
  return {
    pose: {
      position: [centerX + (reference ? 0 : -8), centerY + 7, centerZ + 12],
      target: [centerX, centerY, centerZ],
      radius,
    },
    extent,
    anchors,
    referenceX,
    referenceZ,
    referenceSide,
  }
}
