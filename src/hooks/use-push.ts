'use client'

import { useCallback } from 'react'
import { useSupabase } from '@/hooks/use-supabase'

export function usePush() {
  const { user } = useSupabase()

  const subscribe = useCallback(async () => {
    if (!user) throw new Error('Utente non autenticato')
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push non supportate')
    }
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      ),
    })
    const payload = sub.toJSON() as {
      endpoint?: string
      keys?: { p256dh?: string; auth?: string }
    }
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, userId: user.id }),
    })
    if (!res.ok) throw new Error('Subscribe fallita')
  }, [user])

  const unsubscribe = useCallback(async () => {
    if (!user) throw new Error('Utente non autenticato')
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    const endpoint = sub.endpoint
    await sub.unsubscribe()
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, userId: user.id }),
    })
  }, [user])

  return { subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
