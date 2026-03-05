'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Badge,
} from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { useLoginProtection } from '@/hooks/use-login-protection'

function LoginFormContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const { signIn, loading } = useAuth()
  const {
    isLocked,
    remainingTime,
    attempts,
    maxAttempts,
    recordFailedAttempt,
    recordSuccessfulAttempt,
  } = useLoginProtection()

  // Gestisci errori dalla URL
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'profilo':
          setError('Profilo incompleto • Contatta un amministratore')
          break
        case 'accesso_negato':
          setError('Accesso negato • Ruolo non autorizzato')
          break
        case 'errore_server':
          setError('Errore del server • Riprova più tardi')
          break
        default:
          setError('Errore sconosciuto • Riprova più tardi')
      }
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (isLocked) {
      setError(`Troppi tentativi falliti • Riprova tra ${remainingTime} ⏳`)
      return
    }

    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }

    const result = await signIn(email, password)

    if (result.success) {
      setSuccess('Accesso in corso…')
      recordSuccessfulAttempt()
    } else {
      setError(result.error || 'Email o password non validi ❌')
      recordFailedAttempt()
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background gradient decorativo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-gradient-to-tl from-purple-500/20 via-pink-500/20 to-rose-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-teal-950/20 via-cyan-950/20 to-blue-950/20 blur-3xl" />

        <Card
          variant="elevated"
          className="relative overflow-hidden border-teal-500/20 bg-background-secondary/95 backdrop-blur-xl"
        >
          {/* Decorative gradient top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

          <CardHeader className="relative border-b border-background-tertiary/50 bg-gradient-to-br from-background-secondary to-background-tertiary/30 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <span className="text-3xl">🏋️</span>
            </div>
            <CardTitle
              size="xl"
              className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              22Club
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Accedi al tuo account personale
            </CardDescription>
          </CardHeader>

          <CardContent className="relative p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@22club.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  helperText="Admin: admin@22club.it • PT: pt1@22club.it • Atleta: atleta1@22club.it"
                  required
                  disabled={isLocked}
                  className="bg-background-secondary/50"
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Password di esempio: password123"
                  required
                  disabled={isLocked}
                  className="bg-background-secondary/50"
                />
              </div>

              {/* Messaggi di stato */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-state-error/20 bg-state-error/10 p-3">
                  <span className="text-lg">⚠️</span>
                  <p className="text-state-error flex-1 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-state-valid/20 bg-state-valid/10 p-3">
                  <span className="text-lg">✓</span>
                  <p className="text-state-valid flex-1 text-sm">{success}</p>
                </div>
              )}

              {/* Contatore tentativi */}
              {attempts > 0 && !isLocked && (
                <div className="flex justify-center">
                  <Badge variant="warning" size="sm">
                    🛡️ Tentativi: {attempts}/{maxAttempts}
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading || isLocked}
                >
                  {isLocked ? (
                    <>
                      <span className="mr-2">🔒</span>
                      Bloccato per {remainingTime}
                    </>
                  ) : loading ? (
                    <>
                      <span className="mr-2">⏳</span>
                      Accesso in corso...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🔓</span>
                      Accedi
                    </>
                  )}
                </Button>

                <div className="flex flex-col items-center gap-2">
                  <Button variant="link" asChild className="text-white">
                    <Link href="/">← Torna alla homepage</Link>
                  </Button>
                  <Button variant="link" asChild className="text-white">
                    <Link href="/reset">Password dimenticata?</Link>
                  </Button>
                </div>
              </div>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 rounded-xl border border-background-tertiary/50 bg-background-tertiary/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <h4 className="text-text-primary text-sm font-semibold">Account Demo</h4>
              </div>
              <div className="text-text-secondary space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-background-secondary/50 px-3 py-2">
                  <span className="font-medium">Admin:</span>
                  <code className="text-teal-400">admin@22club.it</code>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background-secondary/50 px-3 py-2">
                  <span className="font-medium">PT:</span>
                  <code className="text-cyan-400">pt1@22club.it</code>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background-secondary/50 px-3 py-2">
                  <span className="font-medium">Atleta:</span>
                  <code className="text-blue-400">atleta1@22club.it</code>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-3 py-2">
                  <span className="font-medium">Password:</span>
                  <code className="text-teal-400 font-mono">password123</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="text-text-primary">Caricamento...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  )
}
