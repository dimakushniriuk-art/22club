'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:documenti:page')
import { Button } from '@/components/ui'
import { Upload } from 'lucide-react'
import { useDocumentsFilters } from '@/hooks/use-documents-filters'
import { DocumentsFilters } from '@/components/dashboard/documenti/documents-filters'
import { DocumentsTable } from '@/components/dashboard/documenti/documents-table'
import { DocumentsStatsCards } from '@/components/dashboard/documenti/documents-stats-cards'
import {
  documentsFilePreviewHref,
  extractFileName,
  fetchDocumentBlobViaPreview,
} from '@/lib/documents'
import { useDocuments } from '@/hooks/use-documents'
import { useToast } from '@/components/ui/toast'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import type { Document } from '@/types/document'

// Lazy load modali per ridurre bundle size iniziale
const DocumentDetailDrawer = lazy(() =>
  import('@/components/dashboard/documenti/document-detail-drawer').then((mod) => ({
    default: mod.DocumentDetailDrawer,
  })),
)
const DocumentInvalidModal = lazy(() =>
  import('@/components/dashboard/documenti/document-invalid-modal').then((mod) => ({
    default: mod.DocumentInvalidModal,
  })),
)

export default function DocumentiPage() {
  const searchParams = useSearchParams()
  const athleteIdFromQuery = searchParams.get('atleta')

  const {
    documents: fetchedDocuments,
    loading,
    error,
  } = useDocuments({
    athleteId: athleteIdFromQuery,
  })

  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [showInvalidModal, setShowInvalidModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Hook per filtri
  const {
    searchTerm,
    statusFilter,
    categoryFilter,
    filteredDocuments,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    resetFilters,
  } = useDocumentsFilters(documents)

  const { addToast } = useToast()

  useEffect(() => {
    // Durante il loading React Query può restituire un array "di default"
    // con riferimento diverso ad ogni render: evita di fare setState in loop.
    if (loading) return
    setDocuments(fetchedDocuments)
  }, [fetchedDocuments, loading])

  useEffect(() => {
    if (!error) return
    logger.error('Errore caricamento documenti', error)
    addToast({
      title: 'Errore',
      message: error,
      variant: 'error',
    })
  }, [addToast, error])

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc)
    setShowDrawer(true)
  }

  const handlePreview = (doc: Document) => {
    if (!doc.file_url) return
    const href = documentsFilePreviewHref(doc.file_url, { redirectForNavigation: true })
    if (href) window.open(href, '_blank', 'noopener,noreferrer')
  }

  const handleMarkInvalid = () => {
    if (!selectedDocument || !rejectionReason.trim()) return

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === selectedDocument.id
          ? { ...doc, status: 'non_valido', notes: rejectionReason }
          : doc,
      ),
    )

    setShowInvalidModal(false)
    setRejectionReason('')
    setShowDrawer(false)
    setSelectedDocument(null)
  }

  const handleDownload = (doc: Document) => {
    if (!doc.file_url) return

    const fileName = doc.file_name || extractFileName(doc.file_url)

    void (async () => {
      try {
        const blob = await fetchDocumentBlobViaPreview(doc.file_url)
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
        const href = documentsFilePreviewHref(doc.file_url, { redirectForNavigation: true })
        if (href) window.open(href, '_blank', 'noopener,noreferrer')
      }
    })()
  }

  if (loading) {
    return (
      <StaffContentLayout
        title="Documenti Atleti"
        description="Gestisci certificati, liberatorie e contratti"
        theme="teal"
        onBack={() => window.history.back()}
      >
        {null}
      </StaffContentLayout>
    )
  }

  return (
    <>
      <StaffContentLayout
        title="Documenti Atleti"
        description="Gestisci certificati, liberatorie e contratti"
        theme="teal"
        onBack={() => window.history.back()}
        actions={
          <Button variant="primary" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Carica Documento
          </Button>
        }
      >
        <div className="space-y-4 sm:space-y-6">
          {/* Filtri */}
          <DocumentsFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onCategoryFilterChange={setCategoryFilter}
            onReset={resetFilters}
          />

          {/* Tabella documenti */}
          <DocumentsTable
            documents={filteredDocuments}
            onDocumentClick={handleDocumentClick}
            onPreview={handlePreview}
            onDownload={handleDownload}
          />

          {/* Statistiche rapide */}
          <DocumentsStatsCards documents={documents} />
        </div>
      </StaffContentLayout>

      {/* Drawer dettaglio documento - Lazy loaded solo quando aperto */}
      {showDrawer && selectedDocument && (
        <Suspense fallback={null}>
          <DocumentDetailDrawer
            document={selectedDocument}
            open={showDrawer}
            onClose={() => {
              setShowDrawer(false)
              setSelectedDocument(null)
            }}
            onDownload={handleDownload}
            onMarkInvalid={() => setShowInvalidModal(true)}
          />
        </Suspense>
      )}

      {/* Modal segnalazione non valido - Lazy loaded solo quando aperto */}
      {showInvalidModal && (
        <Suspense fallback={null}>
          <DocumentInvalidModal
            open={showInvalidModal}
            rejectionReason={rejectionReason}
            onRejectionReasonChange={setRejectionReason}
            onConfirm={handleMarkInvalid}
            onCancel={() => {
              setShowInvalidModal(false)
              setRejectionReason('')
            }}
          />
        </Suspense>
      )}
    </>
  )
}
