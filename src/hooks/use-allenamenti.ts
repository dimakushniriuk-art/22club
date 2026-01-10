'use client'

import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from './use-supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import { useSupabaseWithRetry } from './use-api-with-retry'
import { queryKeys } from '@/lib/query-keys'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import type {
  Allenamento,
  AllenamentoFilters,
  AllenamentoStats,
  AllenamentoSort,
  AllenamentoDettaglio,
} from '@/types/allenamento'

import type { Tables, TablesUpdate } from '@/types/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

const logger = createLogger('hooks:use-allenamenti')

type WorkoutLogRow = Tables<'workout_logs'>
type WorkoutLogWithRelations = WorkoutLogRow & {
  atleta?: { nome?: string | null; cognome?: string | null } | null
  scheda?: {
    id?: string | null
    name?: string | null
    created_by?: string | null
    trainer?: { nome?: string | null; cognome?: string | null } | null
  } | null
}

const ALLENAMENTO_STATUS_MAP: Record<string, Allenamento['stato']> = {
  completato: 'completato',
  in_corso: 'in_corso',
  'in corso': 'in_corso',
  programmato: 'programmato',
  'non iniziato': 'programmato',
  pianificato: 'programmato',
  saltato: 'saltato',
  annullato: 'saltato',
}

function mapAllenamentoStatus(value: unknown): Allenamento['stato'] {
  if (typeof value !== 'string') {
    return 'programmato'
  }

  const normalized = value.toLowerCase()
  return ALLENAMENTO_STATUS_MAP[normalized] ?? 'programmato'
}

function mapWorkoutLogToAllenamento(item: WorkoutLogWithRelations): Allenamento {
  const atleta = item.atleta
  const scheda = item.scheda
  const trainer = scheda?.trainer

  const atletaNome = `${(atleta?.nome ?? '').trim()} ${(atleta?.cognome ?? '').trim()}`.trim()
  const trainerName = trainer
    ? `${(trainer.nome ?? '').trim()} ${(trainer.cognome ?? '').trim()}`.trim()
    : null

  return {
    id: item.id ?? '',
    atleta_id: item.atleta_id ?? '',
    atleta_nome: atletaNome || 'N/A',
    scheda_id: item.scheda_id ?? '',
    scheda_nome: scheda?.name ?? 'Nessuna scheda',
    data: item.data ?? '',
    durata_minuti: item.durata_minuti ?? 0,
    stato: mapAllenamentoStatus(item.stato),
    esercizi_completati: item.esercizi_completati ?? 0,
    esercizi_totali: item.esercizi_totali ?? 0,
    volume_totale: item.volume_totale ?? 0,
    note: item.note ?? null,
    created_at: item.created_at ?? '',
    updated_at: item.updated_at ?? item.created_at ?? '',
    trainer_name: trainerName || null,
  }
}

// Helper function per calcolare statistiche
function calculateStats(allenamenti: Allenamento[]): AllenamentoStats {
  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const settimanaFa = new Date(oggi)
  settimanaFa.setDate(settimanaFa.getDate() - 7)
  const meseFa = new Date(oggi)
  meseFa.setMonth(meseFa.getMonth() - 1)

  return {
    oggi: allenamenti.filter((a) => new Date(a.data).toDateString() === oggi.toDateString()).length,
    completati: allenamenti.filter((a) => a.stato === 'completato').length,
    in_corso: allenamenti.filter((a) => a.stato === 'in_corso').length,
    programmati: allenamenti.filter((a) => a.stato === 'programmato').length,
    saltati: allenamenti.filter((a) => a.stato === 'saltato').length,
    questa_settimana: allenamenti.filter((a) => new Date(a.data) >= settimanaFa).length,
    questo_mese: allenamenti.filter((a) => new Date(a.data) >= meseFa).length,
  }
}

