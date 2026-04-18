/**
 * @fileoverview Hook React Query per gestione dati anagrafici atleta
 * @description GET e UPDATE dati anagrafici con validazione Zod e optimistic updates
 * @module hooks/athlete-profile/use-athlete-anagrafica
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import { normalizeSesso } from '@/lib/sanitize'
import {
  createAthleteAnagraficaSchema,
  updateAthleteAnagraficaSchema,
} from '@/types/athlete-profile.schema'
import type { AthleteAnagrafica, AthleteAnagraficaUpdate } from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-anagrafica')

/**
 * Query key factory per dati anagrafici
 */
export const athleteAnagraficaKeys = {
  all: ['athlete-anagrafica'] as const,
  detail: (athleteId: string) => [...athleteAnagraficaKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere dati anagrafici atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useAthleteAnagrafica(athleteId: string | null) {
  return useQuery({
    queryKey: athleteAnagraficaKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteAnagrafica | null> => {
      if (!athleteId) {
        return null
      }

      try {
        // Recupera dati anagrafici estesi da profiles
        const { data, error } = await supabase
          .from('profiles')
          .select(
            `
            user_id,
            nome,
            cognome,
            email,
            phone,
            telefono,
            data_nascita,
            sesso,
            codice_fiscale,
            indirizzo,
            citta,
            cap,
            provincia,
            nazione,
            contatto_emergenza_nome,
            contatto_emergenza_telefono,
            contatto_emergenza_relazione,
            professione,
            altezza_cm,
            peso_iniziale_kg,
            gruppo_sanguigno,
            created_at,
            updated_at
          `,
          )
          .eq('user_id', athleteId)
          .single()

        if (error) {
          throw error
        }

        if (!data) {
          return null
        }

        // Valida e trasforma i dati
        const validated = createAthleteAnagraficaSchema.parse({
          user_id: data.user_id,
          nome: data.nome || '',
          cognome: data.cognome || '',
          email: data.email || '',
          telefono: data.telefono || data.phone || null,
          data_nascita: data.data_nascita,
          sesso: normalizeSesso(data.sesso),
          codice_fiscale: data.codice_fiscale,
          indirizzo: data.indirizzo,
          citta: data.citta,
          cap: data.cap,
          provincia: data.provincia,
          nazione: data.nazione,
          contatto_emergenza_nome: data.contatto_emergenza_nome,
          contatto_emergenza_telefono: data.contatto_emergenza_telefono,
          contatto_emergenza_relazione: data.contatto_emergenza_relazione,
          professione: data.professione,
          altezza_cm: data.altezza_cm,
          peso_iniziale_kg: data.peso_iniziale_kg,
          gruppo_sanguigno: data.gruppo_sanguigno,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteAnagrafica
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteAnagrafica')
        logger.error('Errore nel caricamento dati anagrafici', apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati anagrafici atleta
 * @param athleteId - `profiles.user_id` o `profiles.id` (risolto da PATCH `/api/athlete-anagrafica`)
 */
export function useUpdateAthleteAnagrafica(athleteId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteAnagraficaUpdate): Promise<AthleteAnagrafica> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        const validated = updateAthleteAnagraficaSchema.parse(updates)

        const res = await fetch('/api/athlete-anagrafica', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            athleteUserId: athleteId,
            updates: validated,
          }),
        })

        const payload = (await res.json().catch(() => null)) as
          | { data?: unknown; error?: string }
          | null

        if (!res.ok) {
          const msg =
            payload && typeof payload === 'object' && 'error' in payload && payload.error
              ? String(payload.error)
              : `HTTP ${res.status}`
          throw new Error(msg)
        }

        if (!payload || typeof payload !== 'object' || !('data' in payload) || !payload.data) {
          throw new Error('Risposta API non valida')
        }

        const data = payload.data as Record<string, unknown>

        const validatedResult = createAthleteAnagraficaSchema.parse({
          user_id: data.user_id,
          nome: data.nome || '',
          cognome: data.cognome || '',
          email: data.email || '',
          telefono: (data.telefono || data.phone || null) as string | null,
          data_nascita: data.data_nascita,
          sesso: normalizeSesso(data.sesso as string | null | undefined),
          codice_fiscale: data.codice_fiscale,
          indirizzo: data.indirizzo,
          citta: data.citta,
          cap: data.cap,
          provincia: data.provincia,
          nazione: data.nazione,
          contatto_emergenza_nome: data.contatto_emergenza_nome,
          contatto_emergenza_telefono: data.contatto_emergenza_telefono,
          contatto_emergenza_relazione: data.contatto_emergenza_relazione,
          professione: data.professione,
          altezza_cm: data.altezza_cm,
          peso_iniziale_kg: data.peso_iniziale_kg,
          gruppo_sanguigno: data.gruppo_sanguigno,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validatedResult as AthleteAnagrafica
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteAnagrafica')
        logger.error("Errore nell'aggiornamento dati anagrafici", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update: aggiorna la cache prima della risposta del server
      if (!athleteId) return

      // Annulla query in corso per evitare override
      await queryClient.cancelQueries({ queryKey: athleteAnagraficaKeys.detail(athleteId) })

      // Snapshot del valore precedente
      const previousData = queryClient.getQueryData<AthleteAnagrafica | null>(
        athleteAnagraficaKeys.detail(athleteId),
      )

      // Aggiorna optimisticamente la cache
      if (previousData) {
        queryClient.setQueryData<AthleteAnagrafica>(athleteAnagraficaKeys.detail(athleteId), {
          ...previousData,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }

      // Ritorna context per rollback in caso di errore
      return { previousData }
    },
    onError: (error, _updates, context) => {
      // Rollback in caso di errore
      if (context?.previousData && athleteId) {
        queryClient.setQueryData(athleteAnagraficaKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati anagrafici", error, { athleteId })
    },
    onSuccess: (_data, _updates) => {
      // Invalida e refetch per assicurarsi di avere dati aggiornati
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteAnagraficaKeys.detail(athleteId) })
        // Invalida anche query complete profilo se esistono
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
