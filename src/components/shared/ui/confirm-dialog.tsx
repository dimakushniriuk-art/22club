'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  loading?: boolean
  disabled?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  variant = 'default',
  onConfirm,
  loading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null)
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null)
  const dialogContentRef = React.useRef<HTMLDivElement>(null)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      // Il dialog viene chiuso dal componente parent dopo la conferma
    } catch (error) {
      // Gestione errori: il dialog non si chiude se c'è un errore
      setIsSubmitting(false)
      throw error
    }
  }

  const handleCancel = () => {
    if (!loading && !isSubmitting) {
      onOpenChange(false)
    }
  }

  // Reset loading state quando il dialog si chiude
  React.useEffect(() => {
    if (!open) {
      setIsSubmitting(false)
    }
  }, [open])

  // Focus management: focus sul bottone cancel quando si apre
  React.useEffect(() => {
    if (open && cancelButtonRef.current) {
      // Delay per assicurarsi che il dialog sia renderizzato
      const timeoutId = setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [open])

  // Focus trap: gestisce Tab e Shift+Tab
  React.useEffect(() => {
    if (!open || !dialogContentRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = dialogContentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as NodeListOf<HTMLElement>

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift+Tab: vai all'elemento precedente
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab: vai all'elemento successivo
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const isDisabled = disabled || loading || isSubmitting

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent
        className="relative max-w-md overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-border shadow-lg backdrop-blur-xl"
      >
        <div ref={dialogContentRef}>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`flex-shrink-0 rounded-full p-2 ${
                  variant === 'destructive'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <DialogTitle className="text-text-primary text-xl font-bold">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-text-secondary text-sm mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

        <DialogFooter className="relative z-10 mt-6 flex justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={handleCancel}
            disabled={isDisabled}
            className="border-border/30 text-text-secondary hover:bg-background-tertiary/50 hover:border-border/50 hover:text-text-primary transition-all duration-200"
            aria-label={cancelText}
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isDisabled}
            className={
              variant === 'destructive'
                ? 'bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all duration-200'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200'
            }
            aria-label={confirmText}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                <span>Elaborazione...</span>
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
