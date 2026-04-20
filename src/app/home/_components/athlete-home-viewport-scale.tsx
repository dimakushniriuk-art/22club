'use client'

import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

/** Larghezza di riferimento layout mobile atleta (px CSS). */
export const ATHLETE_HOME_DESIGN_WIDTH_PX = 390

/** Allineato a `min-[834px]:` nel chrome atleta: da qui non compattiamo. */
const ATHLETE_HOME_SCALE_OFF_MIN_WIDTH = 834

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
  }, [compact, scale])

  const outerStyle = useMemo(
    (): CSSProperties => ({
      ['--athlete-home-scale' as string]: String(scale),
    }),
    [scale],
  )

  return (
    <div
      className="min-h-dvh w-full min-w-0 overflow-x-hidden"
      style={outerStyle}
    >
      <div className="min-h-dvh min-w-0" style={innerStyle}>
        {children}
      </div>
    </div>
  )
}
