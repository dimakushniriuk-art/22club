'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Search,
  UserPlus,
  Trash2,
  Edit,
  MoreVertical,
  Users,
  RefreshCw,
  Download,
  Upload,
  Key,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { ModernKPICard } from '@/components/dashboard/modern-kpi-card'
import { UserFormModal } from './user-form-modal'
import { UserDeleteDialog } from './user-delete-dialog'
import { UserResetPasswordDialog } from './user-reset-password-dialog'
import { UserImportModal } from './user-import-modal'
import { notifySuccess, notifyError } from '@/lib/notifications'
import { createLogger } from '@/lib/logger'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

const logger = createLogger('AdminUsersContent')

interface TrainerAssegnato {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
}

interface User {
  id: string
  user_id: string
  email: string | null
  nome: string | null
  cognome: string | null
  phone: string | null
  role: 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete' | 'nutrizionista' | 'massaggiatore'
  stato: 'attivo' | 'inattivo' | 'sospeso'
  org_id: string | null
  data_iscrizione: string | null
  created_at: string
  updated_at: string
  trainerAssegnato?: TrainerAssegnato | null
}

type RoleFilter =
  | 'tutti'
  | 'admin'
  | 'pt'
  | 'trainer'
  | 'atleta'
  | 'athlete'
  | 'nutrizionista'
  | 'massaggiatore'
type StatoFilter = 'tutti' | 'attivo' | 'inattivo' | 'sospeso'

