'use client'

import * as React from 'react'
// Nota: X icon potrebbe essere usato in futuro per chiusura dialog
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { X } from 'lucide-react'
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
  return <p className={cn('text-text-secondary text-sm', className)}>{children}</p>
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
