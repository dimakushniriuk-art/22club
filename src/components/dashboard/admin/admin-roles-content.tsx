'use client'

import { useState, useEffect } from 'react'
import { Shield, Users, Edit, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { notifySuccess, notifyError } from '@/lib/notifications'
import { RolePermissionsEditor } from './role-permissions-editor'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminRolesContent')

interface Role {
  id: string
  name: string
  description: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any
  created_at: string
  updated_at: string | null
  user_count?: number
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

export function AdminRolesContent() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editedDescription, setEditedDescription] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editedPermissions, setEditedPermissions] = useState<any>({})

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Errore nel caricamento ruoli', error)
      notifyError('Errore', error.message || 'Errore nel caricamento ruoli')
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Errore nel salvataggio ruolo', error, { roleId: editingRole?.id })
      notifyError('Errore', error.message || 'Errore nel salvataggio ruolo')
    }
  }

  const getRoleBadge = (roleName: string) => {
    const roleMap: Record<string, { label: string; className: string }> = {
      admin: { label: 'Admin', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      pt: { label: 'PT', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      trainer: { label: 'Trainer', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      atleta: { label: 'Atleta', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      athlete: { label: 'Atleta', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    }

    const roleInfo = roleMap[roleName] || {
      label: roleName,
      className: 'bg-gray-500/20 text-gray-400',
    }
    return <Badge className={roleInfo.className}>{roleInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Gestione Ruoli e Permessi</h1>
        <p className="text-gray-400">Configura i permessi per ogni ruolo del sistema</p>
      </div>

      {/* Lista Ruoli */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`bg-background-secondary border-border ${
              editingRole?.id === role.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {getRoleBadge(role.name)}
                </div>
                {editingRole?.id !== role.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardTitle className="text-white mt-2">{role.name}</CardTitle>
              {editingRole?.id === role.id ? (
                <div className="space-y-2 mt-2">
                  <Label htmlFor={`desc-${role.id}`} className="text-gray-300 text-sm">
                    Descrizione
                  </Label>
                  <Input
                    id={`desc-${role.id}`}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="bg-background border-border text-white"
                    placeholder="Descrizione del ruolo..."
                  />
                </div>
              ) : (
                <CardDescription className="text-gray-400">
                  {role.description || 'Nessuna descrizione'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Users className="h-4 w-4" />
                <span>{role.user_count || 0} utenti</span>
              </div>

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
                  <p className="text-sm font-medium text-gray-300">Permessi attivi:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions && typeof role.permissions === 'object'
                      ? Object.keys(role.permissions)
                          .filter((key) => role.permissions[key] === true)
                          .slice(0, 3)
                          .map((key) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}
                            </Badge>
                          ))
                      : null}
                    {role.permissions &&
                      typeof role.permissions === 'object' &&
                      Object.keys(role.permissions).filter((key) => role.permissions[key] === true)
                        .length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +
                          {Object.keys(role.permissions).filter(
                            (key) => role.permissions[key] === true,
                          ).length - 3}
                        </Badge>
                      )}
                    {(!role.permissions ||
                      (typeof role.permissions === 'object' &&
                        Object.keys(role.permissions).filter(
                          (key) => role.permissions[key] === true,
                        ).length === 0)) && (
                      <span className="text-xs text-gray-500">Nessun permesso configurato</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
