import type { jsPDF } from 'jspdf'

import { JSPDF_DEFAULT_MARGIN_MM, PROJECT_LOGO_HEADER_MM } from './pdf-export-constants'

export type StampProjectLogoOptions = {
  marginMm?: number
  logoWidthMm?: number
  logoHeightMm?: number
  /** Raggio extra attorno al logo per il cerchio di sfondo */
  circlePaddingMm?: number
  /** Offset verticale del blocco logo (mm), tipicamente leggermente sopra il margine */
  topOffsetMm?: number
}

/**
 * Disegna logo + cerchio nero di sfondo in alto a destra sulla pagina corrente.
 */
export function stampProjectLogoOnCurrentPage(
  doc: jsPDF,
  logoPngDataUrl: string,
  options: StampProjectLogoOptions = {},
): void {
  const margin = options.marginMm ?? JSPDF_DEFAULT_MARGIN_MM
  const logoW = options.logoWidthMm ?? PROJECT_LOGO_HEADER_MM.width
  const logoH = options.logoHeightMm ?? PROJECT_LOGO_HEADER_MM.height
  const pad = options.circlePaddingMm ?? PROJECT_LOGO_HEADER_MM.circlePaddingMm
  const top = margin + (options.topOffsetMm ?? -2)

  const pageW = doc.internal.pageSize.getWidth()
  const x = pageW - margin - logoW
  const y = top
  const r = Math.max(logoW, logoH) / 2 + pad
  const cx = x + logoW / 2
  const cy = y + logoH / 2

  doc.setFillColor(0, 0, 0)
  ;(doc as unknown as { circle: (x: number, y: number, r: number, style?: string) => void }).circle(
    cx,
    cy,
    r,
    'F',
  )

  ;(doc as unknown as { addImage: (...args: unknown[]) => void }).addImage(
    logoPngDataUrl,
    'PNG',
    x,
    y,
    logoW,
    logoH,
  )
}

/**
 * Ripete logo+cerchio su tutte le pagine del documento e torna alla pagina 1.
 */
export function stampProjectLogoOnAllPages(
  doc: jsPDF,
  logoPngDataUrl: string | null,
  options: StampProjectLogoOptions = {},
): void {
  if (!logoPngDataUrl) return
  const n = doc.getNumberOfPages()
  for (let p = 1; p <= n; p++) {
    doc.setPage(p)
    stampProjectLogoOnCurrentPage(doc, logoPngDataUrl, options)
  }
  doc.setPage(1)
}
