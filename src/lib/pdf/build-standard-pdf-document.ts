import type { jsPDF } from 'jspdf'

import { JSPDF_DEFAULT_MARGIN_MM } from './pdf-export-constants'
import { loadProjectLogoPngDataUrl } from './load-project-logo-png'
import { stampProjectLogoOnCurrentPage } from './jspdf-stamp-project-logo'

/** jsPDF con proprietà aggiunta da jspdf-autotable */
export type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number }
}

export const STANDARD_AUTOTABLE_HEAD_STYLES = {
  fillColor: [6, 182, 212] as [number, number, number],
  textColor: [0, 0, 0] as [number, number, number],
  fontStyle: 'bold' as const,
}

export type StandardPdfRenderContext = {
  doc: jsPDF
  docWithAuto: JsPdfWithAutoTable
  margin: number
  autoTable: (doc: jsPDF, options: import('jspdf-autotable').UserOptions) => void
  headStyles: typeof STANDARD_AUTOTABLE_HEAD_STYLES
}

export type BuildStandardPdfBlobOptions = {
  orientation?: 'landscape' | 'portrait'
  format?: string | [number, number]
  marginMm?: number
  render: (ctx: StandardPdfRenderContext) => void | Promise<void>
}

/**
 * Crea un PDF con jsPDF + jspdf-autotable: logo su pagina 1 prima del contenuto,
 * su pagine successive il logo viene applicato dopo il rendering (come pagamenti atleta).
 */
export async function buildStandardPdfBlob(options: BuildStandardPdfBlobOptions): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const margin = options.marginMm ?? JSPDF_DEFAULT_MARGIN_MM
  const orientation = options.orientation ?? 'landscape'
  const format = options.format ?? 'a4'

  const doc = new jsPDF({ orientation, unit: 'mm', format })
  const docWithAuto = doc as JsPdfWithAutoTable
  const logoPng = await loadProjectLogoPngDataUrl()
  if (logoPng) stampProjectLogoOnCurrentPage(doc, logoPng, { marginMm: margin })

  const ctx: StandardPdfRenderContext = {
    doc,
    docWithAuto,
    margin,
    autoTable,
    headStyles: STANDARD_AUTOTABLE_HEAD_STYLES,
  }

  await options.render(ctx)

  if (logoPng) {
    const pageCount = doc.getNumberOfPages()
    for (let p = 2; p <= pageCount; p++) {
      doc.setPage(p)
      stampProjectLogoOnCurrentPage(doc, logoPng, { marginMm: margin })
    }
    doc.setPage(1)
  }

  return doc.output('blob') as Blob
}
