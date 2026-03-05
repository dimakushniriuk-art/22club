'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Shield,
  Users,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Key,
  Lock,
  Calendar,
  Mail,
  Phone,
  User,
  MoreVertical,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModernKPICard } from '@/components/dashboard/modern-kpi-card'
import { UserResetPasswordDialog } from './user-reset-password-dialog'
import { UserDeleteDialog } from './user-delete-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { notifySuccess, notifyError } from '@/lib/notifications'
import { RolePermissionsEditor } from './role-permissions-editor'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminRolesContent')

type RolePermissions = Record<string, boolean>

interface Role {
  id: string
  name: string
  description: string | null
  permissions: RolePermissions
  created_at: string
  updated_at: string | null
  user_count?: number
}

interface RoleUser {
  id?: string
  user_id?: string
  email?: string
  role?: string
  nome?: string | null
  cognome?: string | null
  stato?: string | null
  phone?: string | null
}

interface PermissionCategory {
  category: string
  permissions: {
    key: string
    label: string
    description: string
  }[]
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    category: 'Utenti',
    permissions: [
      {
        key: 'users.view',
        label: 'Visualizza utenti',
        description: 'Può vedere la lista degli utenti',
      },
      { key: 'users.create', label: 'Crea utenti', description: 'Può creare nuovi utenti' },
      {
        key: 'users.edit',
        label: 'Modifica utenti',
        description: 'Può modificare utenti esistenti',
      },
      { key: 'users.delete', label: 'Elimina utenti', description: 'Può eliminare utenti' },
    ],
  },
  {
    category: 'Clienti',
    permissions: [
      {
        key: 'clients.view',
        label: 'Visualizza clienti',
        description: 'Può vedere la lista dei clienti',
      },
      { key: 'clients.create', label: 'Crea clienti', description: 'Può creare nuovi clienti' },
      {
        key: 'clients.edit',
        label: 'Modifica clienti',
        description: 'Può modificare clienti esistenti',
      },
      { key: 'clients.delete', label: 'Elimina clienti', description: 'Può eliminare clienti' },
    ],
  },
  {
    category: 'Appuntamenti',
    permissions: [
      {
        key: 'appointments.view',
        label: 'Visualizza appuntamenti',
        description: 'Può vedere gli appuntamenti',
      },
      {
        key: 'appointments.create',
        label: 'Crea appuntamenti',
        description: 'Può creare nuovi appuntamenti',
      },
      {
        key: 'appointments.edit',
        label: 'Modifica appuntamenti',
        description: 'Può modificare appuntamenti',
      },
      {
        key: 'appointments.delete',
        label: 'Elimina appuntamenti',
        description: 'Può eliminare appuntamenti',
      },
    ],
  },
  {
    category: 'Schede Allenamento',
    permissions: [
      {
        key: 'workouts.view',
        label: 'Visualizza schede',
        description: 'Può vedere le schede di allenamento',
      },
      { key: 'workouts.create', label: 'Crea schede', description: 'Può creare nuove schede' },
      {
        key: 'workouts.edit',
        label: 'Modifica schede',
        description: 'Può modificare schede esistenti',
      },
      { key: 'workouts.delete', label: 'Elimina schede', description: 'Può eliminare schede' },
    ],
  },
  {
    category: 'Pagamenti',
    permissions: [
      {
        key: 'payments.view',
        label: 'Visualizza pagamenti',
        description: 'Può vedere i pagamenti',
      },
      {
        key: 'payments.create',
        label: 'Crea pagamenti',
        description: 'Può registrare nuovi pagamenti',
      },
      {
        key: 'payments.edit',
        label: 'Modifica pagamenti',
        description: 'Può modificare pagamenti',
      },
      {
        key: 'payments.delete',
        label: 'Elimina pagamenti',
        description: 'Può eliminare pagamenti',
      },
    ],
  },
  {
    category: 'Documenti',
    permissions: [
      {
        key: 'documents.view',
        label: 'Visualizza documenti',
        description: 'Può vedere i documenti',
      },
      {
        key: 'documents.upload',
        label: 'Carica documenti',
        description: 'Può caricare nuovi documenti',
      },
      {
        key: 'documents.delete',
        label: 'Elimina documenti',
        description: 'Può eliminare documenti',
      },
    ],
  },
  {
    category: 'Comunicazioni',
    permissions: [
      {
        key: 'communications.view',
        label: 'Visualizza comunicazioni',
        description: 'Può vedere le comunicazioni',
      },
      {
        key: 'communications.create',
        label: 'Crea comunicazioni',
        description: 'Può creare nuove comunicazioni',
      },
      {
        key: 'communications.send',
        label: 'Invia comunicazioni',
        description: 'Può inviare comunicazioni',
      },
    ],
  },
  {
    category: 'Amministrazione',
    permissions: [
      {
        key: 'admin.access',
        label: 'Accesso Admin',
        description: 'Può accedere al pannello admin',
      },
      { key: 'admin.roles', label: 'Gestione Ruoli', description: 'Può gestire ruoli e permessi' },
      {
        key: 'admin.settings',
        label: 'Impostazioni Sistema',
        description: 'Può modificare le impostazioni di sistema',
      },
    ],
  },
]

