'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Instagram } from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from '@/components/ui'
import {
  WorkoutInstagramShareTarget,
  DEFAULT_INSTAGRAM_SHARE_SECTIONS,
  INSTAGRAM_SHARE_CAPTURE_HEIGHT,
  INSTAGRAM_SHARE_CAPTURE_WIDTH,
  type WorkoutInstagramShareTargetProps,
} from './workout-instagram-share-target'

const logger = createLogger('app:home:allenamenti:riepilogo:instagram-preview')

const SOURCE_W = INSTAGRAM_SHARE_CAPTURE_WIDTH
const SOURCE_H = INSTAGRAM_SHARE_CAPTURE_HEIGHT

export type InstagramExportTransform = 'none' | 'crop_center_square' | 'cover' | 'contain'

export type InstagramExportPreset = {
  id: string
  label: string
  sub: string
  width: number
  height: number
  transform: InstagramExportTransform
}

/** Export unico formato Storie (pixel consigliati da Instagram). */
export const INSTAGRAM_EXPORT_PRESETS: InstagramExportPreset[] = [
  {
    id: 'story_916',
    label: 'Storie 9:16',
    sub: '1080×1920',
    width: 1080,
    height: 1920,
    /** Canvas sorgente già 9:16: nessuna letterbox. */
    transform: 'none',
  },
]

function applyExportPreset(
  source: HTMLCanvasElement,
  preset: InstagramExportPreset,
): HTMLCanvasElement {
  const sw = source.width
  const sh = source.height
  if (preset.transform === 'none' && sw === preset.width && sh === preset.height) {
    return source
  }

  const out = document.createElement('canvas')
  out.width = preset.width
  out.height = preset.height
  const ctx = out.getContext('2d')
  if (!ctx) return source

  switch (preset.transform) {
    case 'none': {
      ctx.drawImage(source, 0, 0, sw, sh, 0, 0, preset.width, preset.height)
      return out
    }
    case 'crop_center_square': {
      const side = Math.min(sw, sh)
      const sx = (sw - side) / 2
      const sy = (sh - side) / 2
      ctx.drawImage(source, sx, sy, side, side, 0, 0, preset.width, preset.height)
      return out
    }
    case 'cover': {
      ctx.fillStyle = '#18181b'
      ctx.fillRect(0, 0, preset.width, preset.height)
      const scale = Math.max(preset.width / sw, preset.height / sh)
      const nw = sw * scale
      const nh = sh * scale
      const ox = (preset.width - nw) / 2
      const oy = (preset.height - nh) / 2
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(source, 0, 0, sw, sh, ox, oy, nw, nh)
      return out
    }
    case 'contain': {
      ctx.fillStyle = '#18181b'
      ctx.fillRect(0, 0, preset.width, preset.height)
      const scale = Math.min(preset.width / sw, preset.height / sh)
      const nw = sw * scale
      const nh = sh * scale
      const ox = (preset.width - nw) / 2
      const oy = (preset.height - nh) / 2
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(source, 0, 0, sw, sh, ox, oy, nw, nh)
      return out
    }
    default:
      return source
  }
}

async function canvasToPng(
  canvas: HTMLCanvasElement,
): Promise<{ blob: Blob; dataUrl: string } | null> {
  const dataUrl = canvas.toDataURL('image/png', 0.92)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
  })
  if (!blob) return null
  return { blob, dataUrl }
}

async function captureAndExport(
  element: HTMLElement,
  preset: InstagramExportPreset,
): Promise<{ blob: Blob; dataUrl: string } | null> {
  const { default: html2canvas } = await import('html2canvas')
  const sourceCanvas = await html2canvas(element, {
    scale: 1,
    width: SOURCE_W,
    height: SOURCE_H,
    backgroundColor: '#18181b',
    logging: false,
    useCORS: true,
  })
  const finalCanvas = applyExportPreset(sourceCanvas, preset)
  return canvasToPng(finalCanvas)
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Incrementa quando cambiano i dati del riepilogo (anteprima aggiornata). */
  shareRevision: string
} & Omit<WorkoutInstagramShareTargetProps, 'sections'>

