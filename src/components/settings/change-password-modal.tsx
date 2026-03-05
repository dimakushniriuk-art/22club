'use client'

import * as React from 'react'
import { createLogger } from '@/lib/logger'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
} from '@/components/ui'

const logger = createLogger('components:settings:change-password-modal')
import { useSupabase } from '@/hooks/use-supabase'
import { useToast } from '@/components/ui/toast'

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const { supabase, user } = useSupabase()
  const { addToast } = useToast()

  const [currentPassword, setCurrentPassword] = React.useState<string>('')
  const [newPassword, setNewPassword] = React.useState<string>('')
  const [confirmPassword, setConfirmPassword] = React.useState<string>('')
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  const resetState = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrorMessage('')
  }

  const validate = (): string | null => {
    if (!newPassword || !confirmPassword) return 'Compila tutti i campi'
    if (newPassword !== confirmPassword) return 'Le password non coincidono'
    if (newPassword.length < 8) return 'La nuova password deve avere almeno 8 caratteri'
    const hasUpper = /[A-Z]/.test(newPassword)
    const hasNumber = /\d/.test(newPassword)
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
    if (!hasUpper || !hasNumber || !hasSpecial)
      return 'La password deve includere almeno una maiuscola, un numero e un simbolo'
    return null
  }

  const handleSubmit = async () => {
    setErrorMessage('')
    const validationError = validate()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      setIsSubmitting(true)

      // Verifica opzionale della password corrente (se fornita)
      if (currentPassword && user?.email) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        })
        if (signInErr) {
          setErrorMessage('La password attuale non è corretta')
          setIsSubmitting(false)
          return
        }
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setErrorMessage(error.message)
        setIsSubmitting(false)
        return
      }

      addToast({
        title: 'Password aggiornata',
        message: 'La tua password è stata modificata correttamente.',
        variant: 'success',
      })
      onOpenChange(false)
      resetState()
    } catch (error) {
      logger.error('Errore cambio password', error)
      setErrorMessage('Errore inatteso. Riprova più tardi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="right" size="md">
      <DrawerContent onClose={() => onOpenChange(false)}>
        <DrawerHeader title="Cambia password" description="Aggiorna la password del tuo account" />
        <DrawerBody>
          <div className="space-y-4">
            <Input
              label="Password attuale (opzionale)"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              label="Nuova password"
              type="password"
              placeholder="Almeno 8 caratteri, una maiuscola, un numero, un simbolo"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Conferma nuova password"
              type="password"
              placeholder="Ripeti la nuova password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            {errorMessage && <p className="text-state-error text-sm">{errorMessage}</p>}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand/90"
          >
            {isSubmitting ? 'Salvataggio…' : 'Aggiorna password'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
