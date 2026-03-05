'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:documenti:page')
import { Button } from '@/components/ui'
import { Upload } from 'lucide-react'
import { mockDocuments } from '@/data/mock-documents-data'
import { useDocumentsFilters } from '@/hooks/use-documents-filters'
import { DocumentsFilters } from '@/components/dashboard/documenti/documents-filters'
import { DocumentsTable } from '@/components/dashboard/documenti/documents-table'
import { DocumentsStatsCards } from '@/components/dashboard/documenti/documents-stats-cards'
import { extractFileName } from '@/lib/documents'
import { LoadingState } from '@/components/dashboard/loading-state'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
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
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [showInvalidModal, setShowInvalidModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(true)

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

  // Carica documenti reali da Supabase invece di mock data
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Errore caricamento documenti', error)
          addToast({
            title: 'Errore',
            message: 'Errore durante il caricamento dei documenti',
            variant: 'error',
          })
          setLoading(false)
          return
        }

        setDocuments((data as Document[]) || [])
      } catch (err) {
        logger.error('Errore caricamento documenti', err)
        addToast({
          title: 'Errore',
          message: err instanceof Error ? err.message : 'Errore durante il caricamento dei documenti',
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [addToast])

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document)
    setShowDrawer(true)
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

  const handleDownload = (document: Document) => {
    logger.debug('Download document', undefined, {
      fileName: extractFileName(document.file_url),
      documentId: document.id,
    })
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <div className="animate-pulse space-y-4">
            <div className="bg-background-tertiary h-8 w-64 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-background-tertiary h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-500/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Documenti Atleti
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Gestisci certificati, liberatorie e contratti
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200">
            <Upload className="mr-2 h-4 w-4" />
            Carica Documento
          </Button>
        </div>

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
          onDownload={handleDownload}
        />

        {/* Statistiche rapide */}
        <DocumentsStatsCards documents={documents} />
      </div>

      {/* Drawer dettaglio documento - Lazy loaded solo quando aperto */}
      {showDrawer && selectedDocument && (
        <Suspense fallback={<LoadingState message="Caricamento dettagli documento..." />}>
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
        <Suspense fallback={<LoadingState message="Caricamento modal..." />}>
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
    </div>
  )
}
