'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:welcome:page')
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase'
import {
  CheckCircle,
  ArrowRight,
  Users,
  Calendar,
  FileText,
  Target,
  Sparkles,
  Loader2,
} from 'lucide-react'

interface WelcomeData {
  pt_nome: string
  pt_cognome: string
  pt_email: string
  pt_telefono: string
}

export default function WelcomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [completing, setCompleting] = useState(false)

  const steps = [
    {
      title: 'Benvenuto in 22Club!',
      description:
        'Il tuo personal trainer ti ha assegnato un account per seguire i tuoi progressi.',
      icon: <Sparkles className="text-brand h-8 w-8" />,
    },
    {
      title: 'Il tuo Personal Trainer',
      description: 'Ecco chi si occuperà del tuo percorso di allenamento.',
      icon: <Users className="text-brand h-8 w-8" />,
    },
    {
      title: 'Le tue Schede',
      description: 'Qui troverai le schede di allenamento personalizzate per te.',
      icon: <Target className="text-brand h-8 w-8" />,
    },
    {
      title: 'I tuoi Appuntamenti',
      description: 'Visualizza e gestisci i tuoi appuntamenti con il PT.',
      icon: <Calendar className="text-brand h-8 w-8" />,
    },
    {
      title: 'I tuoi Documenti',
      description: 'Carica e gestisci i tuoi documenti medici e certificati.',
      icon: <FileText className="text-brand h-8 w-8" />,
    },
  ]

  useEffect(() => {
    const fetchWelcomeData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Ottieni i dati del PT assegnato
        const { data: ptData, error: ptError } = await supabase
          .from('pt_atleti')
          .select(
            `
            pt_id,
            pt_nome:profiles!pt_atleti_pt_id_fkey(nome),
            pt_cognome:profiles!pt_atleti_pt_id_fkey(cognome),
            pt_email:profiles!pt_atleti_pt_id_fkey(email),
            pt_telefono:profiles!pt_atleti_pt_id_fkey(telefono)
          `,
          )
          .eq('atleta_id', user.id)
          .single()

        if (ptError) throw ptError

        const ptNome = (ptData.pt_nome as { nome?: string } | null)?.nome ?? ''
        const ptCognome = (ptData.pt_cognome as { cognome?: string } | null)?.cognome ?? ''
        const ptEmail = (ptData.pt_email as { email?: string } | null)?.email ?? ''
        const ptTelefono = (ptData.pt_telefono as { telefono?: string } | null)?.telefono ?? ''

        setWelcomeData({
          pt_nome: ptNome,
          pt_cognome: ptCognome,
          pt_email: ptEmail,
          pt_telefono: ptTelefono,
        })
      } catch (err) {
        logger.error('Error fetching welcome data', err, { userId: user?.id })
      } finally {
        setLoading(false)
      }
    }

    fetchWelcomeData()
  }, [user?.id, supabase])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    if (!user?.id) return

    try {
      setCompleting(true)

      // Aggiorna il profilo per indicare che l'onboarding è completato
      const { error } = await supabase
        .from('profiles')
        .update({ first_login: false })
        .eq('user_id', user.id)

      if (error) throw error

      // Redirect alla home atleta
      router.push('/home')
    } catch (err) {
      logger.error('Error completing onboarding', err, { userId: user?.id })
      // Redirect comunque alla home
      router.push('/home')
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="text-brand mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-text-secondary">Caricamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-text-secondary text-sm">
              Passo {currentStep + 1} di {steps.length}
            </span>
            <span className="text-text-secondary text-sm">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="bg-background-tertiary h-2 w-full rounded-full">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="mb-6">{steps[currentStep].icon}</div>
            <h1 className="text-text-primary mb-4 text-2xl font-bold">
              {steps[currentStep].title}
            </h1>
            <p className="text-text-secondary mb-6 text-lg">{steps[currentStep].description}</p>

            {/* PT Info Step */}
            {currentStep === 1 && welcomeData && (
              <Card className="bg-background-secondary border-border">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-text-primary font-semibold">
                        {welcomeData.pt_nome} {welcomeData.pt_cognome}
                      </h3>
                      <p className="text-text-secondary text-sm">Il tuo Personal Trainer</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {welcomeData.pt_email && (
                      <p className="text-text-secondary">📧 {welcomeData.pt_email}</p>
                    )}
                    {welcomeData.pt_telefono && (
                      <p className="text-text-secondary">📞 {welcomeData.pt_telefono}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feature Preview Steps */}
            {currentStep >= 2 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentStep === 2 && (
                  <>
                    <div className="bg-background-secondary rounded-lg p-4">
                      <Target className="text-brand mb-2 h-6 w-6" />
                      <h4 className="text-text-primary mb-1 font-medium">Schede Allenamento</h4>
                      <p className="text-text-secondary text-sm">
                        Segui le tue routine personalizzate
                      </p>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-4">
                      <Calendar className="text-brand mb-2 h-6 w-6" />
                      <h4 className="text-text-primary mb-1 font-medium">Appuntamenti</h4>
                      <p className="text-text-secondary text-sm">
                        Gestisci i tuoi incontri con il PT
                      </p>
                    </div>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <div className="bg-background-secondary rounded-lg p-4">
                      <FileText className="text-brand mb-2 h-6 w-6" />
                      <h4 className="text-text-primary mb-1 font-medium">Documenti</h4>
                      <p className="text-text-secondary text-sm">Carica certificati e documenti</p>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-4">
                      <Target className="text-brand mb-2 h-6 w-6" />
                      <h4 className="text-text-primary mb-1 font-medium">Progressi</h4>
                      <p className="text-text-secondary text-sm">Traccia i tuoi miglioramenti</p>
                    </div>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <div className="bg-background-secondary rounded-lg p-4">
                      <CheckCircle className="text-state-valid mb-2 h-6 w-6" />
                      <h4 className="text-text-primary mb-1 font-medium">Tutto Pronto!</h4>
                      <p className="text-text-secondary text-sm">
                        Inizia il tuo percorso di fitness
                      </p>
                    </div>
                    <div className="bg-background-secondary rounded-lg p-4">
                      <Sparkles className="text-brand mb-2 h-6 w-6" />
                      <h4 className="text-text-primary mb-1 font-medium">Benvenuto!</h4>
                      <p className="text-text-secondary text-sm">La tua avventura inizia ora</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {currentStep < steps.length - 1 && (
            <Button variant="secondary" onClick={handleSkip}>
              Salta Tour
            </Button>
          )}
          <Button onClick={handleNext} disabled={completing} className="flex items-center gap-2">
            {completing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Completando...
              </>
            ) : currentStep < steps.length - 1 ? (
              <>
                Avanti
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Inizia il Percorso
              </>
            )}
          </Button>
        </div>

        {/* Skip Link */}
        {currentStep < steps.length - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSkip}
              className="text-text-tertiary hover:text-text-secondary text-sm transition-colors"
            >
              Salta il tour e vai direttamente all&apos;app
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
