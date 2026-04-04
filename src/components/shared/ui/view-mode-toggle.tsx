'use client'

import type { ComponentType } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export type ViewModeToggleOption<TMode extends string> = {
  value: TMode
  ariaLabel: string
  Icon: ComponentType<{ className?: string }>
}

export interface ViewModeToggleProps<TMode extends string> {
  value: TMode
  onChange: (value: TMode) => void
  options: Array<ViewModeToggleOption<TMode>>
  className?: string
  buttonClassName?: string
}

export function ViewModeToggle<TMode extends string>({
  value,
  onChange,
  options,
  className,
  buttonClassName,
}: ViewModeToggleProps<TMode>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-500/5 p-0.5 min-h-[44px] sm:min-h-0',
        className,
      )}
    >
      {options.map(({ value: optionValue, ariaLabel, Icon }) => {
        const isActive = optionValue === value
        return (
          <Button
            key={optionValue}
            variant={isActive ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onChange(optionValue)}
            aria-label={ariaLabel}
            className={cn(
              'rounded-md h-9 w-9 px-0',
              !isActive && 'text-cyan-300/80 hover:bg-cyan-500/10 border-transparent',
              buttonClassName,
            )}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
}
