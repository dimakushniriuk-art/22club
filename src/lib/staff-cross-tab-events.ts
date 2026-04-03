/**
 * Evento `window` quando la tabella `appointments` cambia in realtime per l’org
 * dello staff (dopo filtro in `dashboard/layout`). Usato per rifetch hook che non passano da React Query.
 */
export const STAFF_APPOINTMENTS_INVALIDATE_EVENT = '22club:staff-appointments-invalidate' as const

export type StaffAppointmentsInvalidateDetail = { org_id: string }

/** Profilo atleta (`profiles`) INSERT/UPDATE/DELETE per la stessa org (dopo filtro layout). */
export const STAFF_CLIENTI_INVALIDATE_EVENT = '22club:staff-clienti-invalidate' as const

export type StaffClientiInvalidateDetail = { org_id: string }
