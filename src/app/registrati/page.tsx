'use client'

import { useState } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:registrati:page')
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn, SlideUp } from '@/components/ui/animations'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Settings } from 'lucide-react'

export default function RegisterPage() {
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

    // Validation
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
      // Create user account con metadata per il trigger automatico
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
        // Il trigger dovrebbe creare automaticamente il profilo
        // Ma facciamo un fallback manuale se necessario
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          // Errore diverso da "non trovato" - logga
          logger.error('Errore verifica profilo', checkError, {
            code: checkError.code,
            details: checkError.details,
            hint: checkError.hint,
          })
        }

        // Se il profilo non esiste (trigger non ha funzionato o non ancora eseguito)
        if (!existingProfile) {
          // Crea manualmente il profilo come fallback
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: authData.user.id,
            nome: formData.nome,
            cognome: formData.cognome,
            email: formData.email,
            role: 'athlete',
            org_id: 'default-org',
            stato: 'attivo',
          })

          if (profileError) {
            logger.error('Errore creazione profilo fallback', profileError, {
              code: profileError.code || 'UNKNOWN',
              details: profileError.details,
              hint: profileError.hint,
            })
            setError(
              profileError.message || 'Errore durante la creazione del profilo. Riprova più tardi.',
            )
            return
          }
        }

        // Success - redirect to home
        router.push('/home')
        router.refresh()
      } else {
        setError('Utente non creato correttamente')
      }
    } catch (error) {
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              stack: error.stack,
            }
          : typeof error === 'object' && error !== null
            ? {
                message: (error as { message?: string }).message || 'Errore sconosciuto',
                fullError: error,
              }
            : { rawError: error }

      logger.error('Errore durante la registrazione', error, errorDetails)
      setError('Errore durante la registrazione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Register Card */}
      <FadeIn>
        <Card className="w-full max-w-md bg-slate-900/95 border-slate-700 shadow-2xl">
          <CardContent className="p-8">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="mb-4">
                {/* Logo "22" */}
                <div className="text-6xl font-bold text-white mb-2">22</div>

                {/* "PERSONAL TRAINING" with lines */}
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-px bg-white"></div>
                  <span className="mx-4 text-white text-xs font-medium tracking-widest uppercase">
                    PERSONAL TRAINING
                  </span>
                  <div className="w-8 h-px bg-white"></div>
                </div>

                {/* "Club" in cursive */}
                <div className="text-2xl text-cyan-400 font-serif italic">Club</div>
              </div>

              <p className="text-white text-lg">Crea il tuo account</p>
            </div>

            {/* Register Form */}
            <SlideUp delay={200}>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-white text-sm font-medium">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Mario"
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cognome" className="text-white text-sm font-medium">
                      Cognome
                    </Label>
                    <Input
                      id="cognome"
                      type="text"
                      value={formData.cognome}
                      onChange={(e) => handleInputChange('cognome', e.target.value)}
                      placeholder="Rossi"
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="la.tua@email.com"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>

                {/* Password Fields */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                    Conferma Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3">
                    {error}
                  </div>
                )}

                {/* Register Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 mt-6"
                >
                  {loading ? 'Registrazione in corso...' : 'Registrati'}
                </Button>
              </form>
            </SlideUp>

            {/* Login Link */}
            <SlideUp delay={400}>
              <div className="text-center mt-6">
                <p className="text-slate-400 text-sm">
                  Hai già un account?{' '}
                  <Link
                    href="/login"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                  >
                    Accedi
                  </Link>
                </p>
              </div>
            </SlideUp>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Bottom Icons */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
        <Heart className="w-6 h-6 text-white/30" />
        <Settings className="w-6 h-6 text-white/30" />
      </div>
    </div>
  )
}
