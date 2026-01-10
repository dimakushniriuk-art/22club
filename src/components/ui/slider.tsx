'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  className?: string
  disabled?: boolean
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = min,
  onChange,
  className,
  disabled = false,
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState(controlledValue ?? defaultValue)

  const value = controlledValue ?? internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('relative w-full', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="slider-input sr-only"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div
        className={cn(
          'bg-background-tertiary relative h-2 w-full rounded-full',
          disabled && 'opacity-50',
        )}
        onClick={(e) => {
          if (disabled) return
          const rect = e.currentTarget.getBoundingClientRect()
          const percentage = (e.clientX - rect.left) / rect.width
          const newValue = Math.round((percentage * (max - min) + min) / step) * step
          const clampedValue = Math.max(min, Math.min(max, newValue))
          if (controlledValue === undefined) {
            setInternalValue(clampedValue)
          }
          onChange?.(clampedValue)
        }}
      >
        <div
          className="bg-brand absolute h-full rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="bg-brand border-background absolute top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer rounded-full border-2 transition-all hover:scale-110"
          style={{ left: `calc(${percentage}% - 0.5rem)` }}
        />
      </div>
    </div>
  )
}
