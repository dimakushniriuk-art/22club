import React from 'react'

type SkeletonProps = {
  height?: number
  width?: number | string
  className?: string
  rounded?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = 80,
  width = '100%',
  className = '',
  rounded = true,
}) => (
  <div
    className={`animate-pulse bg-surface-200 ${rounded ? 'rounded-xl' : ''} ${className}`}
    style={{ height, width }}
  />
)

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 rounded-xl bg-surface-200 ${className}`}>
    <Skeleton height={20} width="60%" className="mb-2" />
    <Skeleton height={16} width="40%" className="mb-4" />
    <Skeleton height={40} width="100%" />
  </div>
)

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

/** Skeleton che mima la timeline agenda (orario + avatar + nome + descrizione) */
export const SkeletonAgendaTimeline: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`} role="status" aria-label="Caricamento agenda">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-xl p-3 bg-surface-200/80">
        <Skeleton height={40} width={40} className="shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton height={14} width={36} className="rounded" />
          <Skeleton height={16} width="70%" className="rounded" />
          <Skeleton height={12} width="50%" className="rounded" />
        </div>
      </div>
    ))}
  </div>
)

/** Skeleton che mima la griglia clienti (card avatar + nome + info) */
export const SkeletonClientiList: React.FC<{ cards?: number; className?: string }> = ({
  cards = 8,
  className = '',
}) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ${className}`}
    role="status"
    aria-label="Caricamento elenco clienti"
  >
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton height={48} width={48} className="shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1">
            <Skeleton height={16} width="70%" className="rounded" />
            <Skeleton height={12} width="50%" className="rounded" />
          </div>
        </div>
        <Skeleton height={12} width="100%" className="rounded mb-2" />
        <Skeleton height={12} width="80%" className="rounded" />
      </div>
    ))}
  </div>
)

/** Skeleton che mima la lista appuntamenti (orario + avatar + righe) */
export const SkeletonAppointmentsList: React.FC<{ rows?: number; className?: string }> = ({
  rows = 6,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} role="status" aria-label="Caricamento appuntamenti">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-lg p-4 bg-surface-200/80 border border-white/5">
        <div className="min-w-[120px] space-y-1">
          <Skeleton height={12} width={80} className="rounded" />
          <Skeleton height={18} width={100} className="rounded" />
        </div>
        <div className="h-12 w-px bg-border/30 shrink-0" />
        <div className="flex flex-1 items-center gap-3">
          <Skeleton height={40} width={40} className="rounded-full shrink-0" />
          <div className="min-w-0 flex-1 space-y-1">
            <Skeleton height={16} width="60%" className="rounded" />
            <Skeleton height={12} width="40%" className="rounded" />
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Skeleton height={36} width={36} className="rounded-full" />
          <Skeleton height={36} width={36} className="rounded-full" />
        </div>
      </div>
    ))}
  </div>
)

/** Skeleton che mima la griglia schede workout (titolo, badge, righe info) */
export const SkeletonWorkoutList: React.FC<{ cards?: number; className?: string }> = ({
  cards = 8,
  className = '',
}) => (
  <div
    className={`grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    role="status"
    aria-label="Caricamento schede"
  >
    {Array.from({ length: cards }).map((_, i) => (
      <div key={i} className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <Skeleton height={20} width="70%" className="rounded" />
          <Skeleton height={20} width={56} className="rounded-full shrink-0" />
        </div>
        <Skeleton height={14} width="90%" className="rounded mb-2" />
        <Skeleton height={14} width="60%" className="rounded mb-2" />
        <Skeleton height={14} width="80%" className="rounded mb-3" />
        <div className="flex gap-2 mt-auto pt-2">
          <Skeleton height={32} width={80} className="rounded" />
          <Skeleton height={32} width={70} className="rounded" />
        </div>
      </div>
    ))}
  </div>
)
