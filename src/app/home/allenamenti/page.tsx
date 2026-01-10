'use client'

import { Suspense, useMemo, useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import {
  Calendar,
  Play,
  CheckCircle,
  TrendingUp,
  Award,
  Clock,
  Target,
  Activity,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { useAllenamenti } from '@/hooks/use-allenamenti'
import { useWorkouts } from '@/hooks/use-workouts'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useNormalizedRole, toLegacyRole } from '@/lib/utils/role-normalizer'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

const logger = createLogger('app:home:allenamenti:page')

// Funzione helper per formattare la data in italiano
function formatAppointmentDate(dateString: string): { day: string; time: string } {
  try {
    // Gestisce sia DATE che TIMESTAMP
    const date = new Date(dateString)

    // Verifica che la data sia valida
    if (isNaN(date.getTime())) {
      return { day: 'Data non valida', time: '' }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const appointmentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    let day: string
    if (appointmentDay.getTime() === today.getTime()) {
      day = 'Oggi'
    } else if (appointmentDay.getTime() === tomorrow.getTime()) {
      day = 'Domani'
    } else {
      day = date.toLocaleDateString('it-IT', { weekday: 'long' })
      day = day.charAt(0).toUpperCase() + day.slice(1)
    }

    // Se la data ha un'ora, mostra l'ora, altrimenti mostra solo la data
    const hasTime = dateString.includes('T') || dateString.includes(' ')
    const time = hasTime
      ? date.toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''

    return { day, time }
  } catch (err) {
    logger.warn('Errore formattazione data', err, { dateString })
    return { day: 'Data non valida', time: '' }
  }
}

// Funzione per calcolare lo streak (giorni consecutivi con allenamenti completati)
function calculateStreak(allenamenti: Array<{ data: string; stato: string }>): number {
  if (!allenamenti || allenamenti.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const completedDates = new Set<string>()

  // Raccogli tutte le date con allenamenti completati
  allenamenti
    .filter((a) => a.stato === 'completato')
    .forEach((a) => {
      try {
        const date = new Date(a.data)
        if (isNaN(date.getTime())) return
        date.setHours(0, 0, 0, 0)
        completedDates.add(date.toISOString())
      } catch {
        // Ignora date non valide
      }
    })

  // Conta giorni consecutivi partendo da oggi/ieri
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    checkDate.setHours(0, 0, 0, 0)
    const dateKey = checkDate.toISOString()

    if (completedDates.has(dateKey)) {
      streak++
    } else if (streak > 0) {
      // Se abbiamo già uno streak e questo giorno non ha allenamenti, interrompi
      break
    }
  }

  return streak
}

function AllenamentiHomePageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const [isCompletatiOpen, setIsCompletatiOpen] = useState(false)
  const [oggiMedia, setOggiMedia] = useState<{
    video_url: string | null
    thumb_url: string | null
    image_url: string | null
  } | null>(null)

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // Helper per ID mapping: chiarisce quale ID usare per ogni query
  // profileId = profiles.id (corretto per workout_logs.atleta_id)
  // NOTA: Tutti gli hooks devono essere chiamati prima di qualsiasi early return
  const profileId = useMemo(() => {
    if (!isValidUser || !user?.id) return null
    return isValidUUID(user.id) ? user.id : null
  }, [user?.id, isValidUser]) // profiles.id

  // Normalizza il ruolo usando utility function centralizzata
  const normalizedRoleRaw = useNormalizedRole(user?.role)
  // Converte in formato legacy per compatibilità
  const normalizedRole = useMemo(() => {
    return toLegacyRole(normalizedRoleRaw)
  }, [normalizedRoleRaw])

  // Stabilizza filters per evitare re-fetch continui
  // Usa profileId (profiles.id) per workout_logs.atleta_id
  const stableFilters = useMemo(
    () => ({
      atleta_id: profileId, // ✅ Corretto: workout_logs.atleta_id = profiles.id
      stato: 'tutti' as const,
    }),
    [profileId],
  )

  // Recupera workout logs (allenamenti)
  const {
    allenamenti: workoutLogs,
    loading: allenamentiLoading,
    error: allenamentiError,
  } = useAllenamenti(stableFilters)

  // Recupera workout plans attivi (schede di allenamento)
  // Nota: useWorkouts gestisce internamente la conversione profileId → userId se necessario
  const {
    workouts,
    loading: workoutsLoading,
    error: workoutsError,
  } = useWorkouts({
    userId: profileId, // Passa profileId, useWorkouts gestirà la conversione se necessario
    role: normalizedRole,
  })

  // Calcola statistiche reali con validazione dati
  const stats = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return {
        settimana: 0,
        mese: 0,
        streak: 0,
        volume_medio: 0,
      }
    }

    // Valida ogni log prima di usarlo per le statistiche
    const validLogs = workoutLogs.filter((log) => {
      // Valida data
      if (!log.data) return false
      try {
        const date = new Date(log.data)
        if (isNaN(date.getTime())) return false
      } catch {
        return false
      }
      // Valida volume_totale se presente
      if (log.volume_totale != null) {
        if (isNaN(log.volume_totale) || log.volume_totale < 0) return false
      }
      return true
    })

    if (validLogs.length === 0) {
      logger.warn('Nessun log valido per calcolare statistiche', undefined, {
        totalLogs: workoutLogs.length,
      })
      return {
        settimana: 0,
        mese: 0,
        streak: 0,
        volume_medio: 0,
      }
    }

    const completati = validLogs.filter((a) => a.stato === 'completato')
    const oggi = new Date()
    oggi.setHours(0, 0, 0, 0)
    const settimanaFa = new Date(oggi)
    settimanaFa.setDate(settimanaFa.getDate() - 7)
    const meseFa = new Date(oggi)
    meseFa.setMonth(meseFa.getMonth() - 1)

    const questaSettimana = completati.filter((a) => {
      try {
        const data = new Date(a.data)
        return !isNaN(data.getTime()) && data >= settimanaFa
      } catch {
        return false
      }
    }).length
    const questoMese = completati.filter((a) => {
      try {
        const data = new Date(a.data)
        return !isNaN(data.getTime()) && data >= meseFa
      } catch {
        return false
      }
    }).length
    const streak = calculateStreak(validLogs)

    // Calcola volume medio solo su log completati con volume valido
    const completatiConVolume = completati.filter(
      (a) => a.volume_totale != null && !isNaN(a.volume_totale) && a.volume_totale >= 0,
    )
    const volumeMedio =
      completatiConVolume.length > 0
        ? Math.round(
            completatiConVolume.reduce((sum, a) => sum + (a.volume_totale || 0), 0) /
              completatiConVolume.length,
          )
        : 0

    return {
      settimana: questaSettimana,
      mese: questoMese,
      streak,
      volume_medio: volumeMedio,
    }
  }, [workoutLogs])

  // Recupera media (video/thumbnail) per l'allenamento di oggi
  useEffect(() => {
    const fetchOggiMedia = async () => {
      if (!workoutLogs || workoutLogs.length === 0) {
        setOggiMedia(null)
        return
      }

      const oggi = new Date()
      oggi.setHours(0, 0, 0, 0)

      const allenamentoOggi = workoutLogs.find((a) => {
        try {
          const data = new Date(a.data)
          if (isNaN(data.getTime())) return false
          data.setHours(0, 0, 0, 0)
          return (
            data.getTime() === oggi.getTime() && (a.stato === 'programmato' || a.stato === 'in_corso')
          )
        } catch {
          return false
        }
      })

      if (!allenamentoOggi?.scheda_id) {
        setOggiMedia(null)
        return
      }

      try {
        // Recupera il primo esercizio del workout plan per ottenere video/thumbnail
        const { data: workoutDay, error: dayError } = await supabase
          .from('workout_days')
          .select('id')
          .eq('workout_plan_id', allenamentoOggi.scheda_id)
          .order('day_number', { ascending: true })
          .limit(1)
          .single()

        if (dayError || !workoutDay) {
          setOggiMedia(null)
          return
        }

        const workoutDayId = (workoutDay as { id?: string })?.id
        if (!workoutDayId) {
          setOggiMedia(null)
          return
        }

        const { data: exercise, error: exerciseError } = await supabase
          .from('workout_day_exercises')
          .select('exercise_id')
          .eq('workout_day_id', workoutDayId)
          .order('order_index', { ascending: true })
          .limit(1)
          .single()

        if (exerciseError || !exercise) {
          setOggiMedia(null)
          return
        }

        const exerciseId = (exercise as { exercise_id?: string })?.exercise_id
        if (!exerciseId) {
          setOggiMedia(null)
          return
        }

        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('exercises')
          .select('video_url, thumb_url, image_url')
          .eq('id', exerciseId)
          .single()

        if (detailsError || !exerciseDetails) {
          setOggiMedia(null)
          return
        }

        setOggiMedia({
          video_url: (exerciseDetails as { video_url?: string | null })?.video_url ?? null,
          thumb_url: (exerciseDetails as { thumb_url?: string | null })?.thumb_url ?? null,
          image_url: (exerciseDetails as { image_url?: string | null })?.image_url ?? null,
        })
      } catch (error) {
        logger.warn('Errore recupero media allenamento oggi', error, {
          scheda_id: allenamentoOggi.scheda_id,
        })
        setOggiMedia(null)
      }
    }

    fetchOggiMedia()
  }, [workoutLogs, supabase])

  // Organizza allenamenti in: oggi, programmati, completati con validazione date
  const organizedAllenamenti = useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return {
        oggi: null,
        programmati: [],
        completati: [],
      }
    }

    // Valida e filtra log invalidi prima di organizzare
    const validLogs = workoutLogs.filter((log) => {
      try {
        if (!log.data) return false
        const date = new Date(log.data)
        return !isNaN(date.getTime())
      } catch {
        return false
      }
    })

    if (validLogs.length === 0) {
      logger.warn('Nessun log valido per organizzare allenamenti', undefined, {
        totalLogs: workoutLogs.length,
      })
      return {
        oggi: null,
        programmati: [],
        completati: [],
      }
    }

    const oggi = new Date()
    oggi.setHours(0, 0, 0, 0)
    const oggiEnd = new Date(oggi)
    oggiEnd.setHours(23, 59, 59, 999)

    // Allenamento di oggi (programmato o in corso)
    const allenamentoOggi = validLogs.find((a) => {
      try {
        const data = new Date(a.data)
        if (isNaN(data.getTime())) return false
        data.setHours(0, 0, 0, 0)
        return (
          data.getTime() === oggi.getTime() && (a.stato === 'programmato' || a.stato === 'in_corso')
        )
      } catch {
        return false
      }
    })

    // Allenamenti programmati futuri
    const programmati = validLogs
      .filter((a) => {
        try {
          const data = new Date(a.data)
          if (isNaN(data.getTime())) return false
          return data > oggiEnd && a.stato === 'programmato'
        } catch {
          return false
        }
      })
      .slice(0, 5) // Limita a 5 per la visualizzazione

    // Allenamenti completati recenti
    const completati = validLogs
      .filter((a) => a.stato === 'completato')
      .sort((a, b) => {
        try {
          const dateA = new Date(a.data).getTime()
          const dateB = new Date(b.data).getTime()
          if (isNaN(dateA) || isNaN(dateB)) return 0
          return dateB - dateA
        } catch {
          return 0
        }
      })
      .slice(0, 5) // Limita a 5 per la visualizzazione

    return {
      oggi: allenamentoOggi
        ? {
            id: allenamentoOggi.id,
            titolo: allenamentoOggi.scheda_nome || 'Allenamento',
            descrizione: allenamentoOggi.note || 'Sessione di allenamento',
            durata: allenamentoOggi.durata_minuti || 60,
            esercizi_totali: allenamentoOggi.esercizi_totali || 0,
            esercizi_completati: allenamentoOggi.esercizi_completati || 0,
            pt: allenamentoOggi.trainer_name || 'Personal Trainer',
            orario: formatAppointmentDate(allenamentoOggi.data).time,
          }
        : null,
      programmati: programmati.map((a) => {
        const { day, time } = formatAppointmentDate(a.data)
        return {
          id: a.id,
          titolo: a.scheda_nome || 'Allenamento',
          data: day,
          orario: time,
          durata: a.durata_minuti || 60,
          esercizi: a.esercizi_totali || 0,
          pt: a.trainer_name || 'Personal Trainer',
        }
      }),
      completati: completati.map((a) => ({
        id: a.id,
        titolo: a.scheda_nome || 'Allenamento',
        data: a.data,
        durata: a.durata_minuti || 0,
        esercizi_completati: a.esercizi_completati || 0,
        esercizi_totali: a.esercizi_totali || 0,
        volume: a.volume_totale || 0,
        note: a.note || '',
      })),
    }
  }, [workoutLogs])

  // Memoizza funzione formatData per evitare ricreazione ad ogni render
  const formatData = useCallback((dataString: string) => {
    try {
      const date = new Date(dataString)
      if (isNaN(date.getTime())) return 'Data non valida'
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
      })
    } catch {
      return 'Data non valida'
    }
  }, [])

  // Mostra errori all'utente con notifiche
  useEffect(() => {
    if (allenamentiError) {
      logger.warn('Errore nel caricamento allenamenti', allenamentiError, {
        profileId: user?.id,
        userId: user?.user_id,
      })
      const errorMessage =
        (allenamentiError as unknown) instanceof Error
          ? (allenamentiError as Error).message
          : String(allenamentiError)
      notifyError('Errore nel caricamento allenamenti', errorMessage)
    }
  }, [allenamentiError, user?.id, user?.user_id])

  useEffect(() => {
    if (workoutsError) {
      logger.warn('Errore nel caricamento workout plans', workoutsError, {
        profileId: user?.id,
        userId: user?.user_id,
      })
      // workoutsError è di tipo string | null da useWorkoutPlansList
      const errorMessage =
        typeof workoutsError === 'string'
          ? workoutsError
          : 'Errore sconosciuto nel caricamento delle schede allenamento'
      notifyError('Errore nel caricamento schede allenamento', errorMessage)
    }
  }, [workoutsError, user?.id, user?.user_id])

  // Loading state per i dati
  const showDataLoading = allenamentiLoading || workoutsLoading

  // Se non c'è user, mostra skeleton (il layout gestirà il redirect)
  if (!user || !isValidUser) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-background-tertiary rounded mb-4" />
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-background-tertiary rounded" />
            ))}
          </div>
          <div className="h-64 bg-background-tertiary rounded" />
        </div>
      </div>
    )
  }

  // Mostra loading state solo per i dati (non per auth - layout gestisce auth)
  if (showDataLoading) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-background-tertiary rounded mb-4" />
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-background-tertiary rounded" />
            ))}
          </div>
          <div className="h-64 bg-background-tertiary rounded" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header - Design Moderno e Uniforme */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-text-primary mb-0.5 text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              I miei Allenamenti
            </h1>
            <p className="text-text-secondary text-xs line-clamp-1">
              Programma e monitora i tuoi progressi
            </p>
          </div>
        </div>
      </div>

      {/* Stats rapidi - Design Moderno e Uniforme */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="group relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-3 text-center relative z-10">
            <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-30 transition-opacity">
              <Activity className="h-5 w-5 text-teal-400" />
            </div>
            <div className="text-teal-300 mb-0.5 text-xl font-bold">{stats.settimana}</div>
            <div className="text-text-secondary text-[10px] font-medium uppercase tracking-wide leading-tight">
              Questa settimana
            </div>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden border-green-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-green-400/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-3 text-center relative z-10">
            <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-30 transition-opacity">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-green-300 mb-0.5 text-xl font-bold">{stats.mese}</div>
            <div className="text-text-secondary text-[10px] font-medium uppercase tracking-wide leading-tight">
              Questo mese
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allenamento di oggi - Design Moderno e Uniforme */}
      {organizedAllenamenti.oggi && (
        <Card className="group relative overflow-hidden border-teal-500/40 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative pb-2.5 z-10">
            <div className="flex items-center justify-between gap-2">
              <CardTitle size="sm" className="text-white flex items-center text-sm">
                <div className="mr-2 p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <Calendar className="h-3.5 w-3.5 text-teal-300" />
                </div>
                <span className="truncate">Allenamento di Oggi</span>
              </CardTitle>
              <Badge
                variant="primary"
                size="sm"
                className="shadow-lg shadow-teal-500/30 text-[10px] flex-shrink-0"
              >
                {organizedAllenamenti.oggi.orario}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative pt-0 z-10">
            <div className="flex gap-3">
              {/* Quadrato video a sinistra */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                {oggiMedia?.video_url ? (
                  <video
                    src={oggiMedia.video_url}
                    className="h-full w-full object-cover rounded-lg"
                    poster={oggiMedia.thumb_url || oggiMedia.image_url || undefined}
                    preload="metadata"
                    muted
                    playsInline
                    onMouseEnter={(e) => {
                      const video = e.currentTarget
                      video.play().catch(() => {
                        // Ignora errori di autoplay
                      })
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget
                      video.pause()
                      video.currentTime = 0
                    }}
                    onError={() => {
                      // In caso di errore, mostra il placeholder
                      setOggiMedia(null)
                    }}
                  />
                ) : oggiMedia?.thumb_url || oggiMedia?.image_url ? (
                  <Image
                    src={oggiMedia.thumb_url || oggiMedia.image_url || ''}
                    alt={organizedAllenamenti.oggi?.titolo || 'Allenamento'}
                    fill
                    className="object-cover rounded-lg"
                    unoptimized={(oggiMedia.thumb_url || oggiMedia.image_url || '').startsWith('http')}
                    onError={() => {
                      // In caso di errore, mostra il placeholder
                      setOggiMedia(null)
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-8 w-8 text-teal-300 opacity-70" />
                  </div>
                )}
              </div>

              {/* Contenuto a destra */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div>
                  <h3 className="text-text-primary mb-1 text-sm font-bold text-white truncate">
                    {organizedAllenamenti.oggi.titolo}
                  </h3>
                  <p className="text-text-secondary text-xs line-clamp-2">
                    {organizedAllenamenti.oggi.descrizione}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center rounded-lg p-2 bg-black/30 border border-teal-500/20">
                  <div>
                    <div className="text-text-tertiary mb-0.5 text-[10px] uppercase tracking-wide">
                      Durata
                    </div>
                    <div className="text-text-primary flex items-center justify-center gap-1 text-xs font-medium text-white">
                      <Clock className="h-3 w-3 text-teal-300" />
                      {organizedAllenamenti.oggi.durata} min
                    </div>
                  </div>
                  <div>
                    <div className="text-text-tertiary mb-0.5 text-[10px] uppercase tracking-wide">
                      Esercizi
                    </div>
                    <div className="text-text-primary flex items-center justify-center gap-1 text-xs font-medium text-white">
                      <Target className="h-3 w-3 text-teal-300" />
                      {organizedAllenamenti.oggi.esercizi_totali}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-tertiary mb-0.5 text-[10px] uppercase tracking-wide">
                      PT
                    </div>
                    <div className="text-text-primary text-xs font-medium text-white truncate">
                      {organizedAllenamenti.oggi.pt}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/home/allenamenti/oggi')}
                  className="h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold w-full shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 hover:scale-[1.02]"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Inizia Allenamento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schede assegnate - Design Moderno e Uniforme */}
      {workouts && workouts.length > 0 && (
        <div>
          <h2 className="text-text-primary mb-2.5 text-base font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
            Schede Assegnate
          </h2>
          <div className="space-y-2.5">
            {workouts
              .filter((w) => w.status === 'attivo')
              .map((workout) => (
                <Link
                  key={workout.id}
                  href={`/home/allenamenti/${workout.id}`}
                  className="block"
                  prefetch={true}
                >
                  <Card className="group relative overflow-hidden cursor-pointer border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]">
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-teal-500/10 to-cyan-500/20" />
                    <CardContent className="p-3 relative z-10">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary mb-1 text-sm font-semibold text-white truncate">
                            {workout.name}
                          </h3>
                          {workout.description && (
                            <p className="text-text-secondary text-xs mb-1.5 line-clamp-2">
                              {workout.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            {workout.difficulty && (
                              <div className="flex items-center gap-0.5">
                                <Target className="text-teal-300 h-3 w-3" />
                                <span className="text-text-secondary capitalize truncate">
                                  {workout.difficulty}
                                </span>
                              </div>
                            )}
                            {workout.muscle_group && (
                              <div className="flex items-center gap-0.5">
                                <Activity className="text-teal-300 h-3 w-3" />
                                <span className="text-text-secondary truncate">
                                  {workout.muscle_group}
                                </span>
                              </div>
                            )}
                            {workout.staff_name && (
                              <div className="flex items-center gap-0.5">
                                <span className="text-text-secondary truncate">
                                  PT: {workout.staff_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="primary"
                          size="sm"
                          className="shadow-md shadow-teal-500/20 pointer-events-none text-[10px] flex-shrink-0"
                        >
                          Attiva
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Allenamenti completati - Menu a scomparsa */}
      <Card
        variant="default"
        className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
          <button
            onClick={() => setIsCompletatiOpen(!isCompletatiOpen)}
            className="flex w-full items-center justify-between gap-2 text-left transition-colors hover:text-teal-300"
          >
            <CardTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
              Completati di recente
            </CardTitle>
            {organizedAllenamenti.completati.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" size="sm" className="text-[10px]">
                  {organizedAllenamenti.completati.length}
                </Badge>
                {isCompletatiOpen ? (
                  <ChevronUp className="h-4 w-4 text-text-secondary flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-secondary flex-shrink-0" />
                )}
              </div>
            )}
          </button>
        </CardHeader>
        {isCompletatiOpen && (
          <CardContent className="relative z-10 pt-2.5">
            {organizedAllenamenti.completati.length === 0 ? (
              <div className="py-6 text-center">
                <div className="mb-2.5 text-4xl opacity-50">💪</div>
                <p className="text-text-secondary text-xs font-medium">
                  Nessun allenamento completato
                </p>
                <p className="text-text-tertiary text-[10px] mt-1.5 line-clamp-2">
                  Inizia il tuo primo allenamento per vedere i tuoi progressi qui
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {organizedAllenamenti.completati.map((allenamento) => (
                  <div
                    key={allenamento.id}
                    className="group relative overflow-hidden rounded-lg border border-green-500/20 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 hover:border-green-400/40 hover:from-green-500/10 hover:to-emerald-500/10 transition-all duration-300 p-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary mb-0.5 text-xs font-semibold text-white truncate">
                            {allenamento.titolo}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-text-secondary">
                              {formatData(allenamento.data)}
                            </span>
                            <span className="text-text-tertiary">•</span>
                            <span className="text-text-secondary">{allenamento.durata} min</span>
                          </div>
                        </div>
                        <Badge
                          variant="success"
                          size="sm"
                          className="shadow-md shadow-green-500/20 text-[10px] flex-shrink-0"
                        >
                          <CheckCircle className="mr-0.5 h-2.5 w-2.5" />
                          Completato
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="mb-0.5 flex items-center justify-between">
                          <span className="text-text-secondary text-[10px] font-medium uppercase tracking-wide">
                            Esercizi
                          </span>
                          <span className="text-text-secondary text-[10px] font-medium">
                            {allenamento.esercizi_completati}/{allenamento.esercizi_totali}
                          </span>
                        </div>
                        <Progress
                          value={
                            allenamento.esercizi_totali > 0
                              ? (allenamento.esercizi_completati / allenamento.esercizi_totali) *
                                100
                              : 0
                          }
                          className="h-1"
                        />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-1.5 text-[10px] rounded-md p-1.5 bg-black/20 border border-green-500/10">
                        {allenamento.volume > 0 && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <TrendingUp className="text-green-300 h-2.5 w-2.5" />
                            <span className="text-text-secondary font-medium">
                              {allenamento.volume}kg
                            </span>
                          </div>
                        )}
                        {allenamento.note && (
                          <div className="flex-1 min-w-0 rounded px-1 py-0.5">
                            <p className="text-text-secondary text-[10px] truncate">
                              📝 {allenamento.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Motivational Card - Design Moderno e Uniforme */}
      <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
        <CardContent className="p-5 text-center relative z-10">
          <div className="mb-2.5 text-3xl animate-bounce">🏆</div>
          <h3 className="text-text-primary mb-1.5 text-base font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Ottimo lavoro questa settimana!
          </h3>
          <p className="text-text-secondary mb-3 text-xs">
            Hai completato <span className="text-teal-300 font-bold">{stats.settimana}</span>{' '}
            allenamenti. Continua così!
          </p>
          <Link href="/home/progressi" prefetch={true} className="inline-block w-full">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs w-full border-teal-500/50 text-white hover:border-teal-400 hover:bg-teal-500/10 transition-all duration-200 hover:scale-105 shadow-md shadow-teal-500/20"
            >
              <Award className="mr-1.5 h-3.5 w-3.5" />
              Vedi i tuoi progressi
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AllenamentiHomePage() {
  return (
    <Suspense
      fallback={
        <div
          className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
          style={{ overflow: 'auto' }}
        >
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-background-tertiary rounded mb-4" />
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-background-tertiary rounded" />
              ))}
            </div>
            <div className="h-64 bg-background-tertiary rounded" />
          </div>
        </div>
      }
    >
      <AllenamentiHomePageContent />
    </Suspense>
  )
}
