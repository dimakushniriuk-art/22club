'use client'

export function ColorSwatch({ label, color }: { label: string; color: string }) {
  const hex = color.startsWith('#') ? color.toUpperCase() : color
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="h-10 w-10 rounded-xl border border-border/70 shadow-sm"
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
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 pb-2 last:border-0">
      <p className={className}>Aa</p>
      <span className="shrink-0 font-mono text-xs text-text-muted">
        {label} — {size} / {lineHeight}
      </span>
    </div>
  )
}
