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
      default:
        'border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none disabled:from-zinc-900/80 disabled:to-zinc-900/80 disabled:shadow-none',
      outline: 'bg-transparent border-white/10 text-text-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25',
      ghost: 'bg-transparent border-transparent text-text-primary',
    }

    const sizes = {
      sm: 'min-h-[60px] px-3 py-2 text-sm',
      md: 'min-h-[80px] px-3.5 py-2.5 text-sm',
      lg: 'min-h-[100px] px-4 py-3 text-base',
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-primary tracking-tight">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'placeholder:text-text-tertiary flex w-full rounded-md border text-text-primary outline-none transition-[border-color,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60',
            variants[variant],
            sizes[size],
            errorMessage &&
              'border-red-500/60 bg-gradient-to-b from-red-950/30 to-red-950/50 focus-visible:border-red-500 focus-visible:ring-red-500/25',
            className,
          )}
          ref={ref}
          {...props}
        />
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
Textarea.displayName = 'Textarea'

export { Textarea }
