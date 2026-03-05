/**
 * 22Club Design Tokens — Gradients
 * Brand, glass header, card gradient; used by Tailwind plugin and components.
 */

export const gradients = {
  'brand-teal-gold': 'linear-gradient(135deg, #02B3BF 0%, #C9A227 100%)',
  'brand-teal-green': 'linear-gradient(135deg, #02B3BF 0%, #27AE60 100%)',
  /** Glass header (teal) — background */
  glassHeaderTeal: `linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.05) 100%)`,
  /** Glass header — border */
  glassHeaderBorder: '1px solid rgba(2, 179, 191, 0.4)',
  /** Glass header — boxShadow */
  glassHeaderShadow: '0 4px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(2,179,191,0.1) inset',
  /** Card gradient (athlete) */
  cardAthlete: 'linear-gradient(to bottom right, var(--tw-gradient-stops))', // use from-teal-900 to-cyan-900 in Tailwind
  /** Radial overlay for glass header */
  glassHeaderRadial: 'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)',
} as const
