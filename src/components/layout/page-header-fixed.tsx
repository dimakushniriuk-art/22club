'use client'

import * as React from 'react'
import { useContext, useEffect, useRef } from 'react'
import { AthleteTopBarContext } from '@/components/athlete/athlete-top-bar-context'
import { useStackAthletePageHeaderBelowBrand } from '@/components/athlete/home-athlete-chrome-context'
import { cn } from '@/lib/utils'
import { StaffHeaderBackButton } from '@/components/shared/dashboard/staff-header-back-button'

export interface PageHeaderFixedProps {
  title: string
  subtitle?: string
  backHref?: string
  onBack?: () => void
  className?: string
  /** Se true, header non fixed (per anteprime design-system). Default false. */
  static?: boolean
  /** Stile come pagina chat: bg-black, border-b, padding uniforme. */
  variant?: 'default' | 'chat'
  /** Header in flow (iframe embed): niente fixed, barra compatta full-width. */
  embedStatic?: boolean
}

const HEADER_BASE =
  'overflow-hidden bg-background px-3 pb-3 min-[834px]:px-4 min-[834px]:pb-4 border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
const HEADER_BASE_CHAT = 'overflow-hidden bg-black border-b border-white/10 p-3 min-[834px]:p-4'
const HEADER_FIXED_TOP = 'fixed inset-x-0 z-20 border-x-0 border-t-0'
const HEADER_FIXED_PT_SAFE = 'top-0 pt-[calc(10px+env(safe-area-inset-top,0px))]'
const HEADER_FIXED_PT_STACKED = 'top-[var(--home-athlete-brand-top,0px)] pt-[10px] min-[834px]:pt-3'
const HEADER_STATIC =
  'relative rounded-lg pt-3 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] shrink-0'
/** Chat embed / split pane: speculare alla barra navigazione oggi (rounded-b, blur, bordo-b, ombra verso il basso). */
const HEADER_CHAT_EMBED =
  'relative z-10 shrink-0 overflow-hidden rounded-b-2xl border-b border-white/10 bg-black/95 px-3 py-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md min-[834px]:px-4 min-[834px]:py-3'

const CYAN_LINE_STYLE = {
  background: 'linear-gradient(to right, transparent 0%, rgb(34 211 238) 50%, transparent 100%)',
}

export function PageHeaderFixed({
  title,
  subtitle,
  backHref,
  onBack,
  className,
  static: isStatic = false,
  variant = 'default',
  embedStatic = false,
}: PageHeaderFixedProps) {
  const stackBelowBrand = useStackAthletePageHeaderBelowBrand()
  const topBarCtx = useContext(AthleteTopBarContext)
  /** setState è stabile: non usare l’intero topBarCtx nelle deps (il value ricrea l’oggetto a ogni config). */
  const setTopBarConfig = topBarCtx?.setConfig
  const onBackRef = useRef(onBack)
  onBackRef.current = onBack
  const hasOnBackHandler = onBack != null

  useEffect(() => {
    if (!setTopBarConfig || !stackBelowBrand || isStatic || embedStatic) return
    setTopBarConfig({
      title,
      subtitle,
      backHref,
      onBack: hasOnBackHandler ? () => onBackRef.current?.() : undefined,
    })
    return () => setTopBarConfig(null)
  }, [
    setTopBarConfig,
    stackBelowBrand,
    isStatic,
    embedStatic,
    title,
    subtitle,
    backHref,
    hasOnBackHandler,
  ])

  if (topBarCtx && stackBelowBrand && !isStatic && !embedStatic) {
    return null
  }

  const base =
    embedStatic && variant === 'chat'
      ? HEADER_CHAT_EMBED
      : variant === 'chat'
        ? HEADER_BASE_CHAT
        : HEADER_BASE
  const fixedPosition =
    embedStatic && variant === 'chat'
      ? ''
      : isStatic
        ? HEADER_STATIC
        : `${HEADER_FIXED_TOP} ${stackBelowBrand ? HEADER_FIXED_PT_STACKED : HEADER_FIXED_PT_SAFE}`
  const headerClass = cn(base, fixedPosition, className)
  const hasBack = backHref != null || onBack != null
  const compactEmbed = embedStatic && variant === 'chat'

  const backContentResolved =
    hasBack &&
    (backHref && !onBack ? (
      <StaffHeaderBackButton href={backHref} />
    ) : (
      <StaffHeaderBackButton onClick={onBack!} />
    ))

  return (
    <header className={headerClass}>
      <div className={cn('relative z-10 flex items-center', compactEmbed ? 'gap-2' : 'gap-3')}>
        {backContentResolved}
        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              'font-semibold text-text-primary truncate',
              compactEmbed ? 'text-base md:text-lg' : 'text-lg md:text-xl',
            )}
          >
            {title}
          </h1>
          {subtitle != null && (
            <p className="text-[11px] text-text-tertiary line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px" style={CYAN_LINE_STYLE} aria-hidden />
    </header>
  )
}
