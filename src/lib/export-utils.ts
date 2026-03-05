import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:export-utils')

export type ExportData = Record<string, string | number | boolean | null>[]

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
 * Esporta dati in formato PDF vero usando jsPDF
 */
export async function exportToPDF(data: ExportData, filename: string) {
  if (data.length === 0) {
    logger.warn('Nessun dato da esportare', undefined, { filename })
    return
  }

  try {
    // Import dinamico di jsPDF per evitare problemi SSR
    const { jsPDF } = await import('jspdf')
    
    // Crea nuovo documento PDF (A4, portrait)
    const doc = new jsPDF({
      orientation: 'landscape', // Landscape per tabelle larghe
      unit: 'mm',
      format: 'a4',
    })

    // Intestazione documento
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORT CLIENTI', 14, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, 14, 27)
    doc.text(`Totale record: ${data.length}`, 14, 32)

    // Prepara i dati per la tabella
    const headers = Object.keys(data[0])
    const tableData = data.map((row) =>
      headers.map((header) => String(row[header] || 'N/A')),
    )

    // Configurazione tabella
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 14
    const tableWidth = pageWidth - 2 * margin
    const startY = 40

    // Calcola larghezza colonne (distribuzione uniforme)
    const columnWidths = headers.map(() => tableWidth / headers.length)

    // Funzione per disegnare header tabella
    let currentY = startY
    doc.setFillColor(52, 152, 219) // Colore header (blu)
    doc.rect(margin, currentY - 5, tableWidth, 7, 'F')
    
    doc.setTextColor(255, 255, 255) // Testo bianco per header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    
    let currentX = margin
    headers.forEach((header, index) => {
      doc.text(header, currentX + 2, currentY, {
        maxWidth: columnWidths[index] - 4,
        align: 'left',
      })
      currentX += columnWidths[index]
    })

    currentY += 8
    doc.setTextColor(0, 0, 0) // Testo nero per dati

    // Disegna righe dati
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    
    const rowHeight = 7
    let dataIndex = 0

    while (dataIndex < tableData.length) {
      // Controlla se serve nuova pagina
      if (currentY + rowHeight > pageHeight - 10) {
        doc.addPage()
        currentY = margin + 10
        
        // Ridisegna header su nuova pagina
        doc.setFillColor(52, 152, 219)
        doc.rect(margin, currentY - 5, tableWidth, 7, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        
        currentX = margin
        headers.forEach((header, index) => {
          doc.text(header, currentX + 2, currentY, {
            maxWidth: columnWidths[index] - 4,
            align: 'left',
          })
          currentX += columnWidths[index]
        })
        
        currentY += 8
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
      }

      // Disegna riga dati
      const row = tableData[dataIndex]
      currentX = margin
      row.forEach((cell, cellIndex) => {
        doc.text(cell, currentX + 2, currentY, {
          maxWidth: columnWidths[cellIndex] - 4,
          align: 'left',
        })
        currentX += columnWidths[cellIndex]
      })
      
      currentY += rowHeight
      dataIndex++
    }

    // Salva PDF
    doc.save(filename)
    
    logger.debug('PDF generato con successo', { filename, rows: data.length })
  } catch (err) {
    logger.error('Errore generazione PDF', err, { filename })
    throw err
  }
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
