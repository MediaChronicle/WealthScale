export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
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
