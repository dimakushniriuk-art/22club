export interface Payment {
  id: string
  athlete_id: string
  athlete_name?: string
  amount: number
  method_text: string
  payment_method?: string
  payment_date?: string | null
  lessons_purchased: number
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | null
  created_by_staff_id: string
  created_by_staff_name?: string
  created_at: string
  is_reversal: boolean | null
  ref_payment_id?: string | null
  notes?: string | null
}

export interface LessonCounter {
  athlete_id: string
  lessons_total: number
  lessons_used: number
  updated_at: string
}
