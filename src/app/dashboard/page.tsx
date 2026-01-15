import { Suspense } from 'react'
import { Skeleton, SkeletonCard } from '@/components/shared/ui/skeleton'
import { UserPlus, FileText, MessageSquare, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AgendaClient } from './_components/agenda-client'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { NewAppointmentButton } from './_components/new-appointment-button'
import { createLogger } from '@/lib/logger'

const logger = createLogger('DashboardPage')

interface AgendaEvent {
  id: string
  time: string
  athlete: string
  athlete_id?: string
  athlete_avatar?: string | null
  type: 'allenamento' | 'appuntamento' | 'consulenza'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'annullato'
  description?: string
  starts_at?: string
  ends_at?: string
}

type TodayAppointment = {
  id: string
  starts_at: string
  ends_at: string | null
  type: string | null
  status: string | null
  athlete_id: string | null
  athlete_name: string | null
  trainer_id: string | null
  trainer_name: string | null
  athlete:
    | {
        avatar: string | null
        avatar_url: string | null
      }
    | SupabaseRelationError
    | null
}

type SupabaseRelationError = {
  message: string
  details?: string | null
  hint?: string | null
  code?: string | null
}

const isSupabaseRelationError = (value: unknown): value is SupabaseRelationError =>
  typeof value === 'object' && value !== null && 'message' in value

