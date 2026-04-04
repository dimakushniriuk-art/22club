'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import { ErrorState } from '@/components/dashboard/error-state'
import { Calendar, Dumbbell, Clock, FileText, User, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/lib/ui/notify'
import { buildStandardPdfBlob } from '@/lib/pdf'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'

interface WorkoutLog {
  id: string
  atleta_id: string
  scheda_id: string | null
  data: string
  stato: string | null
  durata_minuti: number | null
  note: string | null
  created_at: string | null
  /** Per compatibilitÃ  UI (data/ora da mostrare) */
  started_at: string
  completed_at: string | null
  duration_minutes: number | null
  is_coached: boolean
  workout: {
    titolo: string
    descrizione: string | null
  } | null
}

interface WorkoutStats {
  /** Sessioni completate in autonomia (periodo filtrato) */
  solo_count: number
  /** Sessioni completate con trainer (periodo filtrato) */
  coached_count: number
  /** Somma durate registrate (ore, arrotondato a 1 decimale) */
  total_hours: number
}

interface UserProfile {
  nome: string
  cognome: string
}

const COMPLETED_STATI = ['completato', 'completed'] as const

function isCompletedStato(stato: string | null | undefined): boolean {
  if (!stato) return false
  const s = stato.toLowerCase().trim()
  return COMPLETED_STATI.includes(s as (typeof COMPLETED_STATI)[number])
}

/** Evita shift giorno per stringhe solo-data YYYY-MM-DD */
function parseDisplayInstant(iso: string): Date {
  const raw = iso.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T12:00:00`)
  }
  return new Date(raw)
}

export default function StoricoAllenamentiAtletaPage() {
  const router = useRouter()
  const { notify } = useNotify()
  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [stats, setStats] = useState<WorkoutStats>({
    solo_count: 0,
    coached_count: 0,
    total_hours: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const loadData = useCallback(async () => {
    try {
      setError(null)

      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Utente non autenticato')
      }

      // Carica profilo utente (profiles.id = atleta_id nei workout_logs)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, nome, cognome')
        .eq('user_id', user.id)
        .single()

      if (!profileError && profileData) {
        setUserProfile({ nome: profileData.nome ?? '', cognome: profileData.cognome ?? '' })
      }

      const profileId = (profileData as { id?: string } | null)?.id
      if (!profileId) {
        setWorkouts([])
        setStats({ solo_count: 0, coached_count: 0, total_hours: 0 })
        return
      }

      // Calcola data inizio in base al periodo selezionato
      let startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      if (selectedPeriod === '7d') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (selectedPeriod === '30d') {
        startDate.setDate(startDate.getDate() - 30)
      } else if (selectedPeriod === '90d') {
        startDate.setDate(startDate.getDate() - 90)
      } else {
        startDate = new Date('2000-01-01')
      }

      // Carica workout_logs con atleta_id e scheda (workout_plans)
      let query = supabase
        .from('workout_logs')
        .select(
          `
          id,
          atleta_id,
          scheda_id,
          data,
          stato,
          durata_minuti,
          note,
          created_at,
          is_coached,
          completed_at,
          scheda:workout_plans (
            name,
            description
          )
        `,
        )
        .eq('atleta_id', profileId)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false })

      const startDateKey = startDate.toISOString().split('T')[0]
      if (selectedPeriod !== 'all') {
        query = query.gte('data', startDateKey)
      }

      query = query.in('stato', [...COMPLETED_STATI])

      const { data: workoutData, error: workoutError } = await query

      if (workoutError) {
        console.error('Errore caricamento workout logs:', workoutError)
        setWorkouts([])
      } else {
        const rows = (workoutData || []) as Array<{
          id: string
          atleta_id: string
          scheda_id: string | null
          data: string
          stato: string | null
          durata_minuti: number | null
          note: string | null
          created_at: string | null
          is_coached?: boolean
          completed_at?: string | null
          scheda?: { name?: string; description?: string | null } | null
        }>
        setWorkouts(
          rows.map((w) => {
            const scheda = Array.isArray(w.scheda) ? w.scheda[0] : w.scheda
            const dataOrCreated = w.data || w.created_at || new Date().toISOString()
            const done = isCompletedStato(w.stato)
            return {
              id: w.id,
              atleta_id: w.atleta_id,
              scheda_id: w.scheda_id,
              data: w.data,
              stato: w.stato,
              durata_minuti: w.durata_minuti,
              note: w.note,
              created_at: w.created_at,
              started_at: dataOrCreated,
              completed_at: done ? (w.completed_at ?? w.created_at ?? dataOrCreated) : null,
              duration_minutes: w.durata_minuti,
              is_coached: w.is_coached ?? false,
              workout: scheda
                ? { titolo: scheda.name ?? 'Allenamento', descrizione: scheda.description ?? null }
                : null,
            }
          }) as WorkoutLog[],
        )
      }

      // Calcola statistiche (solo righe completate coerenti con la query)
      const rowsForStats = (workoutError ? [] : workoutData || []) as Array<{
        durata_minuti?: number | null
        data?: string | null
        created_at?: string | null
        is_coached?: boolean | null
      }>
      if (rowsForStats.length > 0) {
        const typed = rowsForStats
        const totalMinutes = typed.reduce((sum, w) => sum + (w.durata_minuti ?? 0), 0)
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10
        const coachedCount = typed.filter((w) => Boolean(w.is_coached)).length
        const soloCount = typed.length - coachedCount

        setStats({
          solo_count: soloCount,
          coached_count: coachedCount,
          total_hours: totalHours,
        })
      } else {
        setStats({
          solo_count: 0,
          coached_count: 0,
          total_hours: 0,
        })
      }
    } catch (err) {
      console.error('Errore caricamento dati:', err)
      setError(err instanceof Error ? err.message : 'Errore caricamento dati')
    }
  }, [selectedPeriod])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDate = useCallback((dateString: string) => {
    return parseDisplayInstant(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const formatDuration = useCallback((minutes: number | null | undefined) => {
    if (minutes === null || minutes === undefined) return '—'
    if (minutes === 0) return '0 min'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }, [])

  const displayDurationForWorkout = useCallback(
    (w: WorkoutLog) => {
      if (w.duration_minutes != null && w.duration_minutes > 0) {
        return formatDuration(w.duration_minutes)
      }
      if (w.duration_minutes === 0) return '0 min'
      if (w.completed_at && w.created_at) {
        const a = new Date(w.completed_at).getTime()
        const b = new Date(w.created_at).getTime()
        const diffMin = Math.round((a - b) / 60000)
        if (diffMin > 0 && diffMin < 24 * 60) return formatDuration(diffMin)
      }
      return '—'
    },
    [formatDuration],
  )

  const handleExportPDF = useCallback(async () => {
    const periodLabels = {
      '7d': 'Ultimi 7 giorni',
      '30d': 'Ultimi 30 giorni',
      '90d': 'Ultimi 90 giorni',
      all: 'Tutti gli allenamenti',
    } as const
    const safeAthlete = (userProfile?.nome || 'atleta')
      .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
      .trim()
      .replace(/\s+/g, '_')
    const fileName = `storico-allenamenti-${safeAthlete || 'atleta'}-${new Date().toISOString().split('T')[0]}.pdf`

    setPdfLoading(true)
    try {
      const blob = await buildStandardPdfBlob({
        orientation: 'portrait',
        render: ({ doc, margin, autoTable, headStyles, docWithAuto }) => {
          let y = margin
          doc.setFontSize(16)
          doc.setFont('helvetica', 'bold')
          doc.text('Storico allenamenti', margin, y)
          y += 7
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          if (userProfile) {
            doc.text(`${userProfile.nome} ${userProfile.cognome}`, margin, y)
            y += 5
          }
          doc.text(`Periodo: ${periodLabels[selectedPeriod]}`, margin, y)
          y += 5
          doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, y)
          y += 8

          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Statistiche riepilogative', margin, y)
          y += 6
          doc.setFont('helvetica', 'normal')
          autoTable(doc, {
            startY: y,
            head: [['Metrica', 'Valore']],
            body: [
              ['In autonomia', String(stats.solo_count)],
              ['Con trainer', String(stats.coached_count)],
              ['Ore totali allenamento', `${stats.total_hours}h`],
            ],
            styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
            headStyles,
            margin: { left: margin, right: margin },
          })
          y = (docWithAuto.lastAutoTable?.finalY ?? y) + 10

          if (workouts.length > 0) {
            doc.setFontSize(12)
            doc.setFont('helvetica', 'bold')
            doc.text('Dettaglio allenamenti', margin, y)
            y += 6
            doc.setFont('helvetica', 'normal')
            autoTable(doc, {
              startY: y,
              head: [['Data', 'Scheda', 'Durata', 'Stato', 'Note']],
              body: workouts.map((w) => [
                formatDate(w.completed_at ?? w.started_at),
                w.workout?.titolo || 'Allenamento',
                displayDurationForWorkout(w),
                'Completato',
                w.note || '—',
              ]),
              styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
              headStyles,
              margin: { left: margin, right: margin },
            })
          }
        },
      })
      openPdfWithBlob(blob, fileName)
    } catch (err) {
      console.error('Errore generazione PDF:', err)
      notify('Errore durante la generazione del PDF. Riprova più tardi.', 'error', 'Errore PDF')
    } finally {
      setPdfLoading(false)
    }
  }, [
    userProfile,
    selectedPeriod,
    stats.solo_count,
    stats.coached_count,
    stats.total_hours,
    workouts,
    formatDate,
    displayDurationForWorkout,
    setPdfLoading,
    openPdfWithBlob,
    notify,
  ])

  const handleBack = useCallback(() => router.back(), [router])

  if (error) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div
          className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24"
          style={{ minHeight: 'calc(100dvh - var(--nav-height, 56px))' }}
        >
          <div className="mx-auto w-full max-w-lg min-[1100px]:max-w-3xl">
            <ErrorState message={error} onRetry={loadData} />
          </div>
        </div>
      </div>
    )
  }

  const CARD_DS =
    'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md'

  return (
    <>
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div
          className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24"
          style={{ minHeight: 'calc(100dvh - var(--nav-height, 56px))' }}
        >
          <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl">
            <PageHeaderFixed
              variant="chat"
              title="Storico Allenamenti"
              subtitle={
                userProfile
                  ? `${userProfile.nome} ${userProfile.cognome}`
                  : 'Visualizza allenamenti completati e statistiche'
              }
              onBack={handleBack}
            />

            <div className="grid grid-cols-3 gap-1.5 min-[834px]:gap-3">
              <Card className={`relative overflow-hidden ${CARD_DS}`}>
                <CardContent className="relative z-10 flex items-center gap-1.5 p-2 min-[834px]:gap-2 min-[834px]:p-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-8 min-[834px]:w-8">
                    <User className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                      Da solo
                    </p>
                    <p className="text-base font-bold tabular-nums leading-tight text-text-primary min-[834px]:text-lg">
                      {stats.solo_count}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`relative overflow-hidden ${CARD_DS}`}>
                <CardContent className="relative z-10 flex items-center gap-1.5 p-2 min-[834px]:gap-2 min-[834px]:p-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-8 min-[834px]:w-8">
                    <Users className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                      Con trainer
                    </p>
                    <p className="text-base font-bold tabular-nums leading-tight text-text-primary min-[834px]:text-lg">
                      {stats.coached_count}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className={`relative overflow-hidden ${CARD_DS}`}>
                <CardContent className="relative z-10 flex items-center gap-1.5 p-2 min-[834px]:gap-2 min-[834px]:p-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-8 min-[834px]:w-8">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                      Ore totali
                    </p>
                    <p className="text-base font-bold tabular-nums leading-tight text-text-primary min-[834px]:text-lg">
                      {stats.total_hours}h
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className={`relative min-w-0 overflow-hidden ${CARD_DS}`}>
              <CardHeader className="relative z-10 flex flex-col gap-3 border-b border-white/10 px-4 pb-3 pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4">
                <div className="min-w-0">
                  <CardTitle className="text-base font-bold text-text-primary md:text-lg">
                    Allenamenti completati
                  </CardTitle>
                  <p className="text-text-tertiary mt-0.5 text-xs">
                    {workouts.length} nel periodo selezionato
                  </p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 min-[480px]:flex min-[480px]:w-auto min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:justify-end min-[480px]:gap-2">
                  {[
                    { value: '7d' as const, label: '7gg' },
                    { value: '30d' as const, label: '30gg' },
                    { value: '90d' as const, label: '90gg' },
                    { value: 'all' as const, label: 'Tutto' },
                  ].map((period) => (
                    <button
                      key={period.value}
                      type="button"
                      onClick={() => setSelectedPeriod(period.value)}
                      className={`touch-manipulation min-h-[44px] rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-[0.98] min-[480px]:min-h-9 min-[480px]:rounded-lg min-[480px]:px-3.5 min-[480px]:py-1.5 min-[480px]:text-sm ${
                        selectedPeriod === period.value
                          ? 'border border-white/20 bg-white/10 text-text-primary'
                          : 'border border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleExportPDF()}
                    disabled={pdfLoading}
                    aria-busy={pdfLoading}
                    className="col-span-2 min-h-[44px] w-full touch-manipulation rounded-xl border border-white/10 p-0 hover:bg-white/5 text-text-primary active:scale-[0.98] min-[480px]:col-span-1 min-[480px]:h-9 min-[480px]:w-9 min-[480px]:min-h-9 min-[480px]:min-w-9 min-[480px]:rounded-lg"
                    title="Esporta PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-4 pt-3 sm:p-6 sm:pt-4 min-[834px]:p-5 min-[834px]:pt-4">
                {workouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-16 min-[834px]:w-16">
                      <Dumbbell className="h-7 w-7 text-cyan-400 min-[834px]:h-8 min-[834px]:w-8" />
                    </div>
                    <h3 className="text-text-primary text-sm font-semibold min-[834px]:text-base">
                      Nessun allenamento
                    </h3>
                    <p className="text-text-tertiary mt-1 text-xs min-[834px]:text-sm">
                      Cambia il filtro periodo o verifica che gli allenamenti siano stati
                      registrati.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-white/20 min-[834px]:rounded-lg min-[834px]:p-3.5"
                      >
                        <div className="flex flex-col gap-3 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between min-[834px]:gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                                <Dumbbell className="h-4 w-4 text-cyan-400" />
                              </div>
                              <h3 className="text-text-primary min-w-0 flex-1 truncate text-sm font-semibold min-[834px]:text-base">
                                {workout.workout?.titolo || 'Allenamento'}
                              </h3>
                              <Badge
                                variant="outline"
                                className="shrink-0 border-white/20 px-1.5 py-0 text-[10px] text-text-secondary"
                              >
                                {workout.is_coached ? 'Con trainer' : 'In autonomia'}
                              </Badge>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 text-text-secondary text-xs">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                              <span>{formatDate(workout.completed_at ?? workout.started_at)}</span>
                            </div>
                            {workout.note && (
                              <p className="text-text-tertiary mt-1.5 line-clamp-1 text-xs italic">
                                {workout.note}
                              </p>
                            )}
                          </div>
                          <div className="flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 self-stretch rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[834px]:min-h-0 min-[834px]:self-auto min-[834px]:rounded-lg min-[834px]:px-2.5 min-[834px]:py-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                            <span className="text-text-primary text-sm font-semibold tabular-nums">
                              {displayDurationForWorkout(workout)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Storico allenamenti"
      />
    </>
  )
}
