import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorMessage?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, helperText, errorMessage, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border shrink-0 cursor-pointer transition-[border-color,box-shadow] duration-150',
              'border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 text-primary',
              'focus:ring-2 focus:ring-primary/25 focus:ring-offset-0 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-60 disabled:from-zinc-900/80 disabled:to-zinc-900/80',
              errorMessage && 'border-red-500/60 focus:ring-red-500/25',
              className,
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label className="cursor-pointer text-sm font-medium text-text-primary tracking-tight">
              {label}
            </label>
          )}
        </div>
        {helperText && !errorMessage && (
          <p className="text-xs leading-relaxed text-text-tertiary">{helperText}</p>
        )}
        {errorMessage && (
          <p className="text-xs leading-relaxed text-red-400" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
