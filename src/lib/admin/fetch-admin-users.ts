import type { AdminUser } from '@/lib/admin/types'

async function readJsonResponse<T>(response: Response, fallbackError: string): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    const error = text ? JSON.parse(text) : { error: fallbackError }
    throw new Error(error.error || fallbackError)
  }

  const text = await response.text()
  if (!text || text.trim().length === 0) {
    return { users: [] } as T
  }

  return JSON.parse(text) as T
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch('/api/admin/users')
  const data = await readJsonResponse<{ users?: AdminUser[] }>(
    response,
    'Errore nel caricamento utenti',
  )
  return data.users ?? []
}
