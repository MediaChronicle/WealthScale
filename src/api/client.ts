export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch: ${url}`)
  }

  return response.json()
}

export async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new ApiError(response.status, `Failed to fetch CSV: ${url}`)
  }

  return response.text()
}
