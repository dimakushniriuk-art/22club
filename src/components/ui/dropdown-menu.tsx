'use client'

import * as React from 'react'
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
}>({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
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
  const { open, setOpen } = React.useContext(DropdownContext)

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>

    return React.cloneElement(child, {
      ...child.props,
      onClick: (event?: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event as React.MouseEvent<HTMLElement>)
        setOpen(!open)
      },
      'aria-expanded': open,
      'aria-haspopup': 'menu',
    })
  }

  return (
    <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu">
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  align = 'start',
  className,
}: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'bg-background border-border absolute top-full z-50 mt-2 min-w-[12rem] rounded-md border p-1 shadow-lg',
        alignClasses[align],
        className,
      )}
      role="menu"
    >
      {children}
    </div>
  )
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
        'flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
        disabled
          ? 'text-text-tertiary cursor-not-allowed opacity-50'
          : 'text-text-primary hover:bg-background-tertiary',
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
