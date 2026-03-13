'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextType {
  value: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType>({ value: '' })

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || value || '')
    const isControlled = value !== undefined && value !== null
    const activeTab = isControlled ? value : internalValue

    React.useEffect(() => {
      if (isControlled && typeof value === 'string') {
        setInternalValue(value)
      }
    }, [isControlled, value])

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) setInternalValue(newValue)
        onValueChange?.(newValue)
      },
      [onValueChange, isControlled],
    )

    return (
      <TabsContext.Provider value={{ value: activeTab, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn('w-full', className)} data-active-tab={activeTab} {...props} />
      </TabsContext.Provider>
    )
  },
)
Tabs.displayName = 'Tabs'

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pills' | 'underline'
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default:
        'inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 p-1 text-text-tertiary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] max-[851px]:flex-wrap max-[851px]:gap-2',
      pills:
        'inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 p-1 text-text-tertiary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] max-[851px]:flex-wrap max-[851px]:gap-2',
      underline:
        'inline-flex h-10 items-center justify-center border-b border-white/10 text-text-tertiary max-[851px]:flex-wrap max-[851px]:gap-2',
    }

    const shouldSkipBackground =
      className?.includes('!bg-transparent') || className?.includes('bg-transparent')
    const variantClass =
      shouldSkipBackground && variant !== 'underline'
        ? variants[variant].replace(
            ' border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
            '',
          )
        : variants[variant]

    return <div ref={ref} className={cn(variantClass, className)} {...props} />
  },
)
TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  variant?: 'default' | 'pills' | 'underline'
  disabled?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, variant = 'default', disabled, ...props }, ref) => {
    const { value: activeTab, onValueChange } = React.useContext(TabsContext)
    const isActive = activeTab === value

    const variants = {
      default:
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 data-[state=inactive]:text-text-tertiary data-[state=active]:border data-[state=active]:border-white/10 data-[state=active]:bg-gradient-to-b data-[state=active]:from-zinc-700/90 data-[state=active]:to-zinc-800/90 data-[state=active]:text-text-primary data-[state=active]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] max-[851px]:min-h-[44px] max-[851px]:touch-manipulation',
      pills:
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 data-[state=inactive]:text-text-tertiary data-[state=inactive]:hover:text-text-secondary data-[state=inactive]:hover:bg-white/5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=active]:ring-2 data-[state=active]:ring-primary/40 max-[851px]:min-h-[44px] max-[851px]:touch-manipulation',
      underline:
        'inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-semibold max-[851px]:min-h-[44px] max-[851px]:touch-manipulation',
    }

    return (
      <button
        ref={ref}
        className={cn(
          variants[variant],
          isActive && variant === 'pills' && 'bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-2 ring-primary/40',
          className,
        )}
        onClick={() => onValueChange?.(value)}
        disabled={disabled}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        {...props}
      />
    )
  },
)
TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  forceMount?: boolean
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount, ...props }, ref) => {
    const { value: activeTab } = React.useContext(TabsContext)
    const isActive = activeTab === value

    return (
      <div
        ref={ref}
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className,
        )}
        data-state={isActive ? 'active' : 'inactive'}
        role="tabpanel"
        aria-labelledby={`tab-${value}`}
        hidden={forceMount ? false : !isActive}
        {...props}
      />
    )
  },
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
