import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  helperText?: string
  errorMessage?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      errorMessage,
      variant: _variant = 'default',
      size = 'md',
      children,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const _variants = {
      default:
        'bg-background-secondary text-text-primary hover:bg-background-tertiary/80 focus:border-input-focus focus:ring-2 focus:ring-primary/20 transition-all duration-200',
      outline:
        'bg-background-secondary text-text-primary hover:bg-background-tertiary/80 focus:border-input-focus focus:ring-2 focus:ring-primary/20 transition-all duration-200',
      ghost:
        'bg-transparent border-transparent text-text-primary hover:bg-background-secondary/40 transition-all duration-200',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-4 text-sm',
      lg: 'h-12 px-4 text-base',
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value)
      }
      if (props.onChange) {
        props.onChange(e)
      }
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-primary tracking-tight">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'appearance-none flex items-center w-full rounded-md border text-text-primary px-4 py-2.5 text-base outline-none',
              'min-h-[44px] transition-[border-color,box-shadow] duration-150',
              'border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
              'focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25',
              'disabled:cursor-not-allowed disabled:opacity-60 disabled:from-zinc-900/80 disabled:to-zinc-900/80 disabled:shadow-none',
              errorMessage && 'border-red-500/60 bg-gradient-to-b from-red-950/30 to-red-950/50 focus-visible:border-red-500 focus-visible:ring-red-500/25',
              sizes[size],
              className,
            )}
            ref={ref}
            onChange={handleChange}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-4 w-4 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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
Select.displayName = 'Select'

// Sub-componenti per compatibilità con Radix UI API
const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'flex w-full items-center justify-between rounded-md border border-white/10 text-text-primary px-3 py-2 text-sm placeholder:text-text-tertiary',
      'bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
      'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 transition-[border-color,box-shadow] duration-150',
      'disabled:cursor-not-allowed disabled:opacity-60 disabled:from-zinc-900/80 disabled:to-zinc-900/80',
      className,
    )}
    {...props}
  >
    {children}
  </button>
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <span>{placeholder}</span>
}
SelectValue.displayName = 'SelectValue'

const SelectContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mt-2 rounded-md border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
SelectContent.displayName = 'SelectContent'

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-md px-3 py-2 text-sm text-white bg-background-secondary hover:bg-primary/20 focus:bg-primary/30 outline-none transition-colors',
      className,
    )}
    {...props}
  >
    {children}
  </option>
))
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
