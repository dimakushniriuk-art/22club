'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { 
  Calendar, 
  Dumbbell, 
  Clock, 
  TrendingUp,
  ChevronLeft,
  Filter,
  Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Cliente } from '@/types/cliente'

interface WorkoutLog {
  id: string
  workout_id: string
  user_id: string
  started_at: string
  completed_at: string | null
  duration_minutes: number | null
  note: string | null
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

export default function StoricoAllenamentiPage() {
  const params = useParams()
  const router = useRouter()
  const athleteId = String(params.id || '')
  
  const [athlete, setAthlete] = useState<Cliente | null>(null)
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

  useEffect(() => {
    loadData()
  }, [athleteId, selectedPeriod])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()

      // Carica dati atleta
      const { data: athleteData, error: athleteError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', athleteId)
        .single()

      if (athleteError) throw new Error('Atleta non trovato')

      setAthlete({
        id: athleteData.id,
        nome: athleteData.nome || '',
        cognome: athleteData.cognome || '',
        email: athleteData.email || '',
        phone: athleteData.phone || null,
        avatar_url: athleteData.avatar || athleteData.avatar_url || null,
        data_iscrizione: athleteData.data_iscrizione || athleteData.created_at || '',
        stato: athleteData.stato || 'attivo',
        allenamenti_mese: 0,
        ultimo_accesso: athleteData.ultimo_accesso || null,
        scheda_attiva: null,
        documenti_scadenza: athleteData.documenti_scadenza || false,
        note: athleteData.note || null,
        tags: [],
        role: athleteData.role || 'atleta',
        created_at: athleteData.created_at || '',
        updated_at: athleteData.updated_at || '',
        first_name: athleteData.nome || '',
        last_name: athleteData.cognome || '',
      })

      // Calcola data inizio in base al periodo selezionato
      let startDate = new Date()
      if (selectedPeriod === '7d') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (selectedPeriod === '30d') {
        startDate.setDate(startDate.getDate() - 30)
      } else if (selectedPeriod === '90d') {
        startDate.setDate(startDate.getDate() - 90)
      } else {
        startDate = new Date('2000-01-01') // All time
      }

      // Carica workout logs
      let query = supabase
        .from('workout_logs')
        .select(`
          id,
          workout_id,
          user_id,
          started_at,
          completed_at,
          duration_minutes,
          note,
          workouts:workout_id (
            titolo,
            descrizione
          )
        `)
        .eq('user_id', athleteData.user_id)
        .order('started_at', { ascending: false })

      if (selectedPeriod !== 'all') {
        query = query.gte('started_at', startDate.toISOString())
      }

      const { data: workoutData, error: workoutError } = await query

      if (workoutError) {
        console.error('Errore caricamento workout logs:', workoutError)
        // Non bloccare se non ci sono workout logs
        setWorkouts([])
      } else {
        setWorkouts((workoutData || []).map(w => ({
          ...w,
          workout: Array.isArray(w.workouts) ? w.workouts[0] : w.workouts
        })) as WorkoutLog[])
      }

      // Calcola statistiche
      if (workoutData && workoutData.length > 0) {
        const totalMinutes = workoutData.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10

        // Calcola media settimanale
        const oldestWorkout = new Date(workoutData[workoutData.length - 1].started_at)
        const daysDiff = Math.max(1, Math.ceil((Date.now() - oldestWorkout.getTime()) / (1000 * 60 * 60 * 24)))
        const weeks = daysDiff / 7
        const avgPerWeek = Math.round(workoutData.length / weeks * 10) / 10

        setStats({
          total_workouts: workoutData.length,
          total_hours: totalHours,
          avg_per_week: avgPerWeek,
          current_streak: 0, // TODO: calcolare streak reale
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
  }

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

  if (loading) {
    return <LoadingState message="Caricamento storico allenamenti..." />
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState message={error || 'Atleta non trovato'} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background-secondary">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 px-4 sm:px-6 py-6 sm:py-8 max-w-[1800px] mx-auto w-full relative z-10">
        {/* Header con gradiente */}
        <header className="flex-shrink-0 space-y-6">
          {/* Back button e titolo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full hover:bg-teal-500/10 hover:scale-110 transition-all duration-200"
              aria-label="Torna indietro"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-text-primary text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Storico Allenamenti
              </h1>
              <p className="text-text-secondary text-base sm:text-lg mt-1">
                {athlete.nome} {athlete.cognome}
              </p>
            </div>
          </div>

          {/* Filtri periodo eleganti */}
          <div className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl p-2 border border-teal-500/10 inline-flex flex-wrap items-center gap-2">
            <span className="text-text-secondary text-sm font-medium px-3">Periodo:</span>
            {[
              { value: '7d', label: '7 giorni' },
              { value: '30d', label: '30 giorni' },
              { value: '90d', label: '90 giorni' },
              { value: 'all', label: 'Tutto' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as typeof selectedPeriod)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    selectedPeriod === period.value
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-105'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50'
                  }
                `}
              >
                {period.label}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Cards con animazioni */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: Dumbbell,
              label: 'Allenamenti Totali',
              value: stats.total_workouts,
              color: 'blue',
              gradient: 'from-blue-500 to-blue-600',
              delay: '0ms',
            },
            {
              icon: Clock,
              label: 'Ore Totali',
              value: `${stats.total_hours}h`,
              color: 'teal',
              gradient: 'from-teal-500 to-cyan-500',
              delay: '100ms',
            },
            {
              icon: TrendingUp,
              label: 'Media Settimanale',
              value: stats.avg_per_week,
              color: 'purple',
              gradient: 'from-purple-500 to-pink-500',
              delay: '200ms',
            },
            {
              icon: Calendar,
              label: 'Streak Giorni',
              value: stats.current_streak,
              color: 'orange',
              gradient: 'from-orange-500 to-red-500',
              delay: '300ms',
            },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background-secondary/80 via-background-secondary/60 to-background-tertiary/40 backdrop-blur-sm border border-teal-500/10 hover:border-teal-400/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-teal-500/10"
                style={{ animationDelay: stat.delay }}
              >
                {/* Gradiente animato */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-transparent to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-text-secondary text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-text-primary text-3xl font-bold tracking-tight">{stat.value}</p>
                  </div>

                  {/* Linea decorativa */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Lista Allenamenti con design migliorato */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background-secondary/80 via-background-secondary/60 to-background-tertiary/40 backdrop-blur-sm border border-teal-500/10">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-text-primary text-2xl font-bold mb-1">
                  Allenamenti Completati
                </h2>
                <p className="text-text-secondary text-sm">
                  {workouts.length} {workouts.length === 1 ? 'allenamento' : 'allenamenti'} nel periodo selezionato
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-teal-500/30 hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:text-white hover:border-transparent transition-all duration-200 shadow-lg hover:shadow-teal-500/30"
              >
                <Download className="mr-2 h-4 w-4" />
                Esporta
              </Button>
            </div>

            {workouts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-6 rounded-full">
                    <Dumbbell className="h-16 w-16 text-teal-400" />
                  </div>
                </div>
                <h3 className="text-text-primary text-xl font-semibold mb-2">
                  Nessun allenamento trovato
                </h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Non ci sono allenamenti completati nel periodo selezionato.
                  Prova a cambiare il filtro o verifica che gli allenamenti siano stati registrati.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {workouts.map((workout, index) => (
                  <div
                    key={workout.id}
                    className="group relative overflow-hidden bg-background-secondary/50 backdrop-blur-sm border border-teal-500/10 rounded-xl p-5 hover:border-teal-400/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradiente hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="bg-teal-500/10 p-2 rounded-lg group-hover:bg-teal-500/20 transition-colors">
                            <Dumbbell className="h-4 w-4 text-teal-400" />
                          </div>
                          <h3 className="text-text-primary font-semibold text-lg truncate">
                            {workout.workout?.titolo || 'Allenamento'}
                          </h3>
                          {workout.completed_at && (
                            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 shadow-sm">
                              ✓ Completato
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-2">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(workout.started_at)}
                          </span>
                        </div>
                        
                        {workout.note && (
                          <p className="text-text-tertiary text-sm mt-3 italic line-clamp-2 bg-background-tertiary/30 px-3 py-2 rounded-lg">
                            💭 {workout.note}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-4 py-2 rounded-xl border border-teal-500/20">
                          <Clock className="h-5 w-5 text-teal-400" />
                          <span className="text-teal-400 font-bold text-lg">
                            {formatDuration(workout.duration_minutes)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Linea progresso decorativa */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
