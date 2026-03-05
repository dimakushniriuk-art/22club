'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Array<{
    id: string
    label: string
    description?: string
    completed?: boolean
    active?: boolean
  }>
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'minimal'
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, steps, orientation = 'horizontal', variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'space-y-4',
      pills: 'space-y-2',
      minimal: 'space-y-1',
    }

    const stepVariants = {
      default: {
        container: 'flex items-center',
        indicator:
          'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
        active: 'bg-brand border-brand text-text-primary shadow-sm glow',
        completed: 'bg-brand border-brand text-text-primary',
        pending: 'bg-background-secondary border-border text-text-tertiary',
        content: 'ml-4 flex-1',
        label: 'text-sm font-medium text-text-primary',
        description: 'text-xs text-text-secondary mt-1',
      },
      pills: {
        container: 'flex items-center',
        indicator:
          'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-200',
        active: 'bg-brand text-text-primary shadow-sm',
        completed: 'bg-brand text-text-primary',
        pending: 'bg-background-tertiary text-text-tertiary',
        content: 'ml-3 flex-1',
        label: 'text-sm font-medium text-text-primary',
        description: 'text-xs text-text-secondary mt-0.5',
      },
      minimal: {
        container: 'flex items-center',
        indicator:
          'flex items-center justify-center w-4 h-4 rounded-full transition-all duration-200',
        active: 'bg-brand',
        completed: 'bg-brand',
        pending: 'bg-border',
        content: 'ml-3 flex-1',
        label: 'text-sm text-text-primary',
        description: 'text-xs text-text-secondary mt-0.5',
      },
    }

    const currentVariant = stepVariants[variant]

    if (orientation === 'vertical') {
      return (
        <div ref={ref} className={cn(variants[variant], className)} {...props}>
          {steps.map((step, index) => {
            const isActive = step.active
            const isCompleted = step.completed
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className="relative">
                <div className={currentVariant.container}>
                  <div
                    className={cn(
                      currentVariant.indicator,
                      isActive && currentVariant.active,
                      isCompleted && !isActive && currentVariant.completed,
                      !isActive && !isCompleted && currentVariant.pending,
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className={currentVariant.content}>
                    <div className={currentVariant.label}>{step.label}</div>
                    {step.description && (
                      <div className={currentVariant.description}>{step.description}</div>
                    )}
                  </div>
                </div>
                {!isLast && <div className="absolute left-4 top-8 w-0.5 h-6 bg-border" />}
              </div>
            )
          })}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('flex items-center', className)} {...props}>
        {steps.map((step, index) => {
          const isActive = step.active
          const isCompleted = step.completed
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    currentVariant.indicator,
                    isActive && currentVariant.active,
                    isCompleted && !isActive && currentVariant.completed,
                    !isActive && !isCompleted && currentVariant.pending,
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={currentVariant.label}>{step.label}</div>
                  {step.description && (
                    <div className={currentVariant.description}>{step.description}</div>
                  )}
                </div>
              </div>
              {!isLast && <div className="flex-1 h-0.5 bg-border mx-4" />}
            </React.Fragment>
          )
        })}
      </div>
    )
  },
)
Stepper.displayName = 'Stepper'

export { Stepper }
