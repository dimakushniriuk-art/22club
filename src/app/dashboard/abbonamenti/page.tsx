'use client'

import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input } from '@/components/ui'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import {
  Plus,
  Euro,
  FileText,
  Upload as _Upload,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Package,
  CalendarCheck,
} from 'lucide-react'
import { buildTabularExportPdfBlob, type ExportData } from '@/lib/export-utils'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffLazyChunkFallback } from '@/components/layout/route-loading-skeletons'
import { useAuth } from '@/hooks/use-auth'
import {
  type ServiceType,
  SERVICE_TYPES,
  parseServiceFromUrl,
  defaultServiceForRole,
} from '@/lib/abbonamenti-service-type'
import {
  lessonUsageByAthleteIds,
  type AthleteLessonUsageRow,
} from '@/lib/credits/athlete-training-lessons-display'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('app:dashboard:abbonamenti:page')
const ABBONAMENTI_PER_PAGE = 100 // Soglia per attivare paginazione

// Lazy load modali per ridurre bundle size iniziale
const NuovoPagamentoModal = lazy(() =>
  import('@/components/dashboard/nuovo-pagamento-modal').then((mod) => ({
    default: mod.NuovoPagamentoModal,
  })),
)

interface AbbonamentoAthleteRow {
  athlete_id: string
  athlete_name: string
  total_purchased: number
  total_used: number
  total_remaining: number
}

type KpiPaymentRow = {
  athlete_id: string
  amount: number
  payment_date: string
  status: string | null
}