const VALID_ROLE_NAMES = ['admin', 'trainer', 'athlete', 'marketing', 'nutrizionista', 'massaggiatore']

export function AdminRolesContent() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editedDescription, setEditedDescription] = useState('')
  const [editedPermissions, setEditedPermissions] = useState<RolePermissions>({})
  const [isCreating, setIsCreating] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [newRolePermissions, setNewRolePermissions] = useState<RolePermissions>({})
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [selectedRoleUsers, setSelectedRoleUsers] = useState<Role | null>(null)
  const [roleUsers, setRoleUsers] = useState<RoleUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [resettingPasswordUser, setResettingPasswordUser] = useState<RoleUser | null>(null)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [deletingUser, setDeletingUser] = useState<RoleUser | null>(null)
  const [verifyingLoginUser, setVerifyingLoginUser] = useState<RoleUser | null>(null)
  const [verifyingLogin, setVerifyingLogin] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  async function fetchRoles() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/roles')

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel caricamento ruoli')
      }

      const { roles: rolesData } = await response.json()
      setRoles(rolesData || [])
    } catch (error: unknown) {
      logger.error('Errore nel caricamento ruoli', error)
      notifyError('Errore', error instanceof Error ? error.message : 'Errore nel caricamento ruoli')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setEditedDescription(role.description || '')
    setEditedPermissions(role.permissions || {})
  }

  const handleCancel = () => {
    setEditingRole(null)
    setEditedDescription('')
    setEditedPermissions({})
  }

  const handleSave = async () => {
    if (!editingRole) return

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: editingRole.id,
          description: editedDescription,
          permissions: editedPermissions,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel salvataggio ruolo')
      }

      notifySuccess('Ruolo aggiornato', 'Il ruolo è stato aggiornato con successo')
      fetchRoles()
      handleCancel()
    } catch (error: unknown) {
      logger.error('Errore nel salvataggio ruolo', error, { roleId: editingRole?.id })
      notifyError('Errore', error instanceof Error ? error.message : 'Errore nel salvataggio ruolo')
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setNewRoleName('')
    setNewRoleDescription('')
    setNewRolePermissions({})
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewRoleName('')
    setNewRoleDescription('')
    setNewRolePermissions({})
  }

  const handleSaveCreate = async () => {
    if (!newRoleName.trim()) {
      notifyError('Errore', 'Il nome del ruolo è obbligatorio')
      return
    }

    if (!VALID_ROLE_NAMES.includes(newRoleName.toLowerCase())) {
      notifyError(
        'Errore',
        `Nome ruolo non valido. Valori permessi: ${VALID_ROLE_NAMES.join(', ')}`,
      )
      return
    }

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName.toLowerCase(),
          description: newRoleDescription || null,
          permissions: newRolePermissions,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nella creazione ruolo')
      }

      notifySuccess('Ruolo creato', 'Il ruolo è stato creato con successo')
      fetchRoles()
      handleCancelCreate()
    } catch (error: unknown) {
      logger.error('Errore nella creazione ruolo', error)
      notifyError('Errore', error instanceof Error ? error.message : 'Errore nella creazione ruolo')
    }
  }

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
  }

  const handleCancelDelete = () => {
    setRoleToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return

    try {
      const response = await fetch(`/api/admin/roles?roleId=${roleToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nell\'eliminazione ruolo')
      }

      notifySuccess('Ruolo eliminato', 'Il ruolo è stato eliminato con successo')
      fetchRoles()
      handleCancelDelete()
    } catch (error: unknown) {
      logger.error('Errore nell\'eliminazione ruolo', error, { roleId: roleToDelete.id })
      notifyError('Errore', error instanceof Error ? error.message : 'Errore nell\'eliminazione ruolo')
    }
  }

  const handleViewUsers = async (role: Role) => {
    setSelectedRoleUsers(role)
    setLoadingUsers(true)

    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel caricamento utenti')
      }

      const { users } = await response.json()
      // Filtra utenti per ruolo
      const filteredUsers = (users || []).filter(
        (user: RoleUser) => user.role === role.name || (role.name === 'pt' && user.role === 'trainer'),
      )
      
      // Log per debug struttura utenti
      if (filteredUsers.length > 0) {
        logger.debug('Utenti filtrati per ruolo', {
          roleName: role.name,
          count: filteredUsers.length,
          firstUserKeys: Object.keys(filteredUsers[0]),
          firstUserId: filteredUsers[0].id,
        })
      }
      
      setRoleUsers(filteredUsers)
    } catch (error: unknown) {
      logger.error('Errore nel caricamento utenti ruolo', error)
      notifyError('Errore', error instanceof Error ? error.message : 'Errore nel caricamento utenti')
      setRoleUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleCloseUsersDialog = () => {
    setSelectedRoleUsers(null)
    setRoleUsers([])
  }

  const handleEditUser = (user: RoleUser) => {
    // Apri la pagina gestione utenti con filtro per questo utente
    window.location.href = `/dashboard/admin/utenti?userId=${user.id}`
  }

  const handleResetPassword = (user: RoleUser) => {
    setResettingPasswordUser(user)
  }

  const handleResetPasswordConfirm = async (password: string) => {
    if (!resettingPasswordUser) return

    try {
      setResettingPassword(true)
      logger.debug('Reset password utente', {
        userId: resettingPasswordUser.id,
        userEmail: resettingPasswordUser.email,
      })

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resettingPasswordUser.id,
          password,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMessage = 'Errore nel reset password'
        try {
          const data = text ? JSON.parse(text) : {}
          errorMessage = data.error || errorMessage
        } catch {
          // risposta non JSON (es. 404 HTML)
        }
        throw new Error(errorMessage)
      }

      notifySuccess('Password resettata', 'La password è stata resettata con successo')
      setResettingPasswordUser(null)
    } catch (error: unknown) {
      logger.error('Errore reset password', error, {
        userId: resettingPasswordUser?.id,
        userEmail: resettingPasswordUser?.email,
      })
      notifyError('Errore', error instanceof Error ? error.message : 'Errore durante il reset della password')
    } finally {
      setResettingPassword(false)
    }
  }

  const handleVerifyLogin = async (user: RoleUser) => {
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
    } catch (error: unknown) {
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

  const handleDeleteUser = (user: RoleUser) => {
    setDeletingUser(user)
  }

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return

    // Verifica che l'ID utente sia presente
    const userId = deletingUser.id || deletingUser.user_id
    if (!userId) {
      logger.error('ID utente non disponibile', null, { deletingUser })
      notifyError('Errore', 'ID utente non disponibile')
      setDeletingUser(null)
      return
    }

    try {
      logger.debug('Tentativo eliminazione utente', {
        userId,
        userEmail: deletingUser.email,
        deletingUserKeys: Object.keys(deletingUser),
      })

      const response = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({} as { error?: string; details?: string; code?: string; hint?: string; errorDetails?: string }))
        const messageParts = [
          error?.error || "Errore nell'eliminazione utente",
          error?.details ? String(error.details) : null,
          error?.code ? `code=${error.code}` : null,
          error?.hint ? `hint=${error.hint}` : null,
          error?.errorDetails ? `details=${error.errorDetails}` : null,
        ].filter(Boolean)
        throw new Error(messageParts.join(' • '))
      }

      logger.debug('Utente eliminato con successo', {
        userId,
        userEmail: deletingUser.email,
      })

      notifySuccess('Utente eliminato', "L'utente è stato eliminato con successo")
      setDeletingUser(null)
      // Ricarica gli utenti del ruolo
      if (selectedRoleUsers) {
        handleViewUsers(selectedRoleUsers)
      }
    } catch (error: unknown) {
      logger.error("Errore nell'eliminazione utente", error, {
        userId: deletingUser?.id,
        userEmail: deletingUser?.email,
      })
      notifyError('Errore', error instanceof Error ? error.message : "Errore nell'eliminazione utente")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      trainer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      athlete: 'bg-green-500/20 text-green-400 border-green-500/30',
      marketing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    }
    return roleMap[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getStatoBadgeColor = (stato: string) => {
    const statoMap: Record<string, string> = {
      attivo: 'bg-green-500/20 text-green-400 border-green-500/30',
      inattivo: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      sospeso: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return statoMap[stato] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const getRoleBadge = (roleName: string) => {
    const roleMap: Record<string, { label: string; className: string }> = {
      admin: { label: 'Admin', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      trainer: { label: 'Trainer', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      athlete: { label: 'Atleta', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      marketing: { label: 'Marketing', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    }

    const roleInfo = roleMap[roleName] || {
      label: roleName,
      className: 'bg-gray-500/20 text-gray-400',
    }
    return <Badge className={roleInfo.className}>{roleInfo.label}</Badge>
  }

  const getRoleCardGradient = (roleName: string) => {
    const gradientMap: Record<string, string> = {
      admin: 'from-red-500/10 to-rose-500/10 border-red-500/30',
      trainer: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30',
      athlete: 'from-green-500/10 to-emerald-500/10 border-green-500/30',
      marketing: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/30',
    }
    return (
      gradientMap[roleName] || 'from-gray-500/10 to-slate-500/10 border-gray-500/30'
    )
  }

  // Calcola statistiche
  const stats = useMemo(() => {
    const totalRoles = roles.length
    const totalUsers = roles.reduce((sum, role) => sum + (role.user_count || 0), 0)
    const totalPermissions = roles.reduce((sum, role) => {
      if (role.permissions && typeof role.permissions === 'object') {
        return sum + Object.keys(role.permissions).filter((key) => role.permissions[key] === true).length
      }
      return sum
    }, 0)
    const rolesWithUsers = roles.filter((role) => (role.user_count || 0) > 0).length

    return {
      totalRoles,
      totalUsers,
      totalPermissions,
      rolesWithUsers,
    }
  }, [roles])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  const getActivePermissionsCount = (permissions: RolePermissions) => {
    if (!permissions || typeof permissions !== 'object') return 0
    return Object.keys(permissions).filter((key) => permissions[key] === true).length
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Gestione Ruoli e Permessi</h1>
          <p className="text-gray-400">Configura i permessi per ogni ruolo del sistema</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Crea Ruolo
        </Button>
      </div>

      {/* Statistiche KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernKPICard
          title="Totale Ruoli"
          value={stats.totalRoles}
          icon={<Shield className="h-5 w-5" />}
          color="blue"
        />
        <ModernKPICard
          title="Utenti Totali"
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <ModernKPICard
          title="Permessi Attivi"
          value={stats.totalPermissions}
          icon={<Key className="h-5 w-5" />}
          color="purple"
        />
        <ModernKPICard
          title="Ruoli Attivi"
          value={stats.rolesWithUsers}
          icon={<Lock className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Lista Ruoli */}
      {roles.length === 0 ? (
        <Card className="bg-background-secondary border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nessun ruolo configurato</h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">
              Inizia creando il tuo primo ruolo per gestire i permessi degli utenti nel sistema.
            </p>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Crea Primo Ruolo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`bg-gradient-to-br ${getRoleCardGradient(role.name)} border ${
                editingRole?.id === role.id ? 'ring-2 ring-primary shadow-lg' : ''
              } transition-all hover:shadow-lg hover:scale-[1.02]`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background/50">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    {getRoleBadge(role.name)}
                  </div>
                {editingRole?.id !== role.id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {role.user_count === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(role)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
                <CardTitle className="text-white mt-3 text-lg capitalize">{role.name}</CardTitle>
                {editingRole?.id === role.id ? (
                  <div className="space-y-2 mt-3">
                    <Label htmlFor={`desc-${role.id}`} className="text-gray-300 text-sm">
                      Descrizione
                    </Label>
                    <Input
                      id={`desc-${role.id}`}
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="bg-background/50 border-border text-white"
                      placeholder="Descrizione del ruolo..."
                    />
                  </div>
                ) : (
                  <CardDescription className="text-gray-400 mt-2 min-h-10">
                    {role.description || 'Nessuna descrizione'}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistiche Ruolo */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleViewUsers(role)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer text-left"
                    disabled={!role.user_count || role.user_count === 0}
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-gray-400">Utenti</p>
                      <p className="text-sm font-semibold text-white">{role.user_count || 0}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                    <Key className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-gray-400">Permessi</p>
                      <p className="text-sm font-semibold text-white">
                        {getActivePermissionsCount(role.permissions)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Aggiuntive */}
                {!editingRole || editingRole?.id !== role.id ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-border/50">
                    <Calendar className="h-3 w-3" />
                    <span>Creato: {formatDate(role.created_at)}</span>
                    {role.updated_at && role.updated_at !== role.created_at && (
                      <>
                        <span>•</span>
                        <span>Aggiornato: {formatDate(role.updated_at)}</span>
                      </>
                    )}
                  </div>
                ) : null}

              {editingRole?.id === role.id ? (
                <div className="space-y-4">
                  <RolePermissionsEditor
                    permissions={editedPermissions}
                    onChange={setEditedPermissions}
                    categories={PERMISSION_CATEGORIES}
                  />
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salva
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Annulla
                    </Button>
                  </div>
                </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-300">Permessi attivi</p>
                      <Badge variant="outline" className="text-xs">
                        {getActivePermissionsCount(role.permissions)} totali
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {role.permissions && typeof role.permissions === 'object'
                        ? Object.keys(role.permissions)
                            .filter((key) => role.permissions[key] === true)
                            .slice(0, 6)
                            .map((key) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="text-xs bg-primary/10 border-primary/30 text-primary"
                              >
                                {key.split('.')[1] || key}
                              </Badge>
                            ))
                        : null}
                      {role.permissions &&
                        typeof role.permissions === 'object' &&
                        Object.keys(role.permissions).filter((key) => role.permissions[key] === true)
                          .length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.keys(role.permissions).filter((key) => role.permissions[key] === true).length - 6}
                          </Badge>
                        )}
                      {(!role.permissions ||
                        (typeof role.permissions === 'object' &&
                          Object.keys(role.permissions).filter(
                            (key) => role.permissions[key] === true,
                          ).length === 0)) && (
                        <span className="text-xs text-gray-500 italic">Nessun permesso configurato</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Creazione Ruolo */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Ruolo</DialogTitle>
            <DialogDescription>
              Crea un nuovo ruolo e configura i suoi permessi. Il nome deve essere uno dei valori
              validi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role-name" className="text-gray-300">
                Nome Ruolo *
              </Label>
              <Input
                id="new-role-name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="bg-background border-border text-white"
                placeholder="admin, trainer, athlete, marketing, nutrizionista, massaggiatore"
                list="valid-roles"
              />
              <datalist id="valid-roles">
                {VALID_ROLE_NAMES.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <p className="text-xs text-gray-400">
                Valori validi: {VALID_ROLE_NAMES.join(', ')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role-description" className="text-gray-300">
                Descrizione
              </Label>
              <Input
                id="new-role-description"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                className="bg-background border-border text-white"
                placeholder="Descrizione del ruolo..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Permessi</Label>
              <RolePermissionsEditor
                permissions={newRolePermissions}
                onChange={setNewRolePermissions}
                categories={PERMISSION_CATEGORIES}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCancelCreate} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button onClick={handleSaveCreate} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Crea Ruolo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Conferma Eliminazione */}
      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il ruolo <strong>{roleToDelete?.name}</strong>?
              <br />
              <br />
              Questa azione è irreversibile. Il ruolo può essere eliminato solo se non ci sono
              utenti associati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Utenti Ruolo */}
      <Dialog open={!!selectedRoleUsers} onOpenChange={(open) => !open && handleCloseUsersDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Utenti con ruolo: {selectedRoleUsers?.name}
            </DialogTitle>
            <DialogDescription>
              Lista completa degli utenti con questo ruolo. Puoi gestire ogni utente direttamente.
            </DialogDescription>
          </DialogHeader>

          {loadingUsers ? (
            <div className="py-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : roleUsers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nessun utente con questo ruolo</p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {roleUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-background-secondary border-border hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white truncate">
                              {user.nome && user.cognome
                                ? `${user.nome} ${user.cognome}`
                                : user.nome || user.cognome || 'Nome non disponibile'}
                            </h4>
                            <Badge className={getRoleBadgeColor(user.role ?? '')}>{user.role ?? ''}</Badge>
                            <Badge className={getStatoBadgeColor(user.stato || 'attivo')}>
                              {user.stato || 'attivo'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {user.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <MoreVertical className="h-4 w-4" />
                              Gestisci
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-background-secondary border-border"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
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
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                              aria-label={`Elimina utente ${user.nome || user.email || user.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseUsersDialog} variant="outline">
              Chiudi
            </Button>
            <Button
              onClick={() => {
                handleCloseUsersDialog()
                window.location.href = `/dashboard/admin/utenti?role=${selectedRoleUsers?.name}`
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Vai a Gestione Utenti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reset Password */}
      {resettingPasswordUser && (
        <UserResetPasswordDialog
          user={{
            id: resettingPasswordUser.id ?? '',
            nome: resettingPasswordUser.nome ?? null,
            cognome: resettingPasswordUser.cognome ?? null,
            email: resettingPasswordUser.email ?? null,
          }}
          open={!!resettingPasswordUser}
          onClose={() => setResettingPasswordUser(null)}
          onConfirm={handleResetPasswordConfirm}
          loading={resettingPassword}
        />
      )}

      {/* Dialog Elimina Utente */}
      {deletingUser && (
        <UserDeleteDialog
          user={{
            id: deletingUser.id ?? '',
            nome: deletingUser.nome ?? null,
            cognome: deletingUser.cognome ?? null,
            email: deletingUser.email ?? null,
          }}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUserConfirm}
        />
      )}
    </div>
  )
}
