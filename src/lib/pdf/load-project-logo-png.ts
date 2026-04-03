import { DEFAULT_PROJECT_LOGO_SVG_PATH } from './pdf-export-constants'

/**
 * Carica `/logo.svg`, rasterizza su canvas e restituisce un data URL PNG per jsPDF.
 * Restituisce null se il file manca o in caso di errore.
 */
export async function loadProjectLogoPngDataUrl(
  svgPath: string = DEFAULT_PROJECT_LOGO_SVG_PATH,
): Promise<string | null> {
  try {
    const res = await fetch(svgPath, { cache: 'force-cache' })
    if (!res.ok) return null
    const svgText = await res.text()

    const svgBase64 = btoa(
      new TextEncoder().encode(svgText).reduce((acc, b) => acc + String.fromCharCode(b), ''),
    )
    const svgUrl = `data:image/svg+xml;base64,${svgBase64}`

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Logo non caricabile'))
      i.src = svgUrl
    })

    const targetW = 256
    const scale = targetW / Math.max(1, img.naturalWidth || img.width)
    const targetH = Math.round((img.naturalHeight || img.height) * scale)

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = Math.max(1, targetH)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}
