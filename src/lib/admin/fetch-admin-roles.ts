import type { AdminRole } from '@/lib/admin/types'

export async function fetchAdminRoles(): Promise<AdminRole[]> {
  const response = await fetch('/api/admin/roles')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Errore nel caricamento ruoli')
  }
  const { roles } = (await response.json()) as { roles?: AdminRole[] }
  return (roles ?? []).map((role) => ({
    ...role,
    permissions: (role.permissions ?? {}) as Record<string, boolean>,
  }))
}
