import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import { designSystem } from './src/config/design-system'

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
      // 22Club Design System - Centralized Tokens
      colors: {
        ...designSystem.colors,
        // Background Colors
        background: {
          DEFAULT: designSystem.colors.background.DEFAULT,
          secondary: designSystem.colors.surface[200],
          tertiary: designSystem.colors.surface[300],
          elevated: designSystem.colors.background.elevated,
        },

        // Text Colors
        text: {
          primary: designSystem.colors.text.primary,
          secondary: designSystem.colors.text.secondary,
          tertiary: designSystem.colors.text.muted,
          disabled: '#4B5563',
        },

        // Brand Colors
        brand: {
          DEFAULT: designSystem.colors.primary.DEFAULT,
          50: '#E6F9FA',
          100: '#CCF3F5',
          200: '#99E7EB',
          300: '#66DBE1',
          400: '#33CFD7',
          500: designSystem.colors.primary.DEFAULT,
          600: designSystem.colors.primary.active,
          700: '#016B73',
          800: '#01474D',
          900: '#002326',
        },

        // State Colors
        state: {
          valid: designSystem.colors.success,
          warn: designSystem.colors.warning,
          error: designSystem.colors.error,
          info: '#3498DB',
        },

        // Semantic Colors
        primary: {
          DEFAULT: designSystem.colors.primary.DEFAULT,
          foreground: designSystem.colors.text.primary,
          hover: designSystem.colors.primary.hover,
          active: designSystem.colors.primary.active,
        },

        secondary: {
          DEFAULT: designSystem.colors.surface[200],
          foreground: designSystem.colors.text.secondary,
          hover: designSystem.colors.surface[300],
          active: designSystem.colors.background.elevated,
        },

        accent: {
          DEFAULT: designSystem.colors.primary.DEFAULT,
          foreground: designSystem.colors.background.DEFAULT,
        },

        // UI Colors
        border: {
          DEFAULT: designSystem.colors.surface[300],
          light: designSystem.colors.background.elevated,
          strong: '#4A4F54',
        },

        input: {
          DEFAULT: designSystem.colors.surface[200],
          focus: designSystem.colors.surface[300],
          error: designSystem.colors.error,
        },

        card: {
          DEFAULT: designSystem.colors.surface[200],
          foreground: designSystem.colors.text.primary,
          hover: designSystem.colors.surface[300],
        },

        popover: {
          DEFAULT: designSystem.colors.surface[200],
          foreground: designSystem.colors.text.primary,
        },

        muted: {
          DEFAULT: designSystem.colors.surface[300],
          foreground: designSystem.colors.text.secondary,
        },

        destructive: {
          DEFAULT: designSystem.colors.error,
          foreground: designSystem.colors.text.primary,
          hover: '#E74C3C',
        },

        success: {
          DEFAULT: designSystem.colors.success,
          foreground: designSystem.colors.text.primary,
          hover: '#229954',
        },

        warning: {
          DEFAULT: designSystem.colors.warning,
          foreground: designSystem.colors.background.DEFAULT,
          hover: '#F1C40F',
        },

        // Athlete Account Colors - Teal/Cyan Theme
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

      // Typography
      fontFamily: {
        ...designSystem.fontFamily,
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      // Border Radius - Apple Style
      borderRadius: {
        ...designSystem.radius,
        full: '9999px',
      },

      // Spacing
      spacing: {
        ...designSystem.spacing,
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
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

      // Shadows
      boxShadow: {
        ...designSystem.shadows,
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(2, 179, 191, 0.4)',
      },

      // Animations
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
