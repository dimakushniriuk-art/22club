'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const DropdownContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement> | null
}>({
  open: false,
  setOpen: () => {},
  triggerRef: null,
})

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({
  asChild,
  children,
}: {
  asChild?: boolean
  children: React.ReactNode
}) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownContext)

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>

    return React.cloneElement(child, {
      ...child.props,
      ref: triggerRef,
      onClick: (event?: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event as React.MouseEvent<HTMLElement>)
        setOpen(!open)
      },
      'aria-expanded': open,
      'aria-haspopup': 'menu',
    })
  }

  return (
    <button 
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={() => setOpen(!open)} 
      aria-expanded={open} 
      aria-haspopup="menu"
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  align = 'start',
  className,
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownContext)
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0, right: 'auto' })
  const [mounted, setMounted] = React.useState(false)

  // Calcola la posizione in base al trigger
  const updatePosition = React.useCallback(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const newPosition: { top: number; left?: number; right?: number } = {
        top: rect.bottom + 8, // 8px di spacing sotto il trigger
      }

      if (align === 'end') {
        newPosition.right = window.innerWidth - rect.right
      } else if (align === 'center') {
        newPosition.left = rect.left + rect.width / 2
      } else {
        newPosition.left = rect.left
      }

      setPosition(newPosition as { top: number; left: number; right: string })
    }
  }, [align, triggerRef])

  React.useEffect(() => {
    if (open) {
      updatePosition()
    }
  }, [open, updatePosition])

  // Aggiorna posizione durante lo scroll
  React.useEffect(() => {
    if (!open) return

    const handleScroll = () => {
      updatePosition()
    }

    // Listener su window per catturare tutti gli scroll
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [open, updatePosition])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen, triggerRef])

  if (!open || !mounted) return null

  const alignClasses = {
    start: '',
    center: '-translate-x-1/2',
    end: '',
  }

  const content = (
    <div
      ref={ref}
      className={cn(
        'bg-[#1a1a1a] border-teal-500/30 fixed z-[9999] min-w-[12rem] rounded-lg border p-1 shadow-2xl shadow-black/50 backdrop-blur-sm',
        alignClasses[align],
        className,
      )}
      style={{
        top: `${position.top}px`,
        left: position.left !== undefined ? `${position.left}px` : 'auto',
        right: typeof position.right === 'number' ? `${position.right}px` : 'auto',
      }}
      role="menu"
    >
      {children}
    </div>
  )

  return createPortal(content, document.body)
}

export function DropdownMenuItem({
  children,
  onClick,
  disabled,
  className,
}: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownContext)

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
      setOpen(false)
    }
  }

  return (
    <button
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
        disabled
          ? 'text-text-tertiary cursor-not-allowed opacity-50'
          : 'text-gray-200 hover:bg-teal-500/10 hover:text-white',
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      role="menuitem"
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div className="bg-border -mx-1 my-1 h-px" />
}
