// ============================================================
// Componente Tab Documenti Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { FileText, ArrowLeft, AlertCircle } from 'lucide-react'
import { useStaffAthleteUnifiedDocuments } from '@/hooks/use-staff-athlete-unified-documents'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { DocumentsTable } from '@/components/dashboard/documenti/documents-table'
import type { Document } from '@/types/document'
import {
  documentPreviewHrefForRow,
  extractFileName,
  fetchDocumentBlobForRow,
} from '@/lib/documents'

interface AthleteDocumentsTabProps {
  athleteId: string
  documentiScadenza: number
}

export function AthleteDocumentsTab({ athleteId, documentiScadenza }: AthleteDocumentsTabProps) {
  const {
    data: documents = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useStaffAthleteUnifiedDocuments(athleteId)

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Errore nel caricamento dei documenti'
    : null

  const handleRetry = () => {
    void refetch()
  }

  const handlePreview = (doc: Document) => {
    const href = documentPreviewHrefForRow(doc)
    if (href) window.open(href, '_blank', 'noopener,noreferrer')
  }

  const handleDownload = async (doc: Document) => {
    const previewHref = documentPreviewHrefForRow(doc)
    if (!previewHref && !doc.file_url) return

    const fileName =
      doc.display_file_name?.trim() ||
      doc.file_name ||
      extractFileName(doc.file_url) ||
      'documento'

    try {
      const blob = await fetchDocumentBlobForRow(doc)
      const objectUrl = window.URL.createObjectURL(blob)

      const a = globalThis.document.createElement('a')
      a.href = objectUrl
      a.download = fileName
      a.rel = 'noopener noreferrer'
      globalThis.document.body.appendChild(a)
      a.click()
      globalThis.document.body.removeChild(a)

      window.URL.revokeObjectURL(objectUrl)
    } catch {
      if (previewHref) window.open(previewHref, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card variant="default" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-text-primary text-xl font-bold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documenti
            </h3>
            <p className="text-text-secondary text-sm">
              Certificati, liberatorie, contratti, fatture, piani nutrizionali, chat e altri file
            </p>
            <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
          </div>
          <Link href={`/dashboard/documenti?atleta=${athleteId}`}>
            <Button variant="default" size="sm">
              Vedi tutti i documenti
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          </Link>
        </div>

        {documentiScadenza > 0 && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-lg border border-destructive/30 bg-destructive/15 text-destructive flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-destructive font-semibold mb-1">
                  {documentiScadenza} {documentiScadenza === 1 ? 'documento' : 'documenti'} in
                  scadenza
                </p>
                <p className="text-text-secondary text-sm">
                  Richiedi il rinnovo dei documenti scaduti o in scadenza
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingState message="Caricamento documenti..." className="py-10" size="md" />
        ) : error ? (
          <ErrorState
            title="Impossibile caricare i documenti"
            message={error}
            onRetry={handleRetry}
          />
        ) : documents.length > 0 ? (
          <DocumentsTable
            documents={documents}
            onDocumentClick={(doc) => handlePreview(doc)}
            onDownload={(doc) => void handleDownload(doc)}
          />
        ) : (
          <div className="text-center py-12">
            <div className="rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/10 bg-white/[0.04] text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-text-primary font-medium mb-2">Nessun documento in elenco</p>
            <p className="text-text-secondary text-sm mb-4">
              Carica certificati e liberatorie dalla pagina documenti o verifica i filtri in sede.
            </p>
            <Link href={`/dashboard/documenti?atleta=${athleteId}`}>
              <Button variant="default" size="sm">
                Vai alla gestione documenti
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
