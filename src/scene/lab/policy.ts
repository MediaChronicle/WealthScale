export type Quality = 'standard' | 'economy'
export function renderPolicy(
  quality: Quality,
  mobile: boolean,
): { dpr: number; segments: number } {
  return quality === 'economy' || mobile
    ? { dpr: 1, segments: 16 }
    : { dpr: 1.5, segments: 24 }
}
