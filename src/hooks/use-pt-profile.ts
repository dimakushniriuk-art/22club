'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { fetchStaffPtProfile, type StaffPtProfile } from '@/lib/dashboard/fetch-staff-pt-profile'
import { queryKeys } from '@/lib/query-keys'
import { syncAuthContextAfterOwnProfilesRowUpdate } from '@/lib/react-query/post-mutation-cache'
import { useAuth } from '@/providers/auth-provider'

const logger = createLogger('usePTProfile')

export type { StaffPtProfile as PTProfile }

const STALE_MS = 2 * 60 * 1000

export function usePTProfile(_userId?: string) {
  const queryClient = useQueryClient()
  const { user: authUser, refreshUserProfile } = useAuth()
  const authUserId = authUser?.user_id ?? ''
  const [draft, setDraft] = useState<StaffPtProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const queryKey = useMemo(
    () =>
      authUserId
        ? queryKeys.staff.ptProfile(authUserId)
        : (['staff', 'pt-profile', '__disabled__'] as const),
    [authUserId],
  )

  const profileQuery = useQuery({
    queryKey,
    queryFn: () => fetchStaffPtProfile(supabase, authUserId),
    enabled: Boolean(authUserId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const profile = draft ?? profileQuery.data ?? null
  const loading = Boolean(authUserId && profileQuery.isPending && !profileQuery.data)

  const refetch = useCallback(async () => {
    if (!authUserId) return
    await queryClient.invalidateQueries({ queryKey: queryKeys.staff.ptProfile(authUserId) })
  }, [authUserId, queryClient])

  const saveProfile = useCallback(
    async (profileData: Partial<StaffPtProfile>) => {
      if (!authUserId) return { success: false, error: 'Utente non autenticato' }

      setIsSaving(true)
      try {
        const { handlePTProfileSave } = await import('@/lib/utils/handle-pt-profile-save')
        const result = await handlePTProfileSave(authUserId, {
          nome: profileData.nome || '',
          cognome: profileData.cognome || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          specializzazione: profileData.specializzazione || '',
          certificazioni: profileData.certificazioni || '',
        })

        if (result.success) {
          setDraft(null)
          await refetch()
        }

        if (result.success && authUser?.id) {
          await syncAuthContextAfterOwnProfilesRowUpdate(queryClient, {
            authProfileId: authUser.id,
            updatedProfileId: authUser.id,
            refreshUserProfile,
          })
        }

        return result
      } catch (error) {
        logger.error('Errore nel salvare il profilo', error)
        return { success: false, error: 'Errore nel salvare il profilo' }
      } finally {
        setIsSaving(false)
      }
    },
    [authUserId, authUser?.id, queryClient, refreshUserProfile, refetch],
  )

  const updateProfileField = useCallback(
    (field: keyof StaffPtProfile, value: unknown) => {
      setDraft((prev) => {
        const base = prev ?? profileQuery.data
        if (!base) return prev
        return { ...base, [field]: value } as StaffPtProfile
      })
    },
    [profileQuery.data],
  )

  return {
    authUserId,
    profile,
    loading,
    isSaving,
    saveProfile,
    updateProfileField,
    refetch,
  }
}
