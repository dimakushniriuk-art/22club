// ============================================================
// Hook per gestione pagina comunicazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:communications:use-communications-page')
import {
  useCommunications,
  type CreateCommunicationInput,
  type UpdateCommunicationInput,
} from '@/hooks/use-communications'
import { useToast } from '@/components/ui/toast'
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui'

const ITEMS_PER_PAGE = 10 // Numero di comunicazioni per pagina

export function useCommunicationsPage() {
  const { addToast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(ITEMS_PER_PAGE)
  const [activeTab, setActiveTab] = useState('tutte')
  const [searchTerm, setSearchTerm] = useState('')

  // Determina il tipo di comunicazione da filtrare (undefined = tutte)
  const filterType =
    activeTab === 'tutte' ? undefined : (activeTab as 'push' | 'email' | 'sms' | 'all')

  const {
    communications,
    totalCount,
    loading,
    error,
    createCommunication,
    updateCommunication,
    sendCommunication,
    resetCommunication,
    deleteCommunication,
    fetchCommunications,
  } = useCommunications({
    autoRefresh: true,
    type: filterType,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  })
  const [formType, setFormType] = useState<'push' | 'email' | 'sms' | 'all'>('push')
  const [formTitle, setFormTitle] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formRecipientFilter, setFormRecipientFilter] = useState<'all' | 'atleti' | 'custom'>('all')
  const [formSelectedAthletes, setFormSelectedAthletes] = useState<string[]>([]) // athlete_ids selezionati
  const [formScheduled, setFormScheduled] = useState(false)
  const [formScheduledDate, setFormScheduledDate] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [editingCommunicationId, setEditingCommunicationId] = useState<string | null>(null)

  // Reset alla prima pagina quando cambia filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Calcola paginazione
  const totalPages = totalCount ? Math.ceil(totalCount / itemsPerPage) : 1
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [hasNextPage])

  const handlePrevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }, [hasPrevPage])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
      }
    },
    [totalPages],
  )

  // Filtra comunicazioni per searchTerm (il filtro type è già applicato lato server)
  // Nota: La ricerca client-side può essere migliorata in futuro con ricerca lato server
  const filteredCommunications = useMemo(() => {
    if (!searchTerm) {
      return communications
    }

    const term = searchTerm.toLowerCase()
    return communications.filter(
      (c) => c.title.toLowerCase().includes(term) || c.message.toLowerCase().includes(term),
    )
  }, [communications, searchTerm])

  // Controllo periodico per comunicazioni bloccate in "sending"
  // Ottimizzato: controlla solo quando la pagina è visibile e aumenta intervallo a 5 minuti
  useEffect(() => {
    const checkStuckCommunications = async () => {
      // Controlla solo se la pagina è visibile
      if (document.visibilityState === 'hidden') {
        return
      }

      // Controlla se ci sono comunicazioni in stato "sending" (potrebbero essere bloccate)
      const stuck = communications.filter((c) => c.status === 'sending')
      if (stuck.length === 0) return

      try {
        const response = await fetch('/api/communications/check-stuck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (response.ok) {
          // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
          const text = await response.text()
          if (!text || text.trim().length === 0) {
            logger.warn('Risposta vuota da /api/communications/check-stuck')
            return
          }
          const result = JSON.parse(text)
          if (result.reset > 0) {
            // Refresh automatico se sono state resetate comunicazioni bloccate
            await fetchCommunications()
          }
        }
      } catch (error) {
        logger.error('Error checking stuck communications', error)
      }
    }

    // Controlla ogni 5 minuti (invece di 2) per ridurre chiamate API
    const interval = setInterval(checkStuckCommunications, 5 * 60 * 1000)

    // Controlla subito al mount se la pagina è visibile
    if (document.visibilityState === 'visible') {
      checkStuckCommunications()
    }

    // Ricontrolla quando la pagina diventa visibile
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStuckCommunications()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [communications, fetchCommunications])

  // Re-fetch quando cambia pagina (useCommunications si aggiorna automaticamente quando cambiano options)

  // Calcola count destinatari quando cambia il filtro
  useEffect(() => {
    const calculateRecipientCount = async () => {
      try {
        let filter: { all_users?: boolean; role?: string; athlete_ids?: string[] } | null = null

        if (formRecipientFilter === 'all') {
          filter = { all_users: true }
        } else if (formRecipientFilter === 'atleti') {
          filter = { role: 'atleta' }
        } else if (formRecipientFilter === 'custom') {
          // Per atleti specifici, il count è il numero di atleti selezionati
          setRecipientCount(formSelectedAthletes.length)
          return
        } else {
          setRecipientCount(null)
          return
        }

        // Chiama API route per calcolare count (usa service role key lato server)
        const response = await fetch('/api/communications/count-recipients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filter }),
        })

        if (!response.ok) {
          logger.error('Error counting recipients', undefined, {
            status: response.status,
            statusText: response.statusText,
          })
          setRecipientCount(null)
          return
        }

        // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
        const text = await response.text()
        if (!text || text.trim().length === 0) {
          logger.warn('Risposta vuota da /api/communications/count-recipients')
          setRecipientCount(0)
          return
        }
        const data = JSON.parse(text)
        setRecipientCount(data.count || 0)
      } catch (error) {
        logger.error('Error calculating recipient count', error)
        setRecipientCount(null)
      }
    }

    calculateRecipientCount()
  }, [formRecipientFilter, formSelectedAthletes])

  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo) {
      case 'push':
        return <Bell className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'sms':
        return <MessageSquare className="h-4 w-4" />
      case 'all':
        return <Send className="h-4 w-4" />
      default:
        return <Send className="h-4 w-4" />
    }
  }, [])

  const getStatoBadge = useCallback((stato: string) => {
    switch (stato) {
      case 'sent':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle className="mr-1 h-3 w-3" />
            Inviato
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="primary" size="sm">
            <Clock className="mr-1 h-3 w-3" />
            Bozza
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant="warning" size="sm">
            <Calendar className="mr-1 h-3 w-3" />
            Programmato
          </Badge>
        )
      case 'sending':
        return (
          <Badge variant="warning" size="sm">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Invio in corso
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive" size="sm">
            <AlertCircle className="mr-1 h-3 w-3" />
            Fallito
          </Badge>
        )
      default:
        return <Badge size="sm">{stato}</Badge>
    }
  }, [])

  const formatData = useCallback((dataString: string | null) => {
    if (!dataString) return 'Non inviato'
    return new Date(dataString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const handleCreateCommunication = useCallback(
    async (sendNow: boolean) => {
      if (!formTitle.trim() || !formMessage.trim()) {
        addToast({
          variant: 'error',
          title: 'Validazione fallita',
          message: 'Compila tutti i campi obbligatori',
        })
        return
      }

      setFormLoading(true)

      try {
        const recipientFilter: CreateCommunicationInput['recipient_filter'] =
          formRecipientFilter === 'all'
            ? { all_users: true }
            : formRecipientFilter === 'atleti'
              ? { role: 'atleta' }
              : formRecipientFilter === 'custom'
                ? { athlete_ids: formSelectedAthletes }
                : { all_users: true }

        const input: CreateCommunicationInput = {
          title: formTitle,
          message: formMessage,
          type: formType,
          recipient_filter: recipientFilter,
          scheduled_for: formScheduled && formScheduledDate ? formScheduledDate : null,
        }

        const result = await createCommunication(input)

        if (result) {
          if (sendNow && !formScheduled) {
            const sendResult = await sendCommunication(result.id)
            if (!sendResult.success && sendResult.error) {
              addToast({
                variant: 'error',
                title: 'Errore invio',
                message: sendResult.error,
              })
            } else {
              addToast({
                variant: 'success',
                title: 'Comunicazione inviata',
                message: 'La comunicazione è stata creata e inviata con successo',
              })
            }
          } else {
            addToast({
              variant: 'success',
              title: 'Comunicazione creata',
              message: 'La comunicazione è stata salvata come bozza',
            })
          }

          setFormTitle('')
          setFormMessage('')
          setFormScheduled(false)
          setFormScheduledDate('')
          setFormSelectedAthletes([])
          setFormRecipientFilter('all')

          await fetchCommunications()
        }
      } catch (err) {
        logger.error('Error creating communication', err)
        addToast({
          variant: 'error',
          title: 'Errore',
          message: 'Errore nella creazione della comunicazione',
        })
      } finally {
        setFormLoading(false)
      }
    },
    [
      formTitle,
      formMessage,
      formType,
      formRecipientFilter,
      addToast,
      formSelectedAthletes,
      formScheduled,
      formScheduledDate,
      createCommunication,
      sendCommunication,
      fetchCommunications,
    ],
  )

  const handleSendCommunication = useCallback(
    async (id: string) => {
      const result = await sendCommunication(id)
      if (!result.success && result.error) {
        alert(`Errore durante l'invio: ${result.error}`)
      } else if (result.success && result.message) {
        // Opzionale: mostra messaggio di successo
        logger.info('Invio comunicazione completato', undefined, {
          communicationId: id,
          message: result.message,
        })
      }
      await fetchCommunications()
    },
    [sendCommunication, fetchCommunications],
  )

  const handleResetCommunication = useCallback(
    async (id: string) => {
      const success = await resetCommunication(id)
      if (success) {
        addToast({
          variant: 'success',
          title: 'Reset completato',
          message: 'Lo stato della comunicazione è stato resettato',
        })
        await fetchCommunications()
      } else {
        addToast({
          variant: 'error',
          title: 'Errore',
          message: 'Errore durante il reset della comunicazione',
        })
      }
    },
    [resetCommunication, fetchCommunications, addToast],
  )

  const handleDeleteCommunication = useCallback(
    async (id: string) => {
      const success = await deleteCommunication(id)
      if (success) {
        addToast({
          variant: 'success',
          title: 'Eliminazione completata',
          message: 'La comunicazione è stata eliminata correttamente',
        })
        await fetchCommunications()
      } else {
        addToast({
          variant: 'error',
          title: 'Errore',
          message: "Errore durante l'eliminazione della comunicazione",
        })
      }
    },
    [deleteCommunication, fetchCommunications, addToast],
  )

  const handleEditCommunication = useCallback(
    (id: string) => {
      if (!id) {
        // Reset editing state
        setEditingCommunicationId(null)
        return
      }

      const communication = communications.find((c) => c.id === id)
      if (!communication) return

      setEditingCommunicationId(id)
      setFormType(communication.type as 'push' | 'email' | 'sms' | 'all')
      setFormTitle(communication.title)
      setFormMessage(communication.message)

      // Determina recipient filter
      const recipientFilter = communication.recipient_filter as {
        all_users?: boolean
        role?: string
        athlete_ids?: string[]
      } | null

      if (recipientFilter?.all_users) {
        setFormRecipientFilter('all')
        setFormSelectedAthletes([])
      } else if (recipientFilter?.role === 'atleta') {
        setFormRecipientFilter('atleti')
        setFormSelectedAthletes([])
      } else if (recipientFilter?.athlete_ids && recipientFilter.athlete_ids.length > 0) {
        setFormRecipientFilter('custom')
        setFormSelectedAthletes(recipientFilter.athlete_ids)
      } else {
        setFormRecipientFilter('all')
        setFormSelectedAthletes([])
      }

      // Gestisci schedulazione
      if (communication.scheduled_for) {
        setFormScheduled(true)
        const scheduledDate = new Date(communication.scheduled_for)
        setFormScheduledDate(
          scheduledDate.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
        )
      } else {
        setFormScheduled(false)
        setFormScheduledDate('')
      }
    },
    [
      communications,
      setFormType,
      setFormTitle,
      setFormMessage,
      setFormRecipientFilter,
      setFormSelectedAthletes,
      setFormScheduled,
      setFormScheduledDate,
    ],
  )

  const handleUpdateCommunication = useCallback(
    async (sendNow: boolean) => {
      if (!editingCommunicationId) return
      if (!formTitle.trim() || !formMessage.trim()) {
        addToast({
          variant: 'error',
          title: 'Validazione fallita',
          message: 'Compila tutti i campi obbligatori',
        })
        return
      }

      setFormLoading(true)

      try {
        const recipientFilter: UpdateCommunicationInput['recipient_filter'] =
          formRecipientFilter === 'all'
            ? { all_users: true }
            : formRecipientFilter === 'atleti'
              ? { role: 'atleta' }
              : formRecipientFilter === 'custom'
                ? { athlete_ids: formSelectedAthletes }
                : { all_users: true }

        const input: UpdateCommunicationInput = {
          title: formTitle,
          message: formMessage,
          type: formType,
          recipient_filter: recipientFilter,
          scheduled_for: formScheduled && formScheduledDate ? formScheduledDate : null,
        }

        const result = await updateCommunication(editingCommunicationId, input)

        if (result) {
          if (sendNow && !formScheduled) {
            const sendResult = await sendCommunication(editingCommunicationId)
            if (!sendResult.success && sendResult.error) {
              addToast({
                variant: 'error',
                title: 'Errore invio',
                message: sendResult.error,
              })
            } else {
              addToast({
                variant: 'success',
                title: 'Comunicazione aggiornata e inviata',
                message: 'La comunicazione è stata aggiornata e inviata con successo',
              })
            }
          } else {
            addToast({
              variant: 'success',
              title: 'Comunicazione aggiornata',
              message: 'La comunicazione è stata aggiornata con successo',
            })
          }

          // Reset form
          setEditingCommunicationId(null)
          setFormTitle('')
          setFormMessage('')
          setFormScheduled(false)
          setFormScheduledDate('')
          setFormSelectedAthletes([])
          setFormRecipientFilter('all')

          await fetchCommunications()
        }
      } catch (err) {
        logger.error('Error updating communication', err, {
          communicationId: editingCommunicationId,
        })
        alert("Errore nell'aggiornamento della comunicazione")
      } finally {
        setFormLoading(false)
      }
    },
    [
      editingCommunicationId,
      formTitle,
      formMessage,
      formType,
      formSelectedAthletes,
      addToast,
      formRecipientFilter,
      formScheduled,
      formScheduledDate,
      updateCommunication,
      sendCommunication,
      fetchCommunications,
    ],
  )

  return {
    communications: filteredCommunications,
    totalCount,
    currentPage,
    totalPages,
    itemsPerPage: itemsPerPage,
    hasNextPage,
    hasPrevPage,
    loading,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    handleNextPage,
    handlePrevPage,
    handlePageChange,
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
    getTipoIcon,
    getStatoBadge,
    formatData,
  }
}
