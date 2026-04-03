'use client'

import { useCallback, useState } from 'react'

export type UsePdfPreviewDialogResult = {
  open: boolean
  blob: Blob | null
  filename: string | null
  loading: boolean
  setLoading: (v: boolean) => void
  openWithBlob: (blob: Blob, filename: string) => void
  close: () => void
  onOpenChange: (next: boolean) => void
}

/**
 * Stato per PdfCanvasPreviewDialog: blob, nome file, loading generazione, open/close coerente.
 */
export function usePdfPreviewDialog(): UsePdfPreviewDialogResult {
  const [open, setOpen] = useState(false)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    setBlob(null)
    setFilename(null)
    setLoading(false)
  }, [])

  const openWithBlob = useCallback((nextBlob: Blob, nextFilename: string) => {
    setBlob(nextBlob)
    setFilename(nextFilename)
    setOpen(true)
  }, [])

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!next) close()
      else setOpen(true)
    },
    [close],
  )

  return {
    open,
    blob,
    filename,
    loading,
    setLoading,
    openWithBlob,
    close,
    onOpenChange,
  }
}
