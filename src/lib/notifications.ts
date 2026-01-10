'use client'
// 🔔 Sistema Notifiche — 22Club
import { useState, useEffect } from 'react'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface Notification extends NotificationPayload {
  id: string
}

// Sistema di notifiche semplice (senza dipendenze esterne)
class NotificationManager {
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  add(notification: NotificationPayload) {
    const id = Date.now().toString()
    const newNotification: Notification = { ...notification, id }

    this.notifications.unshift(newNotification)

    // Limita a 10 notifiche
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10)
    }

    this.notifyListeners()

    // Auto-remove dopo la durata specificata
    const duration = notification.duration || 5000
    setTimeout(() => {
      this.remove(id)
    }, duration)

    return id
  }

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notifyListeners()
  }

  clear() {
    this.notifications = []
    this.notifyListeners()
  }

  getAll() {
    return [...this.notifications]
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.notifications]))
  }
}

const notificationManager = new NotificationManager()

// Funzioni di utilità per mostrare notifiche
export function notify(payload: NotificationPayload): string {
  return notificationManager.add(payload)
}

export function notifySuccess(title: string, message?: string): string {
  return notify({ type: 'success', title, message })
}

export function notifyError(title: string, message?: string): string {
  return notify({ type: 'error', title, message })
}

export function notifyWarning(title: string, message?: string): string {
  return notify({ type: 'warning', title, message })
}

export function notifyInfo(title: string, message?: string): string {
  return notify({ type: 'info', title, message })
}

export function removeNotification(id: string) {
  notificationManager.remove(id)
}

export function clearNotifications() {
  notificationManager.clear()
}

export function getNotifications() {
  return notificationManager.getAll()
}

export function subscribeToNotifications(listener: (notifications: Notification[]) => void) {
  return notificationManager.subscribe(listener)
}

// Hook per React
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setNotifications)
    return unsubscribe
  }, [])

  return {
    notifications,
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    removeNotification,
    clearNotifications,
  }
}
