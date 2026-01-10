'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { RefreshButton } from '@/components/common/RefreshButton'
import { useAuth } from '@/providers/auth-provider'
import { useAppointments } from '@/hooks/use-appointments'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useNormalizedRole, toLegacyRole } from '@/lib/utils/role-normalizer'
import { validateDate } from '@/lib/utils/validation'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { Calendar, Clock, MapPin, User, MessageSquare, ArrowLeft } from 'lucide-react'

const logger = createLogger('app:home:appuntamenti:page')

function AppuntamentiPageContent() {
  const router = useRouter()
  const { user } = useAuth()

  // Type guard per user (dichiarato prima di essere usato)
  const isValidUser = user && isValidProfile(user)

  // Helper per ID mapping: profileId = profiles.id
  // Type guard assicura che user sia valido
  const profileId = useMemo(() => {
    if (!isValidUser || !user?.id) return null
    return isValidUUID(user.id) ? user.id : null
  }, [user?.id, isValidUser])

  // Normalizza il ruolo usando utility function centralizzata
  const normalizedRoleRaw = useNormalizedRole(user?.role)
  // Converte in formato legacy per compatibilità con useAppointments
  const normalizedRole = useMemo(() => {
    return toLegacyRole(normalizedRoleRaw)
  }, [normalizedRoleRaw])

  // Recupera appuntamenti dal database
  const { appointments, loading, error, refetch } = useAppointments({
    userId: profileId ?? undefined,
    role: normalizedRole ?? undefined,
  })

  const getStatusColor = (status: 'attivo' | 'completato' | 'annullato' | 'in_corso') => {
    switch (status) {
      case 'attivo':
        return 'success'
      case 'annullato':
        return 'warning'
      case 'completato':
        return 'primary'
      case 'in_corso':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: 'attivo' | 'completato' | 'annullato' | 'in_corso') => {
    switch (status) {
      case 'attivo':
        return 'Attivo'
      case 'annullato':
        return 'Annullato'
      case 'completato':
        return 'Completato'
      case 'in_corso':
        return 'In Corso'
      default:
        return 'Sconosciuto'
    }
  }

  // Helper per validare date (usa utility centralizzata)
  // NOTA: Le funzioni helper devono essere definite prima dei useMemo che le usano
  const isValidDate = (dateString: string | null | undefined): boolean => {
    return validateDate(dateString).valid
  }

  // Helper per formattare date con validazione
  const formatDate = (dateString: string | null | undefined): string => {
    try {
      if (!dateString) return 'Data non valida'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Data non valida'
      return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Data non valida'
    }
  }

  // Helper per formattare orari con validazione
  const formatTime = (dateString: string | null | undefined): string => {
    try {
      if (!dateString) return '--:--'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '--:--'
      return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '--:--'
    }
  }

  // Filtra appuntamenti futuri con validazione date - memoizzato
  // NOTA: Tutti gli hooks devono essere chiamati prima di qualsiasi early return
  const futureAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (!isValidDate(apt.starts_at)) return false
      const startDate = new Date(apt.starts_at)
      return (apt.status || 'attivo') === 'attivo' && startDate >= new Date()
    })
  }, [appointments])

  // Filtra appuntamenti passati con validazione date
  const pastAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (!isValidDate(apt.starts_at)) return false
      const startDate = new Date(apt.starts_at)
      return (apt.status || 'attivo') === 'completato' || startDate < new Date()
    })
  }, [appointments])

  // Gestione errori
  useEffect(() => {
    if (error) {
      logger.error('Errore nel caricamento appuntamenti', error, {
        profileId: user?.id,
        userId: user?.user_id,
      })
      // error è di tipo string | null da useAppointments
      const errorMessage =
        typeof error === 'string' ? error : 'Errore sconosciuto nel caricamento degli appuntamenti'
      notifyError('Errore nel caricamento appuntamenti', errorMessage)
    }
  }, [error, user?.id, user?.user_id])

  // Se non c'è user, mostra skeleton (il layout gestirà il redirect)
  if (!user || !isValidUser) {
    return (
      <div className="bg-black min-w-[402px] min-h-[874px]" style={{ overflow: 'auto' }}>
        <div className="space-y-4 px-3 py-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-background-tertiary h-8 w-48 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background-tertiary h-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostra loading state solo per i dati (non per auth - layout gestisce auth)
  if (loading && !error) {
    return (
      <div className="bg-black min-w-[402px] min-h-[874px]" style={{ overflow: 'auto' }}>
        <div className="space-y-4 px-3 py-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-background-tertiary h-8 w-48 rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background-tertiary h-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mostra errori se presenti e non in loading
  if (error && !loading) {
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
            <h1 className="text-text-primary text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate flex-1 text-center">
              I miei Appuntamenti
            </h1>
            <div className="w-8 flex-shrink-0" />
          </div>
        </div>
        <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
          <CardContent className="p-6 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">❌</div>
            <p className="text-text-primary mb-4 text-sm font-medium text-white line-clamp-3">
              {typeof error === 'string'
                ? error
                : 'Errore sconosciuto nel caricamento degli appuntamenti'}
            </p>
            <RefreshButton
              onRefresh={() => refetch()}
              isLoading={loading}
              ariaLabel="Riprova caricamento appuntamenti"
            />
          </CardContent>
        </Card>
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
              I miei Appuntamenti
            </h1>
            <p className="text-text-secondary text-xs line-clamp-1">
              Visualizza i tuoi appuntamenti programmati
            </p>
          </div>
        </div>
      </div>

      {/* Prossimi Appuntamenti */}
      <Card
        variant="default"
        className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
          <CardTitle
            size="sm"
            className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent"
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
              <Calendar className="h-3.5 w-3.5 text-teal-300" />
            </div>
            <span className="truncate">Prossimi Appuntamenti</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-2.5">
          {futureAppointments.length === 0 ? (
            <div className="py-6 text-center px-2">
              <div className="mb-3 text-4xl opacity-50">📅</div>
              <h3 className="text-text-primary mb-2 text-base font-bold text-white line-clamp-2">
                {normalizedRole === 'athlete'
                  ? 'Nessun appuntamento programmato'
                  : 'Nessun appuntamento per i tuoi atleti'}
              </h3>
              <p className="text-text-secondary text-xs mb-4 line-clamp-2">
                {normalizedRole === 'athlete'
                  ? 'Controlla più tardi o contatta il tuo personal trainer'
                  : 'Gli appuntamenti dei tuoi atleti appariranno qui'}
              </p>
              <RefreshButton
                onRefresh={() => refetch()}
                isLoading={loading}
                ariaLabel="Ricarica appuntamenti"
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {futureAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-background-tertiary/50 to-background-secondary/50 space-y-2 rounded-lg border border-teal-500/30 p-3 hover:border-teal-400/60 hover:bg-gradient-to-br hover:from-teal-500/10 hover:to-cyan-500/5 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <h3 className="text-text-primary text-sm font-semibold text-white truncate flex-1 min-w-0">
                      {appointment.type}
                    </h3>
                    <Badge
                      variant={
                        getStatusColor(appointment.status || 'attivo') as
                          | 'default'
                          | 'success'
                          | 'warning'
                          | 'error'
                          | 'info'
                          | 'outline'
                          | 'secondary'
                      }
                      size="sm"
                      className="shadow-lg shadow-teal-500/20 text-[10px] flex-shrink-0"
                    >
                      {getStatusText(appointment.status || 'attivo')}
                    </Badge>
                  </div>
                  <div className="text-text-secondary text-[10px] space-y-1.5 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-teal-300 flex-shrink-0" />
                      <p className="font-medium text-white truncate">
                        {formatDate(appointment.starts_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-teal-300 flex-shrink-0" />
                      <p className="truncate">
                        {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
                      </p>
                    </div>
                    {appointment.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-teal-300 flex-shrink-0" />
                        <p className="truncate">{appointment.location}</p>
                      </div>
                    )}
                    {appointment.trainer_name && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-teal-300 flex-shrink-0" />
                        <p className="truncate">con {appointment.trainer_name}</p>
                      </div>
                    )}
                    {appointment.notes && (
                      <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded bg-black/30 border border-teal-500/20">
                        <MessageSquare className="h-3 w-3 text-teal-300 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] line-clamp-2">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appuntamenti Passati */}
      {pastAppointments.length > 0 && (
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Clock className="h-3.5 w-3.5 text-teal-300" />
              </div>
              <span className="truncate">Appuntamenti Passati</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 pt-2.5">
            <div className="space-y-2.5">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-background-tertiary/50 to-background-secondary/50 space-y-2 rounded-lg border border-teal-500/30 p-3 hover:border-teal-400/60 hover:bg-gradient-to-br hover:from-teal-500/10 hover:to-cyan-500/5 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <h4 className="text-text-primary text-sm font-semibold text-white truncate flex-1 min-w-0">
                      {appointment.type || 'Allenamento'}
                    </h4>
                    <Badge
                      variant={getStatusColor(appointment.status || 'attivo')}
                      size="sm"
                      className="shadow-lg shadow-teal-500/20 text-[10px] flex-shrink-0"
                    >
                      {getStatusText(appointment.status || 'attivo')}
                    </Badge>
                  </div>
                  <div className="text-text-secondary text-[10px] space-y-1 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-teal-300 flex-shrink-0" />
                      <p className="truncate">
                        {formatDate(appointment.starts_at)} • {formatTime(appointment.starts_at)} -{' '}
                        {formatTime(appointment.ends_at)}
                      </p>
                    </div>
                    {appointment.trainer_name && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-teal-300 flex-shrink-0" />
                        <p className="truncate">con {appointment.trainer_name}</p>
                      </div>
                    )}
                    {appointment.cancelled_at && isValidDate(appointment.cancelled_at) && (
                      <p className="text-red-400 text-[10px] mt-1">
                        Annullato il {new Date(appointment.cancelled_at).toLocaleString('it-IT')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card
        variant="default"
        className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
        <CardContent padding="md" className="text-center relative z-10 p-5">
          <div className="mb-3 text-3xl opacity-50">💡</div>
          <p className="text-text-secondary text-xs font-medium leading-relaxed px-2">
            <strong className="text-white">Suggerimento:</strong> I tuoi appuntamenti vengono
            aggiornati automaticamente. Se hai domande, contatta il tuo personal trainer.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AppuntamentiPage() {
  return (
    <Suspense
      fallback={
        <div
          className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
          style={{ overflow: 'auto' }}
        >
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-background-tertiary rounded" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-background-tertiary rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <AppuntamentiPageContent />
    </Suspense>
  )
}
