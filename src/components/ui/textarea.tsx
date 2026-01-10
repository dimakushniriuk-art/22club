import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  errorMessage?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, helperText, errorMessage, variant = 'default', size = 'md', ...props },
    ref,
  ) => {
    const variants = {
      default: 'bg-background-secondary border-border text-text-primary',
      outline: 'bg-transparent border-border text-text-primary',
      ghost: 'bg-transparent border-transparent text-text-primary',
    }

    const sizes = {
      sm: 'min-h-[60px] px-2 py-1 text-sm',
      md: 'min-h-[80px] px-3 py-2 text-sm',
      lg: 'min-h-[100px] px-4 py-3 text-base',
    }

    return (
      <div className="space-y-2">
        {label && <label className="text-text-primary text-sm font-medium">{label}</label>}
        <textarea
          className={cn(
            'placeholder:text-text-tertiary focus-visible:ring-cyan-500 flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            variants[variant],
            sizes[size],
            errorMessage && 'border-state-error focus-visible:ring-state-error',
            className,
          )}
          ref={ref}
          {...props}
        />
        {helperText && !errorMessage && <p className="text-text-tertiary text-xs">{helperText}</p>}
        {errorMessage && <p className="text-state-error text-xs">{errorMessage}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