export function WorkoutInstagramSharePreviewDialog({
  open,
  onOpenChange,
  shareRevision: _shareRevision,
  ...shareProps
}: Props) {
  const { addToast } = useToast()
  const captureRef = useRef<HTMLDivElement>(null)
  const [exportPresetId, setExportPresetId] = useState<string>(INSTAGRAM_EXPORT_PRESETS[0]!.id)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const exportPreset = useMemo(
    () =>
      INSTAGRAM_EXPORT_PRESETS.find((p) => p.id === exportPresetId) ?? INSTAGRAM_EXPORT_PRESETS[0]!,
    [exportPresetId],
  )

  useEffect(() => {
    if (open) {
      setExportPresetId(INSTAGRAM_EXPORT_PRESETS[0]!.id)
    }
  }, [open])

  const previewDelayMs = useMemo(() => {
    const lines = shareProps.exerciseLines ?? []
    return lines.some((l) => Boolean(l.mediaVideoUrl)) ? 650 : 280
  }, [shareProps.exerciseLines])

  const runPreview = useCallback(async () => {
    const el = captureRef.current
    if (!el) return
    setPreviewLoading(true)
    try {
      const out = await captureAndExport(el, exportPreset)
      if (out) setPreviewDataUrl(out.dataUrl)
    } catch (err) {
      logger.error('Anteprima immagine Instagram', err)
      setPreviewDataUrl(null)
    } finally {
      setPreviewLoading(false)
    }
  }, [exportPreset])

  useEffect(() => {
    if (!open) {
      setPreviewDataUrl(null)
      return
    }
    const t = window.setTimeout(() => {
      void runPreview()
    }, previewDelayMs)
    return () => window.clearTimeout(t)
  }, [open, _shareRevision, previewDelayMs, exportPreset, runPreview])

  const downloadBlob = useCallback(
    (blob: Blob, preset: InstagramExportPreset) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const day = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `22club-allenamento-${preset.id}-${day}.png`
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      addToast({
        title: 'Immagine pronta',
        message: `PNG ${preset.width}×${preset.height} salvato. Caricalo su Instagram dalla galleria.`,
        variant: 'success',
      })
    },
    [addToast],
  )

  const handleDownloadOnly = useCallback(async () => {
    const el = captureRef.current
    if (!el) return
    setExportLoading(true)
    try {
      const out = await captureAndExport(el, exportPreset)
      if (!out) throw new Error('toBlob_null')
      downloadBlob(out.blob, exportPreset)
    } catch (err) {
      logger.error('Download PNG Instagram', err)
      addToast({
        title: 'Errore',
        message: "Impossibile generare l'immagine. Riprova.",
        variant: 'error',
      })
    } finally {
      setExportLoading(false)
    }
  }, [addToast, downloadBlob, exportPreset])

  const handlePublish = useCallback(async () => {
    const el = captureRef.current
    if (!el) return
    setExportLoading(true)
    try {
      const out = await captureAndExport(el, exportPreset)
      if (!out) throw new Error('toBlob_null')
      downloadBlob(out.blob, exportPreset)
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    } catch (err) {
      logger.error('Pubblica Instagram', err)
      addToast({
        title: 'Errore',
        message: "Impossibile generare l'immagine. Riprova.",
        variant: 'error',
      })
    } finally {
      setExportLoading(false)
    }
  }, [addToast, downloadBlob, exportPreset])

  const aspectRatioStyle = `${exportPreset.width} / ${exportPreset.height}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'mx-4 my-4 max-h-[min(92dvh,900px)] overflow-y-auto overflow-x-hidden',
          'max-w-[min(100vw-2rem,24rem)] min-[480px]:max-w-xl md:max-w-2xl',
        )}
      >
        <DialogHeader className="space-y-2 pr-10">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <DialogTitle className="text-left">Post Instagram</DialogTitle>
            <span className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
              {exportPreset.sub}
            </span>
          </div>
          <DialogDescription className="text-left text-text-secondary">
            Controlla l’anteprima, poi scarica o pubblica su Instagram (formato Storie 9:16).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
            Anteprima
          </p>
          <div
            className={cn(
              'relative flex w-full max-w-full items-center justify-center overflow-hidden rounded-2xl',
              'border border-cyan-500/20 bg-zinc-950/90 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
              'min-h-[160px] sm:min-h-[200px]',
            )}
            style={{
              aspectRatio: aspectRatioStyle,
              maxHeight: 'min(52vh, 520px)',
            }}
          >
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Spinner size="lg" className="border-white/25 border-t-cyan-400 text-cyan-400" />
                <span className="text-sm text-text-tertiary">Aggiornamento anteprima…</span>
              </div>
            ) : previewDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL da canvas
              <img
                src={previewDataUrl}
                alt={`Anteprima ${exportPreset.sub}`}
                className="h-full w-full rounded-xl object-contain shadow-[0_8px_40px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
              />
            ) : (
              <p className="px-4 text-center text-sm text-text-tertiary">
                Anteprima non disponibile
              </p>
            )}
          </div>

          {INSTAGRAM_EXPORT_PRESETS.length > 1 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Formato export
              </p>
              <div className="flex flex-wrap gap-2">
                {INSTAGRAM_EXPORT_PRESETS.map((p) => {
                  const selected = p.id === exportPresetId
                  return (
                    <Button
                      key={p.id}
                      type="button"
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      className={cn(
                        'h-auto min-h-9 flex-col gap-0.5 py-2 px-3 text-left sm:flex-row sm:items-center sm:gap-2',
                        selected && 'ring-2 ring-cyan-500/40',
                      )}
                      onClick={() => setExportPresetId(p.id)}
                    >
                      <span className="text-xs font-semibold leading-tight">{p.label}</span>
                      <span
                        className={cn(
                          'text-[10px] font-medium leading-tight',
                          selected ? 'text-primary-foreground/80' : 'text-text-tertiary',
                        )}
                      >
                        {p.sub}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none fixed left-[-14000px] top-0 z-0" aria-hidden>
          <WorkoutInstagramShareTarget
            ref={captureRef}
            {...shareProps}
            sections={DEFAULT_INSTAGRAM_SHARE_SECTIONS}
          />
        </div>

        <DialogFooter className="mt-6 flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="order-3 w-full sm:order-1 sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Chiudi
          </Button>
          <Button
            type="button"
            variant="outline"
            className="order-2 w-full sm:order-2 sm:w-auto"
            disabled={exportLoading || previewLoading}
            onClick={() => void handleDownloadOnly()}
          >
            Scarica PNG
          </Button>
          <Button
            type="button"
            className="order-1 w-full gap-2 sm:order-3 sm:w-auto"
            disabled={exportLoading || previewLoading}
            onClick={() => void handlePublish()}
          >
            <Instagram className="h-4 w-4 shrink-0" aria-hidden />
            Pubblica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
