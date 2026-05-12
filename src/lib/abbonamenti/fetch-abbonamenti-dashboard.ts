import { createLogger } from '@/lib/logger'
import type { ServiceType } from '@/lib/abbonamenti-service-type'
import {
  lessonUsageByAthleteIds,
  type AthleteLessonUsageRow,
} from '@/lib/credits/athlete-training-lessons-display'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { Tables } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

const logger = createLogger('lib:abbonamenti:fetch-abbonamenti-dashboard')

export const ABBONAMENTI_PER_PAGE = 100

export interface AbbonamentoAthleteRow {
  athlete_id: string
  athlete_name: string
  total_purchased: number
  total_used: number
  total_remaining: number
}

export type KpiPaymentRow = {
  athlete_id: string
  amount: number
  payment_date: string
  status: string | null
}

export type FetchAbbonamentiDashboardResult = {
  abbonamenti: AbbonamentoAthleteRow[]
  kpiPayments: KpiPaymentRow[]
  totalCount: number
}

export type FetchAbbonamentiDashboardArgs = {
  supabase: SupabaseClient
  serviceType: ServiceType
  page: number
  enablePagination: boolean
  role: string | null
  profileId: string | null
}

export async function fetchAbbonamentiDashboard(
  args: FetchAbbonamentiDashboardArgs,
): Promise<FetchAbbonamentiDashboardResult> {
  type PaymentRow = Tables<'payments'> & {
    payment_date?: string | null
    invoice_url?: string | null
    status?: string | null
  }
  type ProfileRow = Tables<'profiles'>

  const { supabase: supabaseClient, serviceType: currentServiceType, page: currentPage, enablePagination, role, profileId } = args

  const isStaffOwnPayments =
    role === 'trainer' || role === 'nutrizionista' || role === 'massaggiatore'

  if (enablePagination && !isStaffOwnPayments) {
    try {
      const { data: rpcData, error: rpcError } = await (supabaseClient.rpc as (
        name: string,
        params: Record<string, unknown>,
      ) => ReturnType<SupabaseClient['rpc']>)('get_abbonamenti_with_stats', {
        p_page: currentPage,
        p_page_size: ABBONAMENTI_PER_PAGE,
        p_service_type: currentServiceType,
      })

      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const typedRpcData = rpcData as Array<{
          id: string
          athlete_id: string
          athlete_name: string | null
          payment_date: string
          lessons_purchased: number
          lessons_used: number
          lessons_remaining: number
          amount: number
          invoice_url: string | null
          status: string
          created_at: string
          total_count?: number
        }>

        const rpcAthleteIds = [...new Set(typedRpcData.map((r) => r.athlete_id).filter(Boolean))]
        const usageByAthlete = await lessonUsageByAthleteIds(
          supabaseClient,
          rpcAthleteIds,
          currentServiceType,
        )

        const purchasedByAthlete = new Map<string, { name: string; purchased: number }>()
        const paymentsForKpi: KpiPaymentRow[] = []
        for (const row of typedRpcData) {
          const aid = row.athlete_id
          const prev = purchasedByAthlete.get(aid) ?? {
            name: row.athlete_name || 'Sconosciuto',
            purchased: 0,
          }
          purchasedByAthlete.set(aid, {
            name: prev.name,
            purchased: prev.purchased + (Number(row.lessons_purchased) || 0),
          })
          paymentsForKpi.push({
            athlete_id: aid,
            amount: Number(row.amount) || 0,
            payment_date: row.payment_date || row.created_at || '',
            status: row.status || 'completed',
          })
        }

        const formatted: AbbonamentoAthleteRow[] = Array.from(purchasedByAthlete.entries()).map(
          ([aid, v]) => {
            const u = usageByAthlete.get(aid)
            return {
              athlete_id: aid,
              athlete_name: v.name,
              total_purchased: v.purchased,
              total_used: u?.totalUsed ?? 0,
              total_remaining: u?.totalRemaining ?? 0,
            }
          },
        )

        const total = typedRpcData[0]?.total_count ?? formatted.length
        return { abbonamenti: formatted, kpiPayments: paymentsForKpi, totalCount: total }
      }
    } catch (rpcErr) {
      logger.warn('RPC get_abbonamenti_with_stats failed, using fallback', rpcErr, {
        page: currentPage,
      })
    }
  }

  if (isStaffOwnPayments || role === 'athlete') {
    if (!profileId) {
      return { abbonamenti: [], kpiPayments: [], totalCount: 0 }
    }
  }

  let payments: PaymentRow[] = []

  let paymentsQuery = supabaseClient
    .from('payments')
    .select('id, athlete_id, amount, created_at, created_by_staff_id')
    .eq('service_type', currentServiceType)
    .or('is_reversal.eq.false,is_reversal.is.null')
    .or('status.neq.cancelled,status.is.null')
    .order('created_at', { ascending: false })

  if (isStaffOwnPayments) {
    paymentsQuery = paymentsQuery.eq('created_by_staff_id', profileId!)
  } else if (role === 'athlete') {
    paymentsQuery = paymentsQuery.eq('athlete_id', profileId!)
  }

  const { data: paymentsData, error: paymentsErr } = await paymentsQuery
  if (paymentsErr) {
    logger.error('Errore query payments base', paymentsErr)
    throw paymentsErr
  }

  payments = (paymentsData as unknown as PaymentRow[] | null) ?? []
  const athleteIds = [...new Set(payments.map((p) => p.athlete_id).filter(Boolean))]

  if (payments.length === 0) {
    return { abbonamenti: [], kpiPayments: [], totalCount: 0 }
  }

  type PaymentExtended = {
    id: string
    payment_date?: string | null
    status?: string | null
    invoice_url?: string | null
    lessons_purchased?: number | null
  }

  const paymentIds = payments.map((p) => p.id)
  const extendedMap = new Map<string, PaymentExtended>()
  let paymentsExtendedError: unknown = null
  for (const idChunk of chunkForSupabaseIn(paymentIds)) {
    const chunkRes = await supabaseClient
      .from('payments')
      .select('id, payment_date, status, invoice_url, lessons_purchased')
      .in('id', idChunk)
    if (chunkRes.error) {
      paymentsExtendedError = chunkRes.error
      logger.error('Errore query payments estesi (chunk)', chunkRes.error)
      break
    }
    for (const row of (chunkRes.data ?? []) as PaymentExtended[]) {
      extendedMap.set(row.id, row)
    }
  }

  const profilesMap = new Map<string, Pick<ProfileRow, 'id' | 'nome' | 'cognome'>>()
  let profilesResultError: unknown = null
  if (athleteIds.length > 0) {
    for (const idChunk of chunkForSupabaseIn(athleteIds)) {
      const chunkRes = await supabaseClient
        .from('profiles')
        .select('id, nome, cognome')
        .in('id', idChunk)
      if (chunkRes.error) {
        profilesResultError = chunkRes.error
        logger.error('Errore query profili atleti abbonamenti (chunk)', chunkRes.error)
        break
      }
      ;(chunkRes.data as ProfileRow[] | null)?.forEach((p) => {
        profilesMap.set(p.id, {
          id: p.id,
          nome: p.nome ?? '',
          cognome: p.cognome ?? '',
        })
      })
    }
  }
  if (profilesResultError) {
    profilesMap.clear()
  }

  const usageByAthlete =
    athleteIds.length > 0
      ? await lessonUsageByAthleteIds(supabaseClient, athleteIds, currentServiceType)
      : new Map<string, AthleteLessonUsageRow>()

  if (!paymentsExtendedError && extendedMap.size > 0) {
    payments = payments.map((p) => ({
      ...p,
      payment_date: extendedMap.get(p.id)?.payment_date ?? p.created_at ?? null,
      status: extendedMap.get(p.id)?.status ?? 'completed',
      invoice_url: extendedMap.get(p.id)?.invoice_url ?? null,
      lessons_purchased: extendedMap.get(p.id)?.lessons_purchased ?? 0,
    }))
  }

  const paymentsForKpi: KpiPaymentRow[] = payments.map((p) => ({
    athlete_id: String(p.athlete_id),
    amount: Number(p.amount) || 0,
    payment_date: String(p.payment_date ?? p.created_at ?? ''),
    status: p.status ?? 'completed',
  }))

  const purchasedAgg = new Map<string, number>()
  for (const p of payments) {
    const aid = String(p.athlete_id)
    purchasedAgg.set(aid, (purchasedAgg.get(aid) ?? 0) + (Number(p.lessons_purchased) || 0))
  }

  const formatted: AbbonamentoAthleteRow[] = Array.from(purchasedAgg.entries())
    .map(([aid, purchased]) => {
      const athlete = profilesMap.get(aid)
      const athleteName = athlete
        ? `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim() || 'Sconosciuto'
        : 'Sconosciuto'
      const u = usageByAthlete.get(aid)
      return {
        athlete_id: aid,
        athlete_name: athleteName,
        total_purchased: purchased,
        total_used: u?.totalUsed ?? 0,
        total_remaining: u?.totalRemaining ?? 0,
      }
    })
    .sort((a, b) => a.athlete_name.localeCompare(b.athlete_name, 'it'))

  return {
    abbonamenti: formatted,
    kpiPayments: paymentsForKpi,
    totalCount: formatted.length,
  }
}
