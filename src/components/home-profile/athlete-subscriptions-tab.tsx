'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from '@/components/dashboard/athlete-profile/athlete-profile-ds'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  FileText,
  Download,
  Calendar,
  Target,
  CheckCircle,
  Layers,
  Receipt,
  AlertTriangle,
} from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useProfileId } from '@/lib/utils/profile-id-utils'
import {
  DOCUMENTS_STORAGE_BUCKET,
  downloadStorageBlobViaPreview,
  resolveInvoiceDocumentsStoragePath,
} from '@/lib/documents'

const logger = createLogger('components:home-profile:athlete-subscriptions-tab')

interface Pagamento {
  id: string
  payment_date: string
  lessons_purchased: number
  lessons_used: number
  lessons_remaining: number
  amount: number
  invoice_url: string | null
}

interface AthleteSubscriptionsTabProps {
  athleteUserId: string | null
}

export function AthleteSubscriptionsTab({ athleteUserId }: AthleteSubscriptionsTabProps) {
  const supabase = createClient()
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const athleteProfileId = useProfileId(athleteUserId)

  const loadPagamenti = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!athleteProfileId) {
        setError('Profilo atleta non trovato')
        return
      }

      // Carica pagamenti
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, payment_date, amount, invoice_url, lessons_purchased, status, created_at')
        .eq('athlete_id', athleteProfileId)
        .eq('status', 'completed')
        .order('payment_date', { ascending: false })

      if (paymentsError) throw paymentsError

      // Carica appointments completati per calcolare lezioni usate
      // Questo è il metodo più affidabile (stessa logica della pagina abbonamenti)
      const { data: completedAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('athlete_id', athleteProfileId)
        .eq('status', 'completato')

      if (appointmentsError) throw appointmentsError

      // Calcola lezioni totali acquistate e usate
      const totalPurchased = (payments || []).reduce(
        (sum: number, p: { lessons_purchased?: number | null }) => sum + (p.lessons_purchased || 0),
        0,
      )
      const totalUsed = completedAppointments?.length || 0

      // Distribuisci lezioni usate proporzionalmente tra i pagamenti
      type PaymentRow = {
        id: string
        payment_date: string | null
        amount: number | null
        invoice_url: string | null
        lessons_purchased: number | null
        status: string | null
        created_at?: string | null
      }

      const paymentRows = (payments ?? []) as PaymentRow[]

      // Calcola lezioni rimanenti aggregate per l'atleta
      // Le lezioni rimanenti = totale acquistato - totale usato (può essere negativo)
      const totalRemaining = totalPurchased - totalUsed

      const formatted: Pagamento[] = paymentRows.map((p) => {
        const lessonsPurchased = p.lessons_purchased ?? 0
        // Per ogni pagamento, mostriamo:
        // - lessons_purchased: lezioni acquistate in quel pagamento (specifico)
        // - lessons_used: totale appointments completati per l'atleta (aggregato, stesso per tutti)
        // - lessons_remaining: totale rimanenti per l'atleta (aggregato, stesso per tutti)
        // Questa è la stessa logica della pagina abbonamenti
        return {
          id: p.id,
          payment_date: p.payment_date ?? p.created_at ?? new Date().toISOString(),
          lessons_purchased: lessonsPurchased,
          lessons_used: totalUsed, // Totale aggregato per l'atleta
          lessons_remaining: totalRemaining, // Totale aggregato per l'atleta
          amount: p.amount ?? 0,
          invoice_url: p.invoice_url ?? null,
        }
      })

      setPagamenti(formatted)
    } catch (error) {
      logger.error('Errore caricamento pagamenti', error, { athleteUserId })
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dei pagamenti')
    } finally {
      setLoading(false)
    }
  }, [supabase, athleteProfileId, athleteUserId])

  useEffect(() => {
    if (athleteProfileId) {
      void loadPagamenti()
    }
  }, [athleteProfileId, loadPagamenti])

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

  const handleDownloadInvoice = async (invoiceUrl: string) => {
    try {
      const filePath = resolveInvoiceDocumentsStoragePath(invoiceUrl)
      if (!filePath) {
        notifyError('Download non disponibile', 'Percorso fattura non valido.')
        return
      }
      const safeName =
        filePath.split('/').filter(Boolean).pop() ?? `fattura-${Date.now()}.pdf`
      await downloadStorageBlobViaPreview(DOCUMENTS_STORAGE_BUCKET, filePath, safeName)
    } catch (err) {
      logger.error('Errore download fattura', err, { invoiceUrl })
      notifyError(
        'Errore download',
        err instanceof Error ? err.message : 'Impossibile scaricare la fattura.',
      )
    }
  }

  const totalPurchased = pagamenti.reduce((sum, p) => sum + p.lessons_purchased, 0)
  const totalUsed = pagamenti[0]?.lessons_used ?? 0
  const totalRemaining = totalPurchased - totalUsed

  const progressPercent = useMemo(() => {
    if (totalPurchased <= 0) return 0
    return Math.min(100, Math.round((totalUsed / totalPurchased) * 100))
  }, [totalPurchased, totalUsed])

  const isOverdrawn = totalRemaining < 0

  if (loading) {
    return (
      <div className="py-8">
        <LoadingState message="Caricamento abbonamenti..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState message={error} onRetry={loadPagamenti} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className={ATHLETE_PROFILE_NESTED_CARD_CLASS}>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
              Riepilogo lezioni
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">
              Lezioni acquistate rispetto a quelle già effettuate in palestra.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center sm:px-4">
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <Target className="h-4 w-4 shrink-0 text-cyan-400/90" aria-hidden />
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Acquistate
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary sm:text-[1.65rem]">
                {totalPurchased}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center sm:px-4">
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400/90" aria-hidden />
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Eseguite
                </span>
              </div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-text-primary sm:text-[1.65rem]">
                {totalUsed}
              </p>
            </div>
            <div
              className={`rounded-xl border px-3 py-3 text-center sm:px-4 ${
                isOverdrawn
                  ? 'border-amber-500/35 bg-amber-500/10'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <Layers className="h-4 w-4 shrink-0 text-cyan-400/90" aria-hidden />
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Disponibili
                </span>
              </div>
              <p
                className={`text-2xl font-semibold tabular-nums tracking-tight sm:text-[1.65rem] ${
                  isOverdrawn ? 'text-amber-200' : 'text-text-primary'
                }`}
              >
                {totalRemaining}
              </p>
            </div>
          </div>

          {totalPurchased > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
                <span>Avanzamento</span>
                <span className="tabular-nums text-text-tertiary">
                  {totalUsed} / {totalPurchased}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Percentuale lezioni eseguite sul totale acquistato"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ease-out ${
                    isOverdrawn ? 'bg-amber-400/90' : 'bg-primary'
                  }`}
                  style={{ width: `${isOverdrawn ? 100 : progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          {isOverdrawn ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-sm text-amber-100/90">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
              <p>
                Hai effettuato più lezioni di quante risultino ancora coperte dagli abbonamenti
                registrati. Contatta la reception per allineare i pagamenti.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {pagamenti.length === 0 ? (
        <Card className={ATHLETE_PROFILE_NESTED_CARD_CLASS}>
          <CardContent className="space-y-3 p-6 text-center">
            <div className="flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <FileText className="h-6 w-6 text-cyan-400" aria-hidden />
              </span>
            </div>
            <p className="text-sm font-medium text-text-primary">Nessun pagamento registrato</p>
            <p className="text-xs text-text-secondary">
              Quando acquisti un pacchetto, apparirà qui con data, importo e eventuale fattura.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Storico pagamenti
          </p>
          {pagamenti.map((pagamento) => (
            <Card key={pagamento.id} className={ATHLETE_PROFILE_NESTED_CARD_CLASS}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 shrink-0 text-cyan-400/90" aria-hidden />
                        <time
                          dateTime={pagamento.payment_date}
                          className="font-medium text-text-primary"
                        >
                          {formatDate(pagamento.payment_date)}
                        </time>
                      </div>
                      <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-sm font-semibold tabular-nums text-text-primary">
                        {formatCurrency(pagamento.amount)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-text-secondary">
                        <Receipt className="h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden />
                        <span>
                          <span className="font-medium text-text-primary">
                            {pagamento.lessons_purchased}
                          </span>{' '}
                          {pagamento.lessons_purchased === 1 ? 'lezione' : 'lezioni'} in questo
                          pagamento
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col justify-center sm:items-end">
                    {pagamento.invoice_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(pagamento.invoice_url!)}
                        className="w-full rounded-lg border-white/15 text-text-primary hover:bg-white/5 sm:w-auto"
                        aria-label={`Scarica fattura del ${formatDate(pagamento.payment_date)}`}
                      >
                        <Download className="mr-2 h-4 w-4" aria-hidden />
                        Scarica fattura
                      </Button>
                    ) : (
                      <p className="text-center text-xs text-text-tertiary sm:text-right">
                        Fattura non caricata
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
