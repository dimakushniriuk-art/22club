/**
 * Campi base condivisi per query liste appuntamenti staff (calendario, tabella appuntamenti).
 * Estensioni per contesto: calendario + color, is_open_booking_day, created_by_role; tabella + updated_at.
 */
export const STAFF_APPOINTMENTS_CORE_SELECT =
  'id,org_id,athlete_id,staff_id,starts_at,ends_at,type,status,location,notes,cancelled_at,created_at'
