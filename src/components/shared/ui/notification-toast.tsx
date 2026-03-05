'use client'
import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useNotifications, type NotificationPayload, type Notification } from '@/lib/notifications'

// Import dinamico per framer-motion per evitare problemi SSR con React 19
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let motionModule: any = null

const loadFramerMotion = async () => {
  if (typeof window === 'undefined') return null
  if (motionModule) return motionModule

  try {
    motionModule = await import('framer-motion')
    return motionModule
  } catch (error) {
    console.warn('Errore nel caricamento di framer-motion:', error)
    return null
  }
}

const NotificationIcon = ({ type }: { type: NotificationPayload['type'] }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-success" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-error" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-warning" />
    default:
      return <Info className="w-5 h-5 text-primary" />
  }
}

const NotificationItem: React.FC<{
  notification: Notification
  onRemove: (id: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  motion: any
}> = ({ notification, onRemove, motion }) => {
  const MotionDiv = motion?.div || 'div'

  return (
    <MotionDiv
      {...(motion
        ? {
            initial: { opacity: 0, y: -50, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -50, scale: 0.95 },
            transition: { duration: 0.2 },
          }
        : {})}
      className={`
        flex items-start gap-3 p-4 rounded-xl shadow-lg border
        ${notification.type === 'success' ? 'bg-success/10 border-success/20' : ''}
        ${notification.type === 'error' ? 'bg-error/10 border-error/20' : ''}
        ${notification.type === 'warning' ? 'bg-warning/10 border-warning/20' : ''}
        ${notification.type === 'info' ? 'bg-primary/10 border-primary/20' : ''}
        backdrop-blur-sm
      `}
    >
      <NotificationIcon type={notification.type} />

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-text-primary text-sm">{notification.title}</h4>
        {notification.message && (
          <p className="text-text-secondary text-xs mt-1">{notification.message}</p>
        )}
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(notification.id)}
        className="text-text-muted hover:text-text-primary transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </MotionDiv>
  )
}

// Componente client che usa hooks - non può essere usato direttamente in Server Components
const NotificationToastClient: React.FC = () => {
  const { notifications, removeNotification } = useNotifications()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
    }
    load()
  }, [])

  const AnimatePresence = framerMotion?.AnimatePresence || React.Fragment
  const motion = framerMotion?.motion || null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence {...(framerMotion?.AnimatePresence ? {} : {})}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            motion={motion}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Wrapper per Server Components - gestisce il rendering solo lato client
export const NotificationToast: React.FC = () => {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Durante SSR o prima del mount, non renderizzare nulla
  if (!isClient) {
    return null
  }

  return <NotificationToastClient />
}

// Componente per mostrare le notifiche in una sidebar
export const NotificationSidebar: React.FC<{
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  const { notifications, removeNotification, clearNotifications } = useNotifications()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [framerMotion, setFramerMotion] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const framerMotionModule = await loadFramerMotion()
      setFramerMotion(framerMotionModule)
    }
    load()
  }, [])

  const motion = framerMotion?.motion || null
  const MotionDiv = motion?.div || 'div'

  return (
    <MotionDiv
      {...(motion
        ? {
            initial: false,
            animate: { x: isOpen ? 0 : 320 },
          }
        : {
            style: { transform: `translateX(${isOpen ? 0 : 320}px)` },
          })}
      className="fixed top-0 right-0 h-full w-80 bg-surface-100 border-l border-surface-300 z-50"
    >
      <div className="p-4 border-b border-surface-300">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Notifiche</h3>
          <div className="flex gap-2">
            <button
              onClick={clearNotifications}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Cancella tutto
            </button>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto h-full">
        {notifications.length === 0 ? (
          <div className="text-center text-text-muted py-8">
            <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nessuna notifica</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
              motion={motion}
            />
          ))
        )}
      </div>
    </MotionDiv>
  )
}
