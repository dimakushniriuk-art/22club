'use client'

import { type CSSProperties, type ReactNode, useLayoutEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

/** Larghezza di riferimento layout mobile atleta (px CSS). */
export const ATHLETE_HOME_DESIGN_WIDTH_PX = 390

/** Allineato a `md:` nel chrome atleta: da qui non compattiamo. */
const ATHLETE_HOME_SCALE_OFF_MIN_WIDTH = 768

export function computeAthleteHomeViewportScale(widthPx: number): number {
  if (widthPx >= ATHLETE_HOME_SCALE_OFF_MIN_WIDTH) return 1
  return Math.min(widthPx / ATHLETE_HOME_DESIGN_WIDTH_PX, 1)
}

interface AthleteHomeViewportScaleProps {
  children: ReactNode
}

/**
 * Scala proporzionalmente l’intera superficie /home quando la viewport è più stretta
 * del frame di design, così testi e spaziature restano coerenti tra modelli diversi.
 */
export function AthleteHomeViewportScale({ children }: AthleteHomeViewportScaleProps) {
  const pathname = usePathname()
  /** Evita scroll del documento: solo l’area messaggi in chat ha overflow-y. */
  const isChatRoute = pathname === '/home/chat'
  const [width, setWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    const read = () => setWidth(window.innerWidth)
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  const scale = width == null ? 1 : computeAthleteHomeViewportScale(width)
  const compact = scale < 0.998

  const innerStyle = useMemo((): CSSProperties => {
    if (isChatRoute && !compact) {
      return {
        width: '100%',
        height: '100%',
        minHeight: 0,
        maxHeight: '100%',
      }
    }
    if (isChatRoute && compact) {
      const h = `calc(100dvh / ${scale})`
      return {
        width: ATHLETE_HOME_DESIGN_WIDTH_PX,
        height: h,
        minHeight: h,
        maxHeight: h,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }
    }
    if (!compact) {
      return {
        width: '100%',
        minHeight: '100dvh',
      }
    }
    return {
      width: ATHLETE_HOME_DESIGN_WIDTH_PX,
      minHeight: `calc(100dvh / ${scale})`,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    }
  }, [compact, scale, isChatRoute])

  const outerStyle = useMemo(
    (): CSSProperties => ({
      ['--athlete-home-scale' as string]: String(scale),
    }),
    [scale],
  )

  return (
    <div
      className={cn(
        'w-full min-w-0',
        isChatRoute ? 'h-dvh max-h-dvh min-h-0 overflow-hidden' : 'min-h-dvh overflow-x-hidden',
      )}
      style={outerStyle}
    >
      <div
        className={cn('min-w-0', isChatRoute ? 'flex h-full min-h-0 flex-col' : 'min-h-dvh')}
        style={innerStyle}
      >
        {children}
      </div>
    </div>
  )
}
