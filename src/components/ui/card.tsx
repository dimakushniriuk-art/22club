import * as React from 'react'
import { cn } from '@/lib/utils'
import { masterAnimations, masterCards } from '@/config/master-design.config'

const glassHighlight = 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
const cardBase =
  'border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]'
/** Radius card = designSystem.radius.lg (16px) */
const CARD_RADIUS = 'rounded-lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'athlete' | 'trainer' | 'admin' | 'glass'
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    const variants: Record<string, string> = {
      default: cardBase,
      elevated: cn(cardBase, 'shadow-lg'),
      outlined: cn(
        'border-2 border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]',
      ),
      athlete: masterCards.athlete.base,
      trainer: masterCards.trainer.base,
      admin: masterCards.admin.base,
      glass: cn('bg-white/[0.04] border border-white/10 backdrop-blur-xl', glassHighlight),
    }

    const shouldSkipBackground =
      className?.includes('!bg-transparent') || className?.includes('bg-transparent')

    return (
      <div
        ref={ref}
        className={cn(
          CARD_RADIUS,
          'p-4 text-text-primary',
          masterAnimations.transition,
          masterAnimations.focus.ring,
          masterAnimations.focus.outline,
          !shouldSkipBackground && variants[variant],
          hoverable &&
            !shouldSkipBackground &&
            cn(
              'hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10 hover:bg-white/[0.03]',
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
