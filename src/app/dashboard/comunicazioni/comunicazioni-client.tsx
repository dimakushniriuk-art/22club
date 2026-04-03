'use client'

import { useState, useCallback, lazy, Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, Button } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { AlertCircle, Plus, FileText } from 'lucide-react'
import { useCommunicationsPage } from '@/hooks/communications/use-communications-page'
import { CommunicationsSearch, CommunicationsList } from '@/components/communications'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffLazyChunkFallback } from '@/components/layout/route-loading-skeletons'

// Lazy load modali per ridurre bundle size iniziale
const NewCommunicationModal = lazy(() =>
  import('@/components/communications').then((mod) => ({
    default: mod.NewCommunicationModal,
  })),
)
const RecipientsDetailModal = lazy(() =>
  import('@/components/communications').then((mod) => ({
    default: mod.RecipientsDetailModal,
  })),
)

export default function ComunicazioniPageClient() {
  const {
    communications,
    totalCount,
    currentPage,
    totalPages,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    formType,
    setFormType,
    formTitle,
    setFormTitle,
    formMessage,
    setFormMessage,
    formRecipientFilter,
    setFormRecipientFilter,
    formSelectedAthletes,
    setFormSelectedAthletes,
    formScheduled,
    setFormScheduled,
    formScheduledDate,
    setFormScheduledDate,
    formLoading,
    recipientCount,
    editingCommunicationId,
    handleCreateCommunication,
    handleUpdateCommunication,
    handleEditCommunication,
    handleSendCommunication,
    handleResetCommunication,
    handleDeleteCommunication,
    handleNextPage,
    handlePrevPage,
    handlePageChange,
    getTipoIcon,
    getStatoBadge,
    formatData,
    refetchCommunications,
  } = useCommunicationsPage()

  const [showNewModal, setShowNewModal] = useState(false)
  const [showRecipientsModal, setShowRecipientsModal] = useState(false)
  const [selectedCommunicationId, setSelectedCommunicationId] = useState<string | null>(null)
  const [selectedCommunicationTitle, setSelectedCommunicationTitle] = useState<string>('')

  const openNewModal = useCallback(() => setShowNewModal(true), [])

  const closeRecipientsModal = useCallback(() => {
    setShowRecipientsModal(false)
    setSelectedCommunicationId(null)
    setSelectedCommunicationTitle('')
  }, [])

  const closeNewModal = useCallback(() => {
    setShowNewModal(false)
    if (editingCommunicationId) {
      handleEditCommunication('')
    }
  }, [editingCommunicationId, handleEditCommunication])

  const handleViewDetails = useCallback(
    (id: string) => {
      const comm = communications.find((c) => c.id === id)
      if (comm) {
        setSelectedCommunicationId(id)
        setSelectedCommunicationTitle(comm.title)
        setShowRecipientsModal(true)
      }
    },
    [communications],
  )

  const handleEditAndOpenModal = useCallback(
    (id: string) => {
      handleEditCommunication(id)
      setShowNewModal(true)
    },
    [handleEditCommunication],
  )

  const handleCreateDraft = useCallback(() => {
    if (editingCommunicationId) {
      handleUpdateCommunication(false).then(() => setShowNewModal(false))
    } else {
      handleCreateCommunication(false).then(() => setShowNewModal(false))
    }
  }, [editingCommunicationId, handleUpdateCommunication, handleCreateCommunication])

  const handleCreateAndSend = useCallback(() => {
    if (editingCommunicationId) {
      handleUpdateCommunication(true).then(() => setShowNewModal(false))
    } else {
      handleCreateCommunication(true).then(() => setShowNewModal(false))
    }
  }, [editingCommunicationId, handleUpdateCommunication, handleCreateCommunication])

  return (
    <StaffContentLayout
      title="Comunicazioni"
      description="Messaggi e campagne email verso gli atleti."
      theme="teal"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/comunicazioni/template">
              <FileText className="mr-2 h-4 w-4" />
              Template email
            </Link>
          </Button>
          <Button variant="primary" onClick={openNewModal}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Comunicazione
          </Button>
        </div>
      }
    >
      {/* Error State con retry */}
      {error && (
        <Card variant="outlined" className="border-red-500/40 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>Errore: {error.message}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCommunications()}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 shrink-0"
              >
                Riprova
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CommunicationsSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList variant="pills">
          <TabsTrigger value="tutte" variant="pills">
            Tutti
          </TabsTrigger>
          <TabsTrigger value="sent" variant="pills">
            Inviati
          </TabsTrigger>
          <TabsTrigger value="delivered" variant="pills">
            Consegnati
          </TabsTrigger>
          <TabsTrigger value="pending" variant="pills">
            In attesa
          </TabsTrigger>
          <TabsTrigger value="failed" variant="pills">
            Falliti
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <CommunicationsList
            activeTab={activeTab}
            communications={communications}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            loading={loading}
            onNewCommunication={openNewModal}
            onSend={handleSendCommunication}
            onEdit={handleEditAndOpenModal}
            onReset={handleResetCommunication}
            onDelete={handleDeleteCommunication}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onPageChange={handlePageChange}
            onViewDetails={handleViewDetails}
            getTipoIcon={getTipoIcon}
            getStatoBadge={getStatoBadge}
            formatData={formatData}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Dettaglio Recipients - Lazy loaded solo quando aperto */}
      {selectedCommunicationId && (
        <Suspense fallback={<StaffLazyChunkFallback className="min-h-[200px] max-w-md mx-auto" label="Caricamento…" />}>
          <RecipientsDetailModal
            isOpen={showRecipientsModal}
            onClose={closeRecipientsModal}
            communicationId={selectedCommunicationId}
            communicationTitle={selectedCommunicationTitle}
          />
        </Suspense>
      )}

      {/* Modal Nuova/Modifica Comunicazione - Lazy loaded solo quando aperto */}
      {showNewModal && (
        <Suspense fallback={<StaffLazyChunkFallback className="min-h-[280px] max-w-lg mx-auto" label="Caricamento…" />}>
          <NewCommunicationModal
            isOpen={showNewModal}
            isEditing={!!editingCommunicationId}
            onClose={closeNewModal}
            formType={formType}
            formTitle={formTitle}
            formMessage={formMessage}
            formRecipientFilter={formRecipientFilter}
            formSelectedAthletes={formSelectedAthletes}
            formScheduled={formScheduled}
            formScheduledDate={formScheduledDate}
            formLoading={formLoading}
            recipientCount={recipientCount}
            onFormTypeChange={setFormType}
            onFormTitleChange={setFormTitle}
            onFormMessageChange={setFormMessage}
            onFormRecipientFilterChange={setFormRecipientFilter}
            onFormSelectedAthletesChange={setFormSelectedAthletes}
            onFormScheduledChange={setFormScheduled}
            onFormScheduledDateChange={setFormScheduledDate}
            onCreateDraft={handleCreateDraft}
            onCreateAndSend={handleCreateAndSend}
          />
        </Suspense>
      )}
    </StaffContentLayout>
  )
}
