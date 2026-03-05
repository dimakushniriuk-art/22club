'use client'

import { Suspense, useState, useMemo } from 'react'
import { createLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { AthleteBackground } from '@/components/athlete/athlete-background'

const logger = createLogger('app:registrati:page')

function RegisterFormFallback() {
  return (
    <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
      <Card variant="default" className="login-card w-full max-w-md min-[834px]:max-w-lg backdrop-blur-xl border border-border rounded-xl min-[834px]:rounded-2xl bg-background-secondary/95">
        <CardContent className="p-5 sm:p-6 min-[834px]:p-8">
          <div className="text-center mb-6 min-[834px]:mb-8">
            <div className="mb-4 min-[834px]:mb-6 flex justify-center">
              <Image src="/logo.svg" alt="22 Club Logo" width={200} height={200} className="w-auto h-24 min-[834px]:h-28 object-contain" priority />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Crea il tuo account</h2>
            <p className="text-text-secondary text-sm mt-2">Caricamento...</p>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 rounded-xl bg-background-tertiary/50 animate-pulse" />
              <div className="h-10 rounded-xl bg-background-tertiary/50 animate-pulse" />
            </div>
            <div className="h-10 rounded-xl bg-background-tertiary/50 animate-pulse" />
            <div className="h-10 rounded-xl bg-background-tertiary/50 animate-pulse" />
            <div className="h-10 rounded-xl bg-background-tertiary/50 animate-pulse" />
            <div className="h-12 rounded-xl bg-background-tertiary/50 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RegisterContent() {
  const searchParams = useSearchParams()
  const codiceInvito = useMemo(
    () => searchParams.get('codice')?.trim() || searchParams.get('code')?.trim() || '',
    [searchParams],
  )

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      setLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome,
            cognome: formData.cognome,
            role: 'athlete',
            org_id: 'default-org',
          },
        },
      })

      if (authError) {
        logger.error('Errore creazione utente', authError, {
          name: authError.name,
          status: authError.status,
        })
        setError(authError.message || 'Errore durante la registrazione')
        return
      }

      if (authData.user) {
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single()

        const isAbort = checkError && (
          checkError.code === '' ||
          (typeof checkError.details === 'string' && checkError.details.includes('AbortError'))
        )
        if (checkError && checkError.code !== 'PGRST116' && !isAbort) {
          logger.error('Errore verifica profilo', checkError, {
            code: checkError.code,
            details: checkError.details,
            hint: checkError.hint,
          })
        }

        const session = authData.session
        const codiceAtSubmit =
          searchParams.get('codice')?.trim() || searchParams.get('code')?.trim() || ''
        const needProfile = !existingProfile || !!isAbort
        const needInvite = !!codiceAtSubmit
        if (needProfile || needInvite) {
          const res = await fetch('/api/register/complete-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nome: formData.nome,
              cognome: formData.cognome,
              email: formData.email,
              ...(codiceAtSubmit && { codice: codiceAtSubmit }),
              ...(session && {
                access_token: session.access_token,
                refresh_token: session.refresh_token,
              }),
            }),
          })
          const data = await res.json().catch(() => ({}))
          if (!res.ok) {
            logger.error('Errore API complete-profile', { status: res.status, data })
            setError(data?.error || 'Errore durante la creazione del profilo. Riprova più tardi.')
            return
          }
        }

        router.push('/home')
        router.refresh()
      } else {
        setError('Utente non creato correttamente')
      }
    } catch (err) {
      const errorDetails =
        err instanceof Error
          ? { message: err.message, name: err.name, stack: err.stack }
          : typeof err === 'object' && err !== null
            ? {
                message: (err as { message?: string }).message || 'Errore sconosciuto',
                fullError: err,
              }
            : { rawError: err }
      logger.error('Errore durante la registrazione', err, errorDetails)
      setError('Errore durante la registrazione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md min-[834px]:max-w-lg animate-fade-in relative z-10">
      <Card variant="default" className="login-card w-full max-w-md min-[834px]:max-w-lg backdrop-blur-xl border border-border rounded-xl min-[834px]:rounded-2xl bg-background-secondary/95">
          <CardContent className="p-5 sm:p-6 min-[834px]:p-8">
            <div className="text-center mb-6 min-[834px]:mb-8">
              <div className="mb-4 min-[834px]:mb-6 flex justify-center">
                <div className="relative">
                  <Image
                    src="/logo.svg"
                    alt="22 Club Logo"
                    width={200}
                    height={200}
                    className="w-auto h-24 min-[834px]:h-28 object-contain drop-shadow-[0_0_20px_rgba(2,179,191,0.25)]"
                    priority
                  />
                  <div className="absolute inset-0 bg-primary/15 blur-xl -z-10" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Crea il tuo account</h2>
              <p className="text-text-secondary text-sm mt-2">Compila i campi per registrarti.</p>
              {codiceInvito && (
                <p className="text-primary text-xs mt-1">
                  Registrazione con invito: sarai collegato al tuo PT dopo l’iscrizione.
                </p>
              )}
            </div>

            <form onSubmit={handleRegister} className="space-y-5 min-[834px]:space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-sm font-medium text-text-primary">
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Mario"
                    className="rounded-xl min-h-[44px] bg-background border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome" className="text-sm font-medium text-text-primary">
                    Cognome
                  </Label>
                  <Input
                    id="cognome"
                    type="text"
                    value={formData.cognome}
                    onChange={(e) => handleInputChange('cognome', e.target.value)}
                    placeholder="Rossi"
                    className="rounded-xl min-h-[44px] bg-background border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-text-primary">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="la.tua@email.com"
                  className="rounded-xl min-h-[44px] bg-background border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-text-primary">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••"
                  className="rounded-xl min-h-[44px] bg-background border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
                  Conferma Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••"
                  className="rounded-xl min-h-[44px] bg-background border-border text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl p-4 animate-fade-in bg-state-error/10 border border-state-error/20">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-state-error" />
                  <p className="text-sm text-state-error flex-1">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" aria-hidden />
                    Registrazione in corso...
                  </>
                ) : (
                  'Registrati'
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-text-secondary text-sm">
                Hai già un account?{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Accedi
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="page-login min-h-screen flex items-center justify-center px-4 py-4 min-[834px]:px-6 min-[834px]:py-6 relative overflow-hidden safe-area-inset bg-background" style={{ minHeight: '100dvh' }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AthleteBackground />
      </div>
      <Suspense fallback={<RegisterFormFallback />}>
        <RegisterContent />
      </Suspense>
    </div>
  )
}
