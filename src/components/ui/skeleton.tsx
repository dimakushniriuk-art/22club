import * as React from 'react'
import { cn } from '@/lib/utils'

function dimensionToCss(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  /** Optional width (number = px, or CSS string). */
  width?: number | string
  /** Optional height (number = px, or CSS string). */
  height?: number | string
  /** When set, overrides `variant` radius (`true` = xl, `false` = none). */
  rounded?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'default',
      animation = 'pulse',
      width,
      height,
      rounded,
      style,
      ...props
    },
    ref,
  ) => {
    const variants = {
      default: 'rounded-md',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
    }

    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-pulse',
      none: '',
    }

    const radiusClass =
      rounded === true ? 'rounded-xl' : rounded === false ? 'rounded-none' : variants[variant]

    const widthCss = dimensionToCss(width)
    const heightCss = dimensionToCss(height)

    return (
      <div
        ref={ref}
        style={{
          ...style,
          ...(widthCss !== undefined ? { width: widthCss } : {}),
          ...(heightCss !== undefined ? { height: heightCss } : {}),
        }}
        className={cn(
          'bg-gradient-to-b from-zinc-800/80 to-zinc-900/80',
          radiusClass,
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
