'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const COMPLETED_STATI = ['completato', 'completed'] as const

/** YYYY-MM-DD nel fuso locale (evita shift rispetto a toISOString().split('T')[0]). */
function toLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isCompletedStato(stato: string | null | undefined): boolean {
  if (!stato) return false
  const s = stato.toLowerCase().trim()
  return COMPLETED_STATI.includes(s as (typeof COMPLETED_STATI)[number])
}

export interface StoricoWorkoutRow {
  id: string
  atleta_id: string
  scheda_id: string | null
  data: string
  stato: string | null
  durata_minuti: number | null
  note: string | null
  created_at: string | null
  started_at: string
  completed_at: string | null
  duration_minutes: number | null
  is_coached: boolean
  workout: { titolo: string; descrizione: string | null } | null
}

export interface StoricoWorkoutStats {
  solo_count: number
  coached_count: number
  total_hours: number
}

export function useStoricoAllenamentiProfile(
  profileId: string | null,
  selectedPeriod: '7d' | '30d' | '90d' | 'all',
) {
  const [workouts, setWorkouts] = useState<StoricoWorkoutRow[]>([])
  const [stats, setStats] = useState<StoricoWorkoutStats>({
    solo_count: 0,
    coached_count: 0,
    total_hours: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const loadSeqRef = useRef(0)

  const loadData = useCallback(async () => {
    if (!profileId) {
      setWorkouts([])
      setStats({ solo_count: 0, coached_count: 0, total_hours: 0 })
      return
    }
    const seq = ++loadSeqRef.current
    try {
      setError(null)
      const supabase = createClient()

      const startOfPeriod = new Date()
      startOfPeriod.setHours(0, 0, 0, 0)
      if (selectedPeriod === '7d') {
        startOfPeriod.setDate(startOfPeriod.getDate() - 7)
      } else if (selectedPeriod === '30d') {
        startOfPeriod.setDate(startOfPeriod.getDate() - 30)
      } else if (selectedPeriod === '90d') {
        startOfPeriod.setDate(startOfPeriod.getDate() - 90)
      }
      const startDateKey = selectedPeriod === 'all' ? null : toLocalYmd(startOfPeriod)

      let query = supabase
        .from('workout_logs')
        .select(
          `
          id,
          atleta_id,
          scheda_id,
          data,
          stato,
          completato,
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
        .or(`atleta_id.eq.${profileId},athlete_id.eq.${profileId}`)

      if (startDateKey) {
        query = query.or(`data.gte.${startDateKey},completed_at.gte.${startDateKey}`)
      }

      query = query
        .or('stato.eq.completato,stato.eq.completed,completato.eq.true')
        .order('data', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false, nullsFirst: false })

      const { data: workoutData, error: workoutError } = await query

      if (seq !== loadSeqRef.current) {
        return
      }

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
          completato?: boolean | null
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
            const done = isCompletedStato(w.stato) || w.completato === true
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
          }),
        )
      }

      if (seq !== loadSeqRef.current) {
        return
      }

      const rowsForStats = (workoutError ? [] : workoutData || []) as Array<{
        durata_minuti?: number | null
        is_coached?: boolean | null
      }>
      if (rowsForStats.length > 0) {
        const totalMinutes = rowsForStats.reduce((sum, w) => sum + (w.durata_minuti ?? 0), 0)
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10
        const coachedCount = rowsForStats.filter((w) => Boolean(w.is_coached)).length
        const soloCount = rowsForStats.length - coachedCount
        setStats({ solo_count: soloCount, coached_count: coachedCount, total_hours: totalHours })
      } else {
        setStats({ solo_count: 0, coached_count: 0, total_hours: 0 })
      }
    } catch (err) {
      if (seq !== loadSeqRef.current) {
        return
      }
      console.error('Errore caricamento dati:', err)
      setError(err instanceof Error ? err.message : 'Errore caricamento dati')
    }
  }, [profileId, selectedPeriod])

  useEffect(() => {
    void loadData()
  }, [loadData])

  return { workouts, stats, error, reload: loadData }
}
