/**
 * 22Club Design Tokens — Focus / Accessibility
 * Ring and outline; single source for focus states.
 */

import { colors } from './colors'

export const focus = {
  ringWidth: '2px',
  ringColor: colors.primary.DEFAULT,
  ringOffset: '2px',
  ringOffsetBackground: '#ffffff',
  /** Tailwind-compatible class string for focus ring (primary teal) */
  ring: 'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none',
  /** With explicit teal for components that don't use primary utility */
  ringTeal:
    'focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none',
} as const
