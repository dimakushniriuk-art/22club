'use client'

import { Button } from '@/components/ui'
import { Download } from 'lucide-react'
import { exportAnalyticsToCSV } from '@/lib/analytics-export'
import { createLogger } from '@/lib/logger'
import { useToast } from '@/components/ui/toast'
import type { AnalyticsData } from '@/lib/analytics'

const logger = createLogger('components:dashboard:export-report-button')

interface ExportReportButtonProps {
  analyticsData: AnalyticsData
}

export function ExportReportButton({ analyticsData }: ExportReportButtonProps) {
  const { addToast } = useToast()

  const handleExport = () => {
    try {
      exportAnalyticsToCSV(analyticsData)
      addToast({
        title: 'Report esportato',
        message: 'Il report è stato esportato con successo.',
        variant: 'success',
      })
    } catch (error) {
      logger.error('Errore durante esportazione report', error)
      addToast({
        title: 'Errore',
        message: "Errore durante l'esportazione del report. Controlla la console per dettagli.",
        variant: 'error',
      })
    }
  }

  return (
    <Button
      onClick={handleExport}
      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
    >
      <Download className="mr-2 h-4 w-4" />
      Esporta Report
    </Button>
  )
}
