'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type {
  TrainerProfileFull,
  TrainerProfileRow,
  TrainerProfileUpdate,
  TrainerEducationRow,
  TrainerCertificationRow,
  TrainerCourseRow,
  TrainerSpecializationRow,
  TrainerExperienceRow,
  TrainerTestimonialRow,
  TrainerTransformationRow,
} from '@/types/trainer-profile'

const logger = createLogger('use-trainer-profile')

/**
 * Ottiene il profile_id del trainer corrente (RLS: get_current_trainer_profile_id).
 * Restituisce null se l'utente non è un trainer.
 */
async function getCurrentTrainerProfileId(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_current_trainer_profile_id')
  if (error) {
    logger.warn('get_current_trainer_profile_id failed', undefined, { error: error.message })
    return null
  }
  return data as string | null
}

/**
 * Carica trainer_profiles + tutte le tabelle 1:N per un profile_id.
 */
async function fetchTrainerProfileFull(profileId: string): Promise<TrainerProfileFull> {
  const [
    profileRes,
    educationRes,
    certificationsRes,
    coursesRes,
    specializationsRes,
    experienceRes,
    testimonialsRes,
    transformationsRes,
  ] = await Promise.all([
    supabase.from('trainer_profiles').select('*').eq('profile_id', profileId).maybeSingle(),
    supabase.from('trainer_education').select('*').eq('profile_id', profileId).order('anno', { ascending: false }),
    supabase.from('trainer_certifications').select('*').eq('profile_id', profileId).order('anno', { ascending: false }),
    supabase.from('trainer_courses').select('*').eq('profile_id', profileId).order('anno', { ascending: false }),
    supabase.from('trainer_specializations').select('*').eq('profile_id', profileId),
    supabase.from('trainer_experience').select('*').eq('profile_id', profileId).order('data_inizio', { ascending: false }),
    supabase.from('trainer_testimonials').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
    supabase.from('trainer_transformations').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
  ])

  if (profileRes.error) logger.warn('trainer_profiles fetch error', undefined, { error: profileRes.error.message })
  if (educationRes.error) logger.warn('trainer_education fetch error', undefined, { error: educationRes.error.message })
  if (certificationsRes.error) logger.warn('trainer_certifications fetch error', undefined, { error: certificationsRes.error.message })
  if (coursesRes.error) logger.warn('trainer_courses fetch error', undefined, { error: coursesRes.error.message })
  if (specializationsRes.error) logger.warn('trainer_specializations fetch error', undefined, { error: specializationsRes.error.message })
  if (experienceRes.error) logger.warn('trainer_experience fetch error', undefined, { error: experienceRes.error.message })
  if (testimonialsRes.error) logger.warn('trainer_testimonials fetch error', undefined, { error: testimonialsRes.error.message })
  if (transformationsRes.error) logger.warn('trainer_transformations fetch error', undefined, { error: transformationsRes.error.message })

  return {
    profile: (profileRes.data as TrainerProfileRow | null) ?? null,
    education: (educationRes.data as TrainerEducationRow[]) ?? [],
    certifications: (certificationsRes.data as TrainerCertificationRow[]) ?? [],
    courses: (coursesRes.data as TrainerCourseRow[]) ?? [],
    specializations: (specializationsRes.data as TrainerSpecializationRow[]) ?? [],
    experience: (experienceRes.data as TrainerExperienceRow[]) ?? [],
    testimonials: (testimonialsRes.data as TrainerTestimonialRow[]) ?? [],
    transformations: (transformationsRes.data as TrainerTransformationRow[]) ?? [],
  }
}

export interface UseTrainerProfileOptions {
  /** Se non passato, usa il profile_id del trainer loggato (RPC get_current_trainer_profile_id). */
  profileId?: string | null
  /** Se true, non esegue il fetch automaticamente (solo quando profileId è disponibile). */
  enabled?: boolean
}

export interface UseTrainerProfileResult extends TrainerProfileFull {
  profileId: string | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  /** Upsert trainer_profiles (solo per profile_id = trainer corrente). */
  updateProfile: (payload: TrainerProfileUpdate) => Promise<{ error: Error | null }>
}

/**
 * Hook per leggere il profilo professionale trainer (trainer_profiles + 1:N).
 * Per dashboard/impostazioni: passare profileId opzionale; se assente usa il trainer loggato.
 */
export function useTrainerProfile(options: UseTrainerProfileOptions = {}): UseTrainerProfileResult {
  const { profileId: profileIdProp, enabled = true } = options

  const [profileId, setProfileId] = useState<string | null>(profileIdProp ?? null)
  const [data, setData] = useState<TrainerProfileFull>({
    profile: null,
    education: [],
    certifications: [],
    courses: [],
    specializations: [],
    experience: [],
    testimonials: [],
    transformations: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    let resolvedId = profileIdProp ?? profileId
    if (!resolvedId && enabled && profileIdProp === undefined) {
      const id = await getCurrentTrainerProfileId()
      if (id) {
        setProfileId(id)
        resolvedId = id
      }
    }
    if (!resolvedId) {
      setLoading(false)
      setError(null)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const full = await fetchTrainerProfileFull(resolvedId)
      setData(full)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      logger.error('useTrainerProfile load failed', e)
    } finally {
      setLoading(false)
    }
  }, [profileIdProp, profileId, enabled])

  useEffect(() => {
    if (profileIdProp !== undefined && profileIdProp !== null) {
      setProfileId(profileIdProp)
    }
  }, [profileIdProp])

  useEffect(() => {
    load()
  }, [load])

  const updateProfile = useCallback(
    async (payload: TrainerProfileUpdate): Promise<{ error: Error | null }> => {
      const id = profileIdProp ?? profileId
      if (!id) return { error: new Error('Nessun profile_id') }
      const { error: err } = await supabase
        .from('trainer_profiles')
        .upsert({ profile_id: id, ...payload }, { onConflict: 'profile_id' })
        .select()
        .single()
      if (err) {
        logger.warn('trainer_profiles upsert error', undefined, { error: err.message })
        return { error: new Error(err.message) }
      }
      await load()
      return { error: null }
    },
    [profileIdProp, profileId, load],
  )

  return {
    ...data,
    profileId,
    loading,
    error,
    refetch: load,
    updateProfile,
  }
}
