import { createLogger } from '@/lib/logger'
import { buildStandardPdfBlob } from '@/lib/pdf'

const logger = createLogger('lib:export-utils')

export type ExportData = Record<string, string | number | boolean | null>[]

export type PdfExportOptions = {
  title?: string
  generatedAtLabel?: string
  orientation?: 'portrait' | 'landscape'
}

/**
 * Esporta dati in formato CSV
 */
export function exportToCSV(data: ExportData, filename: string) {
  if (data.length === 0) {
    logger.warn('Nessun dato da esportare', undefined, { filename })
    return
  }

  // Ottiene le intestazioni dalle chiavi del primo oggetto
  const headers = Object.keys(data[0])

  // Crea le righe CSV
  const csvRows = [
    // Intestazioni
    headers.join(','),
    // Dati
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Gestisce valori null/undefined
          if (value === null || value === undefined) return ''
          // Escapa virgolette e racchiude tra virgolette se contiene virgole
          const stringValue = String(value)
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(','),
    ),
  ]

  // Crea il blob e avvia il download
  // Aggiunge BOM UTF-8 all'inizio del CSV per compatibilità Excel Windows
  const BOM = '\uFEFF'
  const csvContent = BOM + csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

/**
 * Genera un PDF (Blob) usando jsPDF + autoTable (senza logo unificato).
 * @deprecated Preferire `buildStandardPdfBlob` / `buildTabularExportPdfBlob` per export UI.
 */
export async function buildPdfBlob(
  data: ExportData,
  options: PdfExportOptions = {},
): Promise<Blob> {
  if (data.length === 0) {
    logger.warn('Nessun dato da esportare', undefined, { options })
    return new Blob([], { type: 'application/pdf' })
  }

  try {
    // Import dinamico di jsPDF per evitare problemi SSR
    const { jsPDF } = await import('jspdf')
    const autoTableModule = await import('jspdf-autotable')
    const autoTable = autoTableModule.default

    // Crea nuovo documento PDF (A4, portrait)
    const doc = new jsPDF({
      orientation: options.orientation ?? 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    // Intestazione documento
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(options.title ?? 'REPORT', 14, 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `${options.generatedAtLabel ?? 'Generato il'}: ${new Date().toLocaleString('it-IT')}`,
      14,
      27,
    )
    doc.text(`Totale record: ${data.length}`, 14, 32)

    const headers = Object.keys(data[0])
    const tableBody = data.map((row) =>
      headers.map((header) => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'boolean') return value ? 'Sì' : 'No'
        return String(value)
      }),
    )

    autoTable(doc, {
      head: [headers],
      body: tableBody,
      startY: 38,
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [6, 182, 212], // cyan-500-ish
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14, top: 14, bottom: 14 },
    })

    const blob = doc.output('blob') as Blob
    logger.debug('PDF generato con successo', { rows: data.length })
    return blob
  } catch (err) {
    logger.error('Errore generazione PDF', err, { options })
    throw err
  }
}

/**
 * Download immediato PDF da tabella generica (senza anteprima/logo unificati).
 * @deprecated Preferire `buildTabularExportPdfBlob` + `PdfCanvasPreviewDialog`.
 */
export async function exportToPDF(
  data: ExportData,
  filename: string,
  options: PdfExportOptions = {},
) {
  const blob = await buildPdfBlob(data, options)
  downloadBlob(blob, filename)
}

/**
 * Crea un object URL da un Blob PDF (per preview in iframe/object).
 * Chi chiama deve fare revokeObjectURL quando non serve più.
 */
export function createPdfObjectUrl(blob: Blob): string {
  return window.URL.createObjectURL(blob)
}

/**
 * Utility per scaricare un blob come file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Formatta i dati dei clienti per l'export
 */
export function formatClientiForExport(clienti: unknown[]): ExportData {
  return clienti.map((cliente) => {
    const c = cliente as Record<string, unknown>

    // Usa first_name/last_name come primari con fallback a nome/cognome per compatibilità
    const firstName = (c.first_name as string) || (c.nome as string) || ''
    const lastName = (c.last_name as string) || (c.cognome as string) || ''
    const nomeCompleto = `${firstName} ${lastName}`.trim() || 'N/A'

    // Validazione email
    const email = (c.email as string) || 'N/A'

    // Validazione telefono
    const phone = (c.phone as string) || 'N/A'

    // Validazione data_iscrizione con fallback
    let dataIscrizione = 'N/A'
    if (c.data_iscrizione) {
      try {
        const date = new Date(c.data_iscrizione as string)
        if (!isNaN(date.getTime())) {
          dataIscrizione = date.toLocaleDateString('it-IT')
        }
      } catch {
        // Se conversione fallisce, mantieni 'N/A'
      }
    } else if (c.created_at) {
      try {
        const date = new Date(c.created_at as string)
        if (!isNaN(date.getTime())) {
          dataIscrizione = date.toLocaleDateString('it-IT')
        }
      } catch {
        // Se conversione fallisce, mantieni 'N/A'
      }
    }

    // Validazione stato
    const stato = (c.stato as string) || 'N/A'

    // Validazione allenamenti_mese
    const allenamentiMese = typeof c.allenamenti_mese === 'number' ? c.allenamenti_mese : 0

    // Validazione scheda_attiva
    const schedaAttiva = (c.scheda_attiva as string) || 'Nessuna'

    // Validazione documenti_scadenza
    const documentiScadenza = Boolean(c.documenti_scadenza) ? 'Sì' : 'No'

    return {
      Nome: nomeCompleto,
      Email: email,
      Telefono: phone,
      'Data Iscrizione': dataIscrizione,
      Stato: stato,
      'Allenamenti/mese': allenamentiMese,
      'Scheda Attiva': schedaAttiva,
      'Documenti in Scadenza': documentiScadenza,
    }
  })
}

/** PDF tabellare standard (logo + autoTable) da righe export già formattate. */
export async function buildTabularExportPdfBlob(
  title: string,
  data: ExportData,
  options: { orientation?: 'landscape' | 'portrait' } = {},
): Promise<Blob> {
  if (data.length === 0) return new Blob([], { type: 'application/pdf' })
  const headers = Object.keys(data[0])
  const body = data.map((row) =>
    headers.map((h) => {
      const v = row[h]
      if (v === null || v === undefined) return ''
      if (typeof v === 'boolean') return v ? 'Sì' : 'No'
      return String(v)
    }),
  )

  return buildStandardPdfBlob({
    orientation: options.orientation ?? 'landscape',
    render: ({ doc, margin, autoTable, headStyles }) => {
      let cursorY = margin
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin, cursorY)
      cursorY += 7
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, cursorY)
      cursorY += 5
      doc.text(`Record: ${data.length}`, margin, cursorY)
      cursorY += 8

      autoTable(doc, {
        startY: cursorY,
        head: [headers],
        body,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles,
        margin: { left: margin, right: margin },
      })
    },
  })
}

export async function buildClientiPdfBlob(clienti: unknown[]): Promise<Blob> {
  return buildTabularExportPdfBlob('Clienti', formatClientiForExport(clienti))
}
