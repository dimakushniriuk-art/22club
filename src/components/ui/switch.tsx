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
        checked ? 'bg-green-500 border-0' : 'bg-gray-300 border border-white/30',
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'hover:opacity-80',
        className,
      )}
    >
      <span
        className={cn(
          'bg-white inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out shadow-sm',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
