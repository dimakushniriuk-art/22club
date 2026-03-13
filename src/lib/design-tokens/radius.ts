/**
 * 22Club Design Tokens — Border Radius
 * Values in px; full = 9999px.
 *
 * Uso consigliato:
 * - sm (6px): elementi molto piccoli
 * - md (12px): form controls (input, textarea, select, trigger), voci dropdown, tab trigger
 * - lg (16px): card, button, modal, dropdown panel, toast
 * - xl (24px): sezioni ampie (opzionale)
 * - 2xl (32px): hero / container molto grandi (opzionale)
 * - full: avatar, icon button, switch, pill
 */
export const radius = {
  none: '0px',
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const

/** For Tailwind borderRadius keys that need left-only etc. */
export const radiusPartial = {
  'l-xl': '12px',
} as const

export const radiusPx: Record<string, string> = {
  none: '0px',
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '12px',
  '2xl': '16px',
  'rounded-xl': '12px',
  'rounded-2xl': '16px',
  'rounded-lg': '8px',
  'rounded-l-xl': '12px',
  full: '9999px',
}
