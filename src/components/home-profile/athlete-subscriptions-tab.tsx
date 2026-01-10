'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  FileText,
  Download,
  Eye,
  Loader2,
  X,
  Euro,
  Calendar,
  Target,
  CheckCircle,
} from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { useProfileId } from '@/lib/utils/profile-id-utils'

const logger = createLogger('components:home-profile:athlete-subscriptions-tab')

// Componente per visualizzare la fattura con signed URL
function InvoiceViewModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

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
        if (url.includes('/storage/v1/object/public/documents/')) {
          const match = url.match(/\/documents\/(.+)$/)
          if (match) {
            filePath = match[1]
          }
        }
        // Caso 2: Path relativo che inizia con "documents/"
        else if (url.startsWith('documents/')) {
          filePath = url.replace('documents/', '')
        }
        // Caso 3: Path relativo diretto
        else if (!url.startsWith('http')) {
          filePath = url
        }

        // Genera un signed URL valido per 1 ora
        const { data, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(filePath, 3600)

        if (signedError) {
          logger.warn('Errore creazione signed URL', signedError, { url, filePath })
          setSignedUrl(url)
        } else {
          setSignedUrl(data.signedUrl)
        }
      } catch (err) {
        logger.error('Errore caricamento signed URL', err, { url })
        setError(err instanceof Error ? err.message : 'Errore nel caricamento della fattura')
        setSignedUrl(url)
      } finally {
        setLoading(false)
      }
    }

    loadSignedUrl()
  }, [url, supabase])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4 bg-background-secondary rounded-lg border border-teal-500/30 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-teal-500/20">
          <h3 className="text-text-primary text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-400" />
            Fattura
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
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)
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
        (sum, p) => sum + (p.lessons_purchased || 0),
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

  // Calcola totali
  const totalPurchased = pagamenti.reduce((sum, p) => sum + p.lessons_purchased, 0)
  const totalUsed = pagamenti.reduce((sum, p) => sum + p.lessons_used, 0)
  const totalRemaining = pagamenti.reduce((sum, p) => sum + p.lessons_remaining, 0)

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
      <Card className="bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 border-teal-500/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-teal-400">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Comprati</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalPurchased}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Fatti</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalUsed}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Rimasti</span>
              </div>
              <div className="text-3xl font-bold text-white">{totalRemaining}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista pagamenti */}
      {pagamenti.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-teal-400/50" />
            <p className="text-text-secondary">Nessun abbonamento trovato</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pagamenti.map((pagamento) => (
            <Card
              key={pagamento.id}
              className="bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 hover:border-teal-500/40 transition-all duration-200"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="h-4 w-4 text-teal-400" />
                      <span className="text-sm font-medium">
                        {formatDate(pagamento.payment_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Euro className="h-4 w-4 text-teal-400" />
                      <span className="text-sm">{formatCurrency(pagamento.amount)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-teal-400/70 uppercase tracking-wider mb-1">
                          Comprati
                        </div>
                        <div className="text-lg font-bold text-white">
                          {pagamento.lessons_purchased}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-green-400/70 uppercase tracking-wider mb-1">
                          Fatti
                        </div>
                        <div className="text-lg font-bold text-white">{pagamento.lessons_used}</div>
                      </div>
                      <div>
                        <div className="text-xs text-cyan-400/70 uppercase tracking-wider mb-1">
                          Rimasti
                        </div>
                        <div className="text-lg font-bold text-white">
                          {pagamento.lessons_remaining}
                        </div>
                      </div>
                    </div>
                  </div>
                  {pagamento.invoice_url && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(pagamento.invoice_url!)}
                        className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizza
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(pagamento.invoice_url!)}
                        className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50"
                      >
                        <Download className="h-4 w-4 mr-2" />
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

      {/* Modal visualizzazione fattura */}
      {selectedInvoice && (
        <InvoiceViewModal url={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  )
}
