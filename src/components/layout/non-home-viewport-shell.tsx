import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type NonHomeViewportShellProps = {
  children: ReactNode
  className?: string
  scrollClassName?: string
  /**
   * Viewport contract:
   * - `scroll`: root con scroll verticale interno (`non-home-viewport-scroll`; es. login, welcome, privacy…).
   * - `fill`: root flex fill (`flex flex-col`); nessuno scroll dedicato nello shell — lo scroll resta ai figli (es. `RoleLayout` in dashboard).
   */
  variant?: 'scroll' | 'fill'
}

/**
 * **NonHomeViewportShell** — viewport shell per route **non-home** (fuori dalla home atleta / albero “home” di prodotto):
 * altezza = `100dvh`, orientamento landscape/portrait stabile senza rompere la catena flex.
 *
 * Contratto varianti:
 * - `variant="scroll"`: root + wrapper interno = **scroll interno** unico verticale.
 * - `variant="fill"`: root **flex fill** per composizione di layout figli che gestiscono overflow/scroll.
 *
 * Uso dashboard globale: `src/app/dashboard/layout.tsx` avvolge l’albero dashboard in `NonHomeViewportShell` (tipicamente `variant="fill"`).
 */
export function NonHomeViewportShell({
  children,
  className,
  scrollClassName,
  variant = 'scroll',
}: NonHomeViewportShellProps) {
  if (variant === 'fill') {
    return <div className={cn('non-home-viewport-root flex flex-col', className)}>{children}</div>
  }
  return (
    <div className={cn('non-home-viewport-root', className)}>
      <div className={cn('non-home-viewport-scroll', scrollClassName)}>{children}</div>
    </div>
  )
}
