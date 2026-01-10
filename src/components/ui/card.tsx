import * as React from 'react'
import { cn } from '@/lib/utils'
import { designSystem } from '@/config/design-system'
import { masterAnimations, masterCards } from '@/config/master-design.config'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'athlete' | 'trainer' | 'admin'
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    // Varianti usando design tokens
    const variants = {
      default: 'bg-gradient-to-br from-teal-900 to-cyan-900 border border-teal-700/50',
      elevated: cn(
        'bg-gradient-to-br from-teal-800 to-cyan-800 border border-teal-700/50',
        'shadow-lg',
      ),
      outlined: 'bg-gradient-to-br from-teal-900 to-cyan-900 border-2 border-teal-700/50',
      athlete: masterCards.athlete.base,
      trainer: masterCards.trainer.base,
      admin: masterCards.admin.base,
    }

    // Verifica se className contiene !bg-transparent o bg-transparent
    const shouldSkipBackground =
      className?.includes('!bg-transparent') || className?.includes('bg-transparent')

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles usando design tokens
          `rounded-[${designSystem.radius.lg}] p-4`,
          'text-text-primary',
          masterAnimations.transition,
          masterAnimations.focus.ring,
          masterAnimations.focus.outline,
          // Variant (solo se className non contiene !bg-transparent o bg-transparent)
          !shouldSkipBackground && variants[variant],
          // Hoverable effect (solo se non è trasparente)
          hoverable &&
            !shouldSkipBackground &&
            cn(
              masterAnimations.hover.lift,
              masterAnimations.hover.glow,
              'hover:bg-background-tertiary',
            ),
          className,
        )}
        {...props}
      />
    )
  },
)
Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding = 'md', ...props }, ref) => {
    const paddingVariants = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', paddingVariants[padding], className)}
        {...props}
      />
    )
  },
)
CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeVariants = {
      sm: 'text-lg font-semibold',
      md: 'text-xl font-semibold',
      lg: 'text-2xl font-semibold',
      xl: 'text-3xl font-bold',
    }

    return (
      <h3
        ref={ref}
        className={cn(
          'leading-none tracking-tight text-text-primary',
          sizeVariants[size],
          className,
        )}
        {...props}
      />
    )
  },
)
CardTitle.displayName = 'CardTitle'

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'subtle'
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'text-text-secondary',
      muted: 'text-text-tertiary',
      subtle: 'text-text-disabled',
    }

    return <p ref={ref} className={cn('text-sm', variants[variant], className)} {...props} />
  },
)
CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = 'md', ...props }, ref) => {
    const paddingVariants = {
      sm: 'p-3 pt-0',
      md: 'p-4 pt-0',
      lg: 'p-6 pt-0',
    }

    return <div ref={ref} className={cn(paddingVariants[padding], className)} {...props} />
  },
)
CardContent.displayName = 'CardContent'

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
  justify?: 'start' | 'center' | 'end' | 'between'
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding = 'md', justify = 'start', ...props }, ref) => {
    const paddingVariants = {
      sm: 'p-3 pt-0',
      md: 'p-4 pt-0',
      lg: 'p-6 pt-0',
    }

    const justifyVariants = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          paddingVariants[padding],
          justifyVariants[justify],
          className,
        )}
        {...props}
      />
    )
  },
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