/** Chiave cache univoca: stessa per get/set/invalidate. Include service_type. */
function getCacheKey(
  serviceVal: ServiceType,
  page: number,
  enablePag: boolean,
  roleVal: string | null,
  uid: string | null,
): string {
  return `abbonamenti:${serviceVal}:${page}:${enablePag}:${roleVal || 'no-role'}:${uid || 'no-user'}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const _DEFAULT_DATE = new Date().toISOString().split('T')[0]

type AbbonamentiTheme = 'default' | 'teal' | 'amber'

const ABBONAMENTI_THEME = {
  default: {
    tabContainer: 'border-primary/20',
    tabActive: 'bg-primary text-white',
    inputBorder: 'border-primary/30 focus:border-primary/50',
    buttonOutline: 'border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50',
    buttonPrimary:
      'bg-gradient-to-r from-primary to-primary hover:from-primary-hover hover:to-primary-hover text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40',
    kpiAccent: 'text-primary',
    cardBorder: 'border-primary/30',
    tableBorder: 'border-primary/20',
    tableDivide: 'divide-primary/10',
    emptyIcon: 'bg-primary/20 text-primary',
    modalBorder: 'border-primary/30',
    modalHeader: 'border-primary/20',
    modalIcon: 'text-primary',
    modalButton: 'border-primary/30 hover:bg-primary/10',
    modalPrimary: 'bg-primary hover:bg-primary-hover text-primary-foreground',
    spinner: 'text-primary',
  },
  teal: {
    tabContainer: 'border-teal-500/20',
    tabActive: 'bg-teal-600 text-white',
    inputBorder: 'border-teal-500/30 focus:border-teal-500/50',
    buttonOutline: 'border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50',
    buttonPrimary:
      'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40',
    kpiAccent: 'text-teal-400',
    cardBorder: 'border-teal-500/30',
    tableBorder: 'border-teal-500/20',
    tableDivide: 'divide-teal-500/10',
    emptyIcon: 'bg-teal-500/20 text-teal-400',
    modalBorder: 'border-teal-500/30',
    modalHeader: 'border-teal-500/20',
    modalIcon: 'text-teal-400',
    modalButton: 'border-teal-500/30 hover:bg-teal-500/10',
    modalPrimary: 'bg-teal-600 hover:bg-teal-500 text-white',
    spinner: 'text-teal-400',
  },
  amber: {
    tabContainer: 'border-amber-500/20',
    tabActive: 'bg-amber-600 text-white',
    inputBorder: 'border-amber-500/30 focus:border-amber-500/50',
    buttonOutline: 'border-amber-500/30 text-white hover:bg-amber-500/10 hover:border-amber-500/50',
    buttonPrimary:
      'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40',
    kpiAccent: 'text-amber-400',
    cardBorder: 'border-amber-500/30',
    tableBorder: 'border-amber-500/20',
    tableDivide: 'divide-amber-500/10',
    emptyIcon: 'bg-amber-500/20 text-amber-400',
    modalBorder: 'border-amber-500/30',
    modalHeader: 'border-amber-500/20',
    modalIcon: 'text-amber-400',
    modalButton: 'border-amber-500/30 hover:bg-amber-500/10',
    modalPrimary: 'bg-amber-600 hover:bg-amber-500 text-white',
    spinner: 'text-amber-400',
  },
} as const

/** Primo e ultimo istante del mese corrente (UTC). */
function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function AbbonamentiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams
  const { user } = useAuth()
  const userId = user?.user_id || null
  const profileId = user?.id || null // profiles.id (per filtro trainer/athlete)
  const role = user?.role || null
  const { addToast } = useToast()
  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()
  const supabase = useSupabaseClient()
  const [abbonamenti, setAbbonamenti] = useState<AbbonamentoAthleteRow[]>([])
  const [kpiPayments, setKpiPayments] = useState<KpiPaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [enablePagination, setEnablePagination] = useState(false)

  // Filtri (solo ricerca atleta; KPI e tab servizio restano)
  const [searchTerm, setSearchTerm] = useState('')
  const [kpiDebitsInMonth, setKpiDebitsInMonth] = useState<number>(0)

  const urlServiceParam = searchParams.get('service')
  const urlService = parseServiceFromUrl(urlServiceParam)
  const defaultService = defaultServiceForRole(role)
  const currentServiceType: ServiceType = urlService ?? defaultService
  const abbonamentiTheme: AbbonamentiTheme =
    currentServiceType === 'massage'
      ? 'amber'
      : currentServiceType === 'nutrition'
        ? 'teal'
        : 'default'
  const t = ABBONAMENTI_THEME[abbonamentiTheme]

  // Se manca ?service=, applica default e sostituisci URL
  useEffect(() => {
    if (urlService !== null) return
    const params = new URLSearchParams(searchParamsRef.current.toString())
    params.set('service', defaultService)
    router.replace(`/dashboard/abbonamenti?${params.toString()}`, { scroll: false })
  }, [urlService, defaultService, router])

  const urlSearch = searchParams.get('search') ?? ''
  useEffect(() => {
    setSearchTerm(urlSearch)
  }, [urlSearch])

  const updateUrlFilters = useCallback(
    (updates: { search?: string; service?: ServiceType }) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      if (updates.service !== undefined) {
        if (updates.service) params.set('service', updates.service)
        else params.delete('service')
      }
      if (updates.search !== undefined) {
        if (updates.search.trim()) params.set('search', updates.search.trim())
        else params.delete('search')
      }
      const q = params.toString()
      router.replace(q ? `/dashboard/abbonamenti?${q}` : '/dashboard/abbonamenti', {
        scroll: false,
      })
    },
    [router],
  )

  // Al mount invalida cache abbonamenti così il primo caricamento va sempre a Supabase (evita righe fantasma dopo delete esterni)
  useEffect(() => {
    frequentQueryCache.invalidatePrefix('abbonamenti')
  }, [])

  // Prefetch modal nuovo pagamento
  useEffect(() => {
    import('@/components/dashboard/nuovo-pagamento-modal')
  }, [])

  // Abilita paginazione se ci sono più di 100 record
  useEffect(() => {
    if (totalCount > 100 && !enablePagination) {
      setEnablePagination(true)
    }
  }, [totalCount, enablePagination])

  const loadAbbonamenti = useCallback(async () => {
    type PaymentRow = Tables<'payments'> & {
      payment_date?: string | null
      invoice_url?: string | null
      status?: string | null
    }
    type ProfileRow = Tables<'profiles'>

    try {
      setLoading(true)
      setError(null)

      const supabaseClient = supabase

      // RPC solo per admin (vede tutti i pagamenti); trainer/nutrizionista/massaggiatore usano fallback filtrato per created_by_staff_id
      const isStaffOwnPayments =
        role === 'trainer' || role === 'nutrizionista' || role === 'massaggiatore'
      if (enablePagination && !isStaffOwnPayments) {
        try {
          // Workaround necessario per tipizzazione Supabase RPC
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: rpcData, error: rpcError } = await (supabaseClient.rpc as any)(
            'get_abbonamenti_with_stats',
            {
              p_page: currentPage,
              p_page_size: ABBONAMENTI_PER_PAGE,
              p_service_type: currentServiceType,
            },
          )

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

            // Usufruiti/Rimasti = stesso modello profilo atleta (max(ledger, contatore) e rimanenti = acquistate − usate)
            const rpcAthleteIds = [
              ...new Set(typedRpcData.map((r) => r.athlete_id).filter(Boolean)),
            ]
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

            setAbbonamenti(formatted)
            setKpiPayments(paymentsForKpi)
            setTotalCount(total)
            setLoading(false)
            return
          }
        } catch (rpcErr) {
          logger.warn('RPC get_abbonamenti_with_stats failed, using fallback', rpcErr, {
            page: currentPage,
          })
        }
      }

      // Fallback: query separate (compatibilità)
      // Staff (trainer, nutrizionista, massaggiatore) e athlete devono avere profileId per filtrare
      if (isStaffOwnPayments || role === 'athlete') {
        if (!profileId) {
          setAbbonamenti([])
          setTotalCount(0)
          setLoading(false)
          return
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

      // Estrai athleteIds PRIMA delle query parallele
      const athleteIds = [...new Set(payments.map((p) => p.athlete_id).filter(Boolean))]

      // Usufruiti/Rimasti: stesso modello del tab atleta (computeAthleteTrainingLessonUsage)
      if (payments.length > 0) {
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

        setAbbonamenti(formatted)
        setKpiPayments(paymentsForKpi)
        setTotalCount(formatted.length)
        return
      }

      // Se non ci sono payments, setta array vuoto
      setAbbonamenti([])
      setKpiPayments([])
      setTotalCount(0)
    } catch (err) {
      logger.error('Errore caricamento abbonamenti', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli abbonamenti')
    } finally {
      setLoading(false)
    }
  }, [currentPage, enablePagination, role, profileId, currentServiceType, supabase])

  const loadPage = useCallback(async (page: number) => {
    setCurrentPage(page)
    // loadAbbonamenti verrà chiamato automaticamente quando currentPage cambia
  }, [])

  useEffect(() => {
    void loadAbbonamenti()
  }, [loadAbbonamenti])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadAbbonamenti()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [loadAbbonamenti])

  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    updateUrlFilters({ search: '' })
  }, [updateUrlFilters])

  // In questa vista aggregata non facciamo azioni su singolo pagamento (storno/fattura):
  // la riga è per atleta; i dettagli si gestiscono nella pagina atleta.

  // Filtraggio abbonamenti - Combinato in unico filter per performance
  const filteredAbbonamenti = useMemo(() => {
    const search = searchTerm.trim() ? searchTerm.toLowerCase().trim() : null

    return abbonamenti.filter((abb) => {
      const matchesSearch = !search || abb.athlete_name.toLowerCase().includes(search)
      return matchesSearch
    })
  }, [abbonamenti, searchTerm])

  const { start: monthStart, end: monthEnd } = getCurrentMonthRange()
  const kpiFromFiltered = useMemo(() => {
    const inMonth = (d: string) => {
      const t = new Date(d).getTime()
      return t >= new Date(monthStart).getTime() && t <= new Date(monthEnd).getTime()
    }
    const visibleAthleteIds = new Set(filteredAbbonamenti.map((a) => a.athlete_id).filter(Boolean))
    const eligible = kpiPayments.filter((p) => {
      if (!visibleAthleteIds.has(p.athlete_id)) return false
      if (p.status === 'cancelled') return false
      if (!p.payment_date) return false
      return inMonth(p.payment_date)
    })
    const incassoMese = eligible.reduce((s, p) => s + (Number(p.amount) || 0), 0)
    const pacchettiMese = eligible.length
    const seen = new Set<string>()
    let creditiTotali = 0
    for (const abb of filteredAbbonamenti) {
      if (abb.athlete_id && !seen.has(abb.athlete_id)) {
        seen.add(abb.athlete_id)
        creditiTotali += abb.total_remaining
      }
    }
    return { incassoMese, pacchettiMese, creditiTotali }
  }, [filteredAbbonamenti, kpiPayments, monthStart, monthEnd])

  useEffect(() => {
    const ids = [
      ...new Set(filteredAbbonamenti.map((a) => a.athlete_id).filter(Boolean)),
    ] as string[]
    if (ids.length === 0) {
      setKpiDebitsInMonth(0)
      return
    }
    let cancelled = false
    ;(async () => {
      let total = 0
      for (const idChunk of chunkForSupabaseIn(ids)) {
        const { count, error } = await supabase
          .from('credit_ledger')
          .select('*', { count: 'exact', head: true })
          .in('athlete_id', idChunk)
          .eq('service_type', currentServiceType)
          .eq('entry_type', 'DEBIT')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd)
        if (error) break
        total += count ?? 0
      }
      if (!cancelled) setKpiDebitsInMonth(total)
    })()
    return () => {
      cancelled = true
    }
  }, [filteredAbbonamenti, currentServiceType, monthStart, monthEnd, supabase])

  const handleExportPdf = useCallback(async () => {
    if (filteredAbbonamenti.length === 0) return
    setPdfLoading(true)
    try {
      const rows: ExportData = filteredAbbonamenti.map((abb) => ({
        'ID atleta': abb.athlete_id,
        Atleta: abb.athlete_name,
        Servizio: currentServiceType,
        Acquistate: abb.total_purchased,
        Usate: abb.total_used,
        Residue: abb.total_remaining,
      }))
      const blob = await buildTabularExportPdfBlob('Abbonamenti', rows)
      openPdfWithBlob(
        blob,
        `abbonamenti_${currentServiceType}_${new Date().toISOString().split('T')[0]}.pdf`,
      )
    } catch (err) {
      logger.error('Export PDF abbonamenti', err)
      addToast({ title: 'Errore', message: 'Impossibile generare il PDF.', variant: 'error' })
    } finally {
      setPdfLoading(false)
    }
  }, [filteredAbbonamenti, currentServiceType, addToast, setPdfLoading, openPdfWithBlob])

  // Drilldown drawer rimosso: ora si usa la pagina dettaglio atleta.

  if (loading && abbonamenti.length === 0) {
    return null
  }

  return (
    <StaffContentLayout
      title="Abbonamenti"
      description="Abbonamenti, pacchetti e incassi degli atleti."
      theme="teal"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExportPdf()}
            disabled={filteredAbbonamenti.length === 0 || pdfLoading}
            aria-busy={pdfLoading}
            className="border-white/10 hover:border-primary/20"
          >
            <FileText className="mr-1.5 h-4 w-4" />
            Esporta PDF
          </Button>
          <Button onClick={() => setShowModal(true)} size="sm" variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Pagamento
          </Button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {error && (
          <Card variant="default" className="border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-red-200">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadAbbonamenti()}
                className="border-red-500/40 text-red-200 hover:bg-red-500/20 shrink-0"
              >
                Riprova
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tab servizio: Allenamenti | Nutrizione | Massaggi (nascosti al trainer) */}
        {role !== 'trainer' && (
          <div
            className={`flex gap-1 p-1 rounded-lg bg-background-tertiary/50 border w-fit ${t.tabContainer}`}
          >
            {SERVICE_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateUrlFilters({ service: value })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentServiceType === value
                    ? t.tabActive
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* KPI bar (service corrente) - nascosta al trainer */}
        {role !== 'trainer' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-background-secondary/80 p-3 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
                <Euro className="w-3.5 h-3.5" />
                Incasso mese
              </div>
              <p className={`text-lg font-bold ${t.kpiAccent}`}>
                {formatCurrency(kpiFromFiltered.incassoMese)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background-secondary/80 p-3 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
                <Package className="w-3.5 h-3.5" />
                Pacchetti venduti mese
              </div>
              <p className="text-lg font-bold text-text-primary">{kpiFromFiltered.pacchettiMese}</p>
            </div>
            <div className="rounded-xl border border-border bg-background-secondary/80 p-3 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
                <CreditCard className="w-3.5 h-3.5" />
                Crediti rimanenti totali
              </div>
              <p className="text-lg font-bold text-text-primary">{kpiFromFiltered.creditiTotali}</p>
            </div>
            <div className="rounded-xl border border-border bg-background-secondary/80 p-3 ring-1 ring-white/5">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
                <CalendarCheck className="w-3.5 h-3.5" />
                Sedute completate mese
              </div>
              <p className="text-lg font-bold text-text-primary">{kpiDebitsInMonth}</p>
            </div>
          </div>
        )}

        {/* Filtri */}
        <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Cerca per nome atleta..."
                value={searchTerm}
                onChange={(e) => {
                  const v = e.target.value
                  setSearchTerm(v)
                  updateUrlFilters({ search: v })
                }}
                leftIcon={<Search className="h-4 w-4" />}
                className="bg-white/[0.04] border-white/10 focus:border-primary"
              />
            </div>
            {searchTerm.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="border-white/10 hover:border-primary/20"
              >
                <X className="mr-2 h-4 w-4" />
                Rimuovi filtri
              </Button>
            )}

            {/* Contatore risultati */}
            <div className="text-text-secondary text-sm whitespace-nowrap">
              {filteredAbbonamenti.length}{' '}
              {filteredAbbonamenti.length === 1 ? 'abbonamento trovato' : 'abbonamenti trovati'}
              {filteredAbbonamenti.length !== abbonamenti.length &&
                ` di ${abbonamenti.length} totali`}
            </div>
          </div>
        </div>

        <div role="status" aria-live="polite" className="sr-only">
          {filteredAbbonamenti.length === 1
            ? '1 abbonamento trovato'
            : `${filteredAbbonamenti.length} abbonamenti trovati`}
        </div>

        {/* Tabella Abbonamenti (1 riga per atleta) */}
        <Card variant="default" className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Atleta
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Totale allenamenti
                    </th>
                    <th
                      className="px-4 py-3 text-center text-text-primary text-sm font-semibold"
                      title="Totale lezioni già usate dall’atleta (su tutti i pacchetti)"
                    >
                      Usufruiti
                    </th>
                    <th
                      className="px-4 py-3 text-center text-text-primary text-sm font-semibold"
                      title="Saldo totale atleta: lezioni ancora utilizzabili (stesso valore per ogni riga dello stesso atleta)"
                    >
                      Rimasti
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAbbonamenti.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className={`rounded-full p-6 animate-[pulse_2s_ease-in-out_infinite] ${t.emptyIcon}`}
                          >
                            {abbonamenti.length === 0 ? (
                              <Euro className="h-12 w-12" />
                            ) : (
                              <Filter className="h-12 w-12" />
                            )}
                          </div>
                          <h3 className="text-text-primary text-lg font-semibold">
                            {abbonamenti.length === 0
                              ? 'Nessun abbonamento registrato'
                              : 'Nessun abbonamento corrisponde ai filtri'}
                          </h3>
                          <p className="text-text-secondary text-sm mb-4">
                            {abbonamenti.length === 0
                              ? 'Inizia registrando il primo pagamento'
                              : 'Prova a modificare i filtri di ricerca'}
                          </p>
                          {abbonamenti.length === 0 ? (
                            <Button onClick={() => setShowModal(true)} className={t.buttonPrimary}>
                              <Plus className="mr-2 h-4 w-4" />
                              Crea primo abbonamento
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={handleResetFilters}
                              className={t.buttonOutline}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Rimuovi filtri
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAbbonamenti.map((abb) => (
                      <tr key={abb.athlete_id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="px-4 py-3 text-text-primary font-medium">
                          <button
                            type="button"
                            className="hover:underline underline-offset-4 text-left"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(
                                `/dashboard/pagamenti/atleta/${abb.athlete_id}?service=${currentServiceType}`,
                              )
                            }}
                          >
                            {abb.athlete_name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-text-primary font-semibold">
                          {abb.total_purchased}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-orange-400 font-medium">{abb.total_used}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1">
                            <span
                              className={`font-semibold ${
                                abb.total_remaining === 0
                                  ? 'text-red-400'
                                  : abb.total_remaining <= 3
                                    ? 'text-orange-400'
                                    : 'text-green-400'
                              }`}
                            >
                              {abb.total_remaining}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/pagamenti/atleta/${abb.athlete_id}?service=${currentServiceType}`,
                                )
                              }
                              className="border-white/10 hover:border-primary/20"
                            >
                              Vai al dettaglio
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Paginazione */}
        {enablePagination && Math.ceil(totalCount / ABBONAMENTI_PER_PAGE) > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-text-secondary text-sm">
              Mostrando {currentPage * ABBONAMENTI_PER_PAGE + 1} -{' '}
              {Math.min((currentPage + 1) * ABBONAMENTI_PER_PAGE, totalCount)} di {totalCount}{' '}
              abbonamenti
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className={t.buttonOutline}
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">
                  Pagina {currentPage + 1} di {Math.ceil(totalCount / ABBONAMENTI_PER_PAGE)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage + 1)}
                disabled={
                  currentPage >= Math.ceil(totalCount / ABBONAMENTI_PER_PAGE) - 1 || loading
                }
                className={t.buttonOutline}
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuovo Pagamento - Lazy loaded solo quando aperto */}
      {showModal && (
        <Suspense
          fallback={
            <StaffLazyChunkFallback
              className="min-h-[240px] max-w-md mx-auto"
              label="Caricamento modulo…"
            />
          }
        >
          <NuovoPagamentoModal
            open={showModal}
            onOpenChange={setShowModal}
            serviceType={currentServiceType}
            onSuccess={() => {
              // Invalida cache quando viene creato un nuovo pagamento
              frequentQueryCache.invalidate(
                getCacheKey(currentServiceType, currentPage, enablePagination, role, userId),
              )
              loadAbbonamenti()
            }}
          />
        </Suspense>
      )}

      {/* Preview fattura + drawer drilldown + storno rimossi in questa vista aggregata */}

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Abbonamenti"
      />
    </StaffContentLayout>
  )
}
