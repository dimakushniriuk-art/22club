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
    const [activeTab, setActiveTab] = React.useState(defaultValue || value || '')

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        setActiveTab(newValue)
        onValueChange?.(newValue)
      },
      [onValueChange],
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
        'inline-flex h-10 items-center justify-center rounded-lg bg-background-secondary p-1 text-text-tertiary shadow-sm',
      pills:
        'inline-flex h-10 items-center justify-center rounded-full bg-background-secondary p-1 text-text-tertiary shadow-sm',
      underline:
        'inline-flex h-10 items-center justify-center border-b border-border text-text-tertiary',
    }

    // Se className contiene !bg-transparent, non applicare il background del variant
    const shouldSkipBackground =
      className?.includes('!bg-transparent') || className?.includes('bg-transparent')
    const variantClass =
      shouldSkipBackground && variant !== 'underline'
        ? variants[variant].replace('bg-background-secondary', '')
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
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background-elevated data-[state=active]:text-text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border',
      pills:
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand data-[state=active]:text-text-primary data-[state=active]:shadow-sm data-[state=active]:shadow-[0_0_10px_rgba(2,179,191,0.3)]',
      underline:
        'inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-brand data-[state=active]:border-b-2 data-[state=active]:border-brand data-[state=active]:font-semibold',
    }

    return (
      <button
        ref={ref}
        className={cn(
          variants[variant],
          isActive && 'bg-brand text-brand-foreground shadow-sm',
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
          'focus-visible:ring-cyan-500 mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
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
