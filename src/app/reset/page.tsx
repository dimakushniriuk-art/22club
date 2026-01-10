'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { resetPassword, loading } = useAuth()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email) {
      setError('Inserisci la tua email')
      return
    }

    const result = await resetPassword(email)

    if (result.success) {
      setSuccess('Ti abbiamo inviato un link di ripristino 📧')
    } else {
      setError(result.error || 'Email non valida o utente non esistente ❌')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle size="xl">Reset Password</CardTitle>
          <CardDescription>
            Inserisci la tua email per ricevere un link di ripristino
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="pt@22club.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Inserisci l'email associata al tuo account"
                required
              />
            </div>

            {/* Messaggi di stato */}
            {error && (
              <div className="bg-state-error/10 border-state-error/20 rounded-lg border p-3">
                <p className="text-state-error text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-state-valid/10 border-state-valid/20 rounded-lg border p-3">
                <p className="text-state-valid text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Invio in corso...' : 'Invia Link di Ripristino'}
              </Button>

              <div className="text-center">
                <Button variant="link" asChild>
                  <Link href="/login">← Torna al Login</Link>
                </Button>
              </div>
            </div>
          </form>

          {/* Informazioni aggiuntive */}
          <div className="bg-background-tertiary mt-6 rounded-lg p-4">
            <h4 className="text-text-primary mb-2 text-sm font-medium">Come funziona:</h4>
            <div className="text-text-secondary space-y-1 text-xs">
              <p>1. Inserisci la tua email</p>
              <p>2. Controlla la tua casella di posta</p>
              <p>3. Clicca sul link ricevuto</p>
              <p>4. Imposta una nuova password</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
