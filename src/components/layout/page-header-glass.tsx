'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

export interface PageHeaderGlassProps {
  title: string
  subtitle?: string
  backHref?: string
  onBack?: () => void
  icon?: React.ReactNode
  className?: string
}

const HEADER_CLASS =
  'fixed inset-x-0 top-0 z-20 overflow-hidden bg-background border-b border-white/10 px-3 pb-3 min-[834px]:px-4 min-[834px]:pb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] pt-[calc(10px+env(safe-area-inset-top,0px))]'

const CYAN_LINE_STYLE = {
  background: 'linear-gradient(to right, transparent 0%, rgb(34 211 238) 50%, transparent 100%)',
}

export function PageHeaderGlass({
  title,
  subtitle,
  backHref,
  onBack,
  icon,
  className,
}: PageHeaderGlassProps) {
  const hasBack = backHref != null || onBack != null
  const backContent =
    hasBack &&
    (backHref && !onBack ? (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-white/5 hover:text-text-primary"
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
        className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-white/5 hover:text-text-primary"
        aria-label="Indietro"
        onClick={onBack}
      >
        <BackIcon />
      </Button>
    ))

  return (
    <div className={cn(HEADER_CLASS, className)}>
      <div className="relative z-10 flex items-center gap-3">
        {backContent}
        {icon != null && (
          <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
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
      <div className="absolute inset-x-0 bottom-0 h-px" style={CYAN_LINE_STYLE} aria-hidden />
    </div>
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
