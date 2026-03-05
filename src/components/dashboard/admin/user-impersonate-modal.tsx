'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { notifyError, notifySuccess } from '@/lib/notifications'

interface User {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  role: string
}

interface UserImpersonateModalProps {
  user: User
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UserImpersonateModal({ user, open, onClose, onSuccess }: UserImpersonateModalProps) {
  const [password, setPassword] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const displayName =
    user.nome || user.cognome
      ? `${user.nome || ''} ${user.cognome || ''}`.trim()
      : user.email || 'Utente'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      notifyError('Password richiesta', 'Inserisci la tua password admin per confermare.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/impersonation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetProfileId: user.id,
          reason: reason.trim() || null,
          adminPassword: password,
        }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        notifyError('Impersonation', data?.error || 'Avvio impersonation fallito')
        return
      }
      notifySuccess('Impersonation avviata', `Stai entrando come ${displayName}. Reindirizzamento...`)
      onSuccess()
      window.location.href = user.role === 'athlete' ? '/home' : user.role === 'marketing' ? '/dashboard/marketing' : '/dashboard'
    } catch (err) {
      notifyError('Errore', err instanceof Error ? err.message : 'Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPassword('')
    setReason('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-background-secondary border-border text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Impersona utente</DialogTitle>
          <DialogDescription>
            Inserisci la tua password admin per entrare come <strong>{displayName}</strong> ({user.role}
            ). L&apos;azione sarà registrata in audit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="text-sm text-text-secondary">
              Motivo (opzionale)
            </label>
            <Input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Es. supporto utente"
              className="mt-1 bg-background border-border"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="text-sm text-text-secondary">
              Password admin (obbligatoria) *
            </label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="La tua password"
              className="mt-1 bg-background border-border"
              autoComplete="current-password"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} className="border-border">
              Annulla
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? 'Avvio...' : 'Impersona'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
