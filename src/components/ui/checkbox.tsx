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
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className={cn(
              'bg-background-secondary text-brand focus:ring-cyan-500 h-4 w-4 rounded border-border ring-offset-white focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              errorMessage && 'border-state-error focus:ring-state-error',
              className,
            )}
            ref={ref}
            {...props}
          />
          {label && <label className="text-text-primary text-sm font-medium">{label}</label>}
        </div>
        {helperText && !errorMessage && <p className="text-text-tertiary text-xs">{helperText}</p>}
        {errorMessage && <p className="text-state-error text-xs">{errorMessage}</p>}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