export function useAllenamenti(filters?: Partial<AllenamentoFilters>, sort?: AllenamentoSort) {
  const { supabase } = useSupabase()
  const { executeSupabaseCall } = useSupabaseWithRetry<WorkoutLogWithRelations[]>()
  const queryClient = useQueryClient()

  // Query key basata su filtri e sort per cache separata
  const queryKey = useMemo(() => {
    const filterKey = filters ? JSON.stringify(filters) : 'all'
    const sortKey = sort || 'data_desc'
    return [...queryKeys.allenamenti.all, filterKey, sortKey] as const
  }, [filters, sort])

  // Fetch allenamenti con React Query
  const {
    data: rawData,
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      logger.debug('Fetching allenamenti', undefined, { filters, sort })

      // Check if Supabase is properly configured
      const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://mock-project.supabase.co' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'mock-anon-key-for-development'

      if (!isSupabaseConfigured) {
        // Use mock data for development
        logger.warn('Supabase not configured, using mock data for allenamenti')

        const mockAllenamenti: Allenamento[] = [
          {
            id: '1',
            atleta_id: 'athlete-1',
            atleta_nome: 'Mario Rossi',
            scheda_id: 'scheda-1',
            scheda_nome: 'Upper Body',
            data: new Date().toISOString(),
            durata_minuti: 60,
            stato: 'completato',
            esercizi_completati: 8,
            esercizi_totali: 8,
            volume_totale: 2500,
            note: 'Allenamento completato con successo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: '2',
            atleta_id: 'athlete-2',
            atleta_nome: 'Giulia Bianchi',
            scheda_id: 'scheda-2',
            scheda_nome: 'Lower Body',
            data: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            durata_minuti: 0,
            stato: 'programmato',
            esercizi_completati: 0,
            esercizi_totali: 6,
            volume_totale: 0,
            note: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

        return mockAllenamenti
      }

      // Query allenamenti con retry logic
      const supabaseResult = await executeSupabaseCall(
        async () => {
          // Query ottimizzata: select esplicito invece di * per ridurre payload
          let query = supabase
            .from('workout_logs')
            .select<`
                id,
                atleta_id,
                scheda_id,
                data,
                durata_minuti,
                stato,
                esercizi_completati,
                esercizi_totali,
                volume_totale,
                note,
                created_at,
                updated_at,
                atleta:profiles!workout_logs_atleta_id_fkey(id, nome, cognome),
                scheda:workout_plans(
                  id, 
                  name,
                  created_by
                )
              `>()
            .order('data', { ascending: sort === 'data_asc' })
            .limit(100) // Ridotto da 500 a 100 per migliorare performance (paginazione se necessario)

          if (filters?.stato && filters.stato !== 'tutti') {
            query = query.eq('stato', filters.stato)
          }

          if (filters?.atleta_id) {
            // atleta_id deve essere profiles.id (non auth.users.id)
            logger.debug('Query workout_logs con atleta_id', {
              atleta_id: filters.atleta_id,
              filterType: typeof filters.atleta_id,
            })
            query = query.eq('atleta_id', filters.atleta_id)
          }

          if (filters?.periodo && filters.periodo !== 'tutti') {
            const oggi = new Date()
            oggi.setHours(0, 0, 0, 0)

            if (filters.periodo === 'oggi') {
              query = query.gte('data', oggi.toISOString())
            } else if (filters.periodo === 'settimana') {
              const settimanaFa = new Date(oggi)
              settimanaFa.setDate(settimanaFa.getDate() - 7)
              query = query.gte('data', settimanaFa.toISOString())
            } else if (filters.periodo === 'mese') {
              const meseFa = new Date(oggi)
              meseFa.setMonth(meseFa.getMonth() - 1)
              query = query.gte('data', meseFa.toISOString())
            }
          }

          if (filters?.data_da) {
            query = query.gte('data', filters.data_da)
          }

          if (filters?.data_a) {
            query = query.lte('data', filters.data_a)
          }

          const { data: queryData, error: queryError } =
            await query.returns<WorkoutLogWithRelations[]>()
          if (queryError) {
            // Log dettagliato per diagnosticare problemi RLS
            logger.error('Errore query workout_logs', queryError, {
              filters,
              errorCode: queryError.code,
              errorMessage: queryError.message,
              errorDetails: queryError.details,
              errorHint: queryError.hint,
            })
            return { data: null, error: queryError as Error }
          }

          const typedQueryData = queryData ?? []

          logger.debug('Query workout_logs completata', {
            count: typedQueryData?.length ?? 0,
            filters,
            sampleWithScheda:
              typedQueryData && typedQueryData.length > 0
                ? {
                    id: typedQueryData[0].id,
                    scheda_id: typedQueryData[0].scheda_id,
                    scheda: typedQueryData[0].scheda
                      ? {
                          id: typedQueryData[0].scheda.id,
                          name: typedQueryData[0].scheda.name,
                        }
                      : null,
                  }
                : null,
          })
          return { data: typedQueryData, error: null }
        },
        {
          context: 'useAllenamenti.fetchAllenamenti',
          retry: {
            timeoutMs: 60000, // Aumenta timeout a 60s per query complessa con join multipli
            maxAttempts: 2, // Riduci tentativi per evitare attese troppo lunghe
            delayMs: 2000,
            backoffMultiplier: 1.5,
          },
        },
      )

      const data = supabaseResult ?? []

      // Recupera i trainer names dai workout plans
      // created_by punta a profiles(user_id), quindi dobbiamo fare una query separata
      const uniqueTrainerIds = new Set<string>()
      data.forEach((item) => {
        if (item.scheda?.created_by) {
          uniqueTrainerIds.add(item.scheda.created_by)
        }
      })

      // Query per recuperare i profili dei trainer (solo se ci sono trainer IDs)
      // Query separata con timeout breve per non bloccare il flusso principale
      const trainerProfilesMap = new Map<string, { nome: string; cognome: string }>()
      if (uniqueTrainerIds.size > 0) {
        try {
          const trainerIdsArray = Array.from(uniqueTrainerIds)
          logger.debug('Recupero trainer profiles', { count: trainerIdsArray.length })

          type TrainerProfile = {
            user_id: string | null
            nome: string | null
            cognome: string | null
          }

          // Query con timeout di 10s per non bloccare il flusso principale
          const trainerQueryPromise = supabase
            .from('profiles')
            .select('user_id, nome, cognome')
            .in('user_id', trainerIdsArray)

          // Timeout di 10 secondi per la query trainer (non critica)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout query trainer profiles')), 10000)
          })

          const { data: trainerProfiles, error: trainerError } = (await Promise.race([
            trainerQueryPromise,
            timeoutPromise,
          ])) as { data: TrainerProfile[] | null; error: PostgrestError | null }

          if (trainerError) {
            logger.warn('Errore recupero trainer profiles', trainerError, {
              trainerIds: trainerIdsArray,
            })
          } else if (trainerProfiles && trainerProfiles.length > 0) {
            trainerProfiles.forEach((profile) => {
              if (profile.user_id) {
                trainerProfilesMap.set(profile.user_id, {
                  nome: profile.nome ?? '',
                  cognome: profile.cognome ?? '',
                })
              }
            })
            logger.debug('Trainer profiles recuperati', { count: trainerProfilesMap.size })
          }
        } catch (err) {
          logger.warn('Errore nel recupero trainer profiles (non critico)', err)
          // Non bloccare il flusso se la query dei trainer fallisce - i dati principali sono già disponibili
        }
      }

      // Aggiungi i trainer names ai workout logs
      const dataWithTrainers = data.map((item) => {
        if (item.scheda?.created_by) {
          const trainer = trainerProfilesMap.get(item.scheda.created_by)
          if (trainer) {
            return {
              ...item,
              scheda: {
                ...item.scheda,
                trainer: {
                  nome: trainer.nome,
                  cognome: trainer.cognome,
                },
              },
            }
          }
        }
        return item
      })

      // Mappa i dati a Allenamento
      const mappedAllenamenti = dataWithTrainers.map(mapWorkoutLogToAllenamento)

      logger.debug('Appointments fetched successfully', undefined, {
        count: mappedAllenamenti.length,
        filters,
        sort,
      })

      return mappedAllenamenti
    },
  })

  // Applica filtro search client-side e sorting
  const allenamenti = useMemo(() => {
    if (!rawData) return []

    let filtered = rawData

    // Applica filtro search client-side
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.atleta_nome.toLowerCase().includes(searchLower) ||
          a.scheda_nome.toLowerCase().includes(searchLower),
      )
    }

    // Applica sort
    if (sort) {
      filtered = [...filtered].sort((a, b) => {
        switch (sort) {
          case 'data_desc':
            return new Date(b.data).getTime() - new Date(a.data).getTime()
          case 'data_asc':
            return new Date(a.data).getTime() - new Date(b.data).getTime()
          case 'atleta_asc':
            return a.atleta_nome.localeCompare(b.atleta_nome)
          case 'durata_desc':
            return b.durata_minuti - a.durata_minuti
          default:
            return 0
        }
      })
    }

    return filtered
  }, [rawData, filters?.search, sort])

  // Calcola statistiche dai dati raw (prima di filtri client-side)
  const stats = useMemo(() => {
    if (!rawData) {
      return {
        oggi: 0,
        completati: 0,
        in_corso: 0,
        programmati: 0,
        saltati: 0,
        questa_settimana: 0,
        questo_mese: 0,
      }
    }
    return calculateStats(rawData)
  }, [rawData])

  // Converti error di React Query in Error per compatibilità
  const error = queryError
    ? queryError instanceof Error
      ? queryError
      : new Error('Errore nel caricamento degli allenamenti')
    : null

  // Realtime subscription per aggiornamenti automatici
  useRealtimeChannel('workout_logs', (payload) => {
    // Invalida query quando ci sono cambiamenti (INSERT, UPDATE, DELETE)
    queryClient.invalidateQueries({ queryKey: queryKeys.allenamenti.all })
    logger.debug('Realtime workout_logs event received', undefined, {
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
    })
  })

  // Mutation per eliminare allenamento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await executeSupabaseCall(
        async () => {
          const { error } = await supabase.from('workout_logs').delete().eq('id', id)
          if (error) throw error
          return { data: null, error: null }
        },
        { context: 'useAllenamenti.deleteAllenamento' },
      )
    },
    onSuccess: () => {
      // Invalida tutte le query allenamenti per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.allenamenti.all })
    },
    onError: (err, id) => {
      const apiError = handleApiError(err, 'useAllenamenti.deleteAllenamento')
      logger.error('Error deleting allenamento', apiError, { allenamentoId: id })
    },
  })

  const deleteAllenamento = async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }

  // Mutation per aggiornare allenamento
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Allenamento> }) => {
      await executeSupabaseCall(
        async () => {
          const payload: TablesUpdate<'workout_logs'> = {
            updated_at: new Date().toISOString(),
          }

          if (updates.stato) payload.stato = updates.stato
          if (updates.esercizi_completati !== undefined) {
            payload.esercizi_completati = updates.esercizi_completati
          }
          if (updates.volume_totale !== undefined) {
            payload.volume_totale = updates.volume_totale
          }
          if (updates.note !== undefined) {
            payload.note = updates.note
          }
          if (updates.durata_minuti !== undefined) {
            payload.durata_minuti = updates.durata_minuti
          }

          const { error } = await supabase
            .from('workout_logs')
            .update(payload as never)
            .eq('id', id)
          if (error) throw error
          return { data: null, error: null }
        },
        { context: 'useAllenamenti.updateAllenamento' },
      )
    },
    onSuccess: () => {
      // Invalida tutte le query allenamenti per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.allenamenti.all })
    },
    onError: (err, variables) => {
      const apiError = handleApiError(err, 'useAllenamenti.updateAllenamento')
      logger.error('Error updating allenamento', apiError, { allenamentoId: variables.id })
    },
  })

  const updateAllenamento = async (id: string, updates: Partial<Allenamento>) => {
    return updateMutation.mutateAsync({ id, updates })
  }

  return {
    allenamenti,
    stats,
    loading,
    error,
    refresh: async () => {
      await refetchQuery()
    },
    deleteAllenamento,
    updateAllenamento,
  }
}

