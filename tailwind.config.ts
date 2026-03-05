import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import { colors, typography, radius, spacing, shadow, motion } from './src/lib/design-tokens'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Breakpoints ottimizzati per tablet 10+ landscape
    screens: {
      sm: '640px',
      md: '768px',
      'tablet-landscape': '1024px', // Tablet 10+ in orientamento orizzontale
      lg: '1280px', // Desktop standard
      xl: '1536px',
      '2xl': '1920px',
    },
    extend: {
      // 22Club Design System — from lib/design-tokens
      colors: {
        background: {
          DEFAULT: colors.background.DEFAULT,
          secondary: colors.surface[200],
          tertiary: colors.surface[300],
          elevated: colors.background.elevated,
        },
        text: {
          primary: colors.text.primary,
          secondary: colors.text.secondary,
          tertiary: colors.text.muted,
          disabled: colors.text.disabled,
        },
        brand: colors.brand,
        state: {
          valid: colors.success,
          warn: colors.warning,
          error: colors.error,
          info: colors.info,
        },
        primary: {
          DEFAULT: colors.primary.DEFAULT,
          foreground: colors.text.primary,
          hover: colors.primary.hover,
          active: colors.primary.active,
        },
        secondary: {
          DEFAULT: colors.surface[200],
          foreground: colors.text.secondary,
          hover: colors.surface[300],
          active: colors.background.elevated,
        },
        accent: {
          DEFAULT: colors.primary.DEFAULT,
          foreground: colors.background.DEFAULT,
        },
        border: {
          DEFAULT: colors.border.DEFAULT,
          light: colors.border.light,
          strong: colors.border.strong,
        },
        input: {
          DEFAULT: colors.input.DEFAULT,
          focus: colors.input.focus,
          error: colors.input.error,
        },
        card: {
          DEFAULT: colors.surface[200],
          foreground: colors.text.primary,
          hover: colors.surface[300],
        },
        popover: {
          DEFAULT: colors.surface[200],
          foreground: colors.text.primary,
        },
        muted: {
          DEFAULT: colors.surface[300],
          foreground: colors.text.secondary,
        },
        destructive: {
          DEFAULT: colors.error,
          foreground: colors.text.primary,
          hover: colors.destructive.hover,
        },
        success: {
          DEFAULT: colors.success,
          foreground: colors.text.primary,
          hover: colors.successHover,
        },
        warning: {
          DEFAULT: colors.warning,
          foreground: colors.background.DEFAULT,
          hover: colors.warningHover,
        },
        athlete: {
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          cyan: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
          },
        },
      },

      fontFamily: typography.fontFamily,

      fontSize: typography.fontSize,

      borderRadius: {
        ...radius,
      },

      spacing: {
        ...spacing,
      },

      // Grid System ottimizzato per tutti i dispositivi
      gridTemplateColumns: {
        mobile: 'repeat(4, 1fr)',
        tablet: 'repeat(8, 1fr)',
        'tablet-landscape': 'repeat(12, 1fr)', // Ottimizzato per tablet 10+ landscape
        desktop: 'repeat(16, 1fr)',
      },

      gap: {
        mobile: '16px',
        tablet: '20px',
        'tablet-landscape': '24px', // Gap intermedio per tablet landscape
        desktop: '32px',
      },

      boxShadow: {
        ...shadow,
      },

      keyframes: motion.keyframes,

      animation: motion.animation,

      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },

      // Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    // Custom plugin for 22Club utilities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function ({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.text-gradient': {
          background: 'linear-gradient(135deg, #02B3BF 0%, #27AE60 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-glass': {
          background: 'rgba(26, 31, 36, 0.8)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
        },
        '.border-gradient': {
          border: '1px solid transparent',
          background:
            'linear-gradient(#0A0F12, #0A0F12) padding-box, linear-gradient(135deg, #02B3BF, #27AE60) border-box',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}

export default config
