'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:use-push-notifications')

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission | null
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: null,
    isSubscribed: false,
    isLoading: false,
    error: null,
  })

  const supabase = createClient()

  const checkSubscriptionStatus = useCallback(async () => {
    if (!state.isSupported) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      setState((prev) => ({
        ...prev,
        isSubscribed: !!subscription,
      }))
    } catch (error) {
      logger.error('Error checking subscription status', error)
    }
  }, [state.isSupported])

  // Verifica supporto e permessi
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    const permission = Notification.permission

    setState((prev) => ({
      ...prev,
      isSupported,
      permission,
    }))

    // Verifica se è già iscritto
    checkSubscriptionStatus()
  }, [checkSubscriptionStatus])

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: 'Push notifications not supported' }))
      return false
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const permission = await Notification.requestPermission()

      setState((prev) => ({
        ...prev,
        permission,
        isLoading: false,
      }))

      return permission === 'granted'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
      return false
    }
  }, [state.isSupported])

  const subscribe = useCallback(async () => {
    if (!state.isSupported || state.permission !== 'granted') {
      setState((prev) => ({
        ...prev,
        error: 'Push notifications not supported or permission not granted',
      }))
      return false
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      // Ottieni VAPID public key
      const response = await fetch('/api/push/vapid-key')
      // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
      const text = await response.text()
      if (!text || text.trim().length === 0) {
        throw new Error('Risposta vuota da /api/push/vapid-key')
      }
      const { publicKey } = JSON.parse(text)

      if (!publicKey) {
        throw new Error('VAPID public key not available')
      }

      // Converti la chiave
      const applicationServerKey = urlBase64ToUint8Array(publicKey)

      // Registra service worker
      const registration = await navigator.serviceWorker.ready

      // Sottoscrivi alle push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      // Invia subscription al server
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // TODO: Implementare tabella user_push_tokens nel database
      // Per ora salviamo in localStorage
      try {
        localStorage.setItem(`push_subscription_${user.id}`, JSON.stringify(subscription))
      } catch (storageError) {
        logger.warn('Could not save subscription to localStorage', storageError)
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }))

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
      logger.error('Error subscribing to push notifications', error)
      return false
    }
  }, [state.isSupported, state.permission, supabase])

  const unsubscribe = useCallback(async () => {
    if (!state.isSupported) return false

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
      }

      // Rimuovi token dal server
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // TODO: Implementare tabella user_push_tokens nel database
        // Per ora rimuoviamo da localStorage
        try {
          localStorage.removeItem(`push_subscription_${user.id}`)
        } catch (storageError) {
          logger.warn('Could not remove subscription from localStorage', storageError)
        }
      }

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }))

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
      logger.error('Error unsubscribing from push notifications', error)
      return false
    }
  }, [state.isSupported, supabase])

  const enableNotifications = useCallback(async () => {
    // Prima richiedi il permesso
    const hasPermission = await requestPermission()
    if (!hasPermission) return false

    // Poi sottoscrivi
    return await subscribe()
  }, [requestPermission, subscribe])

  const disableNotifications = useCallback(async () => {
    return await unsubscribe()
  }, [unsubscribe])

  return {
    ...state,
    enableNotifications,
    disableNotifications,
    requestPermission,
    subscribe,
    unsubscribe,
  }
}

// =====================================================
// Utility functions
// =====================================================

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// =====================================================
// Service Worker registration
// =====================================================

export function registerServiceWorker() {
  if (typeof window === 'undefined') return

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        await navigator.serviceWorker.register('/sw.js')
      } catch (error) {
        logger.error('Service Worker registration failed', error)
      }
    })
  }
}

// =====================================================
// Push notification event handlers
// =====================================================

export function setupPushNotificationHandlers() {
  if (typeof window === 'undefined') return

  // Handler per notifiche ricevute
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICATION_RECEIVED') {
      // Opzionale: aggiorna il contatore notifiche
      // dispatchEvent(new CustomEvent('notificationReceived'))
    }
  })

  // Handler per click su notifica
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
      // Naviga al link se specificato
      if (event.data.link) {
        window.location.href = event.data.link
      }
    }
  })
}
