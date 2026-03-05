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
import { Label } from '@/components/ui/label'

interface User {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
}

interface UserResetPasswordDialogProps {
  user: User
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => void
  loading?: boolean
}

export function UserResetPasswordDialog({
  user,
  open,
  onClose,
  onConfirm,
  loading = false,
}: UserResetPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const userName =
    user.nome || user.cognome
      ? `${user.nome || ''} ${user.cognome || ''}`.trim()
      : user.email || 'Questo utente'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password && password === confirmPassword && password.length >= 6) {
      onConfirm(password)
    }
  }

  const handleClose = () => {
    setPassword('')
    setConfirmPassword('')
    onClose()
  }

  const isValid = password.length >= 6 && password === confirmPassword

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background-secondary border-border">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Reset Password</DialogTitle>
          <DialogDescription className="text-gray-300">
            Inserisci una nuova password per <strong>{userName}</strong>
            <br />
            <span className="text-sm text-gray-400">
              La password deve essere di almeno 6 caratteri
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Nuova Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-white"
                placeholder="Inserisci nuova password"
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Conferma Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border text-white"
                placeholder="Conferma nuova password"
                disabled={loading}
                minLength={6}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-400">Le password non corrispondono</p>
              )}
              {password && password.length < 6 && (
                <p className="text-sm text-red-400">
                  La password deve essere di almeno 6 caratteri
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="bg-background border-border text-white"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? 'Reset in corso...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
