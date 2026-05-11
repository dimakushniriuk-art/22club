import { toPng } from 'html-to-image'

export const WORKOUT_SHARE_CARD_PX = 1080

/** Nome file: 22club-workout-{data}-{slug}.png */
export function buildWorkoutShareFilename(dateIso: string, workoutTitle: string): string {
  const day = dateIso.slice(0, 10)
  const slug = sanitizeWorkoutShareFilenameSegment(workoutTitle)
  return `22club-workout-${day}-${slug}.png`
}

export function sanitizeWorkoutShareFilenameSegment(raw: string): string {
  const s = raw
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return s || 'allenamento'
}

async function dataUrlToBlobDownscaled(
  dataUrl: string,
  targetW: number,
  targetH: number,
): Promise<Blob> {
  const img = new Image()
  img.decoding = 'async'
  img.src = dataUrl
  await img.decode()

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D non disponibile')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetW, targetH)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png', 0.95),
  )
  if (!blob) throw new Error('Export PNG fallito')
  return blob
}

/**
 * Cattura solo il nodo card (offscreen 1080×1080), alta definizione, output finale 1080×1080.
 */
export async function exportWorkoutShareCardToPng(node: HTMLElement): Promise<Blob> {
  const rect = node.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))

  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    width: w,
    height: h,
    backgroundColor: '#030712',
    style: {
      transform: 'none',
    },
  })

  return dataUrlToBlobDownscaled(dataUrl, WORKOUT_SHARE_CARD_PX, WORKOUT_SHARE_CARD_PX)
}

/** Anteprima dialog: più veloce del PNG finale (senza downscale). */
export async function workoutShareCardPreviewPng(node: HTMLElement): Promise<string> {
  const rect = node.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    width: w,
    height: h,
    backgroundColor: '#030712',
  })
}
