'use client'

import { useQuery } from '@tanstack/react-query'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { queryKeys } from '@/lib/query-keys'
import { computeAthleteTrainingLessonUsage } from '@/lib/credits/athlete-training-lessons-display'

export interface AthletePaymentRow {
  id: string
  payment_date: string
  lessons_purchased: number
  lessons_used: number
  lessons_remaining: number
  amount: number
  invoice_url: string | null
}

type PaymentRow = {
  id: string
  payment_date: string | null
  amount: number | null
  invoice_url: string | null
  lessons_purchased: number | null
  status: string | null
  created_at?: string | null
}

async function fetchAthletePayments(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<AthletePaymentRow[]> {
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('id, payment_date, amount, invoice_url, lessons_purchased, status, created_at')
    .eq('athlete_id', profileId)
    .eq('status', 'completed')
    .eq('service_type', 'training')
    .order('payment_date', { ascending: false })

  if (paymentsError) throw paymentsError

  const paymentRows = (payments ?? []) as PaymentRow[]
  const totalPurchased = paymentRows.reduce(
    (sum, payment) => sum + (payment.lessons_purchased ?? 0),
    0,
  )

  const { totalUsed, totalRemaining } = await computeAthleteTrainingLessonUsage(
    supabase,
    profileId,
    totalPurchased,
  )

  return paymentRows.map((payment) => ({
    id: payment.id,
    payment_date: payment.payment_date ?? payment.created_at ?? new Date().toISOString(),
    lessons_purchased: payment.lessons_purchased ?? 0,
    lessons_used: totalUsed,
    lessons_remaining: totalRemaining,
    amount: payment.amount ?? 0,
    invoice_url: payment.invoice_url ?? null,
  }))
}

export function useAthletePayments(profileId: string | null, refreshKey = 0) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: [...queryKeys.payments.byAthlete(profileId ?? ''), refreshKey] as const,
    queryFn: () => fetchAthletePayments(supabase, profileId!),
    enabled: Boolean(profileId),
    staleTime: 3 * 60 * 1000,
  })
}
