import { afterEach, expect, it, vi } from 'vitest'
import { ApiError, fetchJson } from './client'
afterEach(() => vi.unstubAllGlobals())
it('passes cancellation through to fetch', async () => {
  const signal = new AbortController().signal
  const fetcher = vi.fn().mockResolvedValue(new Response('{"ok":true}'))
  vi.stubGlobal('fetch', fetcher)
  expect(await fetchJson('/test', signal)).toEqual({ ok: true })
  expect(fetcher).toHaveBeenCalledWith('/test', { signal })
})
it('rejects HTTP errors before interpreting the body', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('offline', { status: 503 })),
  )
  await expect(fetchJson('/test')).rejects.toMatchObject({
    name: 'ApiError',
    status: 503,
  })
  expect(new ApiError(404, 'Missing')).toBeInstanceOf(Error)
})
it('preserves abort errors', async () => {
  const error = new DOMException('Cancelled', 'AbortError')
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))
  await expect(fetchJson('/test')).rejects.toBe(error)
})
