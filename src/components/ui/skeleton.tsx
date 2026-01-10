import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', animation = 'pulse', ...props }, ref) => {
    const variants = {
      default: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
    }

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse bg-gradient-to-r from-background-secondary via-background-tertiary to-background-secondary bg-[length:200%_100%]',
      none: '',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-background-secondary',
          variants[variant],
          animations[animation],
          className,
        )}
        {...props}
      />
    )
  },
)
Skeleton.displayName = 'Skeleton'

export { Skeleton }
