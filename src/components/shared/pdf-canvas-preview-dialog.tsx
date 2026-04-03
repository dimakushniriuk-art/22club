'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { createPdfObjectUrl } from '@/lib/export-utils'
import { renderPdfBlobToHostSafe } from '@/lib/pdf'

export type PdfCanvasPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  blob: Blob | null
  filename: string | null
  title?: string
  description?: string
}

/**
 * Anteprima PDF (canvas via PDF.js) + download. Revoca gli object URL quando cambia il blob o alla chiusura.
 */
export function PdfCanvasPreviewDialog({
  open,
  onOpenChange,
  blob,
  filename,
  title = 'Anteprima PDF',
  description = 'Puoi visualizzare il report e scaricarlo come file.',
}: PdfCanvasPreviewDialogProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!blob) {
      setDownloadUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const u = createPdfObjectUrl(blob)
    setDownloadUrl((prev) => {
      if (prev) window.URL.revokeObjectURL(prev)
      return u
    })
  }, [blob])

  useEffect(() => {
    if (!open || !blob) {
      setLoading(false)
      setError(null)
      if (hostRef.current) hostRef.current.innerHTML = ''
      return
    }

    const host = hostRef.current
    if (!host) return

    let cancelled = false
    setError(null)
    setLoading(true)
    host.innerHTML = ''

    void (async () => {
      const result = await renderPdfBlobToHostSafe(blob, host)
      if (cancelled) return
      if (!result.ok) setError(result.message)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [open, blob])

  const handleClose = (next: boolean) => {
    if (!next && hostRef.current) hostRef.current.innerHTML = ''
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative min-h-[60dvh] rounded-lg border border-border bg-black/20 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/40 text-text-secondary">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" aria-hidden />
              <p className="text-sm">Caricamento anteprima…</p>
            </div>
          )}
          {error && !loading && (
            <div className="flex h-[60dvh] flex-col items-center justify-center gap-2 px-4 text-center text-text-secondary">
              <p>Anteprima non disponibile.</p>
              <p className="text-xs text-text-tertiary">{error}</p>
              <p className="text-xs text-text-tertiary">
                Usa «Scarica PDF» per aprire il file con un visualizzatore esterno.
              </p>
            </div>
          )}
          <div
            ref={hostRef}
            className="max-h-[60dvh] overflow-y-auto p-2"
            hidden={Boolean(error) && !loading}
          />
        </div>

        <DialogFooter className="justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
              Chiudi
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (!downloadUrl || !filename) return
                const link = document.createElement('a')
                link.href = downloadUrl
                link.download = filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              disabled={!downloadUrl || !filename}
            >
              Scarica PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
