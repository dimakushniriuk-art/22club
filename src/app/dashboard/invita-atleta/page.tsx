'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:invita-atleta:page')
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Badge,
  Checkbox,
  Select,
  SimpleSelect,
} from '@/components/ui'
import { QRCodeComponent } from '@/components/invitations'
import { useInvitations } from '@/hooks/use-invitations'
import { useAuth } from '@/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { exportToCSV } from '@/lib/export-utils'
import { createInvitoSchema } from '@/lib/validations/invito'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import {
  Plus,
  Copy,
  Trash2,
  QrCode,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Share2,
  Search,
  Download,
  Send,
  X,
} from 'lucide-react'
import type { CreateInvitationData, Invitation } from '@/types/invitation'

type InvitoSort = 'data_asc' | 'data_desc' | 'nome_asc' | 'nome_desc' | 'stato'

export default function InvitaAtletaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { addToast } = useToast()

  // State
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statoFilter, setStatoFilter] = useState<'tutti' | 'inviato' | 'registrato' | 'scaduto'>(
    (searchParams.get('stato') as 'tutti' | 'inviato' | 'registrato' | 'scaduto') || 'tutti',
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Apri il modal automaticamente se c'è il query param 'new'
  useEffect(() => {
    const newParam = searchParams.get('new')
    if (newParam === 'true') {
      setShowCreateForm(true)
    }
  }, [searchParams])

  // Gestisci la chiusura del modal e rimuovi il query param
  const handleCloseCreateForm = (open: boolean) => {
    setShowCreateForm(open)
    if (!open) {
      // Quando il modal viene chiuso, rimuovi il query param
      const params = new URLSearchParams(searchParams.toString())
      params.delete('new')
      const newUrl = params.toString()
        ? `/dashboard/invita-atleta?${params.toString()}`
        : '/dashboard/invita-atleta'
      router.replace(newUrl, { scroll: false })
    }
  }
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<InvitoSort>('data_desc')

  const [formData, setFormData] = useState<CreateInvitationData & { giorni_validita: number }>({
    nome_atleta: '',
    email: '',
    giorni_validita: 7,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [sendEmail, setSendEmail] = useState(false)

  // Debounce search
  const debouncedSearch = useDebouncedValue(searchTerm, 300)

  // Determina se abilitare paginazione (se ci sono più di 50 record)
  const [enablePagination, setEnablePagination] = useState(false)

  // Fetch invitations
  const {
    invitations,
    stats,
    loading,
    error,
    totalCount,
    hasMore,
    currentPage,
    totalPages,
    refetch,
    loadPage,
    createInvitation,
    deleteInvitation,
    bulkDeleteInvitations,
    copyToClipboard,
  } = useInvitations({
    userId: user?.user_id || null,
    role: user?.role || null,
    enablePagination,
  })

  // Abilita paginazione se ci sono più di 50 record
  useEffect(() => {
    if (totalCount > 50 && !enablePagination) {
      setEnablePagination(true)
    }
  }, [totalCount, enablePagination])

  // Filter and sort invitations
  const filteredInvitations = useMemo(() => {
    let filtered = [...invitations]

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(
        (inv) =>
          inv.nome_atleta.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          inv.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          inv.codice.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    }

    // Stato filter
    if (statoFilter !== 'tutti') {
      filtered = filtered.filter((inv) => inv.stato === statoFilter)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'data_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'data_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'nome_asc':
          return a.nome_atleta.localeCompare(b.nome_atleta)
        case 'nome_desc':
          return b.nome_atleta.localeCompare(a.nome_atleta)
        case 'stato':
          return a.stato.localeCompare(b.stato)
        default:
          return 0
      }
    })

    return filtered
  }, [invitations, debouncedSearch, statoFilter, sortBy])

  // Handlers
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    // Validate
    const validation = createInvitoSchema.safeParse(formData)
    if (!validation.success) {
      const errors: Record<string, string> = {}
      validation.error.issues.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message
      })
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)
      const newInvito = await createInvitation({
        nome_atleta: formData.nome_atleta,
        email: formData.email || undefined,
      })

      // Se richiesto, invia email
      if (sendEmail && formData.email && newInvito) {
        try {
          const { sendInvitationEmail } = await import('@/lib/invitations/send-invitation-email')

          // Estrai il codice invito dall'oggetto restituito
          const codiceInvito = (newInvito as { codice?: string }).codice || ''
          if (!codiceInvito) {
            logger.warn('Codice invito non trovato in newInvito', undefined, { newInvito })
            return
          }

          const registrationLink = `${window.location.origin}/registrati?code=${codiceInvito}`
          const expiresAt = (newInvito as { expires_at?: string | null }).expires_at || null

          await sendInvitationEmail({
            email: formData.email,
            nomeAtleta: formData.nome_atleta,
            codiceInvito,
            registrationLink,
            expiresAt,
          })
        } catch (emailError) {
          logger.error('Errore invio email invito', emailError)
          // Non blocchiamo il flusso se l'email fallisce
          // L'invito è già stato creato
        }
      }

      setFormData({ nome_atleta: '', email: '', giorni_validita: 7 })
      handleCloseCreateForm(false)
      setSendEmail(false)
      refetch()
    } catch (error) {
      logger.error('Error creating invitation', error)
      setFormErrors({ general: "Errore nella creazione dell'invito" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteInvitation = (invitationId: string) => {
    setInvitationToDelete(invitationId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!invitationToDelete) return

    setIsDeleting(true)
    try {
      await deleteInvitation(invitationToDelete)
      setDeleteDialogOpen(false)
      setInvitationToDelete(null)
      refetch()
      addToast({
        title: 'Invito eliminato',
        message: 'Invito eliminato con successo.',
        variant: 'success',
      })
    } catch (error) {
      logger.error('Error deleting invitation', error, { invitationId: invitationToDelete })
      addToast({
        title: 'Errore',
        message: "Errore nell'eliminazione dell'invito. Riprova più tardi.",
        variant: 'error',
      })
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
      setInvitationToDelete(null)
    }
  }

  const handleCopyCode = async (code: string) => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopiedText(code)
      setTimeout(() => setCopiedText(null), 2000)
    }
  }

  const handleCopyLink = async (code: string) => {
    const link = `${window.location.origin}/registrati?code=${code}`
    const success = await copyToClipboard(link)
    if (success) {
      setCopiedText(`link-${code}`)
      setTimeout(() => setCopiedText(null), 2000)
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    setBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      // Usa bulkDeleteInvitations invece di Promise.all con delete singoli
      await bulkDeleteInvitations(Array.from(selectedIds))
      const count = selectedIds.size
      setSelectedIds(new Set())
      setBulkDeleteDialogOpen(false)
      refetch()
      addToast({
        title: 'Inviti eliminati',
        message: `${count} invito/i eliminato/i con successo.`,
        variant: 'success',
      })
    } catch (error) {
      logger.error('Errore eliminazione bulk', error, { count: selectedIds.size })
      addToast({
        title: 'Errore',
        message: "Errore durante l'eliminazione degli inviti. Riprova più tardi.",
        variant: 'error',
      })
      setBulkDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const data = filteredInvitations.map((inv) => ({
      'Nome Atleta': inv.nome_atleta,
      Email: inv.email || '',
      Codice: inv.codice,
      Stato: inv.stato,
      'Data Creazione': new Date(inv.created_at).toLocaleDateString('it-IT'),
      'Data Scadenza': inv.expires_at
        ? new Date(inv.expires_at).toLocaleDateString('it-IT')
        : 'N/A',
    }))
    exportToCSV(data, `inviti-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const getStatusIcon = (stato: string) => {
    switch (stato) {
      case 'registrato':
        return <CheckCircle className="text-state-valid h-4 w-4" />
      case 'inviato':
        return <Clock className="text-state-warn h-4 w-4" />
      case 'scaduto':
        return <XCircle className="text-state-error h-4 w-4" />
      default:
        return <Clock className="text-text-tertiary h-4 w-4" />
    }
  }

  const getStatusBadge = (stato: string) => {
    switch (stato) {
      case 'registrato':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle className="mr-1 h-3 w-3" />
            Registrato
          </Badge>
        )
      case 'inviato':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="mr-1 h-3 w-3" />
            Inviato
          </Badge>
        )
      case 'scaduto':
        return (
          <Badge variant="error" size="sm">
            <XCircle className="mr-1 h-3 w-3" />
            Scaduto
          </Badge>
        )
      default:
        return <Badge size="sm">{stato}</Badge>
    }
  }

  // Loading state
  if (authLoading || (loading && invitations.length === 0)) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <LoadingState
            message={authLoading ? 'Caricamento autenticazione...' : 'Caricamento inviti...'}
          />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <ErrorState message={error} onRetry={refetch} />
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
              Invita Atleta
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Genera codici invito per i tuoi atleti
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Invito
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
            style={{ animationDelay: '100ms' }}
          >
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Totale Inviti</p>
                  <p className="text-text-primary text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-blue-500/20 text-blue-400 rounded-full p-3">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-yellow-500/30 shadow-lg shadow-yellow-500/10 backdrop-blur-xl hover:border-yellow-400/50 transition-all duration-200"
            style={{ animationDelay: '200ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Inviati</p>
                  <p className="text-text-primary text-2xl font-bold">{stats.inviati}</p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-400 rounded-full p-3">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-green-500/30 shadow-lg shadow-green-500/10 backdrop-blur-xl hover:border-green-400/50 transition-all duration-200"
            style={{ animationDelay: '300ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Registrati</p>
                  <p className="text-text-primary text-2xl font-bold">{stats.registrati}</p>
                </div>
                <div className="bg-green-500/20 text-green-400 rounded-full p-3">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-red-500/30 shadow-lg shadow-red-500/10 backdrop-blur-xl hover:border-red-400/50 transition-all duration-200"
            style={{ animationDelay: '400ms' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Scaduti</p>
                  <p className="text-text-primary text-2xl font-bold">{stats.scaduti}</p>
                </div>
                <div className="bg-red-500/20 text-red-400 rounded-full p-3">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <Card
          variant="trainer"
          className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
        >
          <CardContent className="p-4 relative">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Cerca per nome, email o codice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statoFilter === 'tutti' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatoFilter('tutti')}
                  className={
                    statoFilter === 'tutti'
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50'
                  }
                >
                  Tutti
                </Button>
                <Button
                  variant={statoFilter === 'inviato' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatoFilter('inviato')}
                  className={
                    statoFilter === 'inviato'
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50'
                  }
                >
                  Inviati
                </Button>
                <Button
                  variant={statoFilter === 'registrato' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatoFilter('registrato')}
                  className={
                    statoFilter === 'registrato'
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50'
                  }
                >
                  Registrati
                </Button>
                <Button
                  variant={statoFilter === 'scaduto' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatoFilter('scaduto')}
                  className={
                    statoFilter === 'scaduto'
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50'
                  }
                >
                  Scaduti
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                onClick={handleExportCSV}
                disabled={filteredInvitations.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sort & Select */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">Ordina per:</span>
            <SimpleSelect
              value={sortBy}
              onValueChange={(value) => setSortBy(value as InvitoSort)}
              options={[
                { value: 'data_desc', label: 'Data (più recenti)' },
                { value: 'data_asc', label: 'Data (più vecchi)' },
                { value: 'nome_asc', label: 'Nome (A-Z)' },
                { value: 'nome_desc', label: 'Nome (Z-A)' },
                { value: 'stato', label: 'Stato' },
              ]}
              className="w-[180px]"
            />
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">{selectedIds.size} selezionati</span>
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Elimina
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-200"
                onClick={() => setSelectedIds(new Set())}
                aria-label="Deseleziona tutti"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Screen reader announce */}
        <div role="status" aria-live="polite" className="sr-only">
          {filteredInvitations.length}{' '}
          {filteredInvitations.length === 1 ? 'invito trovato' : 'inviti trovati'}
        </div>

        {/* Invitations List */}
        {filteredInvitations.length === 0 ? (
          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl"
          >
            <CardContent className="p-12 text-center relative">
              <Users className="text-text-tertiary mx-auto mb-4 h-16 w-16" />
              <h3 className="text-text-primary mb-2 text-lg font-medium">
                {debouncedSearch || statoFilter !== 'tutti'
                  ? 'Nessun invito trovato'
                  : 'Nessun invito ancora'}
              </h3>
              <p className="text-text-secondary mb-4 text-sm">
                {debouncedSearch || statoFilter !== 'tutti'
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Crea il tuo primo invito per iniziare a lavorare con i tuoi atleti'}
              </p>
              {!debouncedSearch && statoFilter === 'tutti' && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Primo Invito
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvitations.map((invitation) => (
              <Card
                key={invitation.id}
                variant="trainer"
                className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 hover:shadow-blue-500/20 transition-all duration-200"
              >
                {invitation.stato === 'inviato' && (
                  <div className="absolute left-3 top-3">
                    <Checkbox
                      checked={selectedIds.has(invitation.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedIds)
                        if (e.target.checked) {
                          newSelected.add(invitation.id)
                        } else {
                          newSelected.delete(invitation.id)
                        }
                        setSelectedIds(newSelected)
                      }}
                      aria-label={`Seleziona invito per ${invitation.nome_atleta}`}
                    />
                  </div>
                )}
                <CardContent className="p-4 pt-10 relative">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-text-primary font-medium">{invitation.nome_atleta}</h3>
                      {invitation.email && (
                        <p className="text-text-secondary text-sm">{invitation.email}</p>
                      )}
                    </div>
                    {getStatusIcon(invitation.stato)}
                  </div>

                  <div className="space-y-3">
                    {/* Status Badge */}
                    {getStatusBadge(invitation.stato)}

                    {/* Code */}
                    <div className="bg-background-tertiary rounded p-3">
                      <p className="text-text-secondary mb-1 text-xs font-medium">Codice invito:</p>
                      <p className="text-text-primary font-mono text-sm font-bold">
                        {invitation.codice}
                      </p>
                    </div>

                    {/* Registration Link */}
                    <div className="bg-background-tertiary rounded p-2">
                      <p className="text-text-secondary mb-1 text-xs">Link registrazione:</p>
                      <p className="text-text-primary truncate text-xs">
                        {`${window.location.origin}/registrati?code=${invitation.codice}`}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
                      <p className="text-text-tertiary text-xs">
                        Creato: {new Date(invitation.created_at).toLocaleDateString('it-IT')}
                      </p>
                      {invitation.expires_at && (
                        <p className="text-text-tertiary text-xs">
                          Scade: {new Date(invitation.expires_at).toLocaleDateString('it-IT')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCode(invitation.codice)}
                        className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                        aria-label="Copia codice"
                      >
                        {copiedText === invitation.codice ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Copiato!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-4 w-4" />
                            Codice
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(invitation.codice)}
                        className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                        aria-label="Copia link"
                      >
                        {copiedText === `link-${invitation.codice}` ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Copiato!
                          </>
                        ) : (
                          <>
                            <Share2 className="mr-1 h-4 w-4" />
                            Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvitation(invitation)
                          setShowQRModal(true)
                        }}
                        className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                        aria-label="Mostra QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      {invitation.stato === 'inviato' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
                          aria-label="Elimina invito"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginazione */}
        {enablePagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-text-secondary text-sm">
              Mostrando {currentPage * 50 + 1} - {Math.min((currentPage + 1) * 50, totalCount)} di{' '}
              {totalCount} inviti
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50"
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">
                  Pagina {currentPage + 1} di {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage + 1)}
                disabled={!hasMore || loading}
                className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50"
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={handleCloseCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo Invito Atleta</DialogTitle>
            <DialogDescription>
              Crea un codice invito per un nuovo atleta. Puoi condividere il codice o inviarlo via
              email.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvitation} className="space-y-4">
            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Nome Atleta *
              </label>
              <Input
                value={formData.nome_atleta}
                onChange={(e) => setFormData({ ...formData, nome_atleta: e.target.value })}
                placeholder="Mario Rossi"
                required
              />
              {formErrors.nome_atleta && (
                <p className="text-state-error mt-1 text-xs">{formErrors.nome_atleta}</p>
              )}
            </div>

            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Email (opzionale)
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="mario.rossi@example.com"
              />
              {formErrors.email && (
                <p className="text-state-error mt-1 text-xs">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Validità invito
              </label>
              <Select
                value={String(formData.giorni_validita)}
                onValueChange={(value) =>
                  setFormData({ ...formData, giorni_validita: Number(value) })
                }
                className="w-full"
              >
                <option value="3">3 giorni</option>
                <option value="7">7 giorni (consigliato)</option>
                <option value="14">14 giorni</option>
                <option value="30">30 giorni</option>
              </Select>
            </div>

            {formData.email && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  id="send-email"
                />
                <label htmlFor="send-email" className="text-text-primary text-sm">
                  Invia invito via email
                </label>
              </div>
            )}

            {formErrors.general && (
              <p className="text-state-error rounded border border-state-error/20 bg-state-error/10 p-2 text-xs">
                {formErrors.general}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                onClick={() => {
                  handleCloseCreateForm(false)
                  setFormErrors({})
                  setFormData({ nome_atleta: '', email: '', giorni_validita: 7 })
                }}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.nome_atleta.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : sendEmail ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Crea e Invia
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crea Invito
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-lg">
          {selectedInvitation && (
            <>
              <DialogHeader>
                <DialogTitle>QR Code Invito</DialogTitle>
                <DialogDescription>
                  Condividi questo QR code con {selectedInvitation.nome_atleta}
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-center py-4">
                <QRCodeComponent
                  invitationCode={selectedInvitation.codice}
                  athleteName={selectedInvitation.nome_atleta}
                  onCopy={() => handleCopyCode(selectedInvitation.codice)}
                />
              </div>

              <div className="space-y-2">
                <div className="bg-background-tertiary rounded p-3">
                  <p className="text-text-secondary mb-1 text-xs">Link registrazione:</p>
                  <p className="text-text-primary break-all text-sm">
                    {`${window.location.origin}/registrati?code=${selectedInvitation.codice}`}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCode(selectedInvitation.codice)}
                    className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copia Codice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(selectedInvitation.codice)}
                    className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  >
                    <Share2 className="mr-1 h-4 w-4" />
                    Copia Link
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setShowQRModal(false)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
                >
                  Chiudi
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog conferma eliminazione singolo invito */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Elimina invito"
        description="Sei sicuro di voler eliminare questo invito? Questa azione non può essere annullata."
        confirmText="Elimina"
        cancelText="Annulla"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />

      {/* Dialog conferma eliminazione multipla */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Elimina inviti"
        description={`Sei sicuro di voler eliminare ${selectedIds.size} invito/i? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        variant="destructive"
        onConfirm={handleBulkDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  )
}
