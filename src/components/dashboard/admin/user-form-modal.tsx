'use client'

import { useState, useEffect } from 'react'
import { createLogger } from '@/lib/logger'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const logger = createLogger('components:dashboard:admin:user-form-modal')
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { notifySuccess, notifyError } from '@/lib/notifications'

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
}

interface UserFormModalProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Trainer {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
}

export function UserFormModal({ user, open, onClose, onSuccess }: UserFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loadingTrainers, setLoadingTrainers] = useState(false)
  const [assignedTrainerId, setAssignedTrainerId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    cognome: '',
    phone: '',
    role: 'atleta' as 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete' | 'nutrizionista' | 'massaggiatore',
    stato: 'attivo' as 'attivo' | 'inattivo' | 'sospeso',
    password: '',
    confirmPassword: '',
  })

  // Carica lista trainer
  useEffect(() => {
    if (open) {
      loadTrainers()
    }
  }, [open])

  // Carica trainer assegnato quando si modifica un atleta
  useEffect(() => {
    if (user && open && (user.role === 'atleta' || user.role === 'athlete')) {
      loadAssignedTrainer(user.id)
    } else {
      setAssignedTrainerId(null)
    }
  }, [user, open])

  // Reset form quando si apre/chiude
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        nome: user.nome || '',
        cognome: user.cognome || '',
        phone: user.phone || '',
        role: user.role,
        stato: user.stato,
        password: '',
        confirmPassword: '',
      })
    } else {
      setFormData({
        email: '',
        nome: '',
        cognome: '',
        phone: '',
        role: 'atleta',
        stato: 'attivo',
        password: '',
        confirmPassword: '',
      })
      setAssignedTrainerId(null)
    }
  }, [user, open])

  async function loadTrainers() {
    try {
      setLoadingTrainers(true)
      const response = await fetch('/api/admin/users?role=trainer')
      if (response.ok) {
        const data = await response.json()
        // Filtra solo trainer (pt o trainer)
        const trainerList = (data.users || []).filter(
          (u: User) => u.role === 'pt' || u.role === 'trainer',
        )
        setTrainers(trainerList)
      }
    } catch (error) {
      logger.error('Errore caricamento trainer', error)
    } finally {
      setLoadingTrainers(false)
    }
  }

  async function loadAssignedTrainer(athleteId: string) {
    try {
      const response = await fetch(`/api/admin/users/trainer?athleteId=${athleteId}`)
      if (response.ok) {
        const data = await response.json()
        setAssignedTrainerId(data.trainerId || null)
      }
    } catch (error) {
      logger.error('Errore caricamento trainer assegnato', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validazione
    if (!formData.email) {
      notifyError('Errore', 'Email obbligatoria')
      return
    }

    if (!user && !formData.password) {
      notifyError('Errore', 'Password obbligatoria per nuovi utenti')
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      notifyError('Errore', 'Le password non corrispondono')
      return
    }

    if (formData.password && formData.password.length < 6) {
      notifyError('Errore', 'La password deve essere di almeno 6 caratteri')
      return
    }

    try {
      setLoading(true)

      if (user) {
        // Aggiorna utente esistente
        const updateData: {
          userId: string
          nome?: string | null
          cognome?: string | null
          phone?: string | null
          role?: 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete' | 'nutrizionista' | 'massaggiatore'
          stato?: 'attivo' | 'inattivo' | 'sospeso'
          email?: string
          password?: string
        } = {
          userId: user.id,
        }

        if (formData.nome !== undefined) updateData.nome = formData.nome || null
        if (formData.cognome !== undefined) updateData.cognome = formData.cognome || null
        if (formData.phone !== undefined) updateData.phone = formData.phone || null
        if (formData.role !== undefined) updateData.role = formData.role
        if (formData.stato !== undefined) updateData.stato = formData.stato
        if (formData.email !== undefined) updateData.email = formData.email
        if (formData.password) updateData.password = formData.password

        // Aggiungi trainer_id se è un atleta e c'è un trainer selezionato
        if ((formData.role === 'atleta' || formData.role === 'athlete') && assignedTrainerId) {
          ;(updateData as { trainerId?: string }).trainerId = assignedTrainerId
        }

        const response = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const error = await response.json()
          // Traduci messaggi di errore comuni
          let errorMessage = error.error || "Errore nell'aggiornamento utente"
          const isConflictError =
            response.status === 409 ||
            errorMessage.includes('already registered') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('già registrata')

          if (isConflictError) {
            errorMessage = 'Questa email è già registrata nel sistema'
          }

          // Crea un errore con lo status code per distinguerlo
          const customError = new Error(errorMessage) as Error & { status?: number }
          customError.status = response.status
          throw customError
        }

        notifySuccess('Utente aggiornato', "L'utente è stato aggiornato con successo")
      } else {
        // Crea nuovo utente
        const createData: {
          email: string
          password: string
          nome: string | null
          cognome: string | null
          phone: string | null
          role: typeof formData.role
          stato: typeof formData.stato
          trainerId?: string
        } = {
          email: formData.email,
          password: formData.password,
          nome: formData.nome || null,
          cognome: formData.cognome || null,
          phone: formData.phone || null,
          role: formData.role,
          stato: formData.stato,
        }

        // Aggiungi trainer_id se è un atleta e c'è un trainer selezionato
        if ((formData.role === 'atleta' || formData.role === 'athlete') && assignedTrainerId) {
          createData.trainerId = assignedTrainerId
        }

        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        })

        if (!response.ok) {
          const error = await response.json()
          // Traduci messaggi di errore comuni
          let errorMessage = error.error || 'Errore nella creazione utente'
          const isConflictError =
            response.status === 409 ||
            errorMessage.includes('already registered') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('già registrata')

          if (isConflictError) {
            errorMessage = 'Questa email è già registrata nel sistema'
          }

          // Crea un errore con lo status code per distinguerlo
          const customError = new Error(errorMessage) as Error & { status?: number }
          customError.status = response.status
          throw customError
        }

        notifySuccess('Utente creato', "L'utente è stato creato con successo")
      }

      onSuccess()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Distingui tra errori di validazione (409 Conflict) e errori critici
      const isConflictError =
        error.status === 409 ||
        error.message?.includes('già registrata') ||
        error.message?.includes('already registered')

      if (isConflictError) {
        // Log come warning per errori di validazione previsti
        logger.warn('Email già registrata durante creazione/aggiornamento utente', {
          email: user?.email || formData.email,
          userId: user?.id,
          errorMessage: error.message,
        })
        notifyError(
          'Email già registrata',
          error.message || 'Questa email è già registrata nel sistema',
        )
      } else {
        // Log come error per errori critici
        logger.error('Errore nel salvataggio utente', error, {
          userId: user?.id,
          email: user?.email || formData.email,
          errorStatus: error.status,
        })
        notifyError('Errore', error.message || 'Errore nel salvataggio utente')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background-secondary border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">
            {user ? 'Modifica Utente' : 'Nuovo Utente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-gray-300">
                Nome
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-background border-border text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cognome" className="text-gray-300">
                Cognome
              </Label>
              <Input
                id="cognome"
                value={formData.cognome}
                onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                className="bg-background border-border text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-background border-border text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">
              Telefono
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-background border-border text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-300">
                Ruolo
              </Label>
              <Select
                id="role"
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as typeof formData.role })
                }
                className="bg-background border-border text-white"
              >
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pt">Personal Trainer</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="atleta">Atleta</SelectItem>
                <SelectItem value="nutrizionista">Nutrizionista</SelectItem>
                <SelectItem value="massaggiatore">Massaggiatore</SelectItem>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stato" className="text-gray-300">
                Stato
              </Label>
              <Select
                id="stato"
                value={formData.stato}
                onValueChange={(value) =>
                  setFormData({ ...formData, stato: value as typeof formData.stato })
                }
                className="bg-background border-border text-white"
              >
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="inattivo">Inattivo</SelectItem>
                <SelectItem value="sospeso">Sospeso</SelectItem>
              </Select>
            </div>
          </div>

          {/* Campo selezione trainer per atleti */}
          {(formData.role === 'atleta' || formData.role === 'athlete') && (
            <div className="space-y-2">
              <Label htmlFor="trainer" className="text-gray-300">
                Trainer Assegnato
              </Label>
              <Select
                id="trainer"
                value={assignedTrainerId || ''}
                onValueChange={(value) => setAssignedTrainerId(value || null)}
                className="bg-background border-border text-white"
                disabled={loadingTrainers}
              >
                <SelectItem value="">Nessun trainer</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.nome || ''} {trainer.cognome || ''} {trainer.email ? `(${trainer.email})` : ''}
                  </SelectItem>
                ))}
              </Select>
              {loadingTrainers && (
                <p className="text-sm text-text-secondary">Caricamento trainer...</p>
              )}
            </div>
          )}

          {!user && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!user}
                  className="bg-background border-border text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Conferma Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={!user}
                  className="bg-background border-border text-white"
                />
              </div>
            </>
          )}

          {user && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Nuova Password (lascia vuoto per non cambiare)
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-background border-border text-white"
              />
              {formData.password && (
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Conferma nuova password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-background border-border text-white mt-2"
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Salvataggio...' : user ? 'Aggiorna' : 'Crea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
