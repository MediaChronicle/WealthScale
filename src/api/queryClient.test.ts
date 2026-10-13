import { expect, it, vi } from 'vitest'
import { z } from 'zod'
import { createQueryClient } from './queryClient'

it('does not retry invalid data but recovers from a transient fetch failure', async () => {
  const client = createQueryClient()
  const invalid = vi.fn(async () => z.number().parse('invalid'))
  await expect(
    client.fetchQuery({
      queryKey: ['invalid'],
      queryFn: invalid,
      retryDelay: 0,
    }),
  ).rejects.toThrow()
  expect(invalid).toHaveBeenCalledTimes(1)
  const transient = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(42)
  await expect(
    client.fetchQuery({
      queryKey: ['transient'],
      queryFn: transient,
      retryDelay: 0,
    }),
  ).resolves.toBe(42)
  expect(transient).toHaveBeenCalledTimes(2)
  client.clear()
})
