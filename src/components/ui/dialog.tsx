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
  return (
    <div onClick={() => onOpenChange(true)} role="button" tabIndex={0}>
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

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop con blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog: full width sotto 852px, centrato desktop */}
      <div
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
            onOpenChange(false)
          }}
          aria-label="Chiudi dialog"
        >
          <X className="h-5 w-5" />
        </Button>
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
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
