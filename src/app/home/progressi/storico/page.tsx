'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  Calendar,
  Dumbbell,
  Clock,
  TrendingUp,
  ArrowLeft,
  History,
  Download,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/lib/ui/notify'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface WorkoutLog {
  id: string
  atleta_id: string
  scheda_id: string | null
  data: string
  stato: string | null
  durata_minuti: number | null
  note: string | null
  created_at: string | null
  /** Per compatibilità UI (data/ora da mostrare) */
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
  total_workouts: number
  total_hours: number
  avg_per_week: number
  current_streak: number
}

interface UserProfile {
  nome: string
  cognome: string
}

export default function StoricoAllenamentiAtletaPage() {
  const router = useRouter()
  const { notify } = useNotify()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [stats, setStats] = useState<WorkoutStats>({
    total_workouts: 0,
    total_hours: 0,
    avg_per_week: 0,
    current_streak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
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
        setStats({ total_workouts: 0, total_hours: 0, avg_per_week: 0, current_streak: 0 })
        setLoading(false)
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

      if (selectedPeriod !== 'all') {
        query = query.gte('data', startDate.toISOString())
      }

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
              completed_at: w.stato === 'completato' ? (w.completed_at ?? w.created_at ?? dataOrCreated) : null,
              duration_minutes: w.durata_minuti,
              is_coached: w.is_coached ?? false,
              workout: scheda
                ? { titolo: scheda.name ?? 'Allenamento', descrizione: scheda.description ?? null }
                : null,
            }
          }) as WorkoutLog[],
        )
      }

      // Calcola statistiche
      if (workoutData && workoutData.length > 0) {
        const typed = workoutData as Array<{ durata_minuti?: number | null; data?: string; created_at?: string | null }>
        const totalMinutes = typed.reduce((sum, w) => sum + (w.durata_minuti ?? 0), 0)
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10

        const oldest = typed[typed.length - 1]
        const oldestDate = oldest?.data || oldest?.created_at
        const oldestWorkout = oldestDate ? new Date(oldestDate) : new Date()
        const daysDiff = Math.max(
          1,
          Math.ceil((Date.now() - oldestWorkout.getTime()) / (1000 * 60 * 60 * 24)),
        )
        const weeks = daysDiff / 7
        const avgPerWeek = Math.round((typed.length / weeks) * 10) / 10

        setStats({
          total_workouts: typed.length,
          total_hours: totalHours,
          avg_per_week: avgPerWeek,
          current_streak: 0,
        })
      } else {
        setStats({
          total_workouts: 0,
          total_hours: 0,
          avg_per_week: 0,
          current_streak: 0,
        })
      }
    } catch (err) {
      console.error('Errore caricamento dati:', err)
      setError(err instanceof Error ? err.message : 'Errore caricamento dati')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()

      // Intestazione
      doc.setFontSize(20)
      doc.setTextColor(20, 184, 166) // Teal
      doc.text('Storico Allenamenti', 14, 20)

      // Info atleta e periodo
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      if (userProfile) {
        doc.text(`${userProfile.nome} ${userProfile.cognome}`, 14, 30)
      }
      doc.setFontSize(10)
      const periodLabels = {
        '7d': 'Ultimi 7 giorni',
        '30d': 'Ultimi 30 giorni',
        '90d': 'Ultimi 90 giorni',
        'all': 'Tutti gli allenamenti'
      }
      doc.text(`Periodo: ${periodLabels[selectedPeriod]}`, 14, 36)
      doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 42)

      // KPI Stats
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Statistiche Riepilogative', 14, 52)

      const statsData = [
        ['Allenamenti Totali', stats.total_workouts.toString()],
        ['Ore Totali', `${stats.total_hours}h`],
        ['Media Settimanale', stats.avg_per_week.toString()],
        ['Streak Giorni', stats.current_streak.toString()]
      ]

      autoTable(doc, {
        startY: 56,
        head: [['Metrica', 'Valore']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255] },
        margin: { left: 14 },
        styles: { fontSize: 10 }
      })

      // Lista Allenamenti
      if (workouts.length > 0) {
        doc.setFontSize(14)
        // jsPDF typing issue - lastAutoTable è aggiunto da autoTable plugin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.text('Dettaglio Allenamenti', 14, (doc as any).lastAutoTable.finalY + 10)

        const workoutsData = workouts.map(w => [
          formatDate(w.started_at),
          w.workout?.titolo || 'Allenamento',
          formatDuration(w.duration_minutes),
          w.completed_at ? 'Completato' : 'In corso',
          w.note || '-'
        ])

        autoTable(doc, {
          // jsPDF typing issue - lastAutoTable è aggiunto da autoTable plugin
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          startY: (doc as any).lastAutoTable.finalY + 14,
          head: [['Data', 'Scheda', 'Durata', 'Stato', 'Note']],
          body: workoutsData,
          theme: 'striped',
          headStyles: { fillColor: [20, 184, 166], textColor: [255, 255, 255] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 40 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 'auto' }
          }
        })
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        doc.text(
          `Pagina ${i} di ${pageCount} - 22Club`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      // Salva PDF
      const fileName = `storico-allenamenti-${userProfile?.nome || 'athlete'}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    } catch (err) {
      console.error('Errore generazione PDF:', err)
      notify('Errore durante la generazione del PDF. Riprova più tardi.', 'error', 'Errore PDF')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-6">
          <LoadingState message="Caricamento storico allenamenti..." size="md" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-6">
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-6">
        {/* Header — stile Nutrizionista: glass + accento teal/cyan */}
        <div
          className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl min-[834px]:p-5"
          style={{
            border: '1px solid rgba(2, 179, 191, 0.4)',
            background:
              'linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.05) 100%)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(2,179,191,0.1) inset',
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-70"
            style={{
              background:
                'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)',
            }}
            aria-hidden
          />
          <div className="relative z-10 flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="h-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl p-0 text-text-secondary transition-colors duration-200 hover:bg-primary/15 hover:text-primary"
              aria-label="Indietro"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl min-[834px]:h-14 min-[834px]:w-14"
                style={{
                  backgroundColor: 'rgba(2, 179, 191, 0.2)',
                  border: '1px solid rgba(2, 179, 191, 0.35)',
                }}
              >
                <History className="h-6 w-6 min-[834px]:h-7 min-[834px]:w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  Storico Allenamenti
                </h1>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  {userProfile
                    ? `${userProfile.nome} ${userProfile.cognome}`
                    : 'Visualizza allenamenti completati e statistiche'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats — card compatte come Nutrizionista */}
        <div className="grid grid-cols-2 min-[834px]:grid-cols-4 gap-3 min-[834px]:gap-4">
          <Card
            className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
            style={{
              background:
                'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
            }}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                <Dumbbell className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Totali
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
                  {stats.total_workouts}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
            style={{
              background:
                'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
            }}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                <Clock className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Ore
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
                  {stats.total_hours}h
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
            style={{
              background:
                'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
            }}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Media/Sett
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
                  {stats.avg_per_week}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
            style={{
              background:
                'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
            }}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                <Calendar className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Streak
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
                  {stats.current_streak}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content — stile Nutrizionista: card con header e contenuto */}
        <Card
          className="relative overflow-hidden rounded-xl border backdrop-blur-md"
          style={{
            borderColor: 'rgba(2, 179, 191, 0.35)',
            background:
              'linear-gradient(145deg, rgba(22,22,26,0.95) 0%, rgba(16,16,18,0.98) 100%)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(2,179,191,0.08) inset',
          }}
        >
          <div
            className="absolute inset-0 rounded-xl opacity-60"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(2,179,191,0.1) 0%, transparent 60%)',
            }}
            aria-hidden
          />
          <CardHeader
            className="relative z-10 flex flex-col gap-3 border-b px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: 'rgba(2, 179, 191, 0.2)' }}
          >
            <div>
              <CardTitle className="text-base font-bold text-text-primary md:text-lg">
                Allenamenti Completati
              </CardTitle>
              <p className="text-text-tertiary mt-0.5 text-xs">
                {workouts.length} nel periodo selezionato
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: '7d' as const, label: '7gg' },
                { value: '30d' as const, label: '30gg' },
                { value: '90d' as const, label: '90gg' },
                { value: 'all' as const, label: 'Tutto' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`min-h-[44px] rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 min-[834px]:min-h-9 min-[834px]:px-3.5 min-[834px]:py-1.5 min-[834px]:text-sm ${
                    selectedPeriod === period.value
                      ? 'border border-cyan-400/40 bg-cyan-500/20 text-cyan-400'
                      : 'border border-border text-text-secondary hover:border-cyan-400/40 hover:text-text-primary'
                  }`}
                >
                  {period.label}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="min-h-[44px] min-w-[44px] shrink-0 rounded-xl border-cyan-400/40 p-0 hover:bg-cyan-500/10 hover:text-cyan-400 min-[834px]:min-h-9 min-[834px]:min-w-9"
                title="Esporta PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 min-[834px]:p-5 min-[834px]:pt-4">
            {workouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20 min-[834px]:h-16 min-[834px]:w-16">
                  <Dumbbell className="h-7 w-7 text-cyan-400 min-[834px]:h-8 min-[834px]:w-8" />
                </div>
                <h3 className="text-text-primary text-sm font-semibold min-[834px]:text-base">
                  Nessun allenamento
                </h3>
                <p className="text-text-tertiary mt-1 text-xs min-[834px]:text-sm">
                  Cambia il filtro periodo o verifica che gli allenamenti siano stati registrati.
                </p>
              </div>
            ) : (
              <div className="space-y-2 min-[834px]:space-y-3">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="relative overflow-hidden rounded-xl border border-border/50 bg-background-secondary/30 p-3 min-[834px]:p-3.5 transition-colors hover:border-cyan-400/30 hover:bg-background-secondary/50"
                  >
                    <div className="flex flex-col gap-2 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                            <Dumbbell className="h-4 w-4 text-cyan-400" />
                          </div>
                          <h3 className="text-text-primary truncate text-sm font-semibold min-[834px]:text-base">
                            {workout.workout?.titolo || 'Allenamento'}
                          </h3>
                          {workout.completed_at && (
                            <Badge className="shrink-0 border-state-valid/30 bg-state-valid/20 text-state-valid text-[10px] px-1.5 py-0">
                              Completato
                            </Badge>
                          )}
                          {workout.stato === 'completato' && (
                            <Badge
                              variant="outline"
                              className="shrink-0 text-[10px] px-1.5 py-0 border-cyan-400/40 text-cyan-400"
                            >
                              {workout.is_coached ? 'Con trainer' : 'Da solo'}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-text-secondary text-xs">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatDate(workout.started_at)}</span>
                        </div>
                        {workout.note && (
                          <p className="text-text-tertiary mt-1.5 line-clamp-1 text-xs italic">
                            {workout.note}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1.5">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-semibold tabular-nums">
                          {formatDuration(workout.duration_minutes)}
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
  )
}
