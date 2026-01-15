'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { 
  Calendar, 
  Dumbbell, 
  Clock, 
  TrendingUp,
  ChevronLeft,
  Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

interface UserProfile {
  nome: string
  cognome: string
}

export default function StoricoAllenamentiAtletaPage() {
  const router = useRouter()
  
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

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Utente non autenticato')
      }

      // Carica profilo utente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nome, cognome')
        .eq('user_id', user.id)
        .single()

      if (!profileError && profileData) {
        setUserProfile(profileData)
      }

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
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })

      if (selectedPeriod !== 'all') {
        query = query.gte('started_at', startDate.toISOString())
      }

      const { data: workoutData, error: workoutError } = await query

      if (workoutError) {
        console.error('Errore caricamento workout logs:', workoutError)
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
        doc.text('Dettaglio Allenamenti', 14, (doc as any).lastAutoTable.finalY + 10)

        const workoutsData = workouts.map(w => [
          formatDate(w.started_at),
          w.workout?.titolo || 'Allenamento',
          formatDuration(w.duration_minutes),
          w.completed_at ? 'Completato' : 'In corso',
          w.note || '-'
        ])

        autoTable(doc, {
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
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Pagina ${i} di ${pageCount} - 22Club`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }

      // Salva PDF
      const fileName = `storico-allenamenti-${userProfile?.nome || 'atleta'}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    } catch (err) {
      console.error('Errore generazione PDF:', err)
      alert('Errore durante la generazione del PDF')
    }
  }

  if (loading) {
    return <LoadingState message="Caricamento storico allenamenti..." />
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="relative min-h-[874px] min-w-[402px] w-full flex flex-col bg-gradient-to-br from-background via-background to-background-secondary overflow-auto">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="flex-1 flex flex-col space-y-3 px-3 py-3 w-full max-w-[1800px] mx-auto relative z-10">
        {/* Header compatto mobile */}
        <header className="flex-shrink-0 space-y-3">
          {/* Back button e titolo */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 rounded-full hover:bg-teal-500/10 transition-all duration-200 flex-shrink-0"
              aria-label="Torna indietro"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-text-primary text-lg font-bold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent truncate">
                I Miei Allenamenti
              </h1>
              {userProfile && (
                <p className="text-text-secondary text-xs mt-0.5 truncate">
                  {userProfile.nome} {userProfile.cognome}
                </p>
              )}
            </div>
          </div>

          {/* Filtri periodo compatti */}
          <div className="bg-background-secondary/50 backdrop-blur-sm rounded-xl p-1.5 border border-teal-500/10 flex flex-wrap items-center gap-1">
            <span className="text-text-secondary text-[10px] font-medium px-2">Periodo:</span>
            {[
              { value: '7d', label: '7gg' },
              { value: '30d', label: '30gg' },
              { value: '90d', label: '90gg' },
              { value: 'all', label: 'Tutto' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as typeof selectedPeriod)}
                className={`
                  px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-200
                  ${
                    selectedPeriod === period.value
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50'
                  }
                `}
              >
                {period.label}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Cards compatte 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              icon: Dumbbell,
              label: 'Totali',
              value: stats.total_workouts,
              gradient: 'from-blue-500 to-blue-600',
            },
            {
              icon: Clock,
              label: 'Ore',
              value: `${stats.total_hours}h`,
              gradient: 'from-teal-500 to-cyan-500',
            },
            {
              icon: TrendingUp,
              label: 'Media/Sett',
              value: stats.avg_per_week,
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              icon: Calendar,
              label: 'Streak',
              value: stats.current_streak,
              gradient: 'from-orange-500 to-red-500',
            },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-background-secondary/80 to-background-tertiary/40 backdrop-blur-sm border border-teal-500/10 hover:border-teal-400/30 transition-all duration-200"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                <div className="relative p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`bg-gradient-to-br ${stat.gradient} p-1.5 rounded-lg`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-text-secondary text-[10px] font-medium truncate flex-1">{stat.label}</p>
                  </div>
                  
                  <p className="text-text-primary text-xl font-bold tracking-tight">{stat.value}</p>

                  {/* Linea decorativa */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Lista Allenamenti compatta mobile */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background-secondary/80 to-background-tertiary/40 backdrop-blur-sm border border-teal-500/10">
          <div className="p-3">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-text-primary text-sm font-bold mb-0.5 truncate">
                  Allenamenti Completati
                </h2>
                <p className="text-text-secondary text-[10px] truncate">
                  {workouts.length} nel periodo
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="border-teal-500/30 hover:bg-teal-500/10 transition-all duration-200 h-7 px-2 text-[10px]"
                title="Esporta PDF"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>

            {workouts.length === 0 ? (
              <div className="text-center py-8 px-3">
                <div className="relative inline-block mb-3">
                  <div className="relative bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-4 rounded-full">
                    <Dumbbell className="h-8 w-8 text-teal-400" />
                  </div>
                </div>
                <h3 className="text-text-primary text-sm font-semibold mb-1">
                  Nessun allenamento
                </h3>
                <p className="text-text-secondary text-[10px] leading-relaxed">
                  Cambia il filtro o verifica che gli allenamenti siano stati registrati.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {workouts.map((workout, index) => (
                  <div
                    key={workout.id}
                    className="group relative overflow-hidden bg-background-secondary/50 backdrop-blur-sm border border-teal-500/10 rounded-lg p-2.5 hover:border-teal-400/30 transition-all duration-200 active:scale-[0.98]"
                  >
                    {/* Gradiente hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-teal-500/10 p-1 rounded group-hover:bg-teal-500/20 transition-colors flex-shrink-0">
                              <Dumbbell className="h-3 w-3 text-teal-400" />
                            </div>
                            <h3 className="text-text-primary font-semibold text-xs truncate flex-1">
                              {workout.workout?.titolo || 'Allenamento'}
                            </h3>
                            {workout.completed_at && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[8px] px-1.5 py-0 h-4">
                                ✓
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-text-secondary mb-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(workout.started_at)}</span>
                          </div>
                          
                          {workout.note && (
                            <p className="text-text-tertiary text-[10px] mt-1.5 italic line-clamp-1 bg-background-tertiary/30 px-2 py-1 rounded">
                              💭 {workout.note}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-2 py-1 rounded-lg border border-teal-500/20 flex-shrink-0">
                          <Clock className="h-3 w-3 text-teal-400" />
                          <span className="text-teal-400 font-bold text-xs whitespace-nowrap">
                            {formatDuration(workout.duration_minutes)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Linea progresso decorativa */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
