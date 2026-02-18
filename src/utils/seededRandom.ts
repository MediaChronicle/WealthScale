/** Deterministic pseudo-random from seed (avoids React 19 purity violations in useMemo) */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
