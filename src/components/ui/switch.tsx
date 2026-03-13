'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(controlledChecked ?? defaultChecked)

  const checked = controlledChecked ?? internalChecked

  const handleToggle = () => {
    if (disabled) return
    const newChecked = !checked
    if (controlledChecked === undefined) {
      setInternalChecked(newChecked)
    }
    onCheckedChange?.(newChecked)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      id={id}
      onClick={handleToggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out',
        checked
          ? 'bg-emerald-500 border-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
          : 'border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && !checked && 'hover:from-zinc-700/90 hover:to-zinc-800/90',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out shadow-md border border-white/20 bg-white',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
