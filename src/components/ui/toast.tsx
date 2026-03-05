'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Toast {
  id: string
  title?: string
  message: string
  variant: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => {
      // Mantieni max 3 toast contemporanei
      const updated = [...prev, newToast]
      return updated.slice(-3)
    })

    // Auto-dismiss
    const duration = toast.duration || 3000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="pointer-events-none fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-3 p-4 sm:right-4 sm:top-4 sm:w-[420px]"
      role="region"
      aria-live="polite"
      aria-label="Notifiche"
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
          index={index}
        />
      ))}
    </div>,
    document.body,
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
  index: number
}

function ToastItem({ toast, onClose, index }: ToastItemProps) {
  const variants = {
    success: {
      bg: 'bg-state-valid/10 border-state-valid/30',
      icon: <CheckCircle className="h-5 w-5 text-state-valid" />,
      text: 'text-state-valid',
    },
    error: {
      bg: 'bg-state-error/10 border-state-error/30',
      icon: <AlertCircle className="h-5 w-5 text-state-error" />,
      text: 'text-state-error',
    },
    warning: {
      bg: 'bg-state-warn/10 border-state-warn/30',
      icon: <AlertTriangle className="h-5 w-5 text-state-warn" />,
      text: 'text-state-warn',
    },
    info: {
      bg: 'bg-state-info/10 border-state-info/30',
      icon: <Info className="h-5 w-5 text-state-info" />,
      text: 'text-state-info',
    },
  }

  const variant = variants[toast.variant]

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in-right',
        variant.bg,
        'hover:shadow-xl hover:scale-[1.02]',
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
      role="alert"
    >
      {/* Icon */}
      <div className="flex-shrink-0">{variant.icon}</div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        {toast.title && <p className={cn('text-sm font-semibold', variant.text)}>{toast.title}</p>}
        <p className="text-text-primary text-sm">{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="text-text-tertiary hover:text-text-primary flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-white/10"
        aria-label="Chiudi notifica"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Helper per mostrare toast rapidamente
export function toast(message: string, variant: Toast['variant'] = 'info', title?: string) {
  // Questa funzione sarà utilizzabile solo se c'è un ToastProvider nel tree
  // Per ora è solo un helper type-safe
  return { message, variant, title }
}
