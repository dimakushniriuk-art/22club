/** Blocco calendario (ferie, chiusura, malattia). */
export interface CalendarBlock {
  id: string
  org_id: string
  staff_id: string | null
  starts_at: string
  ends_at: string
  reason: 'ferie' | 'chiusura' | 'malattia'
  created_at?: string
}
