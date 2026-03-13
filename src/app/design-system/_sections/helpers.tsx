'use client'

/** Stile card/container design system: sfondo scuro, bordo tenue, ombra, rounded-lg. Padding responsive. */
export const DS_CARD_FRAME_CLASS =
  'overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 md:p-6'

/** Stile inline code / token: bordo, sfondo scuro, mono */
export const DS_CODE_CLASS =
  'rounded border border-white/10 bg-zinc-800/90 px-1.5 py-0.5 font-mono text-xs text-text-primary'

/** Titolo sezione (h2) design system: icona + testo. Responsive. */
export const DS_SECTION_TITLE_CLASS =
  'mb-4 sm:mb-6 flex items-center gap-2 text-xl sm:text-2xl font-semibold text-text-primary'

/** Intro paragrafo sotto titolo sezione. Responsive. */
export const DS_SECTION_INTRO_CLASS = 'mb-4 sm:mb-6 text-sm text-text-secondary'

/** Sottotitolo blocco (h3). Responsive. */
export const DS_BLOCK_TITLE_CLASS = 'mb-2 sm:mb-3 text-sm font-medium text-text-secondary'

/** Label secondaria (es. "Varianti", "Dimensioni") */
export const DS_LABEL_CLASS = 'mb-2 text-xs font-medium text-text-tertiary'

export function ColorSwatch({ label, color }: { label: string; color: string }) {
  const hex = color.startsWith('#') ? color.toUpperCase() : color
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-10 w-10 rounded-lg border border-white/10 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className="font-mono text-[10px] text-text-muted">{hex}</span>
    </div>
  )
}

export function TypographySample({
  className,
  label,
  size,
  lineHeight,
}: {
  className: string
  label: string
  size: string
  lineHeight: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-2 last:border-0">
      <p className={className}>Aa</p>
      <span className="shrink-0 font-mono text-xs text-text-muted">
        {label} — {size} / {lineHeight}
      </span>
    </div>
  )
}
