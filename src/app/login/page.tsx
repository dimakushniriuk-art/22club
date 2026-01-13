'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn, SlideUp } from '@/components/ui/animations'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})

  const router = useRouter()
  const supabase = createClient()

  // Diagnostica: Verifica variabili d'ambiente al mount
  useEffect(() => {
    console.log('=== VERIFICA VARIABILI AMBIENTE ===')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Presente' : '❌ Mancante')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Mancante')
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log('URL Preview:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors({})

    // Validazione client-side
    const errors: { email?: string; password?: string } = {}
    if (!email.trim()) {
      errors.email = 'Email è richiesta'
    }
    if (!password) {
      errors.password = 'Password è richiesta'
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      // Performance timing: signInWithPassword
      const signInStart = performance.now()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      const signInEnd = performance.now()
      
      console.log(
        `[PERF] signInWithPassword: ${(signInEnd - signInStart).toFixed(2)}ms`,
        error ? '(failed)' : '(success)',
      )

      if (error) {
        // Log dettagliato dell'errore per debug
        console.error('=== ERRORE LOGIN DETTAGLIATO ===')
        console.error('Error object:', error)
        console.error('Error message:', error.message)
        console.error('Error name:', error.name)
        console.error('Error status:', (error as { status?: number }).status)
        console.error('Error code:', (error as { code?: string }).code)

        // Controlla se è un errore di configurazione Supabase
        if (
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('Supabase not configured')
        ) {
          setError(
            "Supabase non configurato correttamente. Verifica le variabili d'ambiente in .env.local",
          )
        } else {
          // Normalizza messaggio atteso dai test
          setError('Credenziali non valide')
        }
        return
      }

      if (data.user) {
        // Log per debug
        console.log('=== LOGIN: User autenticato ===')
        console.log('User ID:', data.user.id)
        console.log('User Email:', data.user.email)

        // NON interroghiamo più profiles qui - AuthProvider lo farà
        // Redirect a /post-login che gestirà il caricamento profilo e redirect role-based
        router.replace('/post-login')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore durante il login'
      // Controlla se è un errore di rete/configurazione
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Impossibile connettersi a Supabase. Verifica la configurazione in .env.local')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5 animate-pulse-glow" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(2, 179, 191, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2, 179, 191, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Login Card */}
      <FadeIn>
        <Card className="w-full max-w-md bg-transparent border-0 relative z-10">
          <CardContent className="p-8">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <Image
                    src="/logo.svg"
                    alt="22 Club Logo"
                    width={200}
                    height={200}
                    className="w-auto h-28 object-contain drop-shadow-[0_0_20px_rgba(2,179,191,0.3)]"
                    priority
                  />
                  <div className="absolute inset-0 bg-brand/20 blur-xl -z-10" />
                </div>
              </div>
            </div>

            {/* Login Form */}
            <SlideUp delay={200}>
              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-primary text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: undefined }))
                      }
                    }}
                    placeholder="Email"
                    className="bg-input border-border text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-brand/20 focus:ring-2 transition-all duration-200"
                    autoComplete="email"
                    required
                  />
                  {validationErrors.email && (
                    <p className="text-state-error text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-text-primary text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                    placeholder="Password"
                    className="bg-input border-border text-text-primary placeholder:text-text-tertiary focus:border-brand focus:ring-brand/20 focus:ring-2 transition-all duration-200"
                    autoComplete="current-password"
                    required
                  />
                  {validationErrors.password && (
                    <p className="text-state-error text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-state-error text-sm text-center bg-state-error/10 border border-state-error/20 rounded-lg p-3 animate-fade-in">
                    <svg
                      className="inline-block w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-text-primary font-semibold py-3 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white shadow-lg hover:shadow-[0_0_10px_rgba(2,179,191,0.3)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  style={{
                    boxShadow:
                      '0 0 0 1px rgba(2, 179, 191, 0.3), 0 4px 12px rgba(2, 179, 191, 0.2)',
                  }}
                >
                  {/* Gradient Background Fill */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand via-brand to-primary-hover opacity-100 group-hover:opacity-90 transition-all duration-300" />

                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand via-brand/80 to-brand opacity-100 blur-sm group-hover:blur-md transition-all duration-300 -z-10" />
                  <div className="absolute inset-[1px] rounded-lg bg-brand -z-10" />

                  {loading ? (
                    <span className="flex items-center justify-center gap-2 relative z-10">
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Accesso in corso...
                    </span>
                  ) : (
                    <span className="relative z-10">Accedi</span>
                  )}
                </Button>
              </form>
            </SlideUp>

            {/* Forgot Password Link */}
            <SlideUp delay={400}>
              <div className="text-center mt-6">
                <Link
                  href="/forgot-password"
                  className="text-brand hover:text-primary-hover text-sm font-medium transition-colors duration-200 inline-flex items-center gap-1 group"
                >
                  <span>Password dimenticata?</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </SlideUp>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Bottom Icons */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-2 text-text-tertiary">
          <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
          <span className="text-xs font-medium">22 Club PT</span>
        </div>
        <div className="flex items-center gap-2 text-text-tertiary">
          <span className="text-xs font-medium">© 2025</span>
          <div
            className="w-2 h-2 bg-brand rounded-full animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
        </div>
      </div>
    </div>
  )
}