export function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('tutti')
  const [statoFilter, setStatoFilter] = useState<StatoFilter>('tutti')

  // Debounce della ricerca per evitare ricalcoli eccessivi
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [resettingPasswordUser, setResettingPasswordUser] = useState<User | null>(null)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [verifyingLoginUser, setVerifyingLoginUser] = useState<User | null>(null)
  const [verifyingLogin, setVerifyingLogin] = useState(false)

  // Ref per evitare chiamate multiple durante il mount
  const fetchingRef = useRef(false)

  const fetchUsers = useCallback(async () => {
    // Evita chiamate parallele se già in corso
    if (fetchingRef.current) return

    try {
      fetchingRef.current = true
      setLoading(true)
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        // Proteggi da risposte vuote
        const text = await response.text()
        const error = text ? JSON.parse(text) : { error: 'Errore nel caricamento utenti' }
        throw new Error(error.error || 'Errore nel caricamento utenti')
      }

      // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        setUsers([])
        return
      }

      const data = JSON.parse(text)
      // Supporta sia risposta semplice { users } che risposta paginata { users, pagination }
      const usersData = data.users || []
      setUsers(usersData)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Errore nel caricamento utenti', error)
      notifyError('Errore', error.message || 'Errore nel caricamento utenti')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filtro ricerca (usa debouncedSearchTerm per evitare ricalcoli eccessivi)
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        const matchesSearch =
          user.nome?.toLowerCase().includes(searchLower) ||
          user.cognome?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower) ||
          false
        if (!matchesSearch) return false
      }

      // Filtro ruolo
      if (roleFilter !== 'tutti') {
        if (roleFilter === 'atleta' && user.role !== 'atleta' && user.role !== 'athlete') {
          return false
        }
        if (roleFilter === 'athlete' && user.role !== 'atleta' && user.role !== 'athlete') {
          return false
        }
        if (roleFilter !== 'atleta' && roleFilter !== 'athlete' && user.role !== roleFilter) {
          return false
        }
      }

      // Filtro stato
      if (statoFilter !== 'tutti' && user.stato !== statoFilter) {
        return false
      }

      return true
    })
  }, [users, debouncedSearchTerm, roleFilter, statoFilter])

  // Statistiche utenti
  const stats = useMemo(() => {
    const total = users.length
    const attivi = users.filter((u) => u.stato === 'attivo').length
    const inattivi = users.filter((u) => u.stato === 'inattivo').length
    const sospesi = users.filter((u) => u.stato === 'sospeso').length
    const admin = users.filter((u) => u.role === 'admin').length
    const pt = users.filter((u) => u.role === 'pt' || u.role === 'trainer').length
    const atleti = users.filter((u) => u.role === 'atleta' || u.role === 'athlete').length
    const nutrizionisti = users.filter((u) => u.role === 'nutrizionista').length
    const massaggiatori = users.filter((u) => u.role === 'massaggiatore').length

    return {
      total,
      attivi,
      inattivi,
      sospesi,
      admin,
      pt,
      atleti,
      nutrizionisti,
      massaggiatori,
    }
  }, [users])

  // Funzione esportazione CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'Nome',
        'Cognome',
        'Email',
        'Telefono',
        'Ruolo',
        'Stato',
        'Trainer Assegnato',
        'Data Iscrizione',
      ]
      const rows = filteredUsers.map((user) => [
        (user.nome || '').trim(),
        (user.cognome || '').trim(),
        (user.email || '').trim(),
        (user.phone || '').trim(),
        user.role,
        user.stato,
        user.trainerAssegnato
          ? user.trainerAssegnato.nome || user.trainerAssegnato.cognome
            ? `${user.trainerAssegnato.nome || ''} ${user.trainerAssegnato.cognome || ''}`.trim()
            : user.trainerAssegnato.email || 'N/A'
          : user.role === 'atleta' || user.role === 'athlete'
            ? 'Nessun trainer'
            : 'N/A',
        user.data_iscrizione ? new Date(user.data_iscrizione).toISOString().split('T')[0] : '',
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `utenti_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      notifySuccess('Esportazione completata', 'File CSV scaricato con successo')
    } catch (error) {
      logger.error('Errore esportazione CSV', error)
      notifyError('Errore', "Errore durante l'esportazione del file CSV")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleDelete = (user: User) => {
    setDeletingUser(user)
  }

  const handleResetPassword = (user: User) => {
    setResettingPasswordUser(user)
  }

  const handleVerifyLogin = async (user: User) => {
    if (!user.email) {
      notifyError('Errore', 'Email non disponibile per questo utente')
      return
    }

    setVerifyingLoginUser(user)
    setVerifyingLogin(true)

    try {
      const response = await fetch('/api/admin/users/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: 'Password123!', // Password di default per fix
        }),
      })

      const text = await response.text()
      if (!text || text.trim().length === 0) {
        throw new Error('Risposta vuota dal server')
      }

      const data = JSON.parse(text)

      if (!response.ok) {
        throw new Error(data.error || 'Errore nella verifica login')
      }

      // Mostra informazioni dettagliate
      const message = data.message || 'Verifica completata'
      const actions = data.actions || {}

      let detailMessage = message
      if (actions.passwordUpdated) {
        detailMessage += ' Password aggiornata.'
      }
      if (actions.emailConfirmedNow) {
        detailMessage += ' Email confermata.'
      }

      notifySuccess('Verifica completata', detailMessage)

      // Log dettagli
      logger.info('Verifica login completata', {
        email: user.email,
        userId: data.authUser?.id,
        actions,
      })
    } catch (error) {
      logger.error('Errore verifica login', error, {
        userId: user.id,
        email: user.email,
      })
      notifyError(
        'Errore',
        error instanceof Error ? error.message : 'Errore durante la verifica login',
      )
    } finally {
      setVerifyingLogin(false)
      setVerifyingLoginUser(null)
    }
  }

  const handleResetPasswordConfirm = async (password: string) => {
    if (!resettingPasswordUser) return

    try {
      setResettingPassword(true)
      logger.debug('Reset password utente', {
        userId: resettingPasswordUser.id,
        userEmail: resettingPasswordUser.email,
      })

      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resettingPasswordUser.id,
          password,
        }),
      })

      // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        throw new Error('Errore nel reset della password: risposta vuota')
      }

      const data = JSON.parse(text)

      if (!response.ok) {
        throw new Error(data.error || 'Errore nel reset della password')
      }

      notifySuccess('Password resettata', 'La password è stata resettata con successo')
      setResettingPasswordUser(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Errore reset password', error, {
        userId: resettingPasswordUser?.id,
        userEmail: resettingPasswordUser?.email,
      })
      notifyError('Errore', error.message || 'Errore nel reset della password')
    } finally {
      setResettingPassword(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    // Assicurarsi che il modal sia montato prima di aprire
    // Usa setTimeout per garantire che il DOM sia aggiornato
    setTimeout(() => {
      setShowUserForm(true)
    }, 0)
  }

  const handleFormClose = () => {
    setShowUserForm(false)
    setEditingUser(null)
  }

  const handleFormSuccess = () => {
    fetchUsers()
    handleFormClose()
    // Toast notification gestito dal componente UserFormModal
  }

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return

    try {
      // Log per debug
      logger.debug('Tentativo eliminazione utente', {
        userId: deletingUser.id,
        userEmail: deletingUser.email,
        userName: `${deletingUser.nome || ''} ${deletingUser.cognome || ''}`.trim(),
      })

      const response = await fetch(`/api/admin/users?userId=${deletingUser.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let errorMessage = "Errore nell'eliminazione utente"
        let errorData: unknown = null

        try {
          // IMPORTANTE: response.text() può essere chiamato solo UNA volta
          const text = await response.text()
          if (text && text.trim().length > 0) {
            try {
              errorData = JSON.parse(text)
              if (typeof errorData === 'object' && errorData !== null && 'error' in errorData) {
                errorMessage = String((errorData as { error?: string }).error) || errorMessage
              } else {
                // Se non è un oggetto con campo 'error', usa il testo come messaggio
                errorMessage = text
              }
            } catch (parseError) {
              // Se non riesce a parsare JSON, usa il testo grezzo come messaggio
              errorMessage = text || errorMessage
              errorData = { rawText: text, parseError: parseError instanceof Error ? parseError.message : String(parseError) }
            }
          } else {
            // Risposta vuota, usa status text come fallback
            errorMessage = response.statusText || errorMessage
          }
        } catch (readError) {
          // Se anche leggere la risposta fallisce, usa il messaggio di default
          logger.warn('Impossibile leggere errore dalla risposta', readError)
          errorMessage = response.statusText || errorMessage
        }

        logger.error("Errore nell'eliminazione utente - Response non OK", null, {
          userId: deletingUser.id,
          userEmail: deletingUser.email,
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorData,
          responseHeaders: Object.fromEntries(response.headers.entries()),
        })

        throw new Error(errorMessage)
      }

      // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        logger.warn('Risposta vuota da DELETE /api/admin/users', { userId: deletingUser.id })
        return
      }

      const result = JSON.parse(text)

      logger.debug('Utente eliminato con successo', {
        userId: deletingUser.id,
        result,
      })

      notifySuccess('Utente eliminato', "L'utente è stato eliminato con successo")
      fetchUsers()
      setDeletingUser(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error("Errore nell'eliminazione utente", error, {
        userId: deletingUser?.id,
        userEmail: deletingUser?.email,
        errorMessage: error.message,
        errorStack: error.stack,
      })
      notifyError('Errore', error.message || "Errore nell'eliminazione utente")
    }
  }

  /**
   * Mapping colori badge per ruoli (standardizzato)
   * - Admin: rosso (destructive) - ruolo amministrativo
   * - PT/Trainer: blu (default) - trainer/personal trainer
   * - Atleta: grigio (secondary) - atleta
   * - Nutrizionista/Massaggiatore: blu (default) - ruoli supporto
   */
  const getRoleBadge = (role: string) => {
    const roleMap: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      admin: { label: 'Admin', variant: 'destructive' },
      pt: { label: 'PT', variant: 'default' },
      trainer: { label: 'Trainer', variant: 'default' },
      atleta: { label: 'Atleta', variant: 'secondary' },
      athlete: { label: 'Atleta', variant: 'secondary' },
      nutrizionista: { label: 'Nutrizionista', variant: 'default' },
      massaggiatore: { label: 'Massaggiatore', variant: 'default' },
    }

    const roleInfo = roleMap[role.toLowerCase()] || { label: role, variant: 'outline' as const }
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
  }

  const getStatoBadge = (stato: string) => {
    const statoMap: Record<string, { label: string; className: string }> = {
      attivo: { label: 'Attivo', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      inattivo: { label: 'Inattivo', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      sospeso: { label: 'Sospeso', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    }

    const statoInfo = statoMap[stato] || { label: stato, className: 'bg-gray-500/20 text-gray-400' }
    return <Badge className={statoInfo.className}>{statoInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestione Utenti</h1>
          <p className="text-text-secondary mt-1">Gestisci tutti gli utenti del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            className="bg-background-secondary border-border hover:bg-background-tertiary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="bg-background-secondary border-border hover:bg-background-tertiary whitespace-nowrap"
            disabled={filteredUsers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="bg-background-secondary border-border hover:bg-background-tertiary whitespace-nowrap"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importa CSV
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuovo Utente
          </Button>
        </div>
      </div>

      {/* Statistiche KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <ModernKPICard
          title="Totale Utenti"
          value={stats.total}
          icon="👥"
          color="blue"
          animationDelay="0ms"
        />
        <ModernKPICard
          title="Utenti Attivi"
          value={stats.attivi}
          icon="✅"
          color="green"
          animationDelay="100ms"
        />
        <ModernKPICard
          title="Personal Trainer"
          value={stats.pt}
          icon="💪"
          color="orange"
          animationDelay="200ms"
        />
        <ModernKPICard
          title="Atleti"
          value={stats.atleti}
          icon="🏃"
          color="purple"
          animationDelay="300ms"
        />
        <ModernKPICard
          title="Nutrizionisti"
          value={stats.nutrizionisti}
          icon="🥗"
          color="green"
          animationDelay="400ms"
        />
        <ModernKPICard
          title="Massaggiatori"
          value={stats.massaggiatori}
          icon="💆"
          color="blue"
          animationDelay="500ms"
        />
      </div>

      {/* Filtri */}
      <Card variant="trainer" className="bg-background-secondary border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  placeholder="Cerca per nome, email, telefono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-text-primary placeholder:text-text-secondary"
                />
                {debouncedSearchTerm !== searchTerm && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary text-xs">
                    Ricerca...
                  </span>
                )}
              </div>
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value as RoleFilter)}
              className="w-full md:w-48 bg-background border-border min-w-[180px]"
            >
              <option value="tutti">Tutti i ruoli</option>
              <option value="admin">Admin</option>
              <option value="pt">Personal Trainer</option>
              <option value="trainer">Trainer</option>
              <option value="atleta">Atleta</option>
              <option value="nutrizionista">Nutrizionista</option>
              <option value="massaggiatore">Massaggiatore</option>
            </Select>
            <Select
              value={statoFilter}
              onValueChange={(value) => setStatoFilter(value as StatoFilter)}
              className="w-full md:w-48 bg-background border-border min-w-[160px]"
            >
              <option value="tutti">Tutti gli stati</option>
              <option value="attivo">Attivo</option>
              <option value="inattivo">Inattivo</option>
              <option value="sospeso">Sospeso</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabella Utenti */}
      <Card variant="trainer" className="bg-background-secondary border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-text-primary">
              Utenti ({filteredUsers.length} di {users.length})
            </CardTitle>
            {filteredUsers.length !== users.length && (
              <Badge variant="outline" className="text-text-secondary">
                Filtri attivi
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-text-secondary">Nome</TableHead>
                  <TableHead className="text-text-secondary">Email</TableHead>
                  <TableHead className="text-text-secondary">Telefono</TableHead>
                  <TableHead className="text-text-secondary">Ruolo</TableHead>
                  <TableHead className="text-text-secondary">Stato</TableHead>
                  <TableHead className="text-text-secondary">Trainer Assegnato</TableHead>
                  <TableHead className="text-text-secondary">Data Iscrizione</TableHead>
                  <TableHead className="text-text-secondary w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={`skeleton-${i}`} className="border-border">
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded" />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        <p className="text-text-secondary text-sm">Caricamento utenti...</p>
                      </TableCell>
                    </TableRow>
                  </>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="h-12 w-12 text-text-secondary/50" />
                        <p className="text-text-secondary text-sm">
                          {searchTerm || roleFilter !== 'tutti' || statoFilter !== 'tutti'
                            ? 'Nessun utente trovato con i filtri selezionati'
                            : 'Nessun utente nel sistema'}
                        </p>
                        {searchTerm || roleFilter !== 'tutti' || statoFilter !== 'tutti' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm('')
                              setRoleFilter('tutti')
                              setStatoFilter('tutti')
                            }}
                            className="mt-2"
                          >
                            Rimuovi filtri
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreate}
                            className="mt-2"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Crea primo utente
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-border hover:bg-background-tertiary/50 transition-colors"
                    >
                      <TableCell className="text-text-primary font-medium">
                        {user.nome || user.cognome
                          ? `${user.nome || ''} ${user.cognome || ''}`.replace(/\s+/g, ' ').trim()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {user.email ? user.email.trim() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-text-secondary">{user.phone || 'N/A'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatoBadge(user.stato)}</TableCell>
                      <TableCell className="text-text-secondary">
                        {user.trainerAssegnato ? (
                          user.trainerAssegnato.nome || user.trainerAssegnato.cognome ? (
                            `${user.trainerAssegnato.nome || ''} ${user.trainerAssegnato.cognome || ''}`
                              .replace(/\s+/g, ' ')
                              .trim()
                          ) : user.trainerAssegnato.email ? (
                            user.trainerAssegnato.email.trim()
                          ) : (
                            'N/A'
                          )
                        ) : user.role === 'atleta' || user.role === 'athlete' ? (
                          'Nessun trainer'
                        ) : (
                          <span title="Non applicabile per questo ruolo">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {user.data_iscrizione
                          ? new Date(user.data_iscrizione).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-background-tertiary"
                            >
                              <MoreVertical className="h-4 w-4 text-text-secondary" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-background-secondary border-border"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEdit(user)}
                              className="text-text-primary hover:bg-background-tertiary cursor-pointer"
                              aria-label={`Modifica utente ${user.nome || user.email || user.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Modifica
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(user)}
                              className="text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                              aria-label={`Reset password utente ${user.nome || user.email || user.id}`}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleVerifyLogin(user)}
                              className="text-green-400 hover:bg-green-500/20 cursor-pointer"
                              disabled={verifyingLogin}
                              aria-label={`Verifica login utente ${user.nome || user.email || user.id}`}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              {verifyingLogin && verifyingLoginUser?.id === user.id
                                ? 'Verifica in corso...'
                                : 'Verifica/Fix Login'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
                              className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                              aria-label={`Elimina utente ${user.nome || user.email || user.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modali */}
      <UserFormModal
        user={editingUser}
        open={showUserForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {deletingUser && (
        <UserDeleteDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {resettingPasswordUser && (
        <UserResetPasswordDialog
          user={resettingPasswordUser}
          open={!!resettingPasswordUser}
          onClose={() => setResettingPasswordUser(null)}
          onConfirm={handleResetPasswordConfirm}
          loading={resettingPassword}
        />
      )}

      {showImportModal && (
        <UserImportModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchUsers()
            setShowImportModal(false)
          }}
        />
      )}
    </div>
  )
}
