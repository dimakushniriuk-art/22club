'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogFooterProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface AlertDialogCancelProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

function collectFocusables(panel: HTMLElement): HTMLElement[] {
  const nodes = panel.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute('disabled') && !el.closest('[aria-hidden="true"]'),
  )
}

const AlertDialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  const { open, onOpenChange } = React.useContext(AlertDialogContext)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = React.useRef<Element | null>(null)
  const onOpenChangeRef = React.useRef(onOpenChange)

  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  React.useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    previouslyFocusedRef.current = document.activeElement

    const focusFirst = () => {
      const list = collectFocusables(panel)
      const target = list[0]
      window.requestAnimationFrame(() => target?.focus())
    }
    focusFirst()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChangeRef.current(false)
        return
      }
      if (e.key !== 'Tab') return
      if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        collectFocusables(panel)[0]?.focus()
        return
      }
      const list = collectFocusables(panel)
      if (list.length === 0) return
      const firstEl = list[0]
      const lastEl = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      const prev = previouslyFocusedRef.current
      if (prev instanceof HTMLElement) {
        try {
          prev.focus()
        } catch {
          /* ignore */
        }
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop con blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={panelRef}
        className={cn(
          'bg-background border-border relative z-50 w-full max-w-md rounded-lg border p-6 shadow-lg',
          className,
        )}
        role="alertdialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )
}

export function AlertDialogHeader({ children, className }: AlertDialogHeaderProps) {
  return <div className={cn('mb-4 space-y-2', className)}>{children}</div>
}

export function AlertDialogTitle({ children, className }: AlertDialogTitleProps) {
  return <h2 className={cn('text-text-primary text-lg font-semibold', className)}>{children}</h2>
}

export function AlertDialogDescription({ children, className }: AlertDialogDescriptionProps) {
  /* div: evita <p> con figli a blocco (div/checkbox) → HTML invalido e hydration error */
  return <div className={cn('text-text-secondary text-sm', className)}>{children}</div>
}

export function AlertDialogFooter({ children, className }: AlertDialogFooterProps) {
  return <div className={cn('mt-6 flex justify-end gap-3', className)}>{children}</div>
}

export function AlertDialogAction({ children, onClick, className }: AlertDialogActionProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext)

  const handleClick = () => {
    onClick?.()
    onOpenChange(false)
  }

  return (
    <Button onClick={handleClick} className={cn('', className)}>
      {children}
    </Button>
  )
}

export function AlertDialogCancel({ children, onClick, className }: AlertDialogCancelProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext)

  const handleClick = () => {
    onClick?.()
    onOpenChange(false)
  }

  return (
    <Button variant="outline" onClick={handleClick} className={cn('', className)}>
      {children}
    </Button>
  )
}
