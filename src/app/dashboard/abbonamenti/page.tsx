'use client'

import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { Card, CardContent, Input, SimpleSelect } from '@/components/ui'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import {
  Plus,
  Euro,
  FileText,
  Download,
  Eye,
  Upload,
  Loader2,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { useAuth } from '@/hooks/use-auth'

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
}: {
  url: string
  athlete: string
  onClose: () => void
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const loadSignedUrl = async () => {
      try {
        setLoading(true)
        setError(null)

        // Se l'URL è già un signed URL valido, usalo direttamente
        if (url.includes('/storage/v1/object/sign/')) {
          setSignedUrl(url)
          setLoading(false)
          return
        }

        // Estrai il path del file dall'URL
        let filePath = url

        // Caso 1: URL pubblico completo
        // https://xxx.supabase.co/storage/v1/object/public/documents/fatture/xxx/xxx.pdf
        if (url.includes('/storage/v1/object/public/documents/')) {
          const match = url.match(/\/documents\/(.+)$/)
          if (match) {
            filePath = match[1]
          }
        }
        // Caso 2: Path relativo che inizia con "documents/"
        // documents/fatture/xxx/xxx.pdf
        else if (url.startsWith('documents/')) {
          filePath = url.replace('documents/', '')
        }
        // Caso 3: Path relativo diretto
        // fatture/xxx/xxx.pdf
        else if (!url.startsWith('http')) {
          filePath = url
        }

        // Genera un signed URL valido per 1 ora
        // Usa supabaseRef.current invece di supabase per evitare dipendenza instabile
        const { data, error: signedError } = await supabaseRef.current.storage
          .from('documents')
          .createSignedUrl(filePath, 3600)

        if (signedError) {
          logger.warn('Errore creazione signed URL', signedError, { url, filePath })
          // Se fallisce, prova a usare l'URL originale come fallback
          setSignedUrl(url)
        } else {
          setSignedUrl(data.signedUrl)
        }
      } catch (err) {
        logger.error('Errore caricamento signed URL', err, { url })
        setError(err instanceof Error ? err.message : 'Errore nel caricamento della fattura')
        // Fallback: usa l'URL originale
        setSignedUrl(url)
      } finally {
        setLoading(false)
      }
    }

    loadSignedUrl()
  }, [url])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4 bg-background-secondary rounded-lg border border-teal-500/30 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-teal-500/20">
          <h3 className="text-text-primary text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-400" />
            Fattura - {athlete}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-teal-500/30 text-white hover:bg-teal-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            </div>
          ) : error && !signedUrl ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-red-400">{error}</p>
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
            </div>
          ) : signedUrl ? (
            <iframe
              src={signedUrl}
              className="w-full h-full rounded border border-teal-500/20"
              title="Fattura PDF"
            />
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
}

