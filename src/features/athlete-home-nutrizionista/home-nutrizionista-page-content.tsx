'use client'

import type { ComponentType } from 'react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Apple,
  Calendar,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Salad,
  Utensils,
} from 'lucide-react'
import { PageHeaderFixed } from '@/components/layout'
import { ErrorState } from '@/components/dashboard/error-state'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useAthleteNutritionStats } from '@/hooks/athlete-profile/use-athlete-nutrition'

const logger = createLogger('app:home:nutrizionista:page')

/** Allineato a `/home/allenamenti` — superficie card compatte / liste. */
const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

const SCROLL_CLASS =
  'min-h-0 flex-1 space-y-4 overflow-auto px-3 pb-[calc(9.5rem+env(safe-area-inset-bottom))] safe-area-inset-bottom sm:space-y-6 sm:px-4 md:px-6'

const INNER_WRAP_CLASS = 'mx-auto w-full max-w-lg space-y-4 sm:space-y-6 lg:max-w-3xl'

/** Route atleta con UI prevalentemente lista — link diretti dalla hub nutrizione. */
const LISTA_LINKS: ReadonlyArray<{
  href: string
  label: string
  description: string
  Icon: ComponentType<{ className?: string }>
}> = [
  {
    href: '/home/documenti',
    label: 'Documenti',
    description: 'Piani PDF, referti e file del percorso',
    Icon: FileText,
  },
  {
    href: '/home/appuntamenti',
    label: 'Appuntamenti',
    description: 'Calendario e sessioni',
    Icon: Calendar,
  },
  {
    href: '/home/chat',
    label: 'Chat',
    description: 'Messaggi con lo staff',
    Icon: MessageSquare,
  },
  {
    href: '/home/foto-risultati',
    label: 'Foto risultati',
    description: 'Galleria foto e risultati',
    Icon: ImageIcon,
  },
]

const AthleteNutritionTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteNutritionTab,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

function NutrizionistaPageContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const isValidUser = user && isValidProfile(user)

  const athleteUserId = useMemo(() => {
    if (!isValidUser || !user?.user_id) return null
    return isValidUUID(user.user_id) ? user.user_id : null
  }, [user?.user_id, isValidUser])

  useEffect(() => {
    if (!authLoading && !isValidUser) {
      logger.warn('Utente non autenticato, redirect a /login')
      router.push('/login')
    }
  }, [authLoading, isValidUser, router])

  const handleGoHome = useCallback(() => router.push('/home'), [router])

  const [loadNutritionTab, setLoadNutritionTab] = useState(false)
  useEffect(() => {
    if (!athleteUserId) {
      setLoadNutritionTab(false)
      return
    }
    const idleId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => setLoadNutritionTab(true))
        : undefined
    const timeoutId =
      idleId === undefined ? window.setTimeout(() => setLoadNutritionTab(true), 0) : undefined
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [athleteUserId])

  const { pianiAttivi, consigli } = useAthleteNutritionStats(athleteUserId, loadNutritionTab)

  if (authLoading) {
    return <div className="min-h-0 flex-1 bg-background" aria-hidden />
  }

  if (!isValidUser || !athleteUserId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background px-4 pb-24 safe-area-inset-bottom">
        <ErrorState
          title="Errore di autenticazione"
          message="Non hai i permessi per accedere a questa pagina."
        />
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="min-h-[44px] text-sm md:text-base"
          >
            Torna alla Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <PageHeaderFixed
        variant="chat"
        title="Nutrizionista"
        subtitle="Programma e monitora il tuo percorso alimentare"
        backHref="/home"
      />

      <div className={SCROLL_CLASS}>
        <div className={INNER_WRAP_CLASS}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            <Card className={`relative overflow-hidden p-3.5 sm:p-4 ${CARD_DS}`}>
              <CardContent className="flex items-center gap-3 p-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Utensils className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Piani attivi
                  </div>
                  <div className="text-base font-bold leading-tight text-text-primary">
                    {pianiAttivi}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`relative overflow-hidden p-3.5 sm:p-4 ${CARD_DS}`}>
              <CardContent className="flex items-center gap-3 p-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Apple className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Consigli
                  </div>
                  <div className="text-base font-bold leading-tight text-text-primary">
                    {consigli}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold tracking-tight text-text-primary sm:text-lg">
              Liste e archivi
            </h2>
            <ul className="space-y-2.5 sm:space-y-3">
              {LISTA_LINKS.map(({ href, label, description, Icon }) => (
                <li key={href}>
                  <Link href={href} prefetch className="block touch-manipulation">
                    <Card
                      className={`relative overflow-hidden p-3.5 sm:p-4 ${CARD_DS} active:scale-[0.99]`}
                    >
                      <CardContent className="flex items-center gap-3 p-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold leading-tight text-text-primary">
                            {label}
                          </div>
                          <div className="mt-0.5 text-xs text-text-secondary">{description}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" aria-hidden />
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 md:px-5 md:pt-5 md:pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Salad className="h-4 w-4 text-cyan-400" aria-hidden />
                </div>
                <CardTitle className="text-base font-bold text-text-primary md:text-lg">
                  Piano nutrizionale
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 p-4 pt-3 md:p-5 md:pt-4">
              {loadNutritionTab ? (
                <Suspense fallback={null}>
                  <AthleteNutritionTab athleteId={athleteUserId} />
                </Suspense>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function HomeNutrizionistaPageContent() {
  return (
    <Suspense fallback={null}>
      <NutrizionistaPageContent />
    </Suspense>
  )
}