export function useAllenamentoDettaglio(id: string) {
  const { supabase } = useSupabase()
  const { executeSupabaseCall } = useSupabaseWithRetry()

  // Query key per dettaglio singolo
  const queryKey = useMemo(() => [...queryKeys.allenamenti.all, 'dettaglio', id] as const, [id])

  // Fetch dettaglio con React Query
  const {
    data: dettaglio,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!id) {
        throw new Error('ID allenamento non fornito')
      }

      // TODO: Implementare query con dettagli esercizi quando la tabella sarà disponibile
      const allenamentoData = (await executeSupabaseCall(
        async () => {
          const { data, error } = await supabase
            .from('workout_logs')
            .select(
              `
              *,
              atleta:profiles!workout_logs_atleta_id_fkey(id, nome, cognome),
              scheda:workout_plans(id, name)
            `,
            )
            .eq('id', id)
            .single()

          if (error) {
            throw error
          }
          return data
        },
        { context: 'useAllenamentoDettaglio.fetchDettaglio' },
      )) as WorkoutLogWithRelations | null

      if (!allenamentoData) {
        throw new Error('Allenamento non trovato')
      }

      return {
        allenamento: mapWorkoutLogToAllenamento(allenamentoData),
        esercizi: [], // TODO: Implementare quando la tabella esercizi sarà disponibile
      } as AllenamentoDettaglio
    },
    enabled: !!id, // Query abilitata solo se id è presente
  })

  // Converti error di React Query in Error per compatibilità
  const error = queryError
    ? queryError instanceof Error
      ? queryError
      : new Error('Errore nel caricamento del dettaglio')
    : null

  return { dettaglio, loading, error }
}
