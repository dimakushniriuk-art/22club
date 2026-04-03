'use client'

import { Button } from '@/components/ui'
import { FileText } from 'lucide-react'
import { buildAnalyticsReportPdfBlob } from '@/lib/analytics-export'
import { createLogger } from '@/lib/logger'
import { useToast } from '@/components/ui/toast'
import type { AnalyticsData } from '@/lib/analytics'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'

const logger = createLogger('components:dashboard:export-report-button')

interface ExportReportButtonProps {
  analyticsData: AnalyticsData
}

export function ExportReportButton({ analyticsData }: ExportReportButtonProps) {
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

  const handleExport = async () => {
    setPdfLoading(true)
    try {
      const blob = await buildAnalyticsReportPdfBlob(analyticsData)
      const fn = `22club-statistiche-${new Date().toISOString().split('T')[0]}.pdf`
      openPdfWithBlob(blob, fn)
    } catch (error) {
      logger.error('Errore durante esportazione report', error)
      addToast({
        title: 'Errore',
        message: "Errore durante l'esportazione del report. Controlla la console per dettagli.",
        variant: 'error',
      })
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => void handleExport()}
        disabled={pdfLoading}
        aria-busy={pdfLoading}
        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
      >
        <FileText className="mr-2 h-4 w-4" />
        Esporta PDF
      </Button>

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Statistiche"
      />
    </>
  )
}
