'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    { className, open = false, onOpenChange, side = 'right', size = 'md', children, ...props },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(open)

    React.useEffect(() => {
      setIsOpen(open)
    }, [open])

    const handleClose = React.useCallback(() => {
      setIsOpen(false)
      onOpenChange?.(false)
    }, [onOpenChange])

    const handleBackdropClick = React.useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      },
      [handleClose],
    )

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full',
    }

    const sideClasses = {
      left: 'left-0 top-0 h-full',
      right: 'right-0 top-0 h-full',
      top: 'top-0 left-0 w-full',
      bottom: 'bottom-0 left-0 w-full',
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={handleBackdropClick} />

        {/* Drawer Content */}
        <div
          ref={ref}
          className={cn(
            'fixed bg-background-secondary border-border shadow-2xl transition-all duration-300 ease-in-out',
            sideClasses[side],
            sizeClasses[size],
            side === 'left' && 'animate-slide-in-left',
            side === 'right' && 'animate-slide-in-right',
            side === 'top' && 'animate-slide-in-down',
            side === 'bottom' && 'animate-slide-in-up',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  },
)
Drawer.displayName = 'Drawer'

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
  onClose?: () => void
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, showCloseButton = true, onClose, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)} {...props}>
        {showCloseButton && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-background-tertiary transition-colors duration-200"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    )
  },
)
DrawerContent.displayName = 'DrawerContent'

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 border-b border-border', className)} {...props}>
        {title && <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>}
        {description && <p className="text-sm text-text-secondary">{description}</p>}
        {children}
      </div>
    )
  },
)
DrawerHeader.displayName = 'DrawerHeader'

type DrawerBodyProps = React.HTMLAttributes<HTMLDivElement>

const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('p-6 flex-1 overflow-auto', className)} {...props} />
  },
)
DrawerBody.displayName = 'DrawerBody'

type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6 border-t border-border flex items-center justify-end gap-3', className)}
        {...props}
      />
    )
  },
)
DrawerFooter.displayName = 'DrawerFooter'

export { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter }
