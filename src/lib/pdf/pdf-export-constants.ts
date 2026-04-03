/**
 * Configurazione condivisa per export PDF client-side (jsPDF + PDF.js preview).
 * Worker: copia in `public/pdf.worker.min.mjs` da `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`
 * (allineato alla versione in package.json).
 */
export const PDFJS_WORKER_PUBLIC_URL = '/pdf.worker.min.mjs'

/** Logo SVG servito da `public/` (es. generato con `node scripts/extract-logo-svg.cjs`). */
export const DEFAULT_PROJECT_LOGO_SVG_PATH = '/logo.svg'

export const JSPDF_DEFAULT_MARGIN_MM = 14

export const PROJECT_LOGO_HEADER_MM = {
  width: 18,
  height: 18,
  /** Padding extra per il cerchio nero dietro al logo */
  circlePaddingMm: 3,
} as const
