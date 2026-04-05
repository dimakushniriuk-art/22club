'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Settings {
  profile: {
    nome: string
    cognome: string
    email: string
    phone: string
    bio: string
    address: string
    avatar: string | null
  }
  notifications: {
    email_nuovi_clienti: boolean
    email_appuntamenti: boolean
    email_pagamenti: boolean
    push_nuovi_messaggi: boolean
    push_reminder_appuntamenti: boolean
    push_scadenze_documenti: boolean
    sms_conferma_appuntamenti: boolean
  }
  privacy: {
    profilo_pubblico: boolean
    mostra_email: boolean
    mostra_telefono: boolean
    condividi_statistiche: boolean
  }
}

const defaultSettings: Settings = {
  profile: {
    nome: '',
    cognome: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    avatar: null,
  },
  notifications: {
    email_nuovi_clienti: true,
    email_appuntamenti: true,
    email_pagamenti: true,
    push_nuovi_messaggi: true,
    push_reminder_appuntamenti: true,
    push_scadenze_documenti: true,
    sms_conferma_appuntamenti: false,
  },
  privacy: {
    profilo_pubblico: true,
    mostra_email: false,
    mostra_telefono: true,
    condividi_statistiche: true,
  },
}

export function usePTSettings(authUserId: string) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const debouncedSaveRef = useRef<(() => void) | null>(null)

  // Utility debounce
  const debounce = useCallback((fn: () => void, delayMs: number) => {
    let timer: ReturnType<typeof setTimeout> | null = null
    return () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fn()
      }, delayMs)
    }
  }, [])

  // Salva impostazioni
  const handleSaveSettings = useCallback(async () => {
    setIsSavingSettings(true)
    setSaveSuccess(false)

    try {
      if (authUserId) {
        const updatePayload = {
          user_id: authUserId,
          nome: settings.profile.nome,
          cognome: settings.profile.cognome,
          phone: settings.profile.phone,
          address: settings.profile.address,
          bio: settings.profile.bio,
          avatar: settings.profile.avatar,
          email: settings.profile.email,
        }
        type ProfilesUpdate =
          import('@/lib/supabase/types').Database['public']['Tables']['profiles']['Update']
        const { error } = await supabase
          .from('profiles')
          .update(updatePayload as ProfilesUpdate)
          .eq('user_id', authUserId)
        if (error) throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore nel salvataggio'
      throw new Error(message)
    } finally {
      setIsSavingSettings(false)
      setSaveSuccess(true)
      setIsDirty(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }, [authUserId, settings.profile])

  // Inizializza debounce di autosave
  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      void handleSaveSettings()
    }, 800)
    return () => {
      debouncedSaveRef.current = null
    }
  }, [debounce, handleSaveSettings])

  // Conferma abbandono pagina con modifiche non salvate
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const scheduleAutoSave = () => {
    setIsDirty(true)
    debouncedSaveRef.current?.()
  }

  const updateProfile = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }))
    scheduleAutoSave()
  }

  const toggleNotification = (field: string) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field as keyof typeof prev.notifications],
      },
    }))
    scheduleAutoSave()
  }

  const togglePrivacy = (field: string) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: !prev.privacy[field as keyof typeof prev.privacy],
      },
    }))
    scheduleAutoSave()
  }

  return {
    settings,
    isSavingSettings,
    saveSuccess,
    isDirty,
    handleSaveSettings,
    updateProfile,
    toggleNotification,
    togglePrivacy,
  }
}
