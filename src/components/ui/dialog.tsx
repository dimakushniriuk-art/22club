'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

function collectFocusables(panel: HTMLElement): HTMLElement[] {
  const nodes = panel.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute('disabled') && !el.closest('[aria-hidden="true"]'),
  )
}

type DialogFocusShellProps = {
  className?: string | undefined
  children: React.ReactNode
  onOpenChange: (open: boolean) => void
}

/** Shell modale: focus trap + Escape (montata solo con dialog aperto). */
function DialogFocusShell({ className, children, onOpenChange }: DialogFocusShellProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = React.useRef<Element | null>(null)
  const onOpenChangeRef = React.useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  // Al mount (dialog appena aperto): solo allora focus sul primo focusable. onOpenChange via ref
  // così i re-render del genitore non rieseguono focusFirst() (perdeva il focus sugli input).
  React.useEffect(() => {
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
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => onOpenChangeRef.current(false)}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={cn(
          'relative z-[100] w-full max-w-lg rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]',
          'mx-4 my-4 max-h-[90dvh] overflow-y-auto',
          'max-[851px]:max-w-[calc(100vw-2rem)] max-[851px]:w-full',
          className,
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-[110] text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all duration-200 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            onOpenChangeRef.current(false)
          }}
          aria-label="Chiudi dialog"
        >
          <X className="h-5 w-5" />
        </Button>
        {children}
      </div>
    </div>
  )
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
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

  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  const { onOpenChange } = React.useContext(DialogContext)
  const open = () => onOpenChange(true)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
  }
  return (
    <div onClick={open} onKeyDown={onKeyDown} role="button" tabIndex={0} className="cursor-pointer">
      {children}
    </div>
  )
}

export function DialogContent({ children, className }: DialogContentProps) {
  const { open, onOpenChange } = React.useContext(DialogContext)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!open) return null
  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <DialogFocusShell className={className} onOpenChange={onOpenChange}>
      {children}
    </DialogFocusShell>,
    document.body,
  )
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return <div className={cn('mb-4 space-y-2', className)}>{children}</div>
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return <h2 className={cn('text-text-primary text-lg font-semibold', className)}>{children}</h2>
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return <p className={cn('text-text-secondary text-sm', className)}>{children}</p>
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return <div className={cn('mt-6 flex justify-end gap-3', className)}>{children}</div>
}