export default function AbbonamentiPage() {
  const { user } = useAuth()
  const userId = user?.user_id || null
  const role = user?.role || null
  const { addToast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()
  const [abbonamenti, setAbbonamenti] = useState<Abbonamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<{ url: string; athlete: string } | null>(
    null,
  )
  const [uploadingInvoice, setUploadingInvoice] = useState<string | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [enablePagination, setEnablePagination] = useState(false)

  // Filtri
  const [searchTerm, setSearchTerm] = useState('')
  const [lessonsFilter, setLessonsFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [amountFilter, setAmountFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')

  // Abilita paginazione se ci sono più di 100 record
  useEffect(() => {
    if (totalCount > 100 && !enablePagination) {
      setEnablePagination(true)
    }
  }, [totalCount, enablePagination])

  // Usa useRef per supabase per evitare re-creazione di loadAbbonamenti
  const supabaseRef = useRef(supabase)
  useEffect(() => {
    supabaseRef.current = supabase
  }, [supabase])

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

      // Usa supabaseRef.current invece di supabase per evitare dipendenza instabile
      const supabaseClient = supabaseRef.current

      // Controlla cache
      const cacheKey = `abbonamenti:${currentPage}:${enablePagination}:${role || 'no-role'}:${
        userId || 'no-user'
      }`
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

      // Prova prima con RPC (ottimizzata)
      if (enablePagination && role !== 'trainer' && role !== 'pt') {
        try {
          // Workaround necessario per tipizzazione Supabase RPC
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: rpcData, error: rpcError } = await (supabaseClient.rpc as any)(
            'get_abbonamenti_with_stats',
            {
              p_page: currentPage,
              p_page_size: ABBONAMENTI_PER_PAGE,
            },
          )

          if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
            // Type assertion necessario per dati RPC
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
            const formatted: Abbonamento[] = typedRpcData.map(
              (row: {
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
              }) => ({
                id: row.id,
                athlete_id: row.athlete_id,
                athlete_name: row.athlete_name || 'Sconosciuto',
                payment_date: row.payment_date || row.created_at || '',
                lessons_purchased: row.lessons_purchased || 0,
                lessons_used: row.lessons_used || 0,
                lessons_remaining: row.lessons_remaining || 0,
                amount: Number(row.amount) || 0,
                invoice_url: row.invoice_url || null,
                status: row.status || 'completed',
              }),
            )

            const total = typedRpcData[0]?.total_count || formatted.length

            // Salva in cache
            frequentQueryCache.set(cacheKey, { abbonamenti: formatted, totalCount: total })

            // Per trainer/PT filtriamo lato client se il RPC non filtra
            const filteredForRole =
              role === 'trainer' || role === 'pt'
                ? formatted.filter((ab) => ab.created_by_staff_id === userId)
                : formatted

            setAbbonamenti(filteredForRole)
            setTotalCount(role === 'trainer' || role === 'pt' ? filteredForRole.length : total)
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
      // Carica pagamenti - usa solo colonne base che esistono sempre
      let payments: PaymentRow[] = []

      // Query base con solo colonne che esistono sicuramente
      if (!userId) {
        setAbbonamenti([])
        setTotalCount(0)
        setLoading(false)
        return
      }

      let paymentsQuery = supabaseClient
        .from('payments')
        .select('id, athlete_id, amount, created_at, created_by_staff_id')
        .order('created_at', { ascending: false })

      if (role === 'trainer' || role === 'pt') {
        paymentsQuery = paymentsQuery.eq('created_by_staff_id', userId)
      } else if (role === 'atleta') {
        paymentsQuery = paymentsQuery.eq('athlete_id', userId)
      }

      const { data: paymentsData, error: paymentsErr } = await paymentsQuery

      if (paymentsErr) {
        logger.error('Errore query payments base', paymentsErr)
        throw paymentsErr
      }

      payments = (paymentsData as unknown as PaymentRow[] | null) ?? []

      // Estrai athleteIds PRIMA delle query parallele
      const athleteIds = [...new Set(payments.map((p) => p.athlete_id).filter(Boolean))]

      // Prova a caricare colonne opzionali, profili e appuntamenti IN PARALLELO
      if (payments.length > 0) {
        // Query parallele per colonne opzionali, profili, appuntamenti e counters
        const [
          paymentsExtendedResult,
          profilesResult,
          appointmentsResult,
          countersResult,
        ] = await Promise.allSettled([
          // Query 1: Colonne opzionali payments (se esistono)
          supabaseClient
            .from('payments')
            .select('id, payment_date, status, invoice_url, lessons_purchased')
            .in('id', payments.map((p) => p.id)),
          // Query 2: Profili atleti
          athleteIds.length > 0
            ? supabaseClient
                .from('profiles')
                .select('id, nome, cognome')
                .in('id', athleteIds)
            : Promise.resolve({ data: [], error: null }),
          // Query 3: Appuntamenti completati
          athleteIds.length > 0
            ? supabaseClient
                .from('appointments')
                .select('athlete_id')
                .in('athlete_id', athleteIds)
                .eq('status', 'completato')
            : Promise.resolve({ data: [], error: null }),
          // Query 4: Lesson counters (non critico, può fallire)
          athleteIds.length > 0
            ? supabaseClient
                .from('lesson_counters')
                .select('athlete_id, count')
                .in('athlete_id', athleteIds)
            : Promise.resolve({ data: [], error: null }),
        ])

        // Merge dati estesi payments se disponibili
        if (
          paymentsExtendedResult.status === 'fulfilled' &&
          !paymentsExtendedResult.value.error &&
          paymentsExtendedResult.value.data
        ) {
          const paymentsExtended = paymentsExtendedResult.value.data
          const extendedMap = new Map(
            paymentsExtended.map(
              (p: {
                id: string
                payment_date?: string
                status?: string
                invoice_url?: string
                lessons_purchased?: number
              }) => [p.id, p],
            ),
          )
          payments = payments.map((p) => ({
            ...p,
            payment_date: extendedMap.get(p.id)?.payment_date ?? p.created_at ?? null,
            status: extendedMap.get(p.id)?.status ?? 'completed',
            invoice_url: extendedMap.get(p.id)?.invoice_url ?? null,
            lessons_purchased: extendedMap.get(p.id)?.lessons_purchased ?? 0,
          }))
        } else {
          // Se le colonne estese non esistono, usa valori di default
          payments = payments.map((p) => ({
            ...p,
            payment_date: p.created_at ?? null,
            status: 'completed',
            invoice_url: null,
            lessons_purchased: 0,
          }))
        }

        // Carica profili atleti dal risultato parallelo
        const profilesMap = new Map<string, Pick<ProfileRow, 'id' | 'nome' | 'cognome'>>()
        if (
          profilesResult.status === 'fulfilled' &&
          !profilesResult.value.error &&
          profilesResult.value.data
        ) {
          const profilesData = profilesResult.value.data
          ;(profilesData as ProfileRow[]).forEach((p) => {
            profilesMap.set(p.id, {
              id: p.id,
              nome: p.nome ?? '',
              cognome: p.cognome ?? '',
            })
          })
        }

        // Carica appuntamenti completati dal risultato parallelo
        const completedAppointmentsMap = new Map<string, number>()
        if (
          appointmentsResult.status === 'fulfilled' &&
          !appointmentsResult.value.error &&
          appointmentsResult.value.data
        ) {
          const completedAppointments = appointmentsResult.value.data
          completedAppointments.forEach((apt: { athlete_id: string }) => {
            const current = completedAppointmentsMap.get(apt.athlete_id) || 0
            completedAppointmentsMap.set(apt.athlete_id, current + 1)
          })
        }

        // Log warning per counters se fallisce (non critico)
        if (countersResult.status === 'rejected' || (countersResult.status === 'fulfilled' && countersResult.value.error)) {
          logger.warn('Errore caricamento counters', countersResult.status === 'rejected' ? countersResult.reason : countersResult.value.error)
        }

        // Calcola lezioni usate e rimanenti per ogni atleta (aggregato)
        const lessonsUsedMap = new Map<string, number>()
        const lessonsRemainingMap = new Map<string, number>()
        const totalPurchasedMap = new Map<string, number>()

        // Somma tutte le lezioni acquistate per ogni atleta (aggregato)
        payments.forEach((p) => {
          const current = totalPurchasedMap.get(p.athlete_id) || 0
          totalPurchasedMap.set(p.athlete_id, current + (p.lessons_purchased || 0))
        })

        // Calcola lezioni usate e rimanenti per ogni atleta
        // Logica: totale_acquistato - appuntamenti_completati = rimanenti
        totalPurchasedMap.forEach((totalPurchased, athleteId) => {
          const completedCount = completedAppointmentsMap.get(athleteId) || 0
          const lessonsUsed = completedCount
          const lessonsRemaining = totalPurchased - completedCount // Può essere negativo se ha superato

          lessonsUsedMap.set(athleteId, lessonsUsed)
          lessonsRemainingMap.set(athleteId, lessonsRemaining)
        })

        // Per atleti con appuntamenti completati ma senza pagamenti (dovrebbe essere raro)
        completedAppointmentsMap.forEach((completedCount, athleteId) => {
          if (!lessonsUsedMap.has(athleteId)) {
            lessonsUsedMap.set(athleteId, completedCount)
            lessonsRemainingMap.set(athleteId, -completedCount) // Negativo perché non ha pagato
          }
        })

        // Formatta dati
        const formatted: Abbonamento[] = payments.map((p) => {
          const athlete = profilesMap.get(p.athlete_id)
          const athleteName = athlete
            ? `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim() || 'Sconosciuto'
            : 'Sconosciuto'
          const lessonsPurchased = p.lessons_purchased || 0
          const lessonsUsed = lessonsUsedMap.get(p.athlete_id) || 0
          // Se c'è un counter, usa quello (può essere negativo), altrimenti calcola da purchased - used
          const lessonsRemaining = lessonsRemainingMap.has(p.athlete_id)
            ? lessonsRemainingMap.get(p.athlete_id)!
            : Math.max(0, lessonsPurchased - lessonsUsed)

          return {
            id: p.id,
            athlete_id: p.athlete_id,
            athlete_name: athleteName,
            payment_date: p.payment_date ?? p.created_at ?? '',
            lessons_purchased: lessonsPurchased,
            lessons_used: lessonsUsed,
            lessons_remaining: lessonsRemaining,
            amount: p.amount || 0,
            invoice_url: p.invoice_url || null,
            status: p.status || 'completed',
            created_by_staff_id: (p as { created_by_staff_id?: string }).created_by_staff_id,
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
  }, [currentPage, enablePagination, role, userId])

  const loadPage = useCallback(async (page: number) => {
    setCurrentPage(page)
    // loadAbbonamenti verrà chiamato automaticamente quando currentPage cambia
  }, [])

  useEffect(() => {
    void loadAbbonamenti()
  }, [loadAbbonamenti, currentPage])

  const handleInvoiceUpload = async (paymentId: string, file: File) => {
    try {
      setUploadingInvoice(paymentId)

      // Trova il pagamento per ottenere athlete_id
      const payment = abbonamenti.find((a) => a.id === paymentId)
      if (!payment) throw new Error('Pagamento non trovato')

      const fileExt = file.name.split('.').pop()
      const fileName = `fatture/${payment.athlete_id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Per bucket privati, usa createSignedUrl invece di getPublicUrl
      // Il signed URL ha una durata di 1 ora (3600 secondi)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(fileName, 3600) // 1 ora

      let invoiceUrl: string
      if (signedUrlError) {
        // Fallback: prova con getPublicUrl se il bucket è pubblico
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
        invoiceUrl = urlData.publicUrl
      } else {
        invoiceUrl = signedUrlData.signedUrl
      }

      // Aggiorna pagamento con invoice_url
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('payments') as any)
        .update({ invoice_url: invoiceUrl } as Record<string, unknown>)
        .eq('id', paymentId)

      if (updateError) throw updateError

      addToast({
        title: 'Successo',
        message: 'Fattura caricata con successo',
        variant: 'success',
      })

      // Invalida cache
      frequentQueryCache.invalidate(`abbonamenti:${currentPage}:${enablePagination}`)
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
  }

  const handleDownloadInvoice = async (invoiceUrl: string) => {
    try {
      // Estrai il path del file dall'URL
      let filePath = invoiceUrl

      // Caso 1: URL pubblico completo
      if (invoiceUrl.includes('/storage/v1/object/public/documents/')) {
        const match = invoiceUrl.match(/\/documents\/(.+)$/)
        if (match) {
          filePath = match[1]
        }
      }
      // Caso 2: Path relativo che inizia con "documents/"
      else if (invoiceUrl.startsWith('documents/')) {
        filePath = invoiceUrl.replace('documents/', '')
      }
      // Caso 3: Path relativo diretto
      else if (!invoiceUrl.startsWith('http')) {
        filePath = invoiceUrl
      }
      // Caso 4: Se è già un signed URL, usalo direttamente
      else if (invoiceUrl.includes('/storage/v1/object/sign/')) {
        window.open(invoiceUrl, '_blank')
        return
      }

      // Genera un signed URL valido per 1 ora
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

      // Apri il signed URL in una nuova scheda per il download
      window.open(data.signedUrl, '_blank')
    } catch (err) {
      logger.error('Errore download fattura', err, { invoiceUrl })
      addToast({
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore nel download della fattura',
        variant: 'error',
      })
    }
  }

  const handleDeletePayment = (paymentId: string) => {
    setPaymentToDelete(paymentId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return

    setIsDeleting(true)
    setDeletingPayment(paymentToDelete)
    try {
      // Trova il pagamento per ottenere informazioni
      const payment = abbonamenti.find((a) => a.id === paymentToDelete)
      if (!payment) throw new Error('Pagamento non trovato')

      // Elimina la fattura da storage se esiste
      if (payment.invoice_url) {
        try {
          // Estrai il path del file dall'URL
          const url = new URL(payment.invoice_url)
          const pathParts = url.pathname.split('/')
          const fileName = pathParts[pathParts.length - 1]
          const filePath = `fatture/${payment.athlete_id}/${fileName}`

          await supabase.storage.from('documents').remove([filePath])
        } catch (storageError) {
          // Log ma non bloccare l'eliminazione del pagamento
          logger.warn('Errore eliminazione fattura da storage', storageError, { paymentId: paymentToDelete })
        }
      }

      // Elimina il pagamento dal database
      const { error: deleteError } = await supabase.from('payments').delete().eq('id', paymentToDelete)

      if (deleteError) {
        logger.error('Errore eliminazione pagamento da database', deleteError, { paymentId: paymentToDelete })
        throw deleteError
      }

      logger.info('Pagamento eliminato con successo', { paymentId: paymentToDelete })

      addToast({
        title: 'Successo',
        message: 'Pagamento eliminato con successo',
        variant: 'success',
      })

      // Invalida cache
      frequentQueryCache.invalidate(`abbonamenti:${currentPage}:${enablePagination}`)
      loadAbbonamenti()
      setDeleteDialogOpen(false)
      setPaymentToDelete(null)
    } catch (err) {
      logger.error('Errore eliminazione pagamento', err, { paymentId: paymentToDelete })
      addToast({
        title: 'Errore',
        message: 'Errore durante l\'eliminazione del pagamento. Riprova più tardi.',
        variant: 'error',
      })
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
      setDeletingPayment(null)
      setPaymentToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Filtraggio abbonamenti - Combinato in unico filter per performance
  const filteredAbbonamenti = useMemo(() => {
    // Prepara valori di ricerca una sola volta
    const search = searchTerm.trim() ? searchTerm.toLowerCase().trim() : null

    // Filtra con un unico passaggio invece di multipli filter sequenziali
    return abbonamenti.filter((abb) => {
      // Filtro ricerca atleta
      const matchesSearch = !search || abb.athlete_name.toLowerCase().includes(search)

      // Filtro lezioni rimanenti
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

      // Filtro importo
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

      // Filtro data
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

      // Combina tutti i filtri con AND
      return matchesSearch && matchesLessons && matchesAmount && matchesDate
    })
  }, [abbonamenti, searchTerm, lessonsFilter, amountFilter, dateFilter])

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <CardContent className="relative py-16 text-center">
          <LoadingState message="Caricamento abbonamenti..." />
        </CardContent>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <CardContent className="relative py-16 text-center">
          <ErrorState message={error} onRetry={loadAbbonamenti} />
        </CardContent>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Abbonamenti
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Gestione abbonamenti e pagamenti atleti
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Pagamento
          </Button>
        </div>

        {/* Filtri */}
        <div className="relative p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Ricerca */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Cerca per nome atleta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
              />
            </div>

            {/* Filtri avanzati */}
            <div className="w-full sm:w-auto min-w-[160px]">
              <SimpleSelect
                value={lessonsFilter}
                onValueChange={(value) =>
                  setLessonsFilter(value as 'all' | 'low' | 'medium' | 'high')
                }
                placeholder="Lezioni rimanenti"
                options={[
                  { value: 'all', label: 'Tutte le lezioni' },
                  { value: 'low', label: 'Basse (≤3)' },
                  { value: 'medium', label: 'Medie (4-10)' },
                  { value: 'high', label: 'Alte (>10)' },
                ]}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-auto min-w-[160px]">
              <SimpleSelect
                value={amountFilter}
                onValueChange={(value) =>
                  setAmountFilter(value as 'all' | 'low' | 'medium' | 'high')
                }
                placeholder="Importo"
                options={[
                  { value: 'all', label: 'Tutti gli importi' },
                  { value: 'low', label: 'Basso (<500€)' },
                  { value: 'medium', label: 'Medio (500-1000€)' },
                  { value: 'high', label: 'Alto (>1000€)' },
                ]}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-auto min-w-[160px]">
              <SimpleSelect
                value={dateFilter}
                onValueChange={(value) =>
                  setDateFilter(value as 'all' | 'today' | 'week' | 'month' | 'year')
                }
                placeholder="Periodo"
                options={[
                  { value: 'all', label: 'Tutte le date' },
                  { value: 'today', label: 'Oggi' },
                  { value: 'week', label: 'Ultima settimana' },
                  { value: 'month', label: 'Ultimo mese' },
                  { value: 'year', label: 'Ultimo anno' },
                ]}
                className="w-full"
              />
            </div>

            {(searchTerm ||
              lessonsFilter !== 'all' ||
              amountFilter !== 'all' ||
              dateFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setLessonsFilter('all')
                  setAmountFilter('all')
                  setDateFilter('all')
                }}
                className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50"
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

        {/* Tabella Abbonamenti */}
        <Card
          variant="trainer"
          className="relative overflow-hidden border-teal-500/30 bg-transparent transition-all duration-200"
        >
          <CardContent className="relative p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-tertiary/50 border-b border-teal-500/20">
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
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Usufruiti
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
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
                <tbody className="divide-y divide-teal-500/10">
                  {filteredAbbonamenti.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-teal-500/20 text-teal-400 rounded-full p-6">
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
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Crea primo abbonamento
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchTerm('')
                                setLessonsFilter('all')
                                setAmountFilter('all')
                                setDateFilter('all')
                              }}
                              className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50"
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
                        className="hover:bg-background-tertiary/30 transition-colors"
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
                        </td>
                        <td className="px-4 py-3 text-center">
                          {abb.invoice_url ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedInvoice({
                                    url: abb.invoice_url!,
                                    athlete: abb.athlete_name,
                                  })
                                }
                                className="border-teal-500/30 text-white hover:bg-teal-500/10"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Visualizza
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadInvoice(abb.invoice_url!)}
                                className="border-teal-500/30 text-white hover:bg-teal-500/10"
                                title="Scarica fattura"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                id={`invoice-upload-${abb.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleInvoiceUpload(abb.id, file)
                                }}
                                disabled={uploadingInvoice === abb.id}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={uploadingInvoice === abb.id}
                                onClick={() => {
                                  const input = document.getElementById(
                                    `invoice-upload-${abb.id}`,
                                  ) as HTMLInputElement
                                  if (input) input.click()
                                }}
                                className="border-teal-500/30 text-white hover:bg-teal-500/10"
                              >
                                {uploadingInvoice === abb.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-1" />
                                    Carica
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-text-primary font-semibold">
                          {formatCurrency(abb.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
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
                                  className="border-teal-500/30 text-white hover:bg-teal-500/10"
                                  title="Visualizza fattura"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadInvoice(abb.invoice_url!)}
                                  className="border-teal-500/30 text-white hover:bg-teal-500/10"
                                  title="Scarica fattura"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <span className="text-text-secondary text-xs">Nessuna fattura</span>
                            )}
                            {/* Pulsante Elimina Pagamento */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePayment(abb.id)}
                              disabled={deletingPayment === abb.id}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                              title="Elimina pagamento"
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
          <div className="flex items-center justify-between border-t border-border pt-4">
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
                className="border-teal-500/30 text-white hover:bg-teal-500/10"
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
                className="border-teal-500/30 text-white hover:bg-teal-500/10"
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-red-400 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadAbbonamenti()} className="mt-2">
              Riprova
            </Button>
          </div>
        )}
      </div>

      {/* Modal Nuovo Pagamento - Lazy loaded solo quando aperto */}
      {showModal && (
        <Suspense fallback={<LoadingState message="Caricamento form pagamento..." />}>
          <NuovoPagamentoModal
            open={showModal}
            onOpenChange={setShowModal}
            onSuccess={() => {
              // Invalida cache quando viene creato un nuovo pagamento
              frequentQueryCache.invalidate(`abbonamenti:${currentPage}:${enablePagination}`)
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
          />
        </Suspense>
      )}

      {/* Dialog conferma eliminazione pagamento */}
      {paymentToDelete && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Elimina pagamento"
          description="Sei sicuro di voler eliminare questo pagamento? Questa azione non può essere annullata."
          confirmText="Elimina"
          cancelText="Annulla"
          variant="destructive"
          onConfirm={handleDeleteConfirm}
          loading={isDeleting}
        />
      )}
    </div>
  )
}
