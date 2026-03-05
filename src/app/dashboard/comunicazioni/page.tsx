'use client'

import { useState, useCallback, lazy, Suspense } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { AlertCircle, Bell, Mail, MessageSquare } from 'lucide-react'
import { useCommunicationsPage } from '@/hooks/communications/use-communications-page'
import {
  CommunicationsHeader,
  CommunicationsSearch,
  CommunicationsList,
} from '@/components/communications'
import { LoadingState } from '@/components/dashboard/loading-state'

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

export default function ComunicazioniPage() {
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
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-linear-to-br from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-linear-to-tl from-indigo-500/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <CommunicationsHeader onNewCommunication={openNewModal} />

        {/* Error State con retry */}
        {error && (
          <Card variant="trainer" className="border-red-500/30 bg-red-500/10">
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="pills">
            <TabsTrigger value="tutte" variant="pills">
              Tutte
            </TabsTrigger>
            <TabsTrigger value="push" variant="pills">
              <Bell className="mr-2 h-4 w-4" />
              Push
            </TabsTrigger>
            <TabsTrigger value="email" variant="pills">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms" variant="pills">
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS
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
          <Suspense fallback={<LoadingState message="Caricamento dettagli destinatari..." />}>
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
          <Suspense fallback={<LoadingState message="Caricamento form comunicazione..." />}>
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
      </div>
    </div>
  )
}
