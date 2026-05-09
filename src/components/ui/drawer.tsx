'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

function collectFocusables(panel: HTMLElement): HTMLElement[] {
  const nodes = panel.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute('disabled') && !el.closest('[aria-hidden="true"]'),
  )
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    { className, open = false, onOpenChange, side = 'right', size = 'md', children, ...props },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(open)
    const panelRef = React.useRef<HTMLDivElement>(null)
    const previouslyFocusedRef = React.useRef<Element | null>(null)
    const handleCloseRef = React.useRef<() => void>(() => {})

    React.useEffect(() => {
      setIsOpen(open)
    }, [open])

    const handleClose = React.useCallback(() => {
      setIsOpen(false)
      onOpenChange?.(false)
    }, [onOpenChange])

    React.useEffect(() => {
      handleCloseRef.current = handleClose
    }, [handleClose])

    const setPanelRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        panelRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    React.useEffect(() => {
      if (!isOpen) return
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
          handleCloseRef.current()
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
    }, [isOpen])

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
      <div className="fixed inset-0 z-[100]">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />

        <div
          ref={setPanelRef}
          className={cn(
            'fixed border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out',
            sideClasses[side],
            sizeClasses[size],
            side === 'left' && 'animate-slide-in-left',
            side === 'right' && 'animate-slide-in-right',
            side === 'top' && 'animate-slide-in-down',
            side === 'bottom' && 'animate-slide-in-up',
            className,
          )}
          {...props}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    )
  },
)
Drawer.displayName = 'Drawer'

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean
  onClose?: () => void
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, showCloseButton = true, onClose, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)} {...props}>
        {showCloseButton && (
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label="Chiudi drawer"
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

interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 border-b border-white/10', className)} {...props}>
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
        className={cn(
          'p-6 border-t border-white/10 flex items-center justify-end gap-3 pb-safe',
          className,
        )}
        {...props}
      />
    )
  },
)
DrawerFooter.displayName = 'DrawerFooter'

export { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter }
