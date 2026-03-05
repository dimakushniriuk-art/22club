// ============================================================
// Componente Tab Allenamenti Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Mostra: schede assegnate, allenamenti eseguiti con date, appuntamenti (tutti gli stati)
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui'
import { Dumbbell, ArrowLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

const glassSurface =
  'bg-gradient-to-br from-background-secondary/38 via-background-secondary/18 to-cyan-950/22 backdrop-blur-xl'
const framePrimary = 'border border-primary/22 hover:border-primary/30 transition'
const frameSoft = 'border border-white/10 hover:border-white/14 transition'
const shadowSport = 'shadow-[0_10px_30px_rgba(0,0,0,0.45)]'

interface AthleteWorkoutsTabProps {
  athleteId: string
  schedeAttive: number
}

interface SchedaRow {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  created_at: string | null
}

interface WorkoutLogRow {
  id: string
  data: string | null
  completato: boolean | null
  scheda_id: string | null
  created_at: string | null
}

interface AppointmentRow {
  id: string
  starts_at: string
  status: string | null
  type: string
  trainer_name: string | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function statusLabel(status: string | null): string {
  if (!status) return '—'
  const map: Record<string, string> = {
    completato: 'Completato',
    completed: 'Completato',
    annullato: 'Annullato',
    cancelled: 'Cancellato',
    cancellato: 'Cancellato',
    scheduled: 'Programmato',
    programmato: 'Programmato',
    confirmed: 'Confermato',
    confermato: 'Confermato',
  }
  return map[status.toLowerCase()] ?? status
}

function statusVariant(status: string | null): 'success' | 'destructive' | 'secondary' {
  const s = (status ?? '').toLowerCase()
  if (s === 'completato' || s === 'completed') return 'success'
  if (s === 'annullato' || s === 'cancelled' || s === 'cancellato') return 'destructive'
  return 'secondary'
}

export function AthleteWorkoutsTab({ athleteId, schedeAttive }: AthleteWorkoutsTabProps) {
  const [schede, setSchede] = useState<SchedaRow[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogRow[]>([])
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!athleteId) return
    const supabase = createClient()

    const load = async () => {
      setLoading(true)
      try {
        const [schedeRes, logsRes, appRes] = await Promise.all([
          supabase
            .from('workout_plans')
            .select('id, name, start_date, end_date, is_active, created_at')
            .eq('athlete_id', athleteId)
            .order('created_at', { ascending: false }),
          supabase
            .from('workout_logs')
            .select('id, data, completato, scheda_id, created_at')
            .or(`atleta_id.eq.${athleteId},athlete_id.eq.${athleteId}`)
            .order('data', { ascending: false })
            .limit(100),
          supabase
            .from('appointments')
            .select('id, starts_at, status, type, trainer_name')
            .eq('athlete_id', athleteId)
            .order('starts_at', { ascending: false })
            .limit(100),
        ])

        setSchede((schedeRes.data ?? []) as SchedaRow[])
        setWorkoutLogs((logsRes.data ?? []) as WorkoutLogRow[])
        setAppointments((appRes.data ?? []) as AppointmentRow[])
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [athleteId])

  return (
    <Card
      variant="trainer"
      className={`relative overflow-hidden rounded-3xl ${glassSurface} ${framePrimary} ${shadowSport}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <CardContent className="p-6 relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-text-primary text-xl font-bold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Schede di Allenamento
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              {schedeAttive} {schedeAttive === 1 ? 'scheda attiva' : 'schede attive'}
            </p>
            <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          </div>
          <Link
            href={`/dashboard/schede?athlete_id=${athleteId}`}
            className="rounded-full px-5 py-2.5 font-bold text-sm bg-gradient-to-br from-primary/30 to-cyan-500/14 border border-primary/26 shadow-[0_0_24px_rgba(2,179,191,0.16)] hover:from-primary/36 hover:to-cyan-500/18 transition inline-flex items-center gap-2"
          >
            Vedi tutte le schede
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>

        {loading ? (
          <p className="text-text-secondary text-sm py-4">Caricamento...</p>
        ) : schedeAttive === 0 && workoutLogs.length === 0 && appointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary/12 text-primary border border-primary/22">
              <Dumbbell className="h-8 w-8" />
            </div>
            <p className="text-text-primary font-medium mb-2">Nessuna scheda attiva</p>
            <p className="text-text-secondary text-sm mb-4">
              Crea una nuova scheda di allenamento per questo atleta
            </p>
            <Link
              href={`/dashboard/schede?athlete_id=${athleteId}&new=true`}
              className="rounded-full px-5 py-2.5 font-bold text-sm bg-gradient-to-br from-primary/30 to-cyan-500/14 border border-primary/26 shadow-[0_0_24px_rgba(2,179,191,0.16)] hover:from-primary/36 hover:to-cyan-500/18 transition inline-flex items-center justify-center"
            >
              Crea Prima Scheda
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h4 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                Schede assegnate
              </h4>
              {schede.length === 0 ? (
                <p className="text-text-secondary text-sm">Nessuna scheda assegnata</p>
              ) : (
                <ul className="space-y-2">
                  {schede.map((s) => (
                    <li
                      key={s.id}
                      className={`flex items-center justify-between gap-2 p-3 rounded-2xl bg-background-secondary/25 ${frameSoft}`}
                    >
                      <span className="text-text-primary font-medium truncate">{s.name}</span>
                      <span className="text-text-secondary text-xs shrink-0 flex items-center gap-2">
                        {formatDate(s.start_date)} → {formatDate(s.end_date)}
                        {s.is_active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/14 text-emerald-300 text-xs font-bold border border-emerald-500/22 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
                            Attiva
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Allenamenti eseguiti
              </h4>
              {workoutLogs.length === 0 ? (
                <p className="text-text-secondary text-sm">Nessun allenamento registrato</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {workoutLogs.map((log) => (
                    <li
                      key={log.id}
                      className={`flex items-center justify-between gap-2 p-3 rounded-2xl bg-background-secondary/25 ${frameSoft}`}
                    >
                      <span className="text-text-primary text-sm">
                        {formatDate(log.data ?? log.created_at)}
                      </span>
                      {log.completato ? (
                        <span className="text-success text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/14 text-emerald-300 font-bold border border-emerald-500/22">
                          <CheckCircle className="h-3.5 w-3.5" /> Completato
                        </span>
                      ) : (
                        <span className="text-text-secondary text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15">
                          In corso / Parziale
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Appuntamenti
              </h4>
              {appointments.length === 0 ? (
                <p className="text-text-secondary text-sm">Nessun appuntamento</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {appointments.map((a) => {
                    const variant = statusVariant(a.status)
                    return (
                      <li
                        key={a.id}
                        className={`flex items-center justify-between gap-2 p-3 rounded-2xl bg-background-secondary/25 ${frameSoft}`}
                      >
                        <div className="min-w-0">
                          <span className="text-text-primary text-sm block">
                            {formatDateTime(a.starts_at)}
                          </span>
                          {a.trainer_name ? (
                            <span className="text-text-secondary text-xs">{a.trainer_name}</span>
                          ) : null}
                        </div>
                        <span
                          className={`text-xs shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full font-medium
                            ${variant === 'success' ? 'bg-emerald-500/14 text-emerald-300 border border-emerald-500/22' : ''}
                            ${variant === 'destructive' ? 'bg-destructive/10 text-destructive border border-destructive/20' : ''}
                            ${variant === 'secondary' ? 'bg-background-secondary/30 text-text-secondary border border-white/10' : ''}`}
                        >
                          {variant === 'destructive' ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : variant === 'success' ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          {statusLabel(a.status)} · {a.type}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
