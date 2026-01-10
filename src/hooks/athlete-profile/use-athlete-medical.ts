/**
 * @fileoverview Hook React Query per gestione dati medici atleta
 * @description GET, UPDATE dati medici e upload file (certificati/referti) con validazione Zod
 * @module hooks/athlete-profile/use-athlete-medical
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteMedicalDataSchema,
  updateAthleteMedicalDataSchema,
} from '@/types/athlete-profile.schema'
import type {
  AthleteMedicalData,
  AthleteMedicalDataUpdate,
  RefertoMedico,
} from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-medical')

/**
 * Query key factory per dati medici
 */
export const athleteMedicalKeys = {
  all: ['athlete-medical'] as const,
  detail: (athleteId: string) => [...athleteMedicalKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere dati medici atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useAthleteMedical(athleteId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteMedicalKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteMedicalData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        const { data, error } = await supabase
          .from('athlete_medical_data')
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
        const validated = createAthleteMedicalDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          certificato_medico_url: data.certificato_medico_url,
          certificato_medico_scadenza: data.certificato_medico_scadenza,
          certificato_medico_tipo: data.certificato_medico_tipo,
          referti_medici: data.referti_medici || [],
          allergie: data.allergie || [],
          patologie: data.patologie || [],
          farmaci_assunti: data.farmaci_assunti || [],
          interventi_chirurgici: data.interventi_chirurgici || [],
          note_mediche: data.note_mediche,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteMedicalData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteMedical')
        logger.error('Errore nel caricamento dati medici', apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId,
    staleTime: 5 * 60 * 1000, // 5 minuti - dati medici cambiano raramente
    gcTime: 30 * 60 * 1000, // 30 minuti (cacheTime in React Query v4) - mantieni in cache più a lungo
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati medici atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUpdateAthleteMedical(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteMedicalDataUpdate): Promise<AthleteMedicalData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteMedicalDataSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        const updateData: Record<string, unknown> = {}
        if (validated.certificato_medico_url !== undefined)
          updateData.certificato_medico_url = validated.certificato_medico_url
        if (validated.certificato_medico_scadenza !== undefined)
          updateData.certificato_medico_scadenza = validated.certificato_medico_scadenza
        if (validated.certificato_medico_tipo !== undefined)
          updateData.certificato_medico_tipo = validated.certificato_medico_tipo
        if (validated.referti_medici !== undefined)
          updateData.referti_medici = validated.referti_medici
        if (validated.allergie !== undefined) updateData.allergie = validated.allergie
        if (validated.patologie !== undefined) updateData.patologie = validated.patologie
        if (validated.farmaci_assunti !== undefined)
          updateData.farmaci_assunti = validated.farmaci_assunti
        if (validated.interventi_chirurgici !== undefined)
          updateData.interventi_chirurgici = validated.interventi_chirurgici
        if (validated.note_mediche !== undefined) updateData.note_mediche = validated.note_mediche

        // Verifica se esiste già un record
        const { data: existing } = await supabase
          .from('athlete_medical_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .single()

        let result

        if (existing) {
          // Update esistente
          const { data, error } = await supabase
            .from('athlete_medical_data')
            .update(updateData)
            .eq('athlete_id', athleteId)
            .select('*')
            .single()

          if (error) throw error
          result = data
        } else {
          // Insert nuovo record
          const { data, error } = await supabase
            .from('athlete_medical_data')
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
        const validatedResult = createAthleteMedicalDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          certificato_medico_url: result.certificato_medico_url,
          certificato_medico_scadenza: result.certificato_medico_scadenza,
          certificato_medico_tipo: result.certificato_medico_tipo,
          referti_medici: result.referti_medici || [],
          allergie: result.allergie || [],
          patologie: result.patologie || [],
          farmaci_assunti: result.farmaci_assunti || [],
          interventi_chirurgici: result.interventi_chirurgici || [],
          note_mediche: result.note_mediche,
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteMedicalData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteMedical')
        logger.error("Errore nell'aggiornamento dati medici", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({ queryKey: athleteMedicalKeys.detail(athleteId) })

      const previousData = queryClient.getQueryData<AthleteMedicalData | null>(
        athleteMedicalKeys.detail(athleteId),
      )

      if (previousData) {
        queryClient.setQueryData<AthleteMedicalData>(athleteMedicalKeys.detail(athleteId), {
          ...previousData,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }

      return { previousData }
    },
    onError: (error, _updates, context) => {
      // Rollback in caso di errore
      if (context?.previousData && athleteId) {
        queryClient.setQueryData(athleteMedicalKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati medici", error, { athleteId })
    },
    onSuccess: () => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteMedicalKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}

/**
 * Tipo per upload certificato medico
 */
export interface UploadCertificatoMedicoParams {
  file: File
  tipo: 'agonistico' | 'non_agonistico' | 'sportivo'
  scadenza: string // DATE in formato ISO string
}

/**
 * Hook per upload certificato medico
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUploadCertificatoMedico(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UploadCertificatoMedicoParams): Promise<string> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Diagnostica: verifica coerenza tra athleteId (target) e auth.uid() (utente loggato)
        const {
          data: { user: authUser },
          error: authUserError,
        } = await supabase.auth.getUser()

        if (authUserError) {
          logger.warn('Impossibile recuperare auth user (diagnostica upload certificato)', {
            athleteId,
            code: (authUserError as { code?: string }).code,
            message: authUserError.message,
          })
        } else {
          logger.debug('Diagnostica upload certificato', {
            athleteId,
            authUserId: authUser?.id,
            sameAsAuth: authUser?.id === athleteId,
          })
        }

        // Diagnostica: verifica che esista un profilo con profiles.user_id = athleteId
        // (se manca, la FK athlete_medical_data_athlete_id_fkey fallirà anche se la FK è corretta)
        const { data: profileCheck, error: profileCheckError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', athleteId)
          .maybeSingle()

        if (profileCheckError) {
          // Non bloccare: in contesti PT/admin l'RLS potrebbe impedire la lettura diretta del profilo
          logger.warn('Diagnostica: errore verifica profilo per athleteId (upload certificato)', {
            athleteId,
            code: (profileCheckError as { code?: string }).code,
            message: profileCheckError.message,
          })
        } else if (!profileCheck?.user_id) {
          throw new Error(
            `Profilo atleta non trovato (profiles.user_id=${athleteId}). Verifica che esista la riga in profiles per questo utente.`,
          )
        }

        // 1. Upload file to storage
        const fileExt = params.file.name.split('.').pop()
        const fileName = `certificato-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${athleteId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('athlete-certificates')
          .upload(filePath, params.file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Upload fallito: ${uploadError.message}`)
        }

        // 2. Salva un path relativo (bucket privato): l'URL signed verrà generato al momento dell'apertura
        const fileUrl = `/${filePath}`

        // 3. Aggiorna record medico con URL certificato
        const { data: existing } = await supabase
          .from('athlete_medical_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .single()

        const updateData = {
          certificato_medico_url: fileUrl,
          certificato_medico_tipo: params.tipo,
          certificato_medico_scadenza: params.scadenza,
        }

        if (existing) {
          // Update esistente
          const { error: updateError } = await supabase
            .from('athlete_medical_data')
            .update(updateData)
            .eq('athlete_id', athleteId)

          if (updateError) {
            // Rollback: elimina file caricato
            await supabase.storage
              .from('athlete-certificates')
              .remove([filePath])
              .catch(() => {})
            throw new Error(`Errore database: ${updateError.message}`)
          }
        } else {
          // Insert nuovo record
          const { error: insertError } = await supabase.from('athlete_medical_data').insert({
            athlete_id: athleteId,
            ...updateData,
          })

          if (insertError) {
            // Rollback: elimina file caricato
            await supabase.storage
              .from('athlete-certificates')
              .remove([filePath])
              .catch(() => {})
            throw new Error(`Errore database: ${insertError.message}`)
          }
        }

        return fileUrl
      } catch (error) {
        const apiError = handleApiError(error, 'useUploadCertificatoMedico')
        logger.error("Errore nell'upload certificato medico", apiError, {
          athleteId,
          tipo: params.tipo,
        })
        throw new Error(apiError.message)
      }
    },
    onSuccess: () => {
      // Invalida cache dopo upload
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteMedicalKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}

/**
 * Tipo per upload referto medico
 */
export interface UploadRefertoMedicoParams {
  file: File
  tipo: string
  data: string // DATE in formato ISO string
  note?: string
}

/**
 * Hook per upload referto medico
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUploadRefertoMedico(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UploadRefertoMedicoParams): Promise<RefertoMedico> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Diagnostica: coerenza athleteId vs auth.uid()
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        logger.debug('Diagnostica upload referto', {
          athleteId,
          authUserId: authUser?.id,
          sameAsAuth: authUser?.id === athleteId,
        })

        // 1. Upload file to storage
        const fileExt = params.file.name.split('.').pop()
        const fileName = `referto-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${athleteId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('athlete-referti')
          .upload(filePath, params.file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Upload fallito: ${uploadError.message}`)
        }

        // 2. Salva un path relativo (bucket privato): l'URL signed verrà generato al momento dell'apertura
        const fileUrl = `/${filePath}`

        // 3. Crea oggetto referto
        const nuovoReferto: RefertoMedico = {
          url: fileUrl,
          data: params.data,
          tipo: params.tipo,
          note: params.note,
        }

        // 4. Recupera dati medici esistenti
        const { data: existing } = await supabase
          .from('athlete_medical_data')
          .select('referti_medici')
          .eq('athlete_id', athleteId)
          .single()

        const refertiEsistenti: RefertoMedico[] = existing?.referti_medici || []

        // 5. Aggiungi nuovo referto all'array
        const refertiAggiornati = [...refertiEsistenti, nuovoReferto]

        // 6. Aggiorna record medico
        if (existing) {
          const { error: updateError } = await supabase
            .from('athlete_medical_data')
            .update({ referti_medici: refertiAggiornati })
            .eq('athlete_id', athleteId)

          if (updateError) {
            // Rollback: elimina file caricato
            await supabase.storage
              .from('athlete-referti')
              .remove([filePath])
              .catch(() => {})
            throw new Error(`Errore database: ${updateError.message}`)
          }
        } else {
          const { error: insertError } = await supabase.from('athlete_medical_data').insert({
            athlete_id: athleteId,
            referti_medici: [nuovoReferto],
          })

          if (insertError) {
            // Rollback: elimina file caricato
            await supabase.storage
              .from('athlete-referti')
              .remove([filePath])
              .catch(() => {})
            throw new Error(`Errore database: ${insertError.message}`)
          }
        }

        return nuovoReferto
      } catch (error) {
        const apiError = handleApiError(error, 'useUploadRefertoMedico')
        logger.error("Errore nell'upload referto medico", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onSuccess: () => {
      // Invalida cache dopo upload
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteMedicalKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
