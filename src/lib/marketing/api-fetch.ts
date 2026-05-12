export class MarketingApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'MarketingApiError'
    this.status = status
  }
}

export async function fetchMarketingJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new MarketingApiError((body.error as string) || 'Errore richiesta', res.status)
  }
  return body as T
}
