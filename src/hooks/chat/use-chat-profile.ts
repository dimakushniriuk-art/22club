import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChatProfile() {
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null)
  const supabase = createClient()

  const getCurrentProfileId = useCallback(async () => {
    if (currentProfileId) {
      return currentProfileId
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Utente non autenticato')

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile?.id) throw new Error('Profilo non trovato')

    setCurrentProfileId(profile.id)
    return profile.id as string
  }, [currentProfileId, supabase])

  return {
    currentProfileId,
    getCurrentProfileId,
  }
}
