'use client'

import Link from 'next/link'

export function ExerciseExecutionExpand({
  description,
  detailHref,
}: {
  description: string
  detailHref: string | null
}) {
  return (
    <div
      className="mt-3 space-y-3 border-t border-white/10 pt-3"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <section className="space-y-1.5 sm:space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary sm:text-sm">
          Esecuzione
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary sm:text-base">
          {description}
        </p>
      </section>
      {detailHref ? (
        <Link
          href={detailHref}
          prefetch={true}
          className="inline-flex min-h-[44px] touch-manipulation items-center text-xs font-medium text-cyan-400 hover:text-cyan-300"
          onClick={(e) => e.stopPropagation()}
        >
          Video e scheda completa →
        </Link>
      ) : null}
    </div>
  )
}
