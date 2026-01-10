/**
 * @fileoverview Hook React Query per gestione dati anagrafici atleta
 * @description GET e UPDATE dati anagrafici con validazione Zod e optimistic updates
 * @module hooks/athlete-profile/use-athlete-anagrafica
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import { normalizeSesso } from '@/lib/sanitize'
import {
  createAthleteAnagraficaSchema,
  updateAthleteAnagraficaSchema,
} from '@/types/athlete-profile.schema'
import type { AthleteAnagrafica, AthleteAnagraficaUpdate } from '@/types/athlete-profile'
// Nota: UpdateAthleteAnagraficaValidation potrebbe essere usato in futuro per type checking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { UpdateAthleteAnagraficaValidation } from '@/types/athlete-profile.schema'

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
  const supabase = createClient()

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
    staleTime: 5 * 60 * 1000, // 5 minuti - dati anagrafici cambiano raramente
    gcTime: 30 * 60 * 1000, // 30 minuti (cacheTime in React Query v4) - mantieni in cache più a lungo
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati anagrafici atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUpdateAthleteAnagrafica(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteAnagraficaUpdate): Promise<AthleteAnagrafica> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteAnagraficaSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        const updateData: Record<string, unknown> = {}
        if (validated.nome !== undefined) updateData.nome = validated.nome
        if (validated.cognome !== undefined) updateData.cognome = validated.cognome
        if (validated.email !== undefined) updateData.email = validated.email
        if (validated.telefono !== undefined) {
          updateData.telefono = validated.telefono
          updateData.phone = validated.telefono // Sincronizza anche phone
        }
        if (validated.data_nascita !== undefined) updateData.data_nascita = validated.data_nascita
        if (validated.sesso !== undefined) updateData.sesso = validated.sesso
        if (validated.codice_fiscale !== undefined)
          updateData.codice_fiscale = validated.codice_fiscale
        if (validated.indirizzo !== undefined) updateData.indirizzo = validated.indirizzo
        if (validated.citta !== undefined) updateData.citta = validated.citta
        if (validated.cap !== undefined) updateData.cap = validated.cap
        if (validated.provincia !== undefined) updateData.provincia = validated.provincia
        if (validated.nazione !== undefined) updateData.nazione = validated.nazione
        if (validated.contatto_emergenza_nome !== undefined)
          updateData.contatto_emergenza_nome = validated.contatto_emergenza_nome
        if (validated.contatto_emergenza_telefono !== undefined)
          updateData.contatto_emergenza_telefono = validated.contatto_emergenza_telefono
        if (validated.contatto_emergenza_relazione !== undefined)
          updateData.contatto_emergenza_relazione = validated.contatto_emergenza_relazione
        if (validated.professione !== undefined) updateData.professione = validated.professione
        if (validated.altezza_cm !== undefined) updateData.altezza_cm = validated.altezza_cm
        if (validated.peso_iniziale_kg !== undefined)
          updateData.peso_iniziale_kg = validated.peso_iniziale_kg
        if (validated.gruppo_sanguigno !== undefined)
          updateData.gruppo_sanguigno = validated.gruppo_sanguigno

        // Esegui update
        const { data, error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', athleteId)
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
          .single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error('Dati non trovati dopo aggiornamento')
        }

        // Valida e ritorna i dati aggiornati
        const validatedResult = createAthleteAnagraficaSchema.parse({
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
