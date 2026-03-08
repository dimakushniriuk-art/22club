// ============================================================
// Hook per gestione pagina comunicazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:communications:use-communications-page')
import {
  useCommunications,
  type CreateCommunicationInput,
  type UpdateCommunicationInput,
} from '@/hooks/use-communications'
import { useToast } from '@/components/ui/toast'
import { useNotify } from '@/lib/ui/notify'
import {
  Mail,
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
  const { notify } = useNotify()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(ITEMS_PER_PAGE)
  const [activeTab, setActiveTab] = useState<'tutte' | 'sent' | 'delivered' | 'pending' | 'failed'>('tutte')
  const [searchTerm, setSearchTerm] = useState('')

  // Determina il filtro per stato (Tutti, Inviati, Consegnati, In attesa, Falliti)
  const statusFilter = (() => {
    switch (activeTab) {
      case 'sent':
        return 'sent'
      case 'delivered':
        return 'sent' // fetch sent, poi filtriamo client-side per total_delivered > 0
      case 'pending':
        return ['draft', 'scheduled', 'sending']
      case 'failed':
        return 'failed'
      default:
        return undefined
    }
  })()

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
    status: statusFilter,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  })
  const [formType, setFormType] = useState<'email' | 'all'>('email')
  const [formTitle, setFormTitle] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formRecipientFilter, setFormRecipientFilter] = useState<'all' | 'atleti' | 'custom'>('atleti')
  const [formSelectedAthletes, setFormSelectedAthletes] = useState<string[]>([]) // athlete_ids selezionati
  const [formScheduled, setFormScheduled] = useState(false)
  const [formScheduledDate, setFormScheduledDate] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [editingCommunicationId, setEditingCommunicationId] = useState<string | null>(null)

  const communicationsRef = useRef(communications)
  communicationsRef.current = communications

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

  // Filtra per searchTerm e per "Consegnati" (sent con total_delivered > 0)
  const filteredCommunications = useMemo(() => {
    let list = communications
    if (activeTab === 'delivered') {
      list = list.filter((c) => (c.total_delivered ?? 0) > 0)
    }
    if (!searchTerm) {
      return list
    }
    const term = searchTerm.toLowerCase()
    return list.filter(
      (c) => c.title.toLowerCase().includes(term) || c.message.toLowerCase().includes(term),
    )
  }, [communications, searchTerm, activeTab])

  // Controllo periodico per comunicazioni bloccate in "sending" (solo interval, senza dipendere da communications)
  useEffect(() => {
    const checkStuckCommunications = async () => {
      if (document.visibilityState === 'hidden') return
      const list = communicationsRef.current
      const stuck = list.filter((c) => c.status === 'sending')
      if (stuck.length === 0) return

      try {
        const response = await fetch('/api/communications/check-stuck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (response.ok) {
          const text = await response.text()
          if (!text || text.trim().length === 0) return
          const result = JSON.parse(text)
          if (result.reset > 0) {
            await fetchCommunications()
          }
        }
      } catch (error) {
        logger.error('Error checking stuck communications', error)
      }
    }

    const interval = setInterval(checkStuckCommunications, 5 * 60 * 1000)
    if (document.visibilityState === 'visible') {
      checkStuckCommunications()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkStuckCommunications()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchCommunications])

  // Re-fetch quando cambia pagina (useCommunications si aggiorna automaticamente quando cambiano options)

  // Calcola count destinatari quando cambia il filtro
  useEffect(() => {
    const calculateRecipientCount = async () => {
      try {
        let _filter: { all_users?: boolean; role?: string; athlete_ids?: string[] } | null = null

        if (formRecipientFilter === 'all') {
          _filter = { all_users: true }
        } else if (formRecipientFilter === 'atleti') {
          _filter = { role: 'athlete' }
        } else if (formRecipientFilter === 'custom') {
          // Per atleti specifici, il count è il numero di atleti selezionati
          setRecipientCount(formSelectedAthletes.length)
          return
        } else {
          setRecipientCount(null)
          return
        }

        const countUrl =
          formRecipientFilter === 'atleti'
            ? '/api/communications/recipients/count?role=athlete'
            : '/api/communications/recipients/count'
        const response = await fetch(countUrl, { method: 'GET' })

        if (response.status === 404 || !response.ok) {
          setRecipientCount(0)
          return
        }

        const text = await response.text()
        if (!text || text.trim().length === 0) {
          setRecipientCount(0)
          return
        }
        const data = JSON.parse(text)
        setRecipientCount(data.count ?? 0)
      } catch {
        setRecipientCount(0)
      }
    }

    calculateRecipientCount()
  }, [formRecipientFilter, formSelectedAthletes])

  const getTipoIcon = useCallback((tipo: string) => {
    switch (tipo) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'all':
        return <Send className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
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
              ? { role: 'athlete' }
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
          setFormRecipientFilter('atleti')

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
        notify(`Errore durante l'invio della comunicazione: ${result.error}`, 'error', 'Errore invio')
      } else if (result.success && result.message) {
        // Opzionale: mostra messaggio di successo
        logger.info('Invio comunicazione completato', undefined, {
          communicationId: id,
          message: result.message,
        })
      }
      await fetchCommunications()
    },
    [sendCommunication, fetchCommunications, notify],
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
      setFormType(
        communication.type === 'push' || communication.type === 'sms'
          ? 'email'
          : (communication.type as 'email' | 'all'),
      )
      setFormTitle(communication.title)
      setFormMessage(communication.message)

      // Determina recipient filter
      const recipientFilter = communication.recipient_filter as {
        all_users?: boolean
        role?: string
        athlete_ids?: string[]
      } | null

      if (recipientFilter?.all_users) {
        setFormRecipientFilter('atleti')
        setFormSelectedAthletes([])
      } else if (recipientFilter?.role === 'athlete') {
        setFormRecipientFilter('atleti')
        setFormSelectedAthletes([])
      } else if (recipientFilter?.athlete_ids && recipientFilter.athlete_ids.length > 0) {
        setFormRecipientFilter('custom')
        setFormSelectedAthletes(recipientFilter.athlete_ids)
      } else {
        setFormRecipientFilter('atleti')
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
              ? { role: 'athlete' }
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
          setFormRecipientFilter('atleti')

          await fetchCommunications()
        }
      } catch (err) {
        logger.error('Error updating communication', err, {
          communicationId: editingCommunicationId,
        })
        notify('Si è verificato un errore durante l\'aggiornamento della comunicazione. Riprova.', 'error', 'Errore aggiornamento')
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
      notify,
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
    refetchCommunications: fetchCommunications,
  }
}
