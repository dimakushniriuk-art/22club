'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
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
import { useAthletePayments } from '@/hooks/use-athlete-payments'

const logger = createLogger('app:home:pagamenti:page')

export function HomePagamentiPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const profileId = user?.id ?? null
  const {
    data: pagamenti = [],
    isLoading,
    error: queryError,
    refetch,
  } = useAthletePayments(profileId)
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

  const loadError =
    error ??
    (queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null)

  if (isLoading) {
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

  if (loadError) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <PageHeaderFixed
          variant="chat"
          title="Pagamenti"
          subtitle="I tuoi abbonamenti e pagamenti"
          onBack={handleBack}
        />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 pb-24 safe-area-inset-bottom">
          <ErrorState message={loadError} onRetry={() => void refetch()} />
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
