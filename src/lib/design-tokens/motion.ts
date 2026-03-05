/**
 * 22Club Design Tokens — Motion
 * Durations, easing, keyframes names.
 */

export const motion = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
  keyframes: {
    'fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    'fade-out': {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    'slide-in-up': {
      '0%': { transform: 'translateY(100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'slide-in-down': {
      '0%': { transform: 'translateY(-100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'scale-in': {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    'pulse-glow': {
      '0%, 100%': { boxShadow: '0 0 20px rgba(2, 179, 191, 0.3)' },
      '50%': { boxShadow: '0 0 40px rgba(2, 179, 191, 0.6)' },
    },
    'slide-in-left': {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    'slide-in-right': {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    'accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    'accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: '0' },
    },
  },
  animation: {
    'fade-in': 'fade-in 0.2s ease-out',
    'fade-out': 'fade-out 0.2s ease-out',
    'slide-in-up': 'slide-in-up 0.3s ease-out',
    'slide-in-down': 'slide-in-down 0.3s ease-out',
    'scale-in': 'scale-in 0.2s ease-out',
    'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    'slide-in-left': 'slide-in-left 0.3s ease-out',
    'slide-in-right': 'slide-in-right 0.3s ease-out',
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
  },
} as const
