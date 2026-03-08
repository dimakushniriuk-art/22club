'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { gradients } from '@/lib/design-tokens'
import { Button } from '@/components/ui'

export interface PageHeaderGlassProps {
  title: string
  subtitle?: string
  backHref?: string
  onBack?: () => void
  icon?: React.ReactNode
  className?: string
}

export function PageHeaderGlass({
  title,
  subtitle,
  backHref,
  onBack,
  icon,
  className,
}: PageHeaderGlassProps) {
  const backContent =
    backHref && !onBack ? (
      <Button
        variant="ghost"
        size="sm"
        className="h-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl p-0 text-text-secondary hover:bg-primary/15 hover:text-primary"
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
        size="sm"
        className="h-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl p-0 text-text-secondary hover:bg-primary/15 hover:text-primary"
        aria-label="Indietro"
        onClick={onBack}
      >
        <BackIcon />
      </Button>
    )

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-20 overflow-hidden rounded-b-2xl p-4 backdrop-blur-xl pt-[env(safe-area-inset-top)]',
        className,
      )}
      style={{
        border: gradients.glassHeaderBorder,
        borderTop: 'none',
        background: gradients.glassHeaderTeal,
        boxShadow: gradients.glassHeaderShadow,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-b-2xl opacity-70"
        style={{ background: gradients.glassHeaderRadial }}
        aria-hidden
      />
      <div className="relative z-10 flex items-center gap-3">
        {backContent}
        {icon != null && (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: 'rgba(2, 179, 191, 0.2)',
              border: '1px solid rgba(2, 179, 191, 0.35)',
            }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-lg font-bold tracking-tight text-text-primary md:text-xl">
            {title}
          </h4>
          {subtitle != null && (
            <p className="truncate text-xs text-text-tertiary">{subtitle}</p>
          )}
        </div>
      </div>
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
