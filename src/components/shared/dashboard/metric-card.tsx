'use client'

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { triggerHaptic } from '@/lib/haptics'
import { colors as designTokens } from '@/lib/design-tokens'

export type MetricCardTone = 'teal' | 'emerald' | 'amber' | 'blue' | 'purple' | 'neutral' | 'danger'

export type MetricCardVariant = 'default' | 'compact' | 'minimal' | 'glass' | 'trainer'

export type MetricCardStatus = 'success' | 'warning' | 'error' | 'info'

type MetricCardBaseProps = {
  value: string | number
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  loading?: boolean
  trend?: 'up' | 'down' | 'neutral'
  status?: MetricCardStatus
  statusText?: string
  /** Densità ridotta (padding / tipografia), componibile con `variant` */
  compact?: boolean
  enableCountUp?: boolean
  variant?: MetricCardVariant
  tone?: MetricCardTone
  animationDelay?: string
  /**
   * Feedback aptico su attivazione. Default: `true` se è definito `onClick`, altrimenti `false`.
   * Impostare `true` anche per sole navigazioni `href` se desiderato.
   */
  enableHaptic?: boolean
  className?: string
}

export type MetricCardProps =
  | (MetricCardBaseProps & { title: string })
  | (MetricCardBaseProps & { label: string })

type ToneStyle = {
  border: string
  shadow: string
  gradient: string
  iconBg: string
  iconText: string
  hoverBorder: string
}

const toneStyles: Record<MetricCardTone, ToneStyle> = {
  teal: {
    border: 'border-teal-500/30',
    shadow: 'shadow-teal-500/10',
    gradient: 'from-teal-500/5 via-transparent to-cyan-500/5',
    iconBg: 'bg-teal-500/20',
    iconText: 'text-teal-400',
    hoverBorder: 'hover:border-teal-500/50',
  },
  emerald: {
    border: 'border-emerald-500/30',
    shadow: 'shadow-emerald-500/10',
    gradient: 'from-emerald-500/5 via-transparent to-green-500/5',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  amber: {
    border: 'border-amber-500/30',
    shadow: 'shadow-amber-500/10',
    gradient: 'from-amber-500/5 via-transparent to-orange-500/5',
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/50',
  },
  blue: {
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/10',
    gradient: 'from-blue-500/5 via-transparent to-indigo-500/5',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    hoverBorder: 'hover:border-blue-500/50',
  },
  purple: {
    border: 'border-purple-500/30',
    shadow: 'shadow-purple-500/10',
    gradient: 'from-purple-500/5 via-transparent to-violet-500/5',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    hoverBorder: 'hover:border-purple-500/50',
  },
  neutral: {
    border: 'border-gray-500/30',
    shadow: 'shadow-gray-500/10',
    gradient: 'from-gray-500/5 via-transparent to-slate-500/5',
    iconBg: 'bg-gray-500/20',
    iconText: 'text-gray-400',
    hoverBorder: 'hover:border-gray-500/50',
  },
  danger: {
    border: 'border-red-500/30',
    shadow: 'shadow-red-500/10',
    gradient: 'from-red-500/5 via-transparent to-rose-500/5',
    iconBg: 'bg-red-500/20',
    iconText: 'text-red-400',
    hoverBorder: 'hover:border-red-500/50',
  },
}

const accentKeyMap: Partial<Record<MetricCardTone, keyof typeof designTokens.athleteAccents>> = {
  teal: 'teal',
  emerald: 'emerald',
  amber: 'amber',
  blue: 'cyan',
  purple: 'green',
}

const statusBadgeClasses: Record<MetricCardStatus, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const statusIconGradients: Record<MetricCardStatus, string> = {
  success: 'from-green-500 to-emerald-500',
  warning: 'from-yellow-500 to-orange-500',
  error: 'from-red-500 to-pink-500',
  info: 'from-blue-500 to-cyan-500',
}

function resolveCardUiVariant(variant: MetricCardVariant): 'default' | 'glass' | 'trainer' {
  if (variant === 'glass') return 'glass'
  if (variant === 'trainer') return 'trainer'
  return 'default'
}

function useMetricDisplayValue(
  value: string | number,
  loading: boolean,
  enableCountUp: boolean | undefined,
): string | number {
  const isNumeric = typeof value === 'number'
  const shouldAnimate = Boolean(enableCountUp && isNumeric && !loading)
  const [displayValue, setDisplayValue] = useState<string | number>(value)

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayValue(value)
      return
    }

    const durationMs = 800
    const startTs = performance.now()
    const from = 0
    const to = value as number

    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTs) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(from + (to - from) * eased)
      setDisplayValue(current)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shouldAnimate, value])

  return displayValue
}

