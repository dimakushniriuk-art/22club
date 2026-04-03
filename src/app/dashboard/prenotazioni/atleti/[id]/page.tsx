'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Card, CardContent, Button, Input, SimpleSelect } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { AppointmentTable } from '@/types/appointment'

type ProfileRow = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  avatar: string | null
  avatar_url: string | null
}

export default function PrenotazioniAtletaPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const supabase = useSupabaseClient()

  const athleteId = params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<AppointmentTable[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'tutti' | 'attivo' | 'completato' | 'annullato' | 'in_corso'
  >('tutti')
  const [rangeFilter, setRangeFilter] = useState<'tutti' | '7g' | '30g'>('tutti')

  useEffect(() => {
    let cancelled = false
    if (!athleteId) return
    setLoading(true)
    setError(null)
    setProfile(null)
    ;(async () => {
      const { data, error: qErr } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email, avatar, avatar_url')
        .eq('id', athleteId)
        .maybeSingle()

      if (cancelled) return
      if (qErr) {
        setError(qErr.message)
        setLoading(false)
        return
      }
      setProfile((data as ProfileRow | null) ?? null)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [athleteId, supabase])

  useEffect(() => {
    let cancelled = false
    if (!athleteId) return
    setAppointmentsLoading(true)
    setAppointmentsError(null)
    setAppointments([])
    ;(async () => {
      const { data, error: qErr } = await supabase
        .from('appointments')
        .select(
          'id, org_id, athlete_id, staff_id, trainer_id, starts_at, ends_at, type, status, service_type, color, notes, location, cancelled_at, recurrence_rule, created_at, updated_at, is_open_booking_day, created_by_role',
        )
        .eq('athlete_id', athleteId)
        .order('starts_at', { ascending: false })

      if (cancelled) return
      if (qErr) {
        setAppointmentsError(qErr.message)
        setAppointmentsLoading(false)
        return
      }
      setAppointments((data as AppointmentTable[] | null) ?? [])
      setAppointmentsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [athleteId, supabase])

  const displayName = useMemo(() => {
    const nome = profile?.nome?.trim() ?? ''
    const cognome = profile?.cognome?.trim() ?? ''
    return `${nome} ${cognome}`.trim() || 'Atleta'
  }, [profile?.nome, profile?.cognome])

  const avatarSrc = (profile?.avatar_url ?? profile?.avatar)?.trim() || null
  const fallbackText = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    const time = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return { time, dateStr }
  }

  const statusLabel = (status?: string | null) => {
    const s = (status ?? '').toLowerCase()
    if (s === 'completato' || s === 'completed') return 'Completata'
    if (s === 'annullato' || s === 'cancelled') return 'Annullata'
    return 'Attiva'
  }

  const getAppointmentType = (type?: string | null) => {
    if (!type) return 'Appuntamento'
    if (type === 'allenamento') return 'Allenamento'
    if (type === 'prova') return 'Prova'
    if (type === 'valutazione') return 'Valutazione'
    if (type.includes('_')) return type.replaceAll('_', ' ')
    return type
  }

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = new Date()
    const minDate =
      rangeFilter === '7g'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : rangeFilter === '30g'
          ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          : null

    return appointments.filter((apt) => {
      if (statusFilter !== 'tutti' && apt.status !== statusFilter) return false
      if (minDate) {
        const t = new Date(apt.starts_at)
        if (t < minDate) return false
      }
      if (!q) return true
      const hay = [
        getAppointmentType(apt.type),
        apt.type ?? '',
        apt.location ?? '',
        apt.notes ?? '',
        statusLabel(apt.status),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [appointments, rangeFilter, search, statusFilter])

  const hasActiveFilters = search.trim().length > 0 || statusFilter !== 'tutti' || rangeFilter !== 'tutti'

  return (
    <StaffContentLayout
      title={displayName}
      description="Scheda rapida atleta dall’area Prenotazioni."
      theme="teal"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/prenotazioni')}>
            Torna a Prenotazioni
          </Button>
          {athleteId ? (
            <Button size="sm" onClick={() => router.push(`/dashboard/atleti/${athleteId}`)}>
              Apri profilo completo
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        <Card variant="default">
          <CardContent className="p-4 sm:p-5">
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-white/[0.06] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-1/4 rounded bg-white/[0.06] animate-pulse" />
                </div>
              </div>
            ) : error ? (
              <p className="text-sm text-state-error">{error}</p>
            ) : !profile ? (
              <p className="text-sm text-text-secondary">Atleta non trovato.</p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar src={avatarSrc} alt={displayName} fallbackText={fallbackText} size="lg" />
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-text-primary truncate">{displayName}</p>
                  {profile.email ? (
                    <p className="text-sm text-text-secondary truncate">{profile.email}</p>
                  ) : (
                    <p className="text-sm text-text-tertiary">Email non disponibile</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <p className="text-sm font-medium text-text-primary">Appuntamenti</p>
              <p className="text-xs text-text-tertiary">
                {appointmentsLoading ? '—' : `${filteredAppointments.length}/${appointments.length}`}
              </p>
            </div>

            {appointmentsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/10 bg-white/[0.02] p-4 animate-pulse"
                  >
                    <div className="h-3 w-1/4 rounded bg-white/[0.06]" />
                    <div className="mt-2 h-4 w-1/3 rounded bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            ) : appointmentsError ? (
              <p className="text-sm text-state-error">{appointmentsError}</p>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-text-secondary">Nessun appuntamento per questo atleta.</p>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cerca (tipo, luogo, note, stato)..."
                      className="bg-white/[0.03] border-white/10"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <SimpleSelect
                      value={statusFilter}
                      onValueChange={(v) =>
                        setStatusFilter(v as 'tutti' | 'attivo' | 'completato' | 'annullato' | 'in_corso')
                      }
                      placeholder="Stato"
                      options={[
                        { value: 'tutti', label: 'Tutti gli stati' },
                        { value: 'attivo', label: 'Attivi' },
                        { value: 'in_corso', label: 'In corso' },
                        { value: 'completato', label: 'Completati' },
                        { value: 'annullato', label: 'Annullati' },
                      ]}
                      className="min-w-[170px]"
                    />
                    <SimpleSelect
                      value={rangeFilter}
                      onValueChange={(v) => setRangeFilter(v as 'tutti' | '7g' | '30g')}
                      placeholder="Periodo"
                      options={[
                        { value: 'tutti', label: 'Tutto' },
                        { value: '7g', label: 'Ultimi 7 giorni' },
                        { value: '30g', label: 'Ultimi 30 giorni' },
                      ]}
                      className="min-w-[170px]"
                    />
                    {hasActiveFilters ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearch('')
                          setStatusFilter('tutti')
                          setRangeFilter('tutti')
                        }}
                      >
                        Reset
                      </Button>
                    ) : null}
                  </div>
                </div>

                {filteredAppointments.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Nessun appuntamento corrisponde ai filtri.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((apt) => {
                  const { time, dateStr } = formatDateTime(apt.starts_at)
                  const { time: endTime } = formatDateTime(apt.ends_at)
                  return (
                    <div
                      key={apt.id}
                      className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-4 py-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex min-w-[120px] flex-col items-start">
                          <div className="text-text-secondary text-xs mb-1">{dateStr}</div>
                          <div className="font-mono text-[15px] font-bold text-blue-400 tabular-nums">
                            {time} - {endTime}
                          </div>
                        </div>

                        <div className="h-12 w-px bg-border/30" />

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-text-primary truncate">
                            {getAppointmentType(apt.type)}
                          </div>
                          {apt.location ? (
                            <div className="text-xs text-text-secondary truncate">{apt.location}</div>
                          ) : null}
                        </div>

                        <span className="shrink-0 rounded-full bg-background-tertiary/50 border border-white/10 text-text-tertiary text-[11px] font-medium px-3 py-1">
                          {statusLabel(apt.status)}
                        </span>
                      </div>
                      {apt.notes ? (
                        <div className="mt-2 text-xs text-text-secondary line-clamp-2">
                          {apt.notes}
                        </div>
                      ) : null}
                    </div>
                  )
                    })}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffContentLayout>
  )
}

