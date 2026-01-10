'use client'

import React, { memo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  icon: string
  status: 'success' | 'warning' | 'error' | 'info'
  statusText: string
  onClick?: () => void
  href?: string
  loading?: boolean
}

export const KPICard = memo<KPICardProps>(function KPICard({
  title,
  value,
  icon,
  status,
  statusText,
  onClick,
  href,
  loading = false,
}: KPICardProps) {
  const [displayValue, setDisplayValue] = React.useState<string | number>(value)
  const isNumeric = typeof value === 'number'

  const statusColors = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  // Count-up animato per valori numerici
  React.useEffect(() => {
    if (!isNumeric || loading) {
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
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const current = Math.round(from + (to - from) * eased)
      setDisplayValue(current)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isNumeric, value, loading])

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-background-tertiary/50 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-xl backdrop-blur-sm min-h-[140px] p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
        <div className="relative animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="bg-background-tertiary h-10 w-10 rounded-lg" />
            <div className="bg-background-tertiary h-6 w-16 rounded-full" />
          </div>
          <div className="bg-background-tertiary h-8 w-20 rounded" />
          <div className="bg-background-tertiary h-4 w-24 rounded" />
        </div>
      </div>
    )
  }

  // Gradiente icona basato su status (come nelle statistiche)
  const iconGradients = {
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    error: 'from-red-500 to-pink-500',
    info: 'from-blue-500 to-cyan-500',
  }

  const cardContent = (
    <div className="h-full flex flex-col justify-between">
      {/* Header con icona e badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${iconGradients[status]}`}
        >
          <span className="text-lg text-white">{icon}</span>
        </div>
        <div
          className={cn('rounded-full border px-3 py-1 text-xs font-medium', statusColors[status])}
          role="status"
          aria-label={`Status: ${statusText}`}
        >
          {statusText}
        </div>
      </div>

      {/* Valore principale */}
      <div className="mb-3">
        <div className="text-white text-3xl font-bold leading-none">{displayValue}</div>
        <div className="text-gray-300 text-sm mt-1">{title}</div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-gray-500/20 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 shadow-2xl shadow-black/20 backdrop-blur-xl hover:border-gray-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/30 min-h-[140px] h-full p-6',
            onClick && 'hover:shadow-[0_0_10px_rgba(2,179,191,0.3)] cursor-pointer',
          )}
          onClick={onClick}
          role="button"
          tabIndex={0}
          aria-label={`${title}: ${displayValue}. ${statusText}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-gray-500/5" />
          <div className="relative h-full">{cardContent}</div>
        </div>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-500/20 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 shadow-2xl shadow-black/20 backdrop-blur-xl hover:border-gray-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/30 min-h-[140px] h-full p-6',
        onClick && 'hover:shadow-[0_0_10px_rgba(2,179,191,0.3)] cursor-pointer',
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${displayValue}. ${statusText}`}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-gray-500/5" />
      <div className="relative h-full">{cardContent}</div>
    </div>
  )
})
