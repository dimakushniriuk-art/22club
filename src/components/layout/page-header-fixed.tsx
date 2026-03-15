'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'

export interface PageHeaderFixedProps {
  title: string
  subtitle?: string
  backHref?: string
  onBack?: () => void
  icon?: React.ReactNode
  className?: string
  /** Se true, header non fixed (per anteprime design-system). Default false. */
  static?: boolean
  /** Stile come pagina chat: bg-black, border-b, padding uniforme. */
  variant?: 'default' | 'chat'
}

const HEADER_BASE =
  'overflow-hidden bg-background px-3 pb-3 min-[834px]:px-4 min-[834px]:pb-4 border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
const HEADER_BASE_CHAT =
  'overflow-hidden bg-black border-b border-white/10 p-3 min-[834px]:p-4'
const HEADER_FIXED =
  'fixed inset-x-0 top-0 z-20 pt-[calc(10px+env(safe-area-inset-top,0px))] border-x-0 border-t-0'
const HEADER_FIXED_CHAT = 'fixed inset-x-0 top-0 z-20 pt-[calc(10px+env(safe-area-inset-top,0px))]'
const HEADER_STATIC = 'relative rounded-lg pt-3 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]'

const CYAN_LINE_STYLE = {
  background: 'linear-gradient(to right, transparent 0%, rgb(34 211 238) 50%, transparent 100%)',
}

export function PageHeaderFixed({
  title,
  subtitle,
  backHref,
  onBack,
  icon,
  className,
  static: isStatic = false,
  variant = 'default',
}: PageHeaderFixedProps) {
  const base = variant === 'chat' ? HEADER_BASE_CHAT : HEADER_BASE
  const fixed = variant === 'chat' ? HEADER_FIXED_CHAT : HEADER_FIXED
  const headerClass = `${base} ${isStatic ? HEADER_STATIC : fixed}${className ? ` ${className}` : ''}`.trim()
  const hasBack = backHref != null || onBack != null
  const backContent =
    hasBack &&
    (backHref && !onBack ? (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
        aria-label="Indietro"
        asChild
      >
        <Link href={backHref} className="flex h-full w-full items-center justify-center">
          <BackIcon />
        </Link>
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
        aria-label="Indietro"
        onClick={onBack}
      >
        <BackIcon />
      </Button>
    ))

  return (
    <header className={headerClass}>
      <div className="relative z-10 flex items-center gap-3">
        {backContent}
        {icon != null && (
          <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-400">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-text-primary truncate">{title}</h1>
          {subtitle != null && (
            <p className="text-[11px] text-text-tertiary line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={CYAN_LINE_STYLE}
        aria-hidden
      />
    </header>
  )
}

function BackIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}
