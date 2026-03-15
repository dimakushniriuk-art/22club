'use client'

import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useProgressAnalytics, type ProgressKPI } from '@/hooks/use-progress-analytics'
import { Plus, Scale, Dumbbell } from 'lucide-react'
import Link from 'next/link'
import { RangeStatusMeter } from '@/components/dashboard/range-status-meter'
import { getValueRange, PROGRESS_RANGES, type ValueRange } from '@/lib/constants/progress-ranges'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

/** Range ottimale come 25%-75% del range (zona centrale) */
function optimalFromRange(r: ValueRange): { optimalMin: number; optimalMax: number } {
  const span = r.max - r.min
  return {
    optimalMin: r.min + span * 0.25,
    optimalMax: r.max - span * 0.25,
  }
}

type CategoryKey = keyof typeof PROGRESS_RANGES

interface MeasurementEntry {
  section: string
  category: CategoryKey
  field: string
  label: string
  getValue: (d: ProgressKPI) => number | null
}

const MISURAZIONI_ENTRIES: MeasurementEntry[] = [
  {
    section: 'Valori principali',
    category: 'valoriPrincipali',
    field: 'peso_kg',
    label: 'Peso',
    getValue: (d) => d.pesoAttuale,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_grassa_percentuale',
    label: 'Massa grassa %',
    getValue: (d) => d.valoriComposizioneAttuali.massa_grassa_percentuale,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_grassa_kg',
    label: 'Massa grassa',
    getValue: (d) => d.valoriComposizioneAttuali.massa_grassa_kg,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_magra_kg',
    label: 'Massa magra',
    getValue: (d) => d.valoriComposizioneAttuali.massa_magra_kg,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_muscolare_kg',
    label: 'Massa muscolare',
    getValue: (d) => d.valoriComposizioneAttuali.massa_muscolare_kg,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_muscolare_scheletrica_kg',
    label: 'Massa muscolare scheletrica',
    getValue: (d) => d.valoriComposizioneAttuali.massa_muscolare_scheletrica_kg,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'collo_cm',
    label: 'Collo',
    getValue: (d) => d.valoriCirconferenzeAttuali.collo_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'spalle_cm',
    label: 'Spalle',
    getValue: (d) => d.valoriCirconferenzeAttuali.spalle_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'torace_cm',
    label: 'Torace',
    getValue: (d) => d.valoriCirconferenzeAttuali.torace_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'torace_inspirazione_cm',
    label: 'Torace (insp.)',
    getValue: (d) => d.valoriCirconferenzeAttuali.torace_inspirazione_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'braccio_rilassato_cm',
    label: 'Braccio rilassato',
    getValue: (d) => d.valoriCirconferenzeAttuali.braccio_rilassato_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'braccio_contratto_cm',
    label: 'Braccio contratto',
    getValue: (d) => d.valoriCirconferenzeAttuali.braccio_contratto_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'avambraccio_cm',
    label: 'Avambraccio',
    getValue: (d) => d.valoriCirconferenzeAttuali.avambraccio_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'polso_cm',
    label: 'Polso',
    getValue: (d) => d.valoriCirconferenzeAttuali.polso_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'vita_alta_cm',
    label: 'Vita alta',
    getValue: (d) => d.valoriCirconferenzeAttuali.vita_alta_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'vita_cm',
    label: 'Vita',
    getValue: (d) => d.valoriCirconferenzeAttuali.vita_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'addome_basso_cm',
    label: 'Addome basso',
    getValue: (d) => d.valoriCirconferenzeAttuali.addome_basso_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'fianchi_cm',
    label: 'Fianchi',
    getValue: (d) => d.valoriCirconferenzeAttuali.fianchi_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'glutei_cm',
    label: 'Glutei',
    getValue: (d) => d.valoriCirconferenzeAttuali.glutei_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'coscia_alta_cm',
    label: 'Coscia alta',
    getValue: (d) => d.valoriCirconferenzeAttuali.coscia_alta_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'coscia_media_cm',
    label: 'Coscia media',
    getValue: (d) => d.valoriCirconferenzeAttuali.coscia_media_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'coscia_bassa_cm',
    label: 'Coscia bassa',
    getValue: (d) => d.valoriCirconferenzeAttuali.coscia_bassa_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'ginocchio_cm',
    label: 'Ginocchio',
    getValue: (d) => d.valoriCirconferenzeAttuali.ginocchio_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'polpaccio_cm',
    label: 'Polpaccio',
    getValue: (d) => d.valoriCirconferenzeAttuali.polpaccio_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'caviglia_cm',
    label: 'Caviglia',
    getValue: (d) => d.valoriCirconferenzeAttuali.caviglia_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'braccio_contratto_cm',
    label: 'Biceps',
    getValue: (d) => d.valoriCirconferenzeAttuali.biceps_cm,
  },
]

