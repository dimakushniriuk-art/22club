'use client'

import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, Button, Input, SimpleSelect, Drawer, DrawerContent, DrawerHeader, DrawerBody } from '@/components/ui'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { LoadingState } from '@/components/dashboard/loading-state'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import {
  Plus,
  Euro,
  FileText,
  Download,
  Eye,
  Upload as _Upload,
  Loader2,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Info,
  CreditCard,
  Package,
  CalendarCheck,
} from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useAuth } from '@/hooks/use-auth'
import { addReversalFromPayment } from '@/lib/credits/ledger'
import {
  type ServiceType,
  SERVICE_TYPES,
  parseServiceFromUrl,
  defaultServiceForRole,
} from '@/lib/abbonamenti-service-type'

const logger = createLogger('app:dashboard:abbonamenti:page')
const ABBONAMENTI_PER_PAGE = 100 // Soglia per attivare paginazione

// Lazy load modali per ridurre bundle size iniziale
const NuovoPagamentoModal = lazy(() =>
  import('@/components/dashboard/nuovo-pagamento-modal').then((mod) => ({
    default: mod.NuovoPagamentoModal,
  })),
)

// Componente per visualizzare la fattura con signed URL
// Estratto come componente separato per poter essere lazy loaded
function InvoiceViewModal({
  url,
  athlete,
  onClose,
  theme = 'default',
}: {
  url: string
  athlete: string
  onClose: () => void
  theme?: AbbonamentiTheme
}) {
  const m = ABBONAMENTI_THEME[theme]
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabaseClient()

  useEffect(() => {
    let cancelled = false
    const loadSignedUrl = async () => {
      try {
        setLoading(true)
        setError(null)

        const filePath = invoiceUrlToStoragePath(url)
        const { data, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(filePath, 3600)

        if (cancelled) return
        if (signedError) {
          logger.warn('Errore creazione signed URL', signedError, { url, filePath })
          setError(signedError.message || 'Impossibile caricare l’anteprima della fattura')
        } else if (data?.signedUrl) {
          setSignedUrl(data.signedUrl)
        } else {
          setError('URL della fattura non disponibile')
        }
      } catch (err) {
        if (cancelled) return
        logger.error('Errore caricamento signed URL', err, { url })
        setError(err instanceof Error ? err.message : 'Errore nel caricamento della fattura')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSignedUrl()
    return () => {
      cancelled = true
    }
  }, [url, supabase])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className={`relative w-full h-full max-w-4xl max-h-[90vh] m-4 bg-background-secondary rounded-lg border shadow-xl ${m.modalBorder}`}>
        <div className={`flex items-center justify-between p-4 border-b ${m.modalHeader}`}>
          <h3 className="text-text-primary text-lg font-semibold flex items-center gap-2">
            <FileText className={`h-5 w-5 ${m.modalIcon}`} />
            Fattura - {athlete}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className={m.modalButton}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className={`h-8 w-8 animate-spin ${m.spinner}`} />
            </div>
          ) : error && !signedUrl ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-red-400">{error}</p>
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
            </div>
          ) : signedUrl ? (
            <div className="flex flex-col h-full gap-3">
              <iframe
                src={signedUrl}
                title={`Fattura - ${athlete}`}
                className="w-full flex-1 min-h-0 rounded-lg border border-border bg-white"
              />
              <div className="flex justify-end shrink-0">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apri in nuova scheda
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

interface Abbonamento {
  id: string
  athlete_id: string
  athlete_name: string
  payment_date: string
  lessons_purchased: number
  lessons_used: number
  lessons_remaining: number
  amount: number
  invoice_url: string | null
  status: string
  created_by_staff_id?: string // Campo opzionale per filtri trainer/PT
  /** true se rimasti > (credited - used), saldo pre-ledger non tracciato */
  legacy_balance_hint?: boolean
}

/** Estrae il path storage da invoice_url (path o URL completo). */
function invoiceUrlToStoragePath(invoiceUrl: string): string {
  if (!invoiceUrl || typeof invoiceUrl !== 'string') return invoiceUrl
  const s = invoiceUrl.trim()
  if (!s.startsWith('http')) return s.startsWith('documents/') ? s.replace(/^documents\//, '') : s
  const match = s.match(/\/documents\/([^?]+)/)
  return match ? match[1] : s
}

/** Nome documento fattura per visualizzazione in tabella (filename da path o "Fattura DD/MM/YYYY"). */
function getInvoiceDocumentName(abb: { invoice_url: string | null; payment_date?: string }): string | null {
  if (!abb.invoice_url) return null
  const path = abb.invoice_url.trim()
  const segment = path.split('/').filter(Boolean).pop()
  if (segment) return segment
  return abb.payment_date ? `Fattura ${formatDate(abb.payment_date)}` : 'Fattura'
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const LESSONS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tutte le lezioni' },
  { value: 'low', label: 'Basse (≤3)' },
  { value: 'medium', label: 'Medie (4-10)' },
  { value: 'high', label: 'Alte (>10)' },
] as const

const AMOUNT_FILTER_OPTIONS = [
  { value: 'all', label: 'Tutti gli importi' },
  { value: 'low', label: 'Basso (<500€)' },
  { value: 'medium', label: 'Medio (500-1000€)' },
  { value: 'high', label: 'Alto (>1000€)' },
] as const

const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tutte le date' },
  { value: 'today', label: 'Oggi' },
  { value: 'week', label: 'Ultima settimana' },
  { value: 'month', label: 'Ultimo mese' },
  { value: 'year', label: 'Ultimo anno' },
] as const

const _DEFAULT_DATE = new Date().toISOString().split('T')[0]

type AbbonamentiTheme = 'default' | 'teal' | 'amber'

const ABBONAMENTI_THEME = {
  default: {
    tabContainer: 'border-primary/20',
    tabActive: 'bg-primary text-white',
    inputBorder: 'border-primary/30 focus:border-primary/50',
    buttonOutline: 'border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50',
    buttonPrimary: 'bg-gradient-to-r from-primary to-primary hover:from-primary-hover hover:to-primary-hover text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40',
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
    buttonPrimary: 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40',
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
    buttonPrimary: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40',
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

/** Skeleton tabella durante caricamento iniziale */
function AbbonamentiPageSkeleton() {
  return (
    <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-background-tertiary animate-pulse" />
          <div className="h-4 w-32 rounded bg-background-tertiary/80 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-background-tertiary animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-3 p-4">
        <div className="h-10 flex-1 min-w-[200px] rounded-lg bg-background-tertiary animate-pulse" />
        <div className="h-10 w-[160px] rounded-lg bg-background-tertiary animate-pulse" />
        <div className="h-10 w-[160px] rounded-lg bg-background-tertiary animate-pulse" />
        <div className="h-10 w-[160px] rounded-lg bg-background-tertiary animate-pulse" />
      </div>
      <Card variant="trainer" className="overflow-hidden border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-tertiary/50 border-b border-border">
                <tr>
                  {Array.from({ length: 8 }, (_, i) => (
                    <th key={`skeleton-th-${i}`} className="px-4 py-3">
                      <div className="h-4 w-16 rounded bg-background-tertiary animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 6 }, (_, i) => (
                  <tr key={`skeleton-row-${i}`}>
                    {Array.from({ length: 8 }, (_, j) => (
                      <td key={`skeleton-cell-${i}-${j}`} className="px-4 py-3">
                        <div
                          className="h-5 rounded bg-background-tertiary/80 animate-pulse"
                          style={{ width: j === 0 ? 120 : 60 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = useSupabaseClient()
  const [abbonamenti, setAbbonamenti] = useState<Abbonamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<{ url: string; athlete: string } | null>(
    null,
  )
  const [_uploadingInvoice, setUploadingInvoice] = useState<string | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [enablePagination, setEnablePagination] = useState(false)

  // Filtri (sync da URL al mount e quando cambia URL)
  const [searchTerm, setSearchTerm] = useState('')
  const [lessonsFilter, setLessonsFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [amountFilter, setAmountFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')
  const [invoiceOnly, setInvoiceOnly] = useState(false)
  const [kpiDebitsInMonth, setKpiDebitsInMonth] = useState<number>(0)
  const [drilldownRow, setDrilldownRow] = useState<Abbonamento | null>(null)
  const [ledgerHistory, setLedgerHistory] = useState<Array<{ entry_type: string; qty: number; created_at: string; reason?: string | null }>>([])
  const [drilldownLoading, setDrilldownLoading] = useState(false)

  const urlServiceParam = searchParams.get('service')
  const urlService = parseServiceFromUrl(urlServiceParam)
  const defaultService = defaultServiceForRole(role)
  const currentServiceType: ServiceType = urlService ?? defaultService
  const abbonamentiTheme: AbbonamentiTheme =
    currentServiceType === 'massage' ? 'amber' : currentServiceType === 'nutrition' ? 'teal' : 'default'
  const t = ABBONAMENTI_THEME[abbonamentiTheme]

  // Se manca ?service=, applica default e sostituisci URL
  useEffect(() => {
    if (urlService !== null) return
    const params = new URLSearchParams(searchParamsRef.current.toString())
    params.set('service', defaultService)
    router.replace(`/dashboard/abbonamenti?${params.toString()}`, { scroll: false })
  }, [urlService, defaultService, router])

  const urlSearch = searchParams.get('search') ?? ''
  const urlLessons = (searchParams.get('lessons') as 'all' | 'low' | 'medium' | 'high') || 'all'
  const urlAmount = (searchParams.get('amount') as 'all' | 'low' | 'medium' | 'high') || 'all'
  const urlDate = (searchParams.get('date') as 'all' | 'today' | 'week' | 'month' | 'year') || 'all'
  useEffect(() => {
    setSearchTerm(urlSearch)
    setLessonsFilter(urlLessons)
    setAmountFilter(urlAmount)
    setDateFilter(urlDate)
  }, [urlSearch, urlLessons, urlAmount, urlDate])

  const updateUrlFilters = useCallback(
    (updates: {
      search?: string
      lessons?: string
      amount?: string
      date?: string
      service?: ServiceType
    }) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      if (updates.service !== undefined) {
        if (updates.service) params.set('service', updates.service)
        else params.delete('service')
      }
      if (updates.search !== undefined) {
        if (updates.search.trim()) params.set('search', updates.search.trim())
        else params.delete('search')
      }
      if (updates.lessons !== undefined) {
        if (updates.lessons && updates.lessons !== 'all') params.set('lessons', updates.lessons)
        else params.delete('lessons')
      }
      if (updates.amount !== undefined) {
        if (updates.amount && updates.amount !== 'all') params.set('amount', updates.amount)
        else params.delete('amount')
      }
      if (updates.date !== undefined) {
        if (updates.date && updates.date !== 'all') params.set('date', updates.date)
        else params.delete('date')
      }
      const q = params.toString()
      router.replace(q ? `/dashboard/abbonamenti?${q}` : '/dashboard/abbonamenti', { scroll: false })
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

      // Controlla cache (stessa chiave per get/set/invalidate)
      const cacheKey = getCacheKey(currentServiceType, currentPage, enablePagination, role, userId)
      const cached = frequentQueryCache.get<{
        abbonamenti: Abbonamento[]
        totalCount: number
      }>(cacheKey)

      if (cached && !enablePagination) {
        // Se non usiamo paginazione e abbiamo cache, usa quella
        setAbbonamenti(cached.abbonamenti)
        setTotalCount(cached.totalCount)
        setLoading(false)
        return
      }

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

            // Usufruiti/Rimasti sempre da ledger+counter (ignora colonne RPC per coerenza)
            const rpcAthleteIds = [...new Set(typedRpcData.map((r) => r.athlete_id).filter(Boolean))]
            const [countersRes, ledgerDebitRes, ledgerCreditRes] = await Promise.all([
              rpcAthleteIds.length > 0
                ? supabaseClient
                    .from('lesson_counters')
                    .select('athlete_id, count')
                    .in('athlete_id', rpcAthleteIds)
                    .eq('lesson_type', currentServiceType)
                : Promise.resolve({ data: [], error: null }),
              rpcAthleteIds.length > 0
                ? supabaseClient
                    .from('credit_ledger')
                    .select('athlete_id, entry_type, qty')
                    .in('athlete_id', rpcAthleteIds)
                    .eq('entry_type', 'DEBIT')
                    .eq('service_type', currentServiceType)
                : Promise.resolve({ data: [], error: null }),
              rpcAthleteIds.length > 0
                ? supabaseClient
                    .from('credit_ledger')
                    .select('athlete_id, entry_type, qty')
                    .in('athlete_id', rpcAthleteIds)
                    .in('entry_type', ['CREDIT', 'REVERSAL'])
                    .eq('service_type', currentServiceType)
                : Promise.resolve({ data: [], error: null }),
            ])

            const remainingMap = new Map<string, number>()
            const usedMap = new Map<string, number>()
            const creditedMap = new Map<string, number>()
            if (countersRes.data) {
              ;(countersRes.data as { athlete_id: string; count: number | null }[]).forEach(
                (row) => remainingMap.set(row.athlete_id, row.count ?? 0),
              )
            }
            if (ledgerDebitRes.data) {
              ;(ledgerDebitRes.data as { athlete_id: string; qty: number }[]).forEach((row) => {
                usedMap.set(
                  row.athlete_id,
                  (usedMap.get(row.athlete_id) ?? 0) + Math.max(0, -row.qty),
                )
              })
            }
            if (ledgerCreditRes.data) {
              ;(ledgerCreditRes.data as { athlete_id: string; qty: number }[]).forEach((row) => {
                creditedMap.set(
                  row.athlete_id,
                  (creditedMap.get(row.athlete_id) ?? 0) + row.qty,
                )
              })
            }

            const formatted: Abbonamento[] = typedRpcData.map((row) => {
              const used = usedMap.get(row.athlete_id) ?? 0
              const credited = creditedMap.get(row.athlete_id) ?? 0
              const fromCounter = remainingMap.get(row.athlete_id)
              const lessonsRemaining =
                fromCounter !== undefined && fromCounter !== null
                  ? fromCounter
                  : Math.max(0, credited - used)
              return {
                id: row.id,
                athlete_id: row.athlete_id,
                athlete_name: row.athlete_name || 'Sconosciuto',
                payment_date: row.payment_date || row.created_at || '',
                lessons_purchased: row.lessons_purchased || 0,
                lessons_used: used,
                lessons_remaining: lessonsRemaining,
                amount: Number(row.amount) || 0,
                invoice_url: row.invoice_url || null,
                status: row.status || 'completed',
              }
            })

            const total = typedRpcData[0]?.total_count ?? formatted.length

            frequentQueryCache.set(cacheKey, { abbonamenti: formatted, totalCount: total })
            setAbbonamenti(formatted)
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

      // Usufruiti = credit_ledger DEBIT (-qty); Rimasti = lesson_counters.count (1 riga per atleta). No appointments, no payments-based clamp.
      if (payments.length > 0) {
        const [paymentsExtendedResult, profilesResult, countersResult, ledgerResult] =
          await Promise.all([
            supabaseClient
              .from('payments')
              .select('id, payment_date, status, invoice_url, lessons_purchased')
              .in('id', payments.map((p) => p.id)),
            athleteIds.length > 0
              ? supabaseClient.from('profiles').select('id, nome, cognome').in('id', athleteIds)
              : Promise.resolve({ data: [], error: null }),
            athleteIds.length > 0
              ? supabaseClient
                  .from('lesson_counters')
                  .select('athlete_id, count')
                  .in('athlete_id', athleteIds)
                  .eq('lesson_type', currentServiceType)
              : Promise.resolve({ data: [], error: null }),
            athleteIds.length > 0
              ? supabaseClient
                  .from('credit_ledger')
                  .select('athlete_id, entry_type, qty')
                  .in('athlete_id', athleteIds)
                  .eq('service_type', currentServiceType)
              : Promise.resolve({ data: [], error: null }),
          ])

        // Gestione risultati Query 1 (Payments Extended)
        if (!paymentsExtendedResult.error && paymentsExtendedResult.data) {
          type PaymentExtended = {
            id: string
            payment_date?: string | null
            status?: string | null
            invoice_url?: string | null
            lessons_purchased?: number | null
          }
          const extendedData = paymentsExtendedResult.data as PaymentExtended[]
          const extendedMap = new Map(extendedData.map((p) => [p.id, p]))
          payments = payments.map((p) => ({
            ...p,
            payment_date: extendedMap.get(p.id)?.payment_date ?? p.created_at ?? null,
            status: extendedMap.get(p.id)?.status ?? 'completed',
            invoice_url: extendedMap.get(p.id)?.invoice_url ?? null,
            lessons_purchased: extendedMap.get(p.id)?.lessons_purchased ?? 0,
          }))
        }

        // Profili atleti
        const profilesMap = new Map<string, Pick<ProfileRow, 'id' | 'nome' | 'cognome'>>()
        if (!profilesResult.error && profilesResult.data) {
          ;(profilesResult.data as ProfileRow[]).forEach((p) => {
            profilesMap.set(p.id, {
              id: p.id,
              nome: p.nome ?? '',
              cognome: p.cognome ?? '',
            })
          })
        }

        if (countersResult.error) {
          logger.warn('Errore caricamento counters', countersResult.error)
        }
        if (ledgerResult.error) {
          logger.warn('Errore caricamento credit_ledger', ledgerResult.error)
        }

        // Rimasti = lesson_counters.count (unica riga per atleta)
        // Chiave normalizzata a stringa per evitare mismatch UUID/string tra query e lookup
        const lessonsRemainingMap = new Map<string, number>()
        if (countersResult.data) {
          ;(countersResult.data as { athlete_id: string; count: number | null }[]).forEach(
            (row) => {
              lessonsRemainingMap.set(String(row.athlete_id), row.count ?? 0)
            },
          )
        }

        // usedMap = SUM(-qty) per entry_type='DEBIT'; creditedMap = SUM(qty) per CREDIT+REVERSAL
        const lessonsUsedMap = new Map<string, number>()
        const lessonsCreditedMap = new Map<string, number>()
        if (ledgerResult.data) {
          const rows = ledgerResult.data as { athlete_id: string; entry_type: string; qty: number }[]
          rows.forEach((row) => {
            const aid = String(row.athlete_id)
            if (row.entry_type === 'DEBIT') {
              lessonsUsedMap.set(aid, (lessonsUsedMap.get(aid) ?? 0) + Math.max(0, -row.qty))
            } else if (row.entry_type === 'CREDIT' || row.entry_type === 'REVERSAL') {
              lessonsCreditedMap.set(aid, (lessonsCreditedMap.get(aid) ?? 0) + row.qty)
            }
          })
        }

        const formatted: Abbonamento[] = payments.map((p) => {
          const athleteId = p.athlete_id
          const athleteIdKey = String(athleteId)
          const athlete = profilesMap.get(athleteId)
          const athleteName = athlete
            ? `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim() || 'Sconosciuto'
            : 'Sconosciuto'

          const lessonsUsed =
            lessonsUsedMap instanceof Map
              ? lessonsUsedMap.get(athleteIdKey) ?? 0
              : (lessonsUsedMap as Record<string, number>)[athleteIdKey] ?? 0
          const fromCounter =
            lessonsRemainingMap instanceof Map
              ? lessonsRemainingMap.get(athleteIdKey)
              : (lessonsRemainingMap as Record<string, number>)[athleteIdKey]
          const credited = lessonsCreditedMap.get(athleteIdKey) ?? 0
          const lessonsRemaining =
            fromCounter !== undefined && fromCounter !== null
              ? fromCounter
              : Math.max(0, credited - lessonsUsed)
          const legacy_balance_hint =
            lessonsRemaining > credited - lessonsUsed && (credited > 0 || lessonsUsed > 0)

          return {
            id: p.id,
            athlete_id: p.athlete_id,
            athlete_name: athleteName,
            payment_date: p.payment_date ?? p.created_at ?? '',
            lessons_purchased: p.lessons_purchased || 0,
            lessons_used: lessonsUsed,
            lessons_remaining: lessonsRemaining,
            amount: p.amount || 0,
            invoice_url: p.invoice_url || null,
            status: p.status || 'completed',
            created_by_staff_id: (p as { created_by_staff_id?: string }).created_by_staff_id,
            legacy_balance_hint: legacy_balance_hint || undefined,
          }
        })

        setAbbonamenti(formatted)
        setTotalCount(formatted.length)

        // Salva in cache anche il fallback
        frequentQueryCache.set(cacheKey, { abbonamenti: formatted, totalCount: formatted.length })
        return
      }

      // Se non ci sono payments, setta array vuoto
      setAbbonamenti([])
      setTotalCount(0)
      frequentQueryCache.set(cacheKey, { abbonamenti: [], totalCount: 0 })
    } catch (err) {
      logger.error('Errore caricamento abbonamenti', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli abbonamenti')
    } finally {
      setLoading(false)
    }
  }, [currentPage, enablePagination, role, userId, profileId, currentServiceType, supabase])

  const loadPage = useCallback(async (page: number) => {
    setCurrentPage(page)
    // loadAbbonamenti verrà chiamato automaticamente quando currentPage cambia
  }, [])

  useEffect(() => {
    void loadAbbonamenti()
  }, [loadAbbonamenti])

  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    setLessonsFilter('all')
    setAmountFilter('all')
    setDateFilter('all')
    setInvoiceOnly(false)
    updateUrlFilters({ search: '', lessons: 'all', amount: 'all', date: 'all' })
  }, [updateUrlFilters])

  const _handleInvoiceUpload = useCallback(
    async (paymentId: string, file: File) => {
    try {
      setUploadingInvoice(paymentId)

      const payment = abbonamenti.find((a) => a.id === paymentId)
      if (!payment) throw new Error('Pagamento non trovato')

      const fileExt = file.name.split('.').pop() || 'pdf'
      const storagePath = `fatture/${currentServiceType}/${payment.athlete_id}/${paymentId}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Salva solo il path in DB (signed URL generato on-demand in anteprima/download)
      const { error: updateError } = await supabase
        .from('payments')
        .update({ invoice_url: storagePath })
        .eq('id', paymentId)

      if (updateError) throw updateError

      addToast({
        title: 'Successo',
        message: 'Fattura caricata con successo',
        variant: 'success',
      })

      frequentQueryCache.invalidate(
        getCacheKey(currentServiceType, currentPage, enablePagination, role, userId),
      )
      loadAbbonamenti()
    } catch (err) {
      logger.error('Errore upload fattura', err, { paymentId })
      addToast({
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore nel caricamento della fattura',
        variant: 'error',
      })
    } finally {
      setUploadingInvoice(null)
    }
    },
    [
      abbonamenti,
      supabase,
      addToast,
      currentServiceType,
      currentPage,
      enablePagination,
      role,
      userId,
      loadAbbonamenti,
    ],
  )

  const handleDownloadInvoice = useCallback(
    async (invoiceUrl: string) => {
    try {
      const filePath = invoiceUrlToStoragePath(invoiceUrl)
      const { data, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600)

      if (signedError) {
        logger.error('Errore creazione signed URL per download', signedError, {
          invoiceUrl,
          filePath,
        })
        addToast({
          title: 'Errore',
          message: 'Impossibile scaricare la fattura. Riprova più tardi.',
          variant: 'error',
        })
        return
      }

      window.open(data.signedUrl, '_blank')
    } catch (err) {
      logger.error('Errore download fattura', err, { invoiceUrl })
      addToast({
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore nel download della fattura',
        variant: 'error',
      })
    }
    },
    [supabase, addToast],
  )

  const handleStornoPayment = useCallback((paymentId: string) => {
    setPaymentToDelete(paymentId)
    setDeleteDialogOpen(true)
  }, [])

  const handleStornoConfirm = useCallback(async () => {
    if (!paymentToDelete) return

    const payment = abbonamenti.find((a) => a.id === paymentToDelete)
    if (!payment) {
      setDeleteDialogOpen(false)
      setPaymentToDelete(null)
      return
    }

    if (payment.status === 'cancelled') {
      addToast({
        title: 'Info',
        message: 'Pagamento già stornato.',
        variant: 'info',
      })
      setDeleteDialogOpen(false)
      setPaymentToDelete(null)
      return
    }

    setIsDeleting(true)
    setDeletingPayment(paymentToDelete)
    try {
      // Profilo staff corrente (created_by)
      let staffProfileId: string | null = null
      if (userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()
        staffProfileId = profile?.id ?? null
      }

      const { data: updatedRows, error: updateError } = await supabase
        .from('payments')
        .update({ status: 'cancelled' })
        .eq('id', paymentToDelete)
        .select('id')

      if (updateError) {
        const err: unknown = updateError
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: unknown }).message)
            : err instanceof Error
              ? err.message
              : String(err)
        const code =
          err && typeof err === 'object' && 'code' in err
            ? (err as { code?: string }).code
            : undefined
        logger.error('Errore aggiornamento status pagamento', updateError, {
          paymentId: paymentToDelete,
          message: msg,
          code,
        })
        throw err instanceof Error ? err : new Error(msg || 'Aggiornamento status fallito')
      }

      if (!updatedRows?.length) {
        addToast({
          title: 'Pagamento non trovato',
          message: 'Il pagamento potrebbe essere già stato eliminato. Lista aggiornata.',
          variant: 'info',
        })
        frequentQueryCache.invalidate(
          getCacheKey(currentServiceType, currentPage, enablePagination, role, userId),
        )
        await loadAbbonamenti()
        setDeleteDialogOpen(false)
        setPaymentToDelete(null)
        return
      }

      await addReversalFromPayment(
        {
          id: paymentToDelete,
          athlete_id: payment.athlete_id,
          lessons_purchased: payment.lessons_purchased || 0,
          serviceType: currentServiceType,
        },
        staffProfileId,
      )

      logger.info('Pagamento stornato con successo', { paymentId: paymentToDelete })

      addToast({
        title: 'Successo',
        message: 'Pagamento stornato con successo',
        variant: 'success',
      })

      frequentQueryCache.invalidate(
        getCacheKey(currentServiceType, currentPage, enablePagination, role, userId),
      )
      loadAbbonamenti()
      setDeleteDialogOpen(false)
      setPaymentToDelete(null)
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: unknown }).message)
          : err instanceof Error
            ? err.message
            : String(err)
      logger.error('Errore storno pagamento', err, {
        paymentId: paymentToDelete,
        message: msg,
      })
      addToast({
        title: 'Errore',
        message: msg || 'Errore durante lo storno del pagamento. Riprova più tardi.',
        variant: 'error',
      })
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
      setDeletingPayment(null)
      setPaymentToDelete(null)
    }
  }, [
    paymentToDelete,
    abbonamenti,
    supabase,
    addToast,
    currentServiceType,
    currentPage,
    enablePagination,
    role,
    userId,
    loadAbbonamenti,
  ])

  // Filtraggio abbonamenti - Combinato in unico filter per performance
  const filteredAbbonamenti = useMemo(() => {
    const search = searchTerm.trim() ? searchTerm.toLowerCase().trim() : null

    return abbonamenti.filter((abb) => {
      const matchesSearch = !search || abb.athlete_name.toLowerCase().includes(search)
      if (invoiceOnly && !abb.invoice_url) return false

      let matchesLessons = true
      if (lessonsFilter !== 'all') {
        switch (lessonsFilter) {
          case 'low':
            matchesLessons = abb.lessons_remaining <= 3
            break
          case 'medium':
            matchesLessons = abb.lessons_remaining > 3 && abb.lessons_remaining <= 10
            break
          case 'high':
            matchesLessons = abb.lessons_remaining > 10
            break
          default:
            matchesLessons = true
        }
      }

      let matchesAmount = true
      if (amountFilter !== 'all') {
        switch (amountFilter) {
          case 'low':
            matchesAmount = abb.amount < 500
            break
          case 'medium':
            matchesAmount = abb.amount >= 500 && abb.amount < 1000
            break
          case 'high':
            matchesAmount = abb.amount >= 1000
            break
          default:
            matchesAmount = true
        }
      }

      let matchesDate = true
      if (dateFilter !== 'all') {
        const now = new Date()
        const paymentDate = new Date(abb.payment_date)
        switch (dateFilter) {
          case 'today':
            matchesDate = paymentDate.toDateString() === now.toDateString()
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = paymentDate >= weekAgo
            break
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = paymentDate >= monthAgo
            break
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            matchesDate = paymentDate >= yearAgo
            break
          default:
            matchesDate = true
        }
      }

      return matchesSearch && matchesLessons && matchesAmount && matchesDate
    })
  }, [abbonamenti, searchTerm, lessonsFilter, amountFilter, dateFilter, invoiceOnly])

  const { start: monthStart, end: monthEnd } = getCurrentMonthRange()
  const kpiFromFiltered = useMemo(() => {
    const inMonth = (d: string) => {
      const t = new Date(d).getTime()
      return t >= new Date(monthStart).getTime() && t <= new Date(monthEnd).getTime()
    }
    const inMonthList = filteredAbbonamenti.filter((abb) => abb.status !== 'cancelled' && inMonth(abb.payment_date))
    const incassoMese = inMonthList.reduce((s, abb) => s + abb.amount, 0)
    const pacchettiMese = inMonthList.length
    const seen = new Set<string>()
    let creditiTotali = 0
    for (const abb of filteredAbbonamenti) {
      if (abb.athlete_id && !seen.has(abb.athlete_id)) {
        seen.add(abb.athlete_id)
        creditiTotali += abb.lessons_remaining
      }
    }
    return { incassoMese, pacchettiMese, creditiTotali }
  }, [filteredAbbonamenti, monthStart, monthEnd])

  useEffect(() => {
    const ids = [...new Set(filteredAbbonamenti.map((a) => a.athlete_id).filter(Boolean))] as string[]
    if (ids.length === 0) {
      setKpiDebitsInMonth(0)
      return
    }
    let cancelled = false
    supabase
      .from('credit_ledger')
      .select('*', { count: 'exact', head: true })
      .in('athlete_id', ids.slice(0, 500))
      .eq('service_type', currentServiceType)
      .eq('entry_type', 'DEBIT')
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd)
      .then(({ count }) => {
        if (!cancelled) setKpiDebitsInMonth(count ?? 0)
      })
    return () => {
      cancelled = true
    }
  }, [filteredAbbonamenti, currentServiceType, monthStart, monthEnd, supabase])

  const handleExportCSV = useCallback(() => {
    const rows = filteredAbbonamenti.map((abb) => ({
      payment_id: abb.id,
      athlete_id: abb.athlete_id,
      athlete_name: abb.athlete_name,
      payment_date: abb.payment_date,
      service_type: currentServiceType,
      lessons_purchased: abb.lessons_purchased,
      amount: abb.amount,
      invoice_present: !!abb.invoice_url,
      status: abb.status ?? '',
      lessons_used: abb.lessons_used,
      lessons_remaining: abb.lessons_remaining,
    }))
    const filename = `abbonamenti_${currentServiceType}_${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(rows, filename)
    addToast({ title: 'Export', message: `Esportate ${rows.length} righe`, variant: 'success' })
  }, [filteredAbbonamenti, currentServiceType, addToast])

  const loadDrilldownLedger = useCallback(async () => {
    if (!drilldownRow?.athlete_id) return
    setDrilldownLoading(true)
    setLedgerHistory([])
    try {
      const { data } = await supabase
        .from('credit_ledger')
        .select('entry_type, qty, created_at, reason')
        .eq('athlete_id', drilldownRow.athlete_id)
        .eq('service_type', currentServiceType)
        .order('created_at', { ascending: false })
        .limit(20)
      setLedgerHistory((data ?? []) as Array<{ entry_type: string; qty: number; created_at: string; reason?: string | null }>)
    } finally {
      setDrilldownLoading(false)
    }
  }, [drilldownRow?.athlete_id, currentServiceType, supabase])

  useEffect(() => {
    if (drilldownRow?.athlete_id) void loadDrilldownLedger()
    else setLedgerHistory([])
  }, [drilldownRow?.athlete_id, loadDrilldownLedger])

  // Primo caricamento: skeleton invece di messaggio generico
  if (loading && abbonamenti.length === 0) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <AbbonamentiPageSkeleton />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Abbonamenti"
      description="Gestione abbonamenti e pagamenti atleti"
      theme="teal"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredAbbonamenti.length === 0}
            className="border-white/10 hover:border-primary/20"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Esporta CSV
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
          <div className={`flex gap-1 p-1 rounded-lg bg-background-tertiary/50 border w-fit ${t.tabContainer}`}>
            {SERVICE_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateUrlFilters({ service: value })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentServiceType === value ? t.tabActive : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'
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
                  updateUrlFilters({
                    search: v,
                    lessons: lessonsFilter,
                    amount: amountFilter,
                    date: dateFilter,
                  })
                }}
                leftIcon={<Search className="h-4 w-4" />}
                className="bg-white/[0.04] border-white/10 focus:border-primary"
              />
            </div>

            {/* Filtri avanzati */}
            <div className="w-full sm:w-auto min-w-[160px]">
              <SimpleSelect
                value={lessonsFilter}
                onValueChange={(value) => {
                  const v = value as 'all' | 'low' | 'medium' | 'high'
                  setLessonsFilter(v)
                  updateUrlFilters({
                    search: searchTerm,
                    lessons: v,
                    amount: amountFilter,
                    date: dateFilter,
                  })
                }}
                placeholder="Lezioni rimanenti"
                options={LESSONS_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-auto min-w-[160px]">
              <SimpleSelect
                value={amountFilter}
                onValueChange={(value) => {
                  const v = value as 'all' | 'low' | 'medium' | 'high'
                  setAmountFilter(v)
                  updateUrlFilters({
                    search: searchTerm,
                    lessons: lessonsFilter,
                    amount: v,
                    date: dateFilter,
                  })
                }}
                placeholder="Importo"
                options={AMOUNT_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-auto min-w-[160px]">
              <SimpleSelect
                value={dateFilter}
                onValueChange={(value) => {
                  const v = value as 'all' | 'today' | 'week' | 'month' | 'year'
                  setDateFilter(v)
                  updateUrlFilters({
                    search: searchTerm,
                    lessons: lessonsFilter,
                    amount: amountFilter,
                    date: v,
                  })
                }}
                placeholder="Periodo"
                options={DATE_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                className="w-full"
              />
            </div>

            <label className="flex items-center gap-2 text-text-secondary text-sm cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={invoiceOnly}
                onChange={(e) => setInvoiceOnly(e.target.checked)}
                className="rounded border-border bg-background-secondary"
              />
              Solo con fattura
            </label>

            {(searchTerm ||
              lessonsFilter !== 'all' ||
              amountFilter !== 'all' ||
              dateFilter !== 'all' ||
              invoiceOnly) && (
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

        {/* Tabella Abbonamenti */}
        <Card variant="default" className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Atleta
                    </th>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Data
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Allenamenti
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
                      Fattura
                    </th>
                    <th className="px-4 py-3 text-right text-text-primary text-sm font-semibold">
                      Pagato
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAbbonamenti.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center gap-3">
                          <div className={`rounded-full p-6 animate-[pulse_2s_ease-in-out_infinite] ${t.emptyIcon}`}>
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
                            <Button
                              onClick={() => setShowModal(true)}
                              className={t.buttonPrimary}
                            >
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
                      <tr
                        key={abb.id}
                        className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                        onClick={() => setDrilldownRow(abb)}
                      >
                        <td className="px-4 py-3 text-text-primary font-medium">
                          {abb.athlete_name}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {formatDate(abb.payment_date)}
                        </td>
                        <td className="px-4 py-3 text-center text-text-primary font-semibold">
                          {abb.lessons_purchased}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-orange-400 font-medium">{abb.lessons_used}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1">
                            <span
                              className={`font-semibold ${
                                abb.lessons_remaining === 0
                                  ? 'text-red-400'
                                  : abb.lessons_remaining <= 3
                                    ? 'text-orange-400'
                                    : 'text-green-400'
                              }`}
                            >
                              {abb.lessons_remaining}
                            </span>
                            {abb.legacy_balance_hint && (
                              <span title="Saldo storico non tracciato">
                                <Info
                                  className="h-3.5 w-3.5 text-text-tertiary shrink-0"
                                  aria-label="Saldo storico non tracciato"
                                />
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-text-primary text-sm">
                          {getInvoiceDocumentName(abb) ?? (
                            <span className="text-text-tertiary">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-text-primary font-semibold">
                          {formatCurrency(abb.amount)}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {/* Pulsante Visualizza/Scarica Fattura */}
                            {abb.invoice_url ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedInvoice({
                                      url: abb.invoice_url!,
                                      athlete: abb.athlete_name,
                                    })
                                  }
                                  className="border-white/10 hover:border-primary/20"
                                  title="Visualizza fattura"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadInvoice(abb.invoice_url!)}
                                  className="border-white/10 hover:border-primary/20"
                                  title="Scarica fattura"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <span className="text-text-secondary text-xs">Nessuna fattura</span>
                            )}
                            {/* Pulsante Storna Pagamento */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStornoPayment(abb.id)}
                              disabled={deletingPayment === abb.id || abb.status === 'cancelled'}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                              title="Storna pagamento"
                            >
                              {deletingPayment === abb.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
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
        <Suspense fallback={<LoadingState message="Caricamento form pagamento..." />}>
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

      {/* Modal Preview Fattura - Lazy loaded solo quando aperto */}
      {selectedInvoice && (
        <Suspense fallback={<LoadingState message="Caricamento fattura..." />}>
          <InvoiceViewModal
            url={selectedInvoice.url}
            athlete={selectedInvoice.athlete}
            onClose={() => setSelectedInvoice(null)}
            theme={abbonamentiTheme}
          />
        </Suspense>
      )}

      {/* Drawer drilldown atleta: storico movimenti + contatore */}
      <Drawer open={!!drilldownRow} onOpenChange={(open) => !open && setDrilldownRow(null)} side="right" size="md">
        <DrawerContent showCloseButton onClose={() => setDrilldownRow(null)}>
          {drilldownRow && (
            <>
              <DrawerHeader
                title={`Storico ${drilldownRow.athlete_name}`}
                description={`Service: ${currentServiceType}`}
              />
              <DrawerBody className="space-y-4">
                <div className="rounded-lg border border-border bg-background-tertiary/30 p-3">
                  <p className="text-text-secondary text-sm mb-1">Contatore attuale</p>
                  <p className="text-xl font-bold text-text-primary">{drilldownRow.lessons_remaining}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-2">Storico movimenti (ultimi 20)</p>
                  {drilldownLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className={`h-6 w-6 animate-spin ${t.spinner}`} />
                    </div>
                  ) : ledgerHistory.length === 0 ? (
                    <p className="text-text-muted text-sm">Nessun movimento</p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-background-tertiary/50 border-b border-border">
                          <tr>
                            <th className="px-3 py-2 text-left text-text-secondary font-medium">Tipo</th>
                            <th className="px-3 py-2 text-right text-text-secondary font-medium">Qty</th>
                            <th className="px-3 py-2 text-left text-text-secondary font-medium">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ledgerHistory.map((row, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="px-3 py-2 text-text-primary">{row.entry_type}</td>
                              <td className="px-3 py-2 text-right text-text-primary">{row.qty}</td>
                              <td className="px-3 py-2 text-text-muted">
                                {formatDate(row.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Dialog conferma storno pagamento */}
      {paymentToDelete && (() => {
        const paymentForDialog = abbonamenti.find((a) => a.id === paymentToDelete)
        const credits = paymentForDialog?.lessons_purchased ?? 0
        return (
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setPaymentToDelete(null)
            }}
            title="Storna pagamento"
            description={`Vuoi stornare questo pagamento? Verranno rimossi ${credits} crediti.`}
            confirmText="Storna"
            cancelText="Annulla"
            variant="destructive"
            onConfirm={handleStornoConfirm}
            loading={isDeleting}
          />
        )
      })()}
    </StaffContentLayout>
  )
}
