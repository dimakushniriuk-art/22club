'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimationProps {
  children: ReactNode
  className?: string
  delay?: number
}

// Fade in animation
export function FadeIn({ children, className, delay = 0 }: AnimationProps) {
  return (
    <div
      className={cn('animate-in fade-in duration-500 ease-out', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  )
}

// Slide up animation
export function SlideUp({ children, className, delay = 0 }: AnimationProps) {
  return (
    <div
      className={cn('animate-in slide-in-from-bottom-4 duration-500 ease-out', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {children}
    </div>
  )
}

// Scale animation per bottoni
export function ScaleOnHover({ children, className }: AnimationProps) {
  return (
    <div
      className={cn(
        'transition-transform duration-200 ease-out hover:scale-105 active:scale-95',
        className,
      )}
    >
      {children}
    </div>
  )
}

// Stagger animation per liste
export function StaggerContainer({ children, className }: AnimationProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <SlideUp key={index} delay={index * 100}>
            {child}
          </SlideUp>
        ))
      ) : (
        <SlideUp>{children}</SlideUp>
      )}
    </div>
  )
}

// Pulse animation per notifiche
export function PulseIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
      <div className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
    </div>
  )
}

// Bounce animation per success states
export function BounceIn({ children, className }: AnimationProps) {
  return (
    <div className={cn('animate-in zoom-in-50 duration-300 ease-out', className)}>{children}</div>
  )
}