function metricHeading(props: MetricCardProps): string {
  return 'title' in props ? props.title : props.label
}

function buildMetricAriaLabel(props: MetricCardProps, displayValue: string | number): string {
  const parts = [metricHeading(props), String(displayValue)]
  if (props.statusText) parts.push(props.statusText)
  return parts.join('. ')
}

type MetricCardViewProps = MetricCardProps & {
  displayValue: string | number
}

const MetricCardView = memo(function MetricCardView(props: MetricCardViewProps) {
  const {
    displayValue,
    icon,
    loading = false,
    trend,
    status,
    statusText,
    compact: compactProp = false,
    variant = 'default',
    tone = 'blue',
    animationDelay,
    className,
    href,
    onClick,
  } = props

  const heading = metricHeading(props)
  const isCompactLayout = variant === 'compact' || compactProp
  const cardUiVariant = resolveCardUiVariant(variant)
  const toneClass = toneStyles[tone]
  const accentKey = accentKeyMap[tone]
  const accent = accentKey ? designTokens.athleteAccents[accentKey] : null
  const showStatusBadge = Boolean(status && statusText)

  const cardStyle = useMemo((): React.CSSProperties => {
    const base: React.CSSProperties = animationDelay ? { animationDelay } : {}
    if (!accent) return base
    return {
      ...base,
      borderColor: `${accent.bar}4D`,
      boxShadow: `0 10px 15px -3px ${accent.bar}20`,
    }
  }, [animationDelay, accent])

  const gradientOverlayStyle = useMemo((): React.CSSProperties | undefined => {
    if (!accent) return undefined
    return {
      background: `linear-gradient(to bottom right, ${accent.bar}0D, transparent, ${accent.bar}0D)`,
    }
  }, [accent])

  const iconBoxStyle = useMemo((): React.CSSProperties | undefined => {
    if (!accent) return undefined
    return { backgroundColor: `${accent.bar}20`, color: accent.bar }
  }, [accent])

  const minHeightClass = isCompactLayout ? 'min-h-[100px]' : 'min-h-[140px]'
  const isInteractiveShell = Boolean(href || onClick)
  const cardChromeBase = cn(
    'relative overflow-hidden h-full transition-colors',
    minHeightClass,
    !accent && toneClass.border,
    accent ? 'hover:border-white/25' : toneClass.hoverBorder,
    'hover:border-white/20',
    variant === 'minimal' &&
      'shadow-none border-white/5 !bg-gradient-to-b from-zinc-900/80 to-black/70',
    className,
  )
  const cardChrome = cn(cardChromeBase, isInteractiveShell && 'cursor-pointer')

  const iconShellTone = !showStatusBadge
  const iconPadding = isCompactLayout ? 'p-1.5' : 'p-3'
  const iconInnerSize = isCompactLayout ? 'h-4 w-4 text-base' : 'h-5 w-5'

  const titleClass = isCompactLayout
    ? 'text-text-secondary text-xs mb-0.5'
    : 'text-text-secondary text-sm mb-2'

  const valueClass = isCompactLayout
    ? 'text-text-primary text-lg font-bold'
    : 'text-text-primary text-2xl font-bold'

  const contentPadding = isCompactLayout
    ? 'p-2 sm:p-3 relative h-full flex flex-col justify-center'
    : 'p-4 relative h-full flex flex-col justify-center'

  if (loading) {
    const titleBarClass = isCompactLayout ? 'h-3 max-w-[72%]' : 'h-4 max-w-[70%]'
    const valueBarClass = isCompactLayout ? 'h-6 w-16' : 'h-9 w-24'
    const iconSkeletonClass = isCompactLayout ? 'h-7 w-7' : 'h-11 w-11'

    return (
      <Card
        variant={cardUiVariant}
        className={cn(
          cardChromeBase,
          cardUiVariant === 'default' &&
            variant !== 'minimal' &&
            'border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
          cardUiVariant === 'default' && variant === 'minimal' && 'rounded-lg',
        )}
        style={cardStyle}
        aria-busy="true"
      >
        <div
          className={
            !accent
              ? cn(
                  'absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-br opacity-80',
                  toneClass.gradient,
                )
              : 'absolute top-0 left-0 right-0 h-[50%]'
          }
          style={accent ? gradientOverlayStyle : undefined}
        />
        <CardContent className={cn(contentPadding, '!pt-4')}>
          <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <div
                className={cn('rounded-md bg-white/10 animate-pulse flex-1 min-w-0', titleBarClass)}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className={cn('rounded-md bg-white/10 animate-pulse', valueBarClass)} />
              <div
                className={cn(
                  'rounded-full shrink-0 flex items-center justify-center bg-white/10 animate-pulse',
                  iconPadding,
                  iconSkeletonClass,
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      variant={cardUiVariant}
      className={cn(
        cardChrome,
        cardUiVariant === 'default' &&
          variant !== 'minimal' &&
          'border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        cardUiVariant === 'default' && variant === 'minimal' && 'rounded-lg',
      )}
      style={cardStyle}
    >
      <div
        className={
          !accent
            ? cn(
                'absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-br opacity-80',
                toneClass.gradient,
              )
            : 'absolute top-0 left-0 right-0 h-[50%]'
        }
        style={accent ? gradientOverlayStyle : undefined}
      />
      <CardContent className={cn(contentPadding, '!pt-4')}>
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(titleClass, 'flex-1 min-w-0')}>{heading}</p>
            {showStatusBadge && status ? (
              <div
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium shrink-0',
                  statusBadgeClasses[status],
                )}
                role="status"
                aria-label={`Status: ${statusText}`}
              >
                {statusText}
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className={valueClass}>{displayValue}</p>
            <div
              className={cn(
                'rounded-full flex-shrink-0 flex items-center justify-center',
                iconPadding,
                iconShellTone && !accent && cn(toneClass.iconBg, toneClass.iconText),
                showStatusBadge && status && cn('bg-gradient-to-br', statusIconGradients[status]),
              )}
              style={accent && iconShellTone ? iconBoxStyle : undefined}
            >
              <div
                className={cn(iconInnerSize, 'flex items-center justify-center [&>svg]:size-full')}
              >
                {showStatusBadge && status ? (
                  <span className={cn('text-white', isCompactLayout ? 'text-sm' : 'text-lg')}>
                    {icon}
                  </span>
                ) : (
                  icon
                )}
              </div>
            </div>
          </div>
          {trend ? (
            <span
              className={cn(
                'text-xs mt-0.5',
                trend === 'up'
                  ? 'text-success'
                  : trend === 'down'
                    ? 'text-error'
                    : 'text-text-muted',
              )}
              aria-hidden
            >
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
})

export const MetricCard = memo(function MetricCard(props: MetricCardProps) {
  const { href, onClick, loading = false, enableHaptic } = props

  const displayValue = useMetricDisplayValue(props.value, loading, props.enableCountUp)

  const heading = metricHeading(props)
  const ariaLabel = useMemo(
    () => buildMetricAriaLabel(props, displayValue),
    [props.statusText, displayValue, heading],
  )

  const shouldHaptic = enableHaptic ?? Boolean(onClick)

  const runActivate = useCallback(() => {
    if (shouldHaptic) triggerHaptic('light')
    onClick?.()
  }, [onClick, shouldHaptic])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!onClick || href) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        runActivate()
      }
    },
    [href, onClick, runActivate],
  )

  const viewProps: MetricCardViewProps = { ...props, displayValue }

  if (loading) {
    return <MetricCardView {...viewProps} />
  }

  const interactiveSurface = cn(
    'block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  )

  if (href) {
    return (
      <Link href={href} className={interactiveSurface} aria-label={ariaLabel} onClick={runActivate}>
        <MetricCardView {...viewProps} />
      </Link>
    )
  }

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={interactiveSurface}
        aria-label={ariaLabel}
        onClick={runActivate}
        onKeyDown={handleKeyDown}
      >
        <MetricCardView {...viewProps} />
      </div>
    )
  }

  return <MetricCardView {...viewProps} />
})

MetricCard.displayName = 'MetricCard'
MetricCardView.displayName = 'MetricCardView'
