export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchJson<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch: ${url}`)
  }

  return response.json()
}
