'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { FileText, Download, Calendar, Target, CheckCircle } from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { useProfileId } from '@/lib/utils/profile-id-utils'

const logger = createLogger('components:home-profile:athlete-subscriptions-tab')

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200'

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
      // Estrai il path del file dall'URL
      let filePath = invoiceUrl

      if (invoiceUrl.includes('/storage/v1/object/public/documents/')) {
        const match = invoiceUrl.match(/\/documents\/(.+)$/)
        if (match) {
          filePath = match[1]
        }
      } else if (invoiceUrl.startsWith('documents/')) {
        filePath = invoiceUrl.replace('documents/', '')
      } else if (!invoiceUrl.startsWith('http')) {
        filePath = invoiceUrl
      }

      // Genera un signed URL valido per 1 ora
      const { data, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600)

      if (signedError) {
        logger.warn('Errore creazione signed URL per download', signedError, {
          invoiceUrl,
          filePath,
        })
        // Fallback: prova ad aprire l'URL direttamente
        window.open(invoiceUrl, '_blank')
        return
      }

      // Scarica il file
      window.open(data.signedUrl, '_blank')
    } catch (err) {
      logger.error('Errore download fattura', err, { invoiceUrl })
      // Fallback: prova ad aprire l'URL direttamente
      window.open(invoiceUrl, '_blank')
    }
  }

  // Calcola totali: Comprati = somma per pagamento; Fatti = totale usato (uguale in ogni riga); Rimasti = Comprati - Fatti
  const totalPurchased = pagamenti.reduce((sum, p) => sum + p.lessons_purchased, 0)
  const totalUsed = pagamenti[0]?.lessons_used ?? 0
  const totalRemaining = totalPurchased - totalUsed

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
      {/* Riepilogo totale */}
      <Card className={`overflow-hidden ${CARD_DS}`}>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5">
                <Target className="h-4 w-4 shrink-0 text-cyan-400" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Comprati
                </span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-text-primary">
                {totalPurchased}
              </div>
            </div>
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5">
                <CheckCircle className="h-4 w-4 shrink-0 text-state-valid" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Fatti
                </span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-text-primary">{totalUsed}</div>
            </div>
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0 text-cyan-400" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Rimasti
                </span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-text-primary">
                {totalRemaining}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista pagamenti */}
      {pagamenti.length === 0 ? (
        <Card className={CARD_DS}>
          <CardContent className="p-6 text-center">
            <div className="mb-3 flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <FileText className="h-6 w-6 text-cyan-400" />
              </span>
            </div>
            <p className="text-sm text-text-secondary">Nessun abbonamento trovato</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pagamenti.map((pagamento) => (
            <Card key={pagamento.id} className={CARD_DS}>
              <CardContent className="p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      <span className="font-medium text-text-primary">
                        {formatDate(pagamento.payment_date)}
                      </span>
                      <span className="text-text-secondary">
                        {formatCurrency(pagamento.amount)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="mb-0.5 text-[10px] uppercase text-text-tertiary">Comprati</p>
                        <p className="text-base font-bold tabular-nums text-text-primary">
                          {pagamento.lessons_purchased}
                        </p>
                      </div>
                      <div>
                        <p className="mb-0.5 text-[10px] uppercase text-text-tertiary">Fatti</p>
                        <p className="text-base font-bold tabular-nums text-text-primary">
                          {pagamento.lessons_used}
                        </p>
                      </div>
                      <div>
                        <p className="mb-0.5 text-[10px] uppercase text-text-tertiary">Rimasti</p>
                        <p className="text-base font-bold tabular-nums text-text-primary">
                          {pagamento.lessons_remaining}
                        </p>
                      </div>
                    </div>
                  </div>
                  {pagamento.invoice_url && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(pagamento.invoice_url!)}
                        className="rounded-lg border border-white/10 text-xs text-text-primary hover:bg-white/5"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Scarica
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
