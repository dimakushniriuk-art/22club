'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { createLogger } from '@/lib/logger'
import { ErrorState } from '@/components/dashboard/error-state'
import { PageHeaderFixed } from '@/components/layout'
import { Euro, Eye } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import {
  DOCUMENTS_STORAGE_BUCKET,
  fetchStorageBlobViaPreview,
  invoiceDocumentSuggestedFileName,
  resolveInvoiceDocumentsStoragePath,
} from '@/lib/documents'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'

const logger = createLogger('app:home:pagamenti:page')

interface Pagamento {
  id: string
  payment_date: string
  lessons_purchased: number
  lessons_used: number
  lessons_remaining: number
  amount: number
  invoice_url: string | null
}

export default function PagamentiPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {
    open: invoicePdfOpen,
    blob: invoicePdfBlob,
    filename: invoicePdfFilename,
    openWithBlob: openInvoicePdfWithBlob,
    onOpenChange: onInvoicePdfOpenChange,
  } = usePdfPreviewDialog()
  const [invoicePreviewLoadingId, setInvoicePreviewLoadingId] = useState<string | null>(null)

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const loadPagamenti = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.user_id) {
        setError('Utente non autenticato')
        return
      }

      // user.id dal AuthProvider Ã¨ profiles.id (FK athlete_id su payments / lesson_counters)
      let athleteId = user.id ?? null
      if (!athleteId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.user_id)
          .single()
        if (profileError || !profile?.id) {
          throw new Error('Profilo atleta non trovato')
        }
        athleteId = profile.id
      }
      if (!athleteId) {
        throw new Error('Profilo atleta non trovato')
      }
      const [paymentsRes, counterRes] = await Promise.all([
        supabase
          .from('payments')
          .select('id, payment_date, amount, invoice_url, lessons_purchased, status')
          .eq('athlete_id', athleteId)
          .eq('status', 'completed')
          .order('payment_date', { ascending: false }),
        supabase.from('lesson_counters').select('count').eq('athlete_id', athleteId).maybeSingle(),
      ])

      const { data: payments, error: paymentsError } = paymentsRes
      const { data: counter, error: counterError } = counterRes

      if (paymentsError) throw paymentsError
      if (counterError) throw counterError

      // Calcola lezioni totali acquistate e usate
      const totalPurchased = (payments || []).reduce(
        (sum: number, p: { lessons_purchased?: number | null }) => sum + (p.lessons_purchased || 0),
        0,
      )
      const remaining = counter?.count || 0
      const totalUsed = Math.max(0, totalPurchased - remaining)

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

      const formatted: Pagamento[] = paymentRows.map((p) => {
        const lessonsPurchased = p.lessons_purchased ?? 0
        const proportion = totalPurchased > 0 ? lessonsPurchased / totalPurchased : 0
        const lessonsUsed = Math.round(totalUsed * proportion)
        const lessonsRemaining = Math.max(0, lessonsPurchased - lessonsUsed)

        return {
          id: p.id,
          payment_date: p.payment_date ?? p.created_at ?? new Date().toISOString(),
          lessons_purchased: lessonsPurchased,
          lessons_used: lessonsUsed,
          lessons_remaining: lessonsRemaining,
          amount: p.amount ?? 0,
          invoice_url: p.invoice_url ?? null,
        }
      })

      setPagamenti(formatted)
    } catch (error) {
      logger.error('Errore caricamento pagamenti', error, { userId: user?.id })
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dei pagamenti')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      void loadPagamenti()
    }
  }, [user, loadPagamenti])

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

  const openInvoicePdfPreview = useCallback(
    async (paymentId: string, invoiceUrl: string, paymentDate: string) => {
      const filePath = resolveInvoiceDocumentsStoragePath(invoiceUrl)
      if (!filePath) {
        setError('Percorso fattura non valido.')
        return
      }
      const safeName = invoiceDocumentSuggestedFileName(invoiceUrl, paymentDate)
      setError(null)
      setInvoicePreviewLoadingId(paymentId)
      try {
        const blob = await fetchStorageBlobViaPreview(DOCUMENTS_STORAGE_BUCKET, filePath)
        openInvoicePdfWithBlob(blob, safeName)
      } catch (err) {
        logger.error('Errore anteprima fattura PDF', err, { paymentId })
        setError(err instanceof Error ? err.message : 'Impossibile aprire la fattura.')
      } finally {
        setInvoicePreviewLoadingId(null)
      }
    },
    [openInvoicePdfWithBlob],
  )

  if (loading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <PageHeaderFixed
          variant="chat"
          title="Pagamenti"
          subtitle="I tuoi abbonamenti e pagamenti"
          onBack={handleBack}
        />
        <div
          className="min-h-0 flex-1 overflow-auto px-4 pb-24 safe-area-inset-bottom"
          aria-hidden
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <PageHeaderFixed
          variant="chat"
          title="Pagamenti"
          subtitle="I tuoi abbonamenti e pagamenti"
          onBack={handleBack}
        />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 pb-24 safe-area-inset-bottom">
          <ErrorState message={error} onRetry={loadPagamenti} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <PageHeaderFixed
        variant="chat"
        title="Pagamenti"
        subtitle="I tuoi abbonamenti e pagamenti"
        onBack={handleBack}
      />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col space-y-4 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:space-y-6 sm:px-6">
        {/* Tabella Pagamenti */}
        <Card
          variant="trainer"
          className="relative border-blue-500/30 bg-transparent transition-all duration-200"
        >
          <CardContent className="relative z-10 p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-tertiary/50 border-b border-blue-500/20">
                  <tr>
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
                    <th className="px-4 py-3 text-right text-text-primary text-sm font-semibold">
                      Pagato
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Fattura
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {pagamenti.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center gap-3">
                          <Euro className="h-12 w-12 text-blue-400/50" />
                          <p>Nessun pagamento registrato</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagamenti.map((pag) => (
                      <tr key={pag.id} className="transition-colors">
                        <td className="px-4 py-3 text-text-secondary">
                          {formatDate(pag.payment_date)}
                        </td>
                        <td className="px-4 py-3 text-center text-text-primary font-semibold">
                          {pag.lessons_purchased}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-orange-400 font-medium">{pag.lessons_used}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-semibold ${
                              pag.lessons_remaining === 0
                                ? 'text-red-400'
                                : pag.lessons_remaining <= 3
                                  ? 'text-orange-400'
                                  : 'text-green-400'
                            }`}
                          >
                            {pag.lessons_remaining}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-text-primary font-semibold">
                          {formatCurrency(pag.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {pag.invoice_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                void openInvoicePdfPreview(
                                  pag.id,
                                  pag.invoice_url!,
                                  pag.payment_date,
                                )
                              }
                              disabled={invoicePreviewLoadingId === pag.id}
                              className="gap-1.5 border-cyan-400/70 text-cyan-300 hover:border-cyan-300/80 hover:bg-cyan-500/15"
                              title="Anteprima fattura PDF"
                            >
                              <Eye className="h-4 w-4 shrink-0" />
                              <span className="text-xs font-semibold">PDF</span>
                            </Button>
                          ) : (
                            <span className="text-text-tertiary text-sm">Non disponibile</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <PdfCanvasPreviewDialog
        open={invoicePdfOpen}
        onOpenChange={onInvoicePdfOpenChange}
        blob={invoicePdfBlob}
        filename={invoicePdfFilename}
      />
    </div>
  )
}
