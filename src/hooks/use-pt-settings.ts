import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'

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
  appearance: {
    theme: 'dark' | 'light'
    accent_color: string
    sidebar_collapsed: boolean
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
  appearance: {
    theme: 'dark',
    accent_color: 'brand',
    sidebar_collapsed: false,
  },
}

export function usePTSettings(authUserId: string) {
  const supabase = createClient()
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
        const { error } = await supabase.from('profiles').upsert(updatePayload)
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
  }, [authUserId, settings.profile, supabase])

  // Inizializza debounce di autosave
  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      void handleSaveSettings()
    }, 800)
    return () => {
      debouncedSaveRef.current = null
    }
  }, [debounce, handleSaveSettings])

  // Carica impostazioni da localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('impostazioni:appearance')
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings['appearance']>
        setSettings((prev) => ({
          ...prev,
          appearance: { ...prev.appearance, ...parsed },
        }))
      }
    } catch {}
  }, [])

  // Salva impostazioni aspetto in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('impostazioni:appearance', JSON.stringify(settings.appearance))
    document.documentElement.classList.toggle('dark', settings.appearance.theme === 'dark')
  }, [settings.appearance])

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateAppearance = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value },
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
    updateAppearance,
  }
}
