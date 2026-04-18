import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type NonHomeViewportShellProps = {
  children: ReactNode
  className?: string
  scrollClassName?: string
  /**
   * `scroll`: un solo scroll verticale nel wrapper (login, welcome, privacy…).
   * `fill`: solo limite 100dvh + flex; lo scroll resta ai figli (es. RoleLayout dashboard).
   */
  variant?: 'scroll' | 'fill'
}

/**
 * Contenitore viewport per pagine fuori da `/home/*`: altezza = 100dvh,
 * orientamento landscape/portrait stabile (niente catena flex rotta).
 */
export function NonHomeViewportShell({
  children,
  className,
  scrollClassName,
  variant = 'scroll',
}: NonHomeViewportShellProps) {
  if (variant === 'fill') {
    return (
      <div className={cn('non-home-viewport-root flex flex-col', className)}>{children}</div>
    )
  }
  return (
    <div className={cn('non-home-viewport-root', className)}>
      <div className={cn('non-home-viewport-scroll', scrollClassName)}>{children}</div>
    </div>
  )
}