const SCROLL_CONTAINER_STYLE = { minHeight: 'calc(100dvh - var(--nav-height, 56px))' } as const

function MisurazioniValuesContent({ data }: { data: ProgressKPI }) {
  const sections = useMemo(() => {
    const bySection = new Map<string, MeasurementEntry[]>()
    for (const entry of MISURAZIONI_ENTRIES) {
      const list = bySection.get(entry.section) ?? []
      list.push(entry)
      bySection.set(entry.section, list)
    }
    return Array.from(bySection.entries())
  }, [])

  return (
    <div className="space-y-8">
      {sections.map(([sectionTitle, entries]) => (
        <div key={sectionTitle}>
          <h3 className="text-sm font-semibold text-text-primary mb-3 pb-1.5 border-b border-white/10">
            {sectionTitle}
          </h3>
          <div className="space-y-5">
            {entries.map((entry) => {
              const value = entry.getValue(data)
              const range = getValueRange(entry.category, entry.field)
              if (!range) return null
              const unit = range.unit ? ` ${range.unit}` : ''
              const { optimalMin, optimalMax } = optimalFromRange(range)
              return (
                <RangeStatusMeter
                  key={`${entry.category}-${entry.field}`}
                  value={value}
                  min={range.min}
                  max={range.max}
                  optimalMin={optimalMin}
                  optimalMax={optimalMax}
                  title={entry.label}
                  unit={unit}
                  showValue
                  height={44}
                />
              )
            })}
          </div>
        </div>
      ))}

      {/* Forza: valori senza range di riferimento */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 pb-1.5 border-b border-white/10 flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-cyan-400" />
          Forza
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              key: 'max_bench_kg',
              label: 'Panca piana',
              value: data.valoriForzaAttuali.max_bench_kg,
            },
            { key: 'max_squat_kg', label: 'Squat', value: data.valoriForzaAttuali.max_squat_kg },
            {
              key: 'max_deadlift_kg',
              label: 'Stacco',
              value: data.valoriForzaAttuali.max_deadlift_kg,
            },
          ].map(({ key, label, value }) => (
            <div key={key} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
              <p className="text-xs text-text-tertiary">{label}</p>
              <p className="text-lg font-bold tabular-nums text-text-primary mt-0.5">
                {value != null ? `${value} kg` : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MisurazioniContent() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Type guard per user - isValidUser non esiste nel context, usiamo user && isValidProfile(user)
  const isValidUserProfile = user && isValidProfile(user)
  const isValidUser = isValidUserProfile && !loading

  // progress_logs.athlete_id è FK a profiles.user_id; passare user.user_id (auth uid) a useProgressAnalytics
  // NOTA: Tutti gli hooks devono essere chiamati prima di qualsiasi early return
  const athleteId = useMemo(() => {
    if (!isValidUserProfile || !user?.user_id) {
      console.warn('[MisurazioniPage] athleteId is null:', {
        isValidUserProfile,
        hasUserId: !!user?.user_id,
        user,
      })
      return undefined
    }
    const id = isValidUUID(user.user_id) ? user.user_id : undefined
    console.log('[MisurazioniPage] athleteId calculated (user_id per progress_logs):', {
      athleteId: id,
      user_id: user.user_id,
      isValidUUID: isValidUUID(user.user_id),
    })
    return id
  }, [isValidUserProfile, user])

  const { data: progressData, isLoading: progressLoading, error } = useProgressAnalytics(athleteId)
  const handleBack = useCallback(() => router.back(), [router])

  // Redirect se non autenticato (solo dopo che loading è finito)
  useEffect(() => {
    if (!loading && !isValidUser) {
      router.push('/login')
    }
  }, [isValidUser, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-24">
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardContent className="p-8 min-[834px]:p-12 text-center">
              <div className="mb-3 text-4xl opacity-50">📊</div>
              <p className="text-text-secondary text-sm min-[834px]:text-base font-medium">
                Caricamento...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidUser) {
    return null
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div
        className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-24"
        style={SCROLL_CONTAINER_STYLE}
      >
        <PageHeaderFixed
          variant="chat"
          title="Dashboard Misurazioni"
          subtitle="Grafici e analisi dei tuoi progressi"
          onBack={handleBack}
          icon={<Scale className="h-5 w-5 text-cyan-400" />}
        />

        <Link href="/home/progressi/nuovo" className="block w-full">
          <Button
            className="w-full min-h-[44px] gap-1.5 h-10 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            Nuova Misurazione
          </Button>
        </Link>

        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4">
            <CardTitle className="text-base font-bold text-text-primary md:text-lg">
              Tutti i valori
            </CardTitle>
            <p className="text-text-tertiary mt-0.5 text-xs">
              Posizione dei valori nel range di riferimento
            </p>
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 min-[834px]:p-5 min-[834px]:pt-4">
            {progressLoading ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center">
                <div className="mb-3 text-4xl opacity-50">📊</div>
                <p className="text-text-secondary text-sm min-[834px]:text-base font-medium">
                  Caricamento dati...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center px-4">
                <div className="mb-3 text-4xl opacity-50">⚠️</div>
                <p className="text-text-primary text-sm min-[834px]:text-base font-medium">
                  Errore nel caricamento
                </p>
                <p className="text-text-tertiary text-xs min-[834px]:text-sm mt-1.5 line-clamp-2">
                  {error instanceof Error ? error.message : String(error)}
                </p>
              </div>
            ) : !progressData ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center px-4">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-16 min-[834px]:w-16">
                  <Scale className="h-7 w-7 text-cyan-400 min-[834px]:h-8 min-[834px]:w-8" />
                </div>
                <p className="text-text-primary text-sm font-semibold min-[834px]:text-base">
                  Nessun dato disponibile
                </p>
                <p className="text-text-tertiary mt-1 text-xs min-[834px]:text-sm">
                  Inizia a registrare le tue misurazioni
                </p>
                <Link href="/home/progressi/nuovo" className="mt-4 inline-block w-full max-w-xs">
                  <Button
                    className="w-full min-h-[44px] gap-1.5 h-10 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    variant="default"
                  >
                    <Plus className="h-4 w-4" />
                    Prima Misurazione
                  </Button>
                </Link>
              </div>
            ) : (
              <MisurazioniValuesContent data={progressData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MisurazioniPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
          <div
            className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-24 sm:px-5 min-[834px]:px-6 min-[834px]:pt-24"
            style={SCROLL_CONTAINER_STYLE}
          >
            <Card className={`relative overflow-hidden ${CARD_DS}`}>
              <CardContent className="relative z-10 p-8 min-[834px]:p-12 text-center">
                <div className="mb-3 text-4xl opacity-50">📊</div>
                <p className="text-text-secondary text-sm min-[834px]:text-base font-medium">
                  Caricamento...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <MisurazioniContent />
    </Suspense>
  )
}
