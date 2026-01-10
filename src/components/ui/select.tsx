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
      variant = 'default',
      size = 'md',
      children,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const variants = {
      default:
        'bg-background-secondary/50 border-teal-500/30 text-text-primary backdrop-blur-sm hover:bg-background-secondary/70 hover:border-teal-500/50 focus:border-teal-500/50 transition-all duration-200',
      outline:
        'bg-background-secondary/60 border-teal-500/30 text-text-primary backdrop-blur-sm hover:bg-background-secondary/80 hover:border-teal-500/50 focus:border-teal-500/50 transition-all duration-200',
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
      <div className="space-y-2">
        {label && <label className="text-text-primary text-sm font-medium">{label}</label>}
        <div className="relative">
          <select
            className={cn(
              'appearance-none flex w-full rounded-xl border text-text-primary px-4 py-2.5 text-sm shadow-md shadow-teal-500/10 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/15',
              'bg-gradient-to-br from-background-secondary/50 to-background-tertiary/30',
              variants[variant],
              sizes[size],
              errorMessage && 'border-red-500/50 focus-visible:ring-red-500/30',
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
          <p className="text-text-tertiary text-xs mt-1">{helperText}</p>
        )}
        {errorMessage && <p className="text-red-400 text-xs mt-1 font-medium">{errorMessage}</p>}
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
      'placeholder:text-white/50 focus-visible:ring-primary/50 flex w-full items-center justify-between rounded-lg border border-border/50 bg-background-secondary/80 text-white px-3 py-2 text-sm shadow-lg shadow-black/10 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:bg-background-secondary hover:shadow-xl hover:shadow-black/20',
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
      'mt-2 rounded-lg border border-border/50 bg-background-secondary/95 backdrop-blur-xl shadow-2xl shadow-black/30 text-white',
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
