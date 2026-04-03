import { createLogger } from '@/lib/logger'

import { PDFJS_WORKER_PUBLIC_URL } from './pdf-export-constants'

const logger = createLogger('lib:pdf:render-pdf-blob')

export type RenderPdfBlobToHostOptions = {
  /** Default: `PDFJS_WORKER_PUBLIC_URL` */
  workerSrc?: string
  /** Scala massima viewport (default 1.4) */
  maxScale?: number
}

/**
 * Renderizza tutte le pagine di un PDF (Blob) in elementi `<canvas>` dentro `host`.
 * Svuota `host` prima di disegnare.
 */
export async function renderPdfBlobToHost(
  blob: Blob,
  host: HTMLElement,
  options: RenderPdfBlobToHostOptions = {},
): Promise<void> {
  const workerSrc = options.workerSrc ?? PDFJS_WORKER_PUBLIC_URL
  const maxScale = options.maxScale ?? 1.4

  host.innerHTML = ''

  const buf = await blob.arrayBuffer()
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const { getDocument, GlobalWorkerOptions } = pdfjs
  GlobalWorkerOptions.workerSrc = workerSrc

  const pdf = await getDocument({ data: new Uint8Array(buf) }).promise

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  const containerW = host.getBoundingClientRect().width
  const maxW = Math.max(360, containerW > 0 ? containerW - 16 : 720)

  const first = await pdf.getPage(1)
  const baseViewport = first.getViewport({ scale: 1 })
  const scale = Math.min(maxScale, maxW / baseViewport.width)

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas non disponibile')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.className =
      'mx-auto mb-3 block max-w-full rounded border border-white/10 bg-white shadow-sm'
    const renderTask = page.render({ canvasContext: ctx, viewport })
    await renderTask.promise
    host.appendChild(canvas)
  }
}

export async function renderPdfBlobToHostSafe(
  blob: Blob,
  host: HTMLElement,
  options: RenderPdfBlobToHostOptions = {},
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await renderPdfBlobToHost(blob, host, options)
    return { ok: true }
  } catch (err) {
    logger.error('Errore render PDF blob', err)
    host.innerHTML = ''
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Impossibile mostrare l’anteprima del PDF',
    }
  }
}
