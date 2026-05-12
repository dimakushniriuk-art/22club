import type { AdminStatistics } from '@/lib/admin/types'

export async function fetchAdminStatistics(): Promise<AdminStatistics> {
  const response = await fetch('/api/admin/statistics')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Errore nel caricamento statistiche')
  }
  return (await response.json()) as AdminStatistics
}
