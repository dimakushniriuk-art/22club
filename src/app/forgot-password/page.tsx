'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
// Animazioni gestite con CSS inline per evitare problemi di rendering
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { AthleteBackground } from '@/components/athlete/athlete-background'
import Image from 'next/image'

const logger = createLogger('app:forgot-password:page')

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verifica se siamo in sviluppo locale
      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      
      logger.info('Richiesta reset password', { 
        email, 
        isLocalhost,
        origin: typeof window !== 'undefined' ? window.location.origin : 'unknown'
      })

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        logger.error('Errore reset password', error, { email })
        setError(error.message || "Errore durante l'invio della richiesta")
        return
      }

      logger.info('Email reset password inviata con successo', { 
        email,
        isLocalhost,
        inbucketUrl: isLocalhost ? 'http://localhost:54324' : null
      })

      setSuccess(true)
    } catch (error) {
      logger.error('Errore reset password', error, { email })
      setError("Errore durante l'invio della richiesta. Verifica la configurazione email di Supabase.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background" style={{ 
        minHeight: '100vh'
      }}>
        {/* Athlete Background - Stesso stile dell'account atleta */}
        <AthleteBackground />

        <div className="w-full max-w-md animate-fade-in">
          <Card className="w-full max-w-md backdrop-blur-xl shadow-2xl bg-background-secondary/95 border-border rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <Image
                      src="/logo.svg"
                      alt="22 PERSONAL TRAINING Club"
                      width={180}
                      height={180}
                      className="w-auto h-24 object-contain drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                      priority
                    />
                    <div className="absolute inset-0 bg-teal-500/20 blur-xl -z-10" />
                  </div>
                </div>
                
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in bg-teal-500/20" 
                  style={{ 
                    animation: 'scale-in 0.2s ease-out'
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 text-teal-400" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-text-primary">Email inviata!</h2>
                <p className="text-base leading-relaxed max-w-sm mx-auto text-text-secondary">
                  Controlla la tua casella di posta <span className="font-semibold text-text-primary">{email}</span> e segui le istruzioni per reimpostare la password.
                </p>
              </div>

              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="rounded-lg p-4 mb-4 bg-background-tertiary/50 border border-border">
                  <p className="text-sm mb-2 text-text-secondary">
                    <Mail className="w-4 h-4 inline mr-2 text-teal-400" />
                    Non hai ricevuto l&apos;email? Controlla anche la cartella spam.
                  </p>
                  {/* Istruzioni per sviluppo locale */}
                  {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                      <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs mb-2 text-text-tertiary">
                        <strong className="text-text-secondary">Sviluppo locale:</strong> Le email vengono inviate a Inbucket.
                      </p>
                      <a
                        href="http://localhost:54324"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium inline-flex items-center gap-1 transition-colors text-teal-400 hover:text-teal-300"
                      >
                        Apri Inbucket per vedere le email
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
                <Link href="/login">
                  <Button className="w-full font-medium py-3 rounded-lg transition-all duration-200 bg-teal-500 hover:bg-teal-600 text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Torna al Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background" style={{ 
      minHeight: '100vh'
    }}>
      {/* Athlete Background - Stesso stile dell'account atleta */}
      <AthleteBackground />

      {/* Reset Password Card */}
      <div className="w-full max-w-md animate-fade-in">
        <Card className="w-full max-w-md backdrop-blur-xl shadow-2xl bg-background-secondary/95 border-border rounded-2xl">
          <CardContent className="p-8">
            {/* Back Button */}
            <div className="mb-6 animate-fade-in">
              <Link
                href="/login"
                className="inline-flex items-center transition-colors group text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Torna al Login</span>
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <Image
                    src="/logo.svg"
                    alt="22 PERSONAL TRAINING Club"
                    width={200}
                    height={200}
                    className="w-auto h-28 object-contain drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                    priority
                  />
                  <div className="absolute inset-0 bg-teal-500/20 blur-xl -z-10" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-3 text-text-primary mt-6">Password dimenticata?</h2>
              <p className="text-sm leading-relaxed max-w-sm mx-auto text-text-secondary">
                Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
              </p>
            </div>

            {/* Reset Form */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-text-primary">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-secondary" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="la.tua@email.com"
                      className="pl-10 rounded-lg transition-all duration-200 bg-background-secondary border-border text-text-primary placeholder:text-text-secondary focus:border-teal-500 focus:ring-teal-500/20"
                      style={{
                        padding: '0.75rem',
                        paddingLeft: '2.5rem'
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 rounded-lg p-4 animate-fade-in" style={{
                    background: 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid rgba(255, 59, 48, 0.2)'
                  }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FF3B30' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#FF3B30' }}>Errore</p>
                      <p className="text-sm mt-1" style={{ color: 'rgba(255, 59, 48, 0.8)' }}>{error}</p>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className={`w-full font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading || !email.trim() 
                      ? 'bg-teal-600/50 text-white' 
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Invia istruzioni
                    </>
                  )}
                </Button>

                {/* Help Text */}
                <p className="text-center text-xs text-text-secondary">
                  Ricordi la password?{' '}
                  <Link href="/login" className="font-medium transition-colors text-teal-400 hover:text-teal-300">
                    Accedi
                  </Link>
                </p>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
