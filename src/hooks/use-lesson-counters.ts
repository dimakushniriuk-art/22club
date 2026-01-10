'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { Tables, TablesUpdate } from '@/types/supabase'

const logger = createLogger('hooks:use-lesson-counters')

interface LessonCounter {
  athlete_id: string
  lessons_total: number
  lessons_used: number
  updated_at: string
}

interface UseLessonCountersProps {
  userId?: string | null
  role?: string | null
}

export function useLessonCounters({ userId, role }: UseLessonCountersProps) {
  const [counters, setCounters] = useState<LessonCounter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const mapRowToCounter = (
    row: Tables<'lesson_counters'>,
    lessonsTotalMap: Map<string, number>,
  ): LessonCounter => {
    const lessonsTotal = lessonsTotalMap.get(row.athlete_id) || 0
    const count = row.count ?? 0
    const lessonsUsed = Math.max(0, lessonsTotal - count)

    return {
      athlete_id: row.athlete_id ?? '',
      lessons_total: lessonsTotal,
      lessons_used: lessonsUsed,
      updated_at: row.updated_at ?? new Date().toISOString(),
    }
  }

  const fetchCounters = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from('lesson_counters').select('*')

      if (role === 'atleta' && userId) {
        query = query.eq('athlete_id', userId)
      } else if ((role === 'admin' || role === 'pt') && userId) {
        // Staff può vedere tutti i contatori
        query = query
      }

      const { data, error: fetchError } = await query.returns<Tables<'lesson_counters'>[]>()

      if (fetchError) {
        throw fetchError
      }

      // Carica tutti i payments per calcolare lessons_total per ogni atleta
      const athleteIds = [...new Set((data ?? []).map((row) => row.athlete_id))]
      const lessonsTotalMap = new Map<string, number>()

      if (athleteIds.length > 0) {
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('athlete_id, lessons_purchased')
          .in('athlete_id', athleteIds)
          .eq('is_reversal', false)

        if (paymentsData) {
          paymentsData.forEach((payment) => {
            const current = lessonsTotalMap.get(payment.athlete_id) || 0
            lessonsTotalMap.set(payment.athlete_id, current + (payment.lessons_purchased || 0))
          })
        }
      }

      setCounters((data ?? []).map((row) => mapRowToCounter(row, lessonsTotalMap)))
    } catch (err) {
      logger.error('Error fetching lesson counters', err, { userId, role })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei contatori lezioni')
    } finally {
      setLoading(false)
    }
  }, [userId, role, supabase])

  useEffect(() => {
    if (!userId) return

    fetchCounters()
  }, [userId, role, fetchCounters])

  const updateCounter = async (athleteId: string, lessonsPurchased: number) => {
    try {
      setError(null)

      // Ottieni il contatore esistente
      const { data: existingCounter, error: fetchError } = await supabase
        .from('lesson_counters')
        .select('*')
        .eq('athlete_id', athleteId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      // Calcola il nuovo count (lezioni rimanenti) aggiungendo le lezioni acquistate
      const currentCount = existingCounter?.count ?? 0
      const newCount = currentCount + lessonsPurchased

      if (existingCounter) {
        // Aggiorna il contatore esistente incrementando count
        const patch: TablesUpdate<'lesson_counters'> = {
          count: newCount,
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('lesson_counters')
          .update(patch)
          .eq('athlete_id', athleteId)
          .select()
          .single()

        if (error) throw error

        // Ricarica i contatori per aggiornare lo stato locale con i valori corretti
        await fetchCounters()

        return data
      } else {
        // Crea un nuovo contatore con count = lessonsPurchased (lezioni rimanenti)
        const insertData: TablesUpdate<'lesson_counters'> = {
          athlete_id: athleteId,
          lesson_type: 'standard', // Tipo di default
          count: lessonsPurchased,
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('lesson_counters')
          .insert(insertData)
          .select()
          .single()

        if (error) throw error

        // Ricarica i contatori per aggiornare lo stato locale
        await fetchCounters()

        return data
      }
    } catch (err) {
      logger.error('Error updating lesson counter', err, { athleteId, lessonsPurchased })
      setError(
        err instanceof Error ? err.message : "Errore nell'aggiornamento del contatore lezioni",
      )
      throw err
    }
  }

  const decrementCounter = async (athleteId: string) => {
    try {
      setError(null)

      // Prima leggi il contatore corrente
      const { data: currentCounter, error: fetchError } = await supabase
        .from('lesson_counters')
        .select('*')
        .eq('athlete_id', athleteId)
        .single()

      if (fetchError) throw fetchError

      // Decrementa count (lezioni rimanenti) di 1
      const currentCount = currentCounter.count ?? 0
      const newCount = Math.max(0, currentCount - 1)

      const patch: TablesUpdate<'lesson_counters'> = {
        count: newCount,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('lesson_counters')
        .update(patch)
        .eq('athlete_id', athleteId)
        .select()
        .single()

      if (error) throw error

      // Ricarica i contatori per aggiornare lo stato locale con i valori corretti
      await fetchCounters()

      return data
    } catch (err) {
      logger.error('Error decrementing lesson counter', err, { athleteId })
      setError(err instanceof Error ? err.message : 'Errore nel decremento del contatore lezioni')
      throw err
    }
  }

  const getCounterForAthlete = useCallback(
    (athleteId: string) => {
      return counters.find((counter) => counter.athlete_id === athleteId)
    },
    [counters],
  )

  const getRemainingLessons = useCallback(
    (athleteId: string) => {
      const counter = getCounterForAthlete(athleteId)
      if (!counter) return 0
      return counter.lessons_total - counter.lessons_used
    },
    [getCounterForAthlete],
  )

  return {
    counters,
    loading,
    error,
    fetchCounters,
    updateCounter,
    decrementCounter,
    getCounterForAthlete,
    getRemainingLessons,
  }
}