export default async function DashboardPage() {
  // Carica appuntamenti del giorno corrente per l'agenda
  let agendaData: AgendaEvent[] = []

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Data di oggi (inizio e fine giornata)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStart = today.toISOString()

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const todayEnd = tomorrow.toISOString()

      // Ottieni il profilo dello staff corrente
      // NOTA: Server component non può usare AuthProvider client, query necessaria per SSR
      if (process.env.NODE_ENV !== 'production') {
        const logger = (await import('@/lib/logger')).createLogger('dashboard:page')
        logger.debug('[profiles] dashboard/page → query DB (server-side)', {
          userId: user.id,
          source: 'dashboard/page',
          reason: 'SSR - ottieni profile.id per appointments',
        })
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      type ProfileData = {
        id: string
      }

      const profileData = profile as ProfileData | null

      if (profileData) {
        // Query per appuntamenti del giorno corrente dello staff corrente
        // Usa staff_id nella nuova struttura semplificata
        const { data: todayAppointments, error } = await supabase
          .from('appointments')
          .select(
            `
            id,
            starts_at,
            ends_at,
            type,
            status,
            athlete_id,
            athlete:profiles!athlete_id(avatar, avatar_url, nome, cognome)
          `,
          )
          .eq('staff_id', profileData.id)
          .gte('starts_at', todayStart)
          .lt('starts_at', todayEnd)
          .is('cancelled_at', null)
          .order('starts_at', { ascending: true })

        if (!error && Array.isArray(todayAppointments)) {
          const now = new Date()
          const currentTime = now.getTime()

          const agendaCandidates = (todayAppointments as unknown as TodayAppointment[]).reduce<
            AgendaEvent[]
          >((acc, apt) => {
            const startTime = new Date(apt.starts_at)
            const endTime = apt.ends_at ? new Date(apt.ends_at) : null
            const startTimeMs = startTime.getTime()
            const statusValue = apt.status ?? ''

            // Escludi appuntamenti completati
            if (statusValue === 'completato' || statusValue === 'completed') {
              return acc
            }

            // Escludi appuntamenti cancellati
            if (statusValue === 'cancelled' || statusValue === 'annullato') {
              return acc
            }

            // Escludi appuntamenti passati (più di 1 ora fa) che non sono in corso
            if (startTimeMs < currentTime) {
              // Se c'è un endTime e siamo ancora dentro la finestra, è in corso
              if (endTime && endTime.getTime() > currentTime) {
                // È in corso, mantienilo
              } else {
                // È passato più di 1 ora, escludilo
                const hoursDiff = (currentTime - startTimeMs) / (1000 * 60 * 60)
                if (hoursDiff > 1) {
                  return acc
                }
              }
            }

            // Determina lo stato
            let status: AgendaEvent['status'] = 'scheduled'
            if (statusValue === 'in_corso' || statusValue === 'in-progress') {
              status = 'in-progress'
            } else if (statusValue === 'cancelled' || statusValue === 'annullato') {
              status = statusValue === 'annullato' ? 'annullato' : 'cancelled'
            } else {
              // Se è passato ma non completato, considera in corso se è entro la fine
              if (endTime && startTimeMs < currentTime && endTime.getTime() > currentTime) {
                status = 'in-progress'
              } else if (startTimeMs < currentTime) {
                // Se è passato ma entro 1 ora, è ancora in corso
                const hoursDiff = (currentTime - startTimeMs) / (1000 * 60 * 60)
                if (hoursDiff <= 1) {
                  status = 'in-progress'
                }
              }
            }

            // Estrai ora e minuti
            const hours = String(startTime.getHours()).padStart(2, '0')
            const minutes = String(startTime.getMinutes()).padStart(2, '0')
            const time = `${hours}:${minutes}`

            // Determina tipo
            let type: AgendaEvent['type'] = 'appuntamento'
            const typeValue = apt.type ?? ''
            if (typeValue === 'allenamento') {
              type = 'allenamento'
            } else if (
              typeValue === 'consulenza' ||
              typeValue === 'prima_visita' ||
              typeValue === 'riunione'
            ) {
              type = 'consulenza'
            }

            const description =
              typeValue === 'allenamento'
                ? 'Allenamento'
                : typeValue === 'consulenza'
                  ? 'Consulenza'
                  : typeValue || 'Appuntamento'

            const athleteRecord = isSupabaseRelationError(apt.athlete) ? null : apt.athlete

            type AthleteProfile = {
              avatar?: string | null
              avatar_url?: string | null
              nome?: string | null
              cognome?: string | null
            }

            const athleteProfile = athleteRecord as AthleteProfile | null

            const athleteAvatar = athleteProfile?.avatar_url ?? athleteProfile?.avatar ?? null
            // Costruisci nome atleta da profiles
            const athleteName =
              athleteProfile && athleteProfile.nome && athleteProfile.cognome
                ? `${athleteProfile.nome} ${athleteProfile.cognome}`.trim()
                : athleteProfile?.nome || athleteProfile?.cognome || 'Atleta'

            // Assicurati che starts_at e ends_at siano stringhe, non Date objects
            const startsAtStr =
              apt.starts_at && typeof apt.starts_at === 'object' && 'getTime' in apt.starts_at
                ? (apt.starts_at as Date).toISOString()
                : typeof apt.starts_at === 'string'
                  ? apt.starts_at
                  : undefined
            const endsAtStr =
              apt.ends_at && typeof apt.ends_at === 'object' && 'getTime' in apt.ends_at
                ? (apt.ends_at as Date).toISOString()
                : typeof apt.ends_at === 'string'
                  ? apt.ends_at
                  : undefined

            acc.push({
              id: apt.id,
              time,
              athlete: athleteName,
              athlete_id: apt.athlete_id || undefined,
              athlete_avatar: athleteAvatar,
              type,
              status,
              description,
              starts_at: startsAtStr,
              ends_at: endsAtStr,
            })

            return acc
          }, [])

          agendaData = agendaCandidates
            // Ordina per orario (mattino → sera)
            .sort((a, b) => {
              const [hoursA, minutesA] = a.time.split(':').map(Number)
              const [hoursB, minutesB] = b.time.split(':').map(Number)
              const timeA = hoursA * 60 + minutesA
              const timeB = hoursB * 60 + minutesB
              return timeA - timeB
            })
        }
      }
    }
  } catch (error) {
    logger.error('Error loading today appointments', error)
    // In caso di errore, agendaData rimane vuoto
  }

  return (
    <div className="flex flex-col h-full space-y-6 px-6 py-6 overflow-y-auto">
      {/* Quick Actions Section */}
      <section className="flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-text-primary">Azioni Rapide</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link href="/dashboard/clienti?new=true">
            <Button
              variant="outline"
              className="w-full h-auto flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-gradient-to-br hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-500/50 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 rounded-lg"
            >
              <UserPlus className="h-6 w-6 text-green-400" />
              <span className="text-sm font-medium text-white">Nuovo Cliente</span>
            </Button>
          </Link>

          <NewAppointmentButton />

          <Link href="/dashboard/schede/nuova">
            <Button
              variant="outline"
              className="w-full h-auto flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/50 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 rounded-lg"
            >
              <FileText className="h-6 w-6 text-orange-400" />
              <span className="text-sm font-medium text-white">Nuova Scheda</span>
            </Button>
          </Link>

          <Link href="/dashboard/chat">
            <Button
              variant="outline"
              className="w-full h-auto flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/50 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 rounded-lg"
            >
              <MessageSquare className="h-6 w-6 text-purple-400" />
              <span className="text-sm font-medium text-white">Messaggi</span>
            </Button>
          </Link>

          <Link href="/dashboard/statistiche">
            <Button
              variant="outline"
              className="w-full h-auto flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/30 hover:bg-gradient-to-br hover:from-teal-500/20 hover:to-cyan-500/20 hover:border-teal-500/50 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/20 rounded-lg"
            >
              <BarChart3 className="h-6 w-6 text-teal-400" />
              <span className="text-sm font-medium text-white">Statistiche</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Agenda Timeline Section */}
      <section className="flex-1 min-h-0">
        <Suspense fallback={<SkeletonCard />}>
          <AgendaClient initialEvents={agendaData} />
        </Suspense>
      </section>

      {/* Action Drawers - Mantenuto per compatibilità ma ora vuoto (modali gestite da ModalsWrapper) */}
      <Suspense fallback={<Skeleton height={60} />}>
        {/* Modali gestite da ModalsWrapper */}
      </Suspense>
    </div>
  )
}
