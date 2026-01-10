/**
 * @fileoverview Hook React Query per gestione dati amministrativi atleta
 * @description GET, UPDATE dati amministrativi e upload documenti contrattuali con validazione Zod
 * @module hooks/athlete-profile/use-athlete-administrative
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteAdministrativeDataSchema,
  updateAthleteAdministrativeDataSchema,
} from '@/types/athlete-profile.schema'
import type {
  AthleteAdministrativeData,
  AthleteAdministrativeDataUpdate,
  DocumentoContrattuale,
} from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-administrative')

/**
 * Query key factory per dati amministrativi
 */
export const athleteAdministrativeKeys = {
  all: ['athlete-administrative'] as const,
  detail: (athleteId: string) => [...athleteAdministrativeKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere dati amministrativi atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useAthleteAdministrative(athleteId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteAdministrativeKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteAdministrativeData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        const { data, error } = await supabase
          .from('athlete_administrative_data')
          .select('*')
          .eq('athlete_id', athleteId)
          .single()

        if (error) {
          // Se non esiste record, ritorna null (non è un errore)
          if (error.code === 'PGRST116') {
            return null
          }
          throw error
        }

        if (!data) {
          return null
        }

        // Valida i dati con Zod
        const validated = createAthleteAdministrativeDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          tipo_abbonamento: data.tipo_abbonamento,
          stato_abbonamento: data.stato_abbonamento,
          data_inizio_abbonamento: data.data_inizio_abbonamento,
          data_scadenza_abbonamento: data.data_scadenza_abbonamento,
          lezioni_incluse: data.lezioni_incluse || 0,
          lezioni_utilizzate: data.lezioni_utilizzate || 0,
          lezioni_rimanenti: data.lezioni_rimanenti || 0, // Calcolato dal trigger
          metodo_pagamento_preferito: data.metodo_pagamento_preferito,
          note_contrattuali: data.note_contrattuali,
          documenti_contrattuali: data.documenti_contrattuali || [],
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteAdministrativeData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteAdministrative')
        logger.error('Errore nel caricamento dati amministrativi', apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId,
    staleTime: 5 * 60 * 1000, // 5 minuti - dati amministrativi cambiano raramente
    gcTime: 30 * 60 * 1000, // 30 minuti (cacheTime in React Query v4) - mantieni in cache più a lungo
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati amministrativi atleta
 * @param athleteId - UUID dell'atleta (user_id)
 * @note `lezioni_rimanenti` viene calcolato automaticamente dal trigger del database
 */
export function useUpdateAthleteAdministrative(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updates: AthleteAdministrativeDataUpdate,
    ): Promise<AthleteAdministrativeData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteAdministrativeDataSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        // NOTA: lezioni_rimanenti viene calcolato dal trigger, quindi non lo aggiorniamo manualmente
        const updateData: Record<string, unknown> = {}
        if (validated.tipo_abbonamento !== undefined)
          updateData.tipo_abbonamento = validated.tipo_abbonamento
        if (validated.stato_abbonamento !== undefined)
          updateData.stato_abbonamento = validated.stato_abbonamento
        if (validated.data_inizio_abbonamento !== undefined)
          updateData.data_inizio_abbonamento = validated.data_inizio_abbonamento
        if (validated.data_scadenza_abbonamento !== undefined)
          updateData.data_scadenza_abbonamento = validated.data_scadenza_abbonamento
        if (validated.lezioni_incluse !== undefined)
          updateData.lezioni_incluse = validated.lezioni_incluse
        if (validated.lezioni_utilizzate !== undefined)
          updateData.lezioni_utilizzate = validated.lezioni_utilizzate
        // lezioni_rimanenti viene calcolato automaticamente dal trigger
        if (validated.metodo_pagamento_preferito !== undefined)
          updateData.metodo_pagamento_preferito = validated.metodo_pagamento_preferito
        if (validated.note_contrattuali !== undefined)
          updateData.note_contrattuali = validated.note_contrattuali
        if (validated.documenti_contrattuali !== undefined)
          updateData.documenti_contrattuali = validated.documenti_contrattuali

        // Verifica se esiste già un record
        const { data: existing } = await supabase
          .from('athlete_administrative_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .single()

        let result

        if (existing) {
          // Update esistente
          const { data, error } = await supabase
            .from('athlete_administrative_data')
            .update(updateData)
            .eq('athlete_id', athleteId)
            .select('*')
            .single()

          if (error) throw error
          result = data
        } else {
          // Insert nuovo record
          const { data, error } = await supabase
            .from('athlete_administrative_data')
            .insert({
              athlete_id: athleteId,
              ...updateData,
            })
            .select('*')
            .single()

          if (error) throw error
          result = data
        }

        if (!result) {
          throw new Error('Dati non trovati dopo aggiornamento')
        }

        // Valida e ritorna i dati aggiornati
        const validatedResult = createAthleteAdministrativeDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          tipo_abbonamento: result.tipo_abbonamento,
          stato_abbonamento: result.stato_abbonamento,
          data_inizio_abbonamento: result.data_inizio_abbonamento,
          data_scadenza_abbonamento: result.data_scadenza_abbonamento,
          lezioni_incluse: result.lezioni_incluse || 0,
          lezioni_utilizzate: result.lezioni_utilizzate || 0,
          lezioni_rimanenti: result.lezioni_rimanenti || 0, // Calcolato dal trigger
          metodo_pagamento_preferito: result.metodo_pagamento_preferito,
          note_contrattuali: result.note_contrattuali,
          documenti_contrattuali: result.documenti_contrattuali || [],
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteAdministrativeData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteAdministrative')
        logger.error("Errore nell'aggiornamento dati amministrativi", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({
        queryKey: athleteAdministrativeKeys.detail(athleteId),
      })

      const previousData = queryClient.getQueryData<AthleteAdministrativeData | null>(
        athleteAdministrativeKeys.detail(athleteId),
      )

      if (previousData) {
        queryClient.setQueryData<AthleteAdministrativeData>(
          athleteAdministrativeKeys.detail(athleteId),
          {
            ...previousData,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        )
      }

      return { previousData }
    },
    onError: (error, _updates, context) => {
      // Rollback in caso di errore
      if (context?.previousData && athleteId) {
        queryClient.setQueryData(athleteAdministrativeKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati amministrativi", error, { athleteId })
    },
    onSuccess: () => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({
          queryKey: athleteAdministrativeKeys.detail(athleteId),
        })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}

/**
 * Tipo per upload documento contrattuale
 */
export interface UploadDocumentoContrattualeParams {
  file: File
  nome: string
  tipo: string
  note?: string
}

/**
 * Hook per upload documento contrattuale
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUploadDocumentoContrattuale(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      params: UploadDocumentoContrattualeParams,
    ): Promise<DocumentoContrattuale> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // 1. Upload file to storage
        const fileExt = params.file.name.split('.').pop()
        const fileName = `documento-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${athleteId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('athlete-documents')
          .upload(filePath, params.file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Upload fallito: ${uploadError.message}`)
        }

        // 2. Ottieni URL
        const { data: urlData } = supabase.storage.from('athlete-documents').getPublicUrl(filePath)
        const fileUrl = urlData.publicUrl

        // 3. Crea oggetto documento
        const nuovoDocumento: DocumentoContrattuale = {
          url: fileUrl,
          nome: params.nome,
          tipo: params.tipo,
          data_upload: new Date().toISOString(),
          note: params.note,
        }

        // 4. Recupera dati amministrativi esistenti
        const { data: existing } = await supabase
          .from('athlete_administrative_data')
          .select('documenti_contrattuali')
          .eq('athlete_id', athleteId)
          .single()

        const documentiEsistenti: DocumentoContrattuale[] = existing?.documenti_contrattuali || []

        // 5. Aggiungi nuovo documento all'array
        const documentiAggiornati = [...documentiEsistenti, nuovoDocumento]

        // 6. Aggiorna record amministrativo
        if (existing) {
          const { error: updateError } = await supabase
            .from('athlete_administrative_data')
            .update({ documenti_contrattuali: documentiAggiornati })
            .eq('athlete_id', athleteId)

          if (updateError) {
            // Rollback: elimina file caricato
            await supabase.storage.from('athlete-documents').remove([filePath])
            throw new Error(`Errore database: ${updateError.message}`)
          }
        } else {
          const { error: insertError } = await supabase.from('athlete_administrative_data').insert({
            athlete_id: athleteId,
            documenti_contrattuali: [nuovoDocumento],
          })

          if (insertError) {
            // Rollback: elimina file caricato
            await supabase.storage.from('athlete-documents').remove([filePath])
            throw new Error(`Errore database: ${insertError.message}`)
          }
        }

        return nuovoDocumento
      } catch (error) {
        const apiError = handleApiError(error, 'useUploadDocumentoContrattuale')
        logger.error("Errore nell'upload documento contrattuale", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onSuccess: () => {
      // Invalida cache dopo upload
      if (athleteId) {
        queryClient.invalidateQueries({
          queryKey: athleteAdministrativeKeys.detail(athleteId),
        })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
