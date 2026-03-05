/**
 * Utility per export pagamenti in CSV/PDF
 */

import { exportToCSV, exportToPDF } from './export-utils'
import type { Payment } from '@/types/payment'

export type PaymentExportData = Record<string, string | number | boolean | null>[]

/**
 * Formatta i dati dei pagamenti per l'export
 */
export function formatPaymentsForExport(payments: Payment[]): PaymentExportData {
  return payments.map((payment) => {
    return {
      Data: payment.payment_date
        ? new Date(payment.payment_date).toLocaleDateString('it-IT')
        : payment.created_at
          ? new Date(payment.created_at).toLocaleDateString('it-IT')
          : '',
      Atleta: payment.athlete_name || '',
      Importo: `€${(payment.amount || 0).toFixed(2)}`,
      Metodo: payment.payment_method || payment.method_text || '',
      'Lezioni Acquistate': payment.lessons_purchased || 0,
      Stato: payment.status || '',
      Storno: payment.is_reversal ? 'Sì' : 'No',
      Note: payment.notes || '',
    }
  })
}

/**
 * Esporta pagamenti in CSV
 */
export function exportPaymentsToCSV(payments: Payment[], filename?: string) {
  const data = formatPaymentsForExport(payments)
  const defaultFilename = `pagamenti-${new Date().toISOString().split('T')[0]}.csv`
  exportToCSV(data, filename || defaultFilename)
}

/**
 * Esporta pagamenti in PDF
 */
export function exportPaymentsToPDF(payments: Payment[], filename?: string) {
  const data = formatPaymentsForExport(payments)
  const defaultFilename = `pagamenti-${new Date().toISOString().split('T')[0]}.pdf`
  exportToPDF(data, filename || defaultFilename)
}
