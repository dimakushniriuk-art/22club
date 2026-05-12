'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Instagram } from 'lucide-react'
import { WorkoutShareCard } from '@/components/workouts/WorkoutShareCard'
import { createLogger } from '@/lib/logger'
import {
  buildWorkoutShareFilename,
  exportWorkoutShareCardToPng,
  workoutShareCardPreviewPng,
} from '@/lib/workouts/exportWorkoutShareCard'
import type { WorkoutShareCardProps } from '@/lib/workouts/workout-share-types'
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

const logger = createLogger('app:home:allenamenti:riepilogo:workout-share')

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Incrementa quando cambiano i dati del riepilogo (anteprima aggiornata). */
  shareRevision: string
  data: WorkoutShareCardProps | null
}

export function WorkoutSharePreviewDialog({ open, onOpenChange, shareRevision, data }: Props) {
  const { addToast } = useToast()
  const captureRef = useRef<HTMLDivElement>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const previewDelayMs = useMemo(() => {
    const ex = data?.exercises ?? []
    return ex.some((l) => Boolean(l.videoUrl)) ? 650 : 320
  }, [data])

  const runPreview = useCallback(async () => {
    const el = captureRef.current
    if (!el || !data) return
    setPreviewLoading(true)
    try {
      const png = await workoutShareCardPreviewPng(el)
      setPreviewDataUrl(png)
    } catch (err) {
      logger.error('Anteprima achievement card', err)
      setPreviewDataUrl(null)
    } finally {
      setPreviewLoading(false)
    }
  }, [data])

  useEffect(() => {
    if (!open) {
      setPreviewDataUrl(null)
      return
    }
    const t = window.setTimeout(() => {
      void runPreview()
    }, previewDelayMs)
    return () => window.clearTimeout(t)
  }, [open, shareRevision, previewDelayMs, runPreview])

  const downloadBlob = useCallback(
    (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      addToast({
        title: 'Immagine pronta',
        message: `PNG 1080×1080 salvato: ${filename}`,
        variant: 'success',
      })
    },
    [addToast],
  )

  const handleSaveImage = useCallback(async () => {
    const el = captureRef.current
    if (!el || !data) return
    setExportLoading(true)
    try {
      const blob = await exportWorkoutShareCardToPng(el)
      const name = buildWorkoutShareFilename(data.completedAtIso, data.workoutTitle)
      downloadBlob(blob, name)
    } catch (err) {
      logger.error('Export PNG achievement card', err)
      addToast({
        title: 'Errore',
        message: "Impossibile generare l'immagine. Riprova.",
        variant: 'error',
      })
    } finally {
      setExportLoading(false)
    }
  }, [addToast, data, downloadBlob])

  const handleShareInstagram = useCallback(async () => {
    const el = captureRef.current
    if (!el || !data) return
    setExportLoading(true)
    try {
      const blob = await exportWorkoutShareCardToPng(el)
      const name = buildWorkoutShareFilename(data.completedAtIso, data.workoutTitle)
      downloadBlob(blob, name)
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    } catch (err) {
      logger.error('Condividi achievement card', err)
      addToast({
        title: 'Errore',
        message: "Impossibile generare l'immagine. Riprova.",
        variant: 'error',
      })
    } finally {
      setExportLoading(false)
    }
  }, [addToast, data, downloadBlob])

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
            <DialogTitle className="text-left">Condividi risultati</DialogTitle>
            <span className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
              1080×1080 · 1:1
            </span>
          </div>
          <DialogDescription className="text-left text-text-secondary">
            Achievement card 22Club per il feed Instagram: anteprima e salva in PNG ad alta qualità.
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
              aspectRatio: '1 / 1',
              maxHeight: 'min(52vh, 520px)',
            }}
          >
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Spinner size="lg" className="border-white/25 border-t-cyan-400 text-cyan-400" />
                <span className="text-sm text-text-tertiary">Generazione anteprima…</span>
              </div>
            ) : previewDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL da export
              <img
                src={previewDataUrl}
                alt="Anteprima achievement card"
                className="h-full w-full rounded-xl object-contain shadow-[0_8px_40px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
              />
            ) : (
              <p className="px-4 text-center text-sm text-text-tertiary">
                Anteprima non disponibile
              </p>
            )}
          </div>
        </div>

        <div className="pointer-events-none fixed left-[-14000px] top-0 z-0" aria-hidden>
          {data ? <WorkoutShareCard ref={captureRef} {...data} /> : null}
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
            disabled={exportLoading || previewLoading || !data}
            onClick={() => void handleSaveImage()}
          >
            Salva immagine
          </Button>
          <Button
            type="button"
            className="order-1 w-full gap-2 sm:order-3 sm:w-auto"
            disabled={exportLoading || previewLoading || !data}
            onClick={() => void handleShareInstagram()}
          >
            <Instagram className="h-4 w-4 shrink-0" aria-hidden />
            Condividi su Instagram
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** @deprecated Usare WorkoutSharePreviewDialog */
export const WorkoutInstagramSharePreviewDialog = WorkoutSharePreviewDialog
