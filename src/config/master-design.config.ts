/**
 * 🎨 UNIFIED DESIGN SYSTEM - 22CLUB
 * ===================================
 * Sistema di design completo e modulare per tutti gli ambienti del progetto 22Club.
 * Include token per colori, layout, tipografia, animazioni, breakpoint e componenti.
 * Progettato per ruoli distinti: atleta, trainer, admin, homepage, auth.
 *
 * ⚠️ IMPORTANTE: Tutte le modifiche di design devono passare da qui
 * per garantire consistenza globale e facilità di manutenzione.
 */

import { roleThemes } from '@/lib/design-tokens'

// =====================================================
// 🎨 COLORI BASE SEMANTICI - DESIGN TOKENS
// =====================================================

export const colorTokens = {
  text: {
    primary: 'text-white',
    secondary: 'text-gray-400',
    tertiary: 'text-gray-600',
    brand: 'text-cyan-400',
    danger: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  },
  background: {
    base: 'bg-black',
    card: 'bg-zinc-900/80',
    elevated: 'bg-zinc-800/90',
    glass: 'bg-white/5 backdrop-blur-md',
    secondary: 'bg-background-secondary',
    tertiary: 'bg-background-tertiary',
  },
  border: {
    base: 'border-zinc-700',
    accent: 'border-cyan-500',
    light: 'border-zinc-600',
    dark: 'border-zinc-800',
  },
  brand: {
    default: 'text-cyan-400',
    bg: 'bg-cyan-500',
    hover: 'hover:bg-cyan-600',
    ring: 'ring-cyan-500',
  },
} as const

// =====================================================
// 🧱 LAYOUT SYSTEM - DESIGN TOKENS
// =====================================================

export const layoutTokens = {
  container: 'min-h-dvh bg-black pb-24',
  content:
    'px-4 py-4 sm:px-6 sm:py-6 tablet-landscape:px-8 tablet-landscape:py-8 max-w-6xl mx-auto space-y-6',
  sectionSpacing: 'space-y-4 tablet-landscape:space-y-6',
  cardPadding: 'p-4 sm:p-5 tablet-landscape:p-6 lg:p-8',
  grid: {
    twoCols: 'grid grid-cols-1 tablet-landscape:grid-cols-2 gap-4 tablet-landscape:gap-6',
    threeCols:
      'grid grid-cols-1 tablet-landscape:grid-cols-2 lg:grid-cols-3 gap-4 tablet-landscape:gap-6',
    fourCols:
      'grid grid-cols-1 tablet-landscape:grid-cols-2 lg:grid-cols-4 gap-4 tablet-landscape:gap-6',
    // Grid specifici per tablet landscape
    tabletOptimal:
      'grid grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3 lg:grid-cols-4 gap-4 tablet-landscape:gap-6',
  },
} as const

// =====================================================
// 🔤 TYPOGRAFIA - DESIGN TOKENS
// =====================================================

export const typographyTokens = {
  h1: 'text-white text-3xl tablet-landscape:text-4xl font-bold',
  h2: 'text-white text-2xl tablet-landscape:text-3xl font-semibold',
  h3: 'text-white text-xl tablet-landscape:text-2xl font-medium',
  h4: 'text-white text-lg tablet-landscape:text-xl font-medium',
  paragraph: 'text-gray-300 text-base tablet-landscape:text-lg',
  small: 'text-gray-400 text-sm tablet-landscape:text-base',
  tiny: 'text-gray-500 text-xs tablet-landscape:text-sm',
  link: 'text-cyan-400 hover:text-cyan-300 transition-colors',
  accent: 'text-cyan-400 font-medium tablet-landscape:text-lg',
  // Tipografia specifica per tablet landscape
  heroTablet: 'text-white text-4xl tablet-landscape:text-5xl font-bold',
  cardTitle: 'text-white text-lg tablet-landscape:text-xl font-semibold',
  cardDescription: 'text-gray-400 text-sm tablet-landscape:text-base',
} as const

// =====================================================
// ✨ ANIMAZIONI E TRANSIZIONI - DESIGN TOKENS
// =====================================================

export const animationTokens = {
  base: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  hover: 'hover:shadow-lg hover:scale-[1.02]',
  hoverSmall: 'hover:scale-[1.05]',
  focus:
    'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black',
  loading: 'animate-pulse',
  spin: 'animate-spin',
} as const

// =====================================================
// 📱 BREAKPOINTS & RESPONSIVE - DESIGN TOKENS
// =====================================================

export const responsiveTokens = {
  mobile: 'sm:',
  tablet: 'md:',
  tabletLandscape: 'tablet-landscape:', // Nuovo breakpoint per tablet 10+ landscape
  desktop: 'lg:',
  wide: 'xl:',
  ultra: '2xl:',
  hideMobile: 'hidden sm:block',
  showMobile: 'block sm:hidden',
  hideTablet: 'hidden tablet-landscape:block',
  showTablet: 'block tablet-landscape:hidden',
  // Utilities per ottimizzazione tablet landscape
  tabletOptimal: 'tablet-landscape:',
  tabletGrid: 'grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3',
} as const

// =====================================================
// 🧩 COMPONENTI - DESIGN TOKENS
// =====================================================

export const componentTokens = {
  card: {
    base: `${colorTokens.background.card} ${colorTokens.border.base} border rounded-2xl shadow-sm ${layoutTokens.cardPadding}`,
    elevated: `${colorTokens.background.elevated} shadow-lg tablet-landscape:shadow-xl`,
    interactive:
      'hover:shadow-md hover:scale-[1.02] tablet-landscape:hover:scale-[1.01] transition-all duration-200',
    glass: `${colorTokens.background.glass}`,
    // Variante ottimizzata per tablet landscape
    tabletOptimal: `${colorTokens.background.card} ${colorTokens.border.base} border rounded-2xl shadow-sm p-4 tablet-landscape:p-6 tablet-landscape:rounded-3xl`,
  },
  button: {
    primary:
      'bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 tablet-landscape:py-3 tablet-landscape:px-6 rounded-full transition-all duration-200',
    secondary:
      'border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 py-2 px-4 tablet-landscape:py-3 tablet-landscape:px-6 rounded-full transition-all duration-200',
    ghost:
      'text-cyan-400 hover:bg-cyan-500/10 py-2 px-4 tablet-landscape:py-3 tablet-landscape:px-6 rounded-full transition-all duration-200',
    link: 'text-cyan-400 hover:text-cyan-300 transition-colors duration-200',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    // Variante ottimizzata per tablet landscape
    tabletLarge:
      'bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 px-6 tablet-landscape:py-4 tablet-landscape:px-8 tablet-landscape:text-lg rounded-full transition-all duration-200',
  },
  badge: {
    success:
      'bg-green-500 text-white text-xs tablet-landscape:text-sm px-2 py-1 tablet-landscape:px-3 tablet-landscape:py-1.5 rounded-full font-medium',
    warning:
      'bg-yellow-500 text-black text-xs tablet-landscape:text-sm px-2 py-1 tablet-landscape:px-3 tablet-landscape:py-1.5 rounded-full font-medium',
    error:
      'bg-red-500 text-white text-xs tablet-landscape:text-sm px-2 py-1 tablet-landscape:px-3 tablet-landscape:py-1.5 rounded-full font-medium',
    info: 'bg-blue-500 text-white text-xs tablet-landscape:text-sm px-2 py-1 tablet-landscape:px-3 tablet-landscape:py-1.5 rounded-full font-medium',
  },
} as const

// =====================================================
// 🔧 UTILITIES - HELPER FUNCTIONS
// =====================================================

export const utils = {
  combine: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
}

// =====================================================
// 🎨 COLOR PALETTE - ACCOUNT SPECIFIC (LEGACY SUPPORT)
// =====================================================

export const masterColors = {
  // Background principale (comune a tutti)
  background: {
    primary: 'bg-black', // Sfondo principale sempre nero
    secondary: 'bg-background-secondary', // Sfondo card
    tertiary: 'bg-background-tertiary', // Sfondo hover
    elevated: 'bg-background-elevated', // Sfondo card elevate
    glass: 'bg-glass', // Effetto vetro
  },

  // =====================================================
  // 🏠 HOMEPAGE & LANDING
  // =====================================================
  homepage: {
    hero: {
      background: 'bg-gradient-to-br from-gray-900 via-black to-gray-800',
      text: 'text-white',
      accent: 'text-brand',
    },
    features: {
      card: 'bg-background-secondary border border-border',
      icon: 'text-brand',
      title: 'text-text-primary',
      description: 'text-text-secondary',
    },
    cta: {
      primary: 'bg-brand text-white hover:bg-brand-hover',
      secondary: 'border border-brand text-brand hover:bg-brand/10',
    },
  },

  // =====================================================
  // 👤 ATHLETE ACCOUNT - from roleThemes
  // =====================================================
  athlete: {
    gradient: {
      primary: roleThemes.athlete.gradientPrimary,
      subtle: 'bg-gradient-to-br from-teal-800/80 to-cyan-800/80',
      intense: 'bg-gradient-to-br from-teal-700 to-cyan-700',
      hover: roleThemes.athlete.gradientHover,
    },
    border: {
      primary: roleThemes.athlete.borderPrimary,
      secondary: 'border-teal-600/40',
      accent: roleThemes.athlete.borderAccent,
    },
    text: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      tertiary: 'text-text-tertiary',
      accent: roleThemes.athlete.textAccent,
      accentHover: roleThemes.athlete.textAccentHover,
    },
    button: {
      primary: roleThemes.athlete.buttonPrimary,
      secondary: roleThemes.athlete.buttonSecondary,
      ghost: roleThemes.athlete.buttonGhost,
      link: `${roleThemes.athlete.textAccent} ${roleThemes.athlete.textAccentHover}`,
    },
    badge: {
      active: 'bg-green-500 text-white',
      pending: 'bg-yellow-500 text-black',
      completed: 'bg-blue-500 text-white',
      cancelled: 'bg-red-500 text-white',
    },
    icon: {
      primary: roleThemes.athlete.textAccent,
      secondary: roleThemes.athlete.textAccentHover,
      accent: 'text-cyan-400',
    },
  },

  // =====================================================
  // 🏋️ PERSONAL TRAINER ACCOUNT - from roleThemes
  // =====================================================
  trainer: {
    gradient: {
      primary: roleThemes.trainer.gradientPrimary,
      subtle: 'bg-gradient-to-br from-blue-800/80 to-indigo-800/80',
      intense: 'bg-gradient-to-br from-blue-700 to-indigo-700',
      hover: roleThemes.trainer.gradientHover,
    },
    border: {
      primary: roleThemes.trainer.borderPrimary,
      secondary: 'border-blue-600/40',
      accent: roleThemes.trainer.borderAccent,
    },
    text: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      tertiary: 'text-text-tertiary',
      accent: roleThemes.trainer.textAccent,
      accentHover: roleThemes.trainer.textAccentHover,
    },
    button: {
      primary: roleThemes.trainer.buttonPrimary,
      secondary: roleThemes.trainer.buttonSecondary,
      ghost: roleThemes.trainer.buttonGhost,
      link: `${roleThemes.trainer.textAccent} ${roleThemes.trainer.textAccentHover}`,
    },
    badge: {
      active: 'bg-green-500 text-white',
      pending: 'bg-yellow-500 text-black',
      completed: 'bg-blue-500 text-white',
      cancelled: 'bg-red-500 text-white',
    },
    icon: {
      primary: roleThemes.trainer.textAccent,
      secondary: roleThemes.trainer.textAccentHover,
      accent: 'text-indigo-400',
    },
  },

  // =====================================================
  // 👨‍💼 ADMIN ACCOUNT - from roleThemes
  // =====================================================
  admin: {
    gradient: {
      primary: roleThemes.admin.gradientPrimary,
      subtle: 'bg-gradient-to-br from-gray-700/80 to-purple-800/80',
      intense: 'bg-gradient-to-br from-gray-600 to-purple-700',
      hover: roleThemes.admin.gradientHover,
    },
    border: {
      primary: roleThemes.admin.borderPrimary,
      secondary: 'border-gray-600/40',
      accent: roleThemes.admin.borderAccent,
    },
    text: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      tertiary: 'text-text-tertiary',
      accent: roleThemes.admin.textAccent,
      accentHover: roleThemes.admin.textAccentHover,
    },
    button: {
      primary: roleThemes.admin.buttonPrimary,
      secondary: roleThemes.admin.buttonSecondary,
      ghost: roleThemes.admin.buttonGhost,
      link: `${roleThemes.admin.textAccent} ${roleThemes.admin.textAccentHover}`,
    },
    badge: {
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-black',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
    },
    icon: {
      primary: roleThemes.admin.textAccent,
      secondary: roleThemes.admin.textAccentHover,
      accent: 'text-gray-400',
    },
  },

  // =====================================================
  // 🔐 AUTHENTICATION PAGES
  // =====================================================
  auth: {
    background: 'bg-black',
    card: 'bg-slate-900/95 border-slate-700 shadow-2xl',
    input:
      'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500',
    button: {
      primary: 'bg-cyan-500 hover:bg-cyan-600 text-white',
      secondary: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-slate-400',
      accent: 'text-cyan-400',
      error: 'text-red-500',
    },
    logo: {
      main: 'text-6xl font-bold text-white',
      subtitle: 'text-white text-sm tracking-widest',
      brand: 'text-2xl text-cyan-400 font-serif italic',
    },
  },

  // =====================================================
  // 🎯 UI COMPONENTS - COMMON
  // =====================================================
  ui: {
    // Stati comuni
    state: {
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-black',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
    },

    // Colori per notifiche
    notification: {
      workout: 'text-teal-400',
      appointment: 'text-blue-400',
      progress: 'text-green-400',
      document: 'text-yellow-400',
      payment: 'text-cyan-400',
    },

    // Colori per progress bar
    progress: {
      positive: 'bg-green-500',
      negative: 'bg-red-500',
      neutral: 'bg-gray-500',
    },
  },
} as const

// =====================================================
// 🏗️ LAYOUT SYSTEM - COMPLETE
// =====================================================

export const masterLayout = {
  // Container principale (comune a tutti)
  container: 'min-h-dvh bg-black pb-24',
  content: 'space-y-6 px-4 py-4 sm:px-6 sm:py-6 max-w-4xl mx-auto',

  // =====================================================
  // 🏠 HOMEPAGE LAYOUT
  // =====================================================
  homepage: {
    hero: 'min-h-dvh flex items-center justify-center',
    section: 'py-16 px-4 sm:px-6 lg:px-8',
    container: 'max-w-7xl mx-auto',
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
  },

  // =====================================================
  // 👤 ATHLETE LAYOUT
  // =====================================================
  athlete: {
    container: 'min-h-dvh bg-black pb-24',
    content:
      'space-y-6 px-4 py-4 sm:px-6 sm:py-6 tablet-landscape:px-8 tablet-landscape:py-8 max-w-4xl tablet-landscape:max-w-5xl mx-auto',
    grid: {
      stats: 'grid grid-cols-1 gap-4 tablet-landscape:grid-cols-2 tablet-landscape:gap-6',
      cards: 'space-y-4 tablet-landscape:space-y-6',
      sections: 'space-y-6 tablet-landscape:space-y-8',
    },
    spacing: {
      section: 'space-y-4 tablet-landscape:space-y-6',
      card: 'space-y-3 tablet-landscape:space-y-4',
      content: 'space-y-2 tablet-landscape:space-y-3',
      cardPadding: 'p-4 sm:p-5 tablet-landscape:p-6',
    },
  },

  // =====================================================
  // 🏋️ TRAINER LAYOUT
  // =====================================================
  trainer: {
    container: 'min-h-dvh bg-black pb-24 tablet-landscape:pb-32',
    content:
      'space-y-6 px-4 py-4 sm:px-6 sm:py-6 tablet-landscape:px-8 tablet-landscape:py-8 max-w-6xl tablet-landscape:max-w-7xl mx-auto',
    grid: {
      stats:
        'grid grid-cols-1 gap-4 tablet-landscape:grid-cols-2 lg:grid-cols-3 tablet-landscape:gap-6',
      cards: 'space-y-4 tablet-landscape:space-y-6',
      sections: 'space-y-6 tablet-landscape:space-y-8',
    },
    spacing: {
      section: 'space-y-4 tablet-landscape:space-y-6',
      card: 'space-y-3 tablet-landscape:space-y-4',
      content: 'space-y-2 tablet-landscape:space-y-3',
      cardPadding: 'p-4 sm:p-5 tablet-landscape:p-6 lg:p-8',
    },
  },

  // =====================================================
  // 👨‍💼 ADMIN LAYOUT
  // =====================================================
  admin: {
    container: 'min-h-dvh bg-black',
    sidebar: 'fixed left-0 top-0 h-full w-64 bg-background-secondary border-r border-border',
    main: 'ml-64 flex-1 p-6',
    content: 'max-w-7xl mx-auto',
    grid: {
      stats: 'grid grid-cols-1 gap-4 lg:grid-cols-4',
      cards: 'space-y-4',
      sections: 'space-y-6',
    },
    spacing: {
      section: 'space-y-4',
      card: 'space-y-3',
      content: 'space-y-2',
      cardPadding: 'p-6',
    },
  },

  // =====================================================
  // 🔐 AUTH LAYOUT
  // =====================================================
  auth: {
    container: 'min-h-dvh bg-black flex items-center justify-center p-4 relative overflow-hidden',
    card: 'w-full max-w-md bg-slate-900/95 border-slate-700 shadow-2xl',
    content: 'p-8',
    grid: 'grid grid-cols-2 gap-4',
    spacing: 'space-y-6',
  },

  // =====================================================
  // 📱 TAB BAR (comune a tutti gli account)
  // =====================================================
  tabBar: {
    container: 'fixed bottom-0 left-0 right-0 z-50 border-t border-border shadow-lg',
    background: 'bg-background-secondary',
    item: 'flex flex-col items-center justify-center px-1 py-2 sm:py-3 text-xs font-medium transition-all duration-200 min-h-[60px] sm:min-h-[72px]',
    active: 'text-brand bg-background-tertiary border-t-2 border-brand',
    inactive:
      'text-gray-600 hover:text-gray-900 hover:bg-background-tertiary active:bg-background-secondary',
    focus:
      'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75 focus:ring-offset-2 focus:ring-offset-white',
  },
} as const

// =====================================================
// 🎭 COMPONENTI CARD - BY ACCOUNT TYPE
// =====================================================

export const masterCards = {
  // =====================================================
  // 👤 ATHLETE CARDS
  // =====================================================
  athlete: {
    base: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary}`,
    workout: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary} hover:shadow-md transition-shadow`,
    progress: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary}`,
    appointment: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary}`,
    notification: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary}`,
    lesson: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary}`,
    elevated: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary} shadow-lg`,
    interactive: `${masterColors.athlete.gradient.primary} ${masterColors.athlete.border.primary} hover:shadow-md hover:scale-[1.02] transition-all duration-200`,
  },

  // =====================================================
  // 🏋️ TRAINER CARDS
  // =====================================================
  trainer: {
    base: `${masterColors.trainer.gradient.primary} ${masterColors.trainer.border.primary}`,
    client: `${masterColors.trainer.gradient.primary} ${masterColors.trainer.border.primary} hover:shadow-md transition-shadow`,
    workout: `${masterColors.trainer.gradient.primary} ${masterColors.trainer.border.primary}`,
    schedule: `${masterColors.trainer.gradient.primary} ${masterColors.trainer.border.primary}`,
    analytics: `${masterColors.trainer.gradient.primary} ${masterColors.trainer.border.primary}`,
    elevated: `${masterColors.trainer.gradient.primary} ${masterColors.trainer.border.primary} shadow-lg`,
    interactive: `${masterColors.trainer.gradient.primary} ${masterColors.trainer.border.primary} hover:shadow-md hover:scale-[1.02] transition-all duration-200`,
  },

  // =====================================================
  // 👨‍💼 ADMIN CARDS
  // =====================================================
  admin: {
    base: `${masterColors.admin.gradient.primary} ${masterColors.admin.border.primary}`,
    dashboard: `${masterColors.admin.gradient.primary} ${masterColors.admin.border.primary} hover:shadow-md transition-shadow`,
    user: `${masterColors.admin.gradient.primary} ${masterColors.admin.border.primary}`,
    analytics: `${masterColors.admin.gradient.primary} ${masterColors.admin.border.primary}`,
    settings: `${masterColors.admin.gradient.primary} ${masterColors.admin.border.primary}`,
    elevated: `${masterColors.admin.gradient.primary} ${masterColors.admin.border.primary} shadow-lg`,
    interactive: `${masterColors.admin.gradient.primary} ${masterColors.admin.border.primary} hover:shadow-md hover:scale-[1.02] transition-all duration-200`,
  },

  // =====================================================
  // 🏠 HOMEPAGE CARDS
  // =====================================================
  homepage: {
    feature: `${masterColors.homepage.features.card} hover:shadow-lg transition-shadow`,
    testimonial: `${masterColors.homepage.features.card} hover:shadow-lg transition-shadow`,
    pricing: `${masterColors.homepage.features.card} hover:shadow-lg transition-shadow`,
  },

  // =====================================================
  // 🔐 AUTH CARDS
  // =====================================================
  auth: {
    login: `${masterColors.auth.card}`,
    register: `${masterColors.auth.card}`,
    forgot: `${masterColors.auth.card}`,
  },
} as const

// =====================================================
// 🎯 BOTTONI - BY ACCOUNT TYPE
// =====================================================

export const masterButtons = {
  // =====================================================
  // 👤 ATHLETE BUTTONS
  // =====================================================
  athlete: {
    primary: `${masterColors.athlete.button.primary} font-medium transition-all duration-200`,
    primaryLarge: `${masterColors.athlete.button.primary} font-medium py-3 text-base transition-all duration-200`,
    secondary: `${masterColors.athlete.button.secondary} font-medium transition-all duration-200`,
    ghost: `${masterColors.athlete.button.ghost} font-medium transition-all duration-200`,
    link: `${masterColors.athlete.button.link} font-medium transition-all duration-200`,
    icon: `${masterColors.athlete.button.ghost} p-2 rounded-full transition-all duration-200`,
  },

  // =====================================================
  // 🏋️ TRAINER BUTTONS
  // =====================================================
  trainer: {
    primary: `${masterColors.trainer.button.primary} font-medium transition-all duration-200`,
    primaryLarge: `${masterColors.trainer.button.primary} font-medium py-3 text-base transition-all duration-200`,
    secondary: `${masterColors.trainer.button.secondary} font-medium transition-all duration-200`,
    ghost: `${masterColors.trainer.button.ghost} font-medium transition-all duration-200`,
    link: `${masterColors.trainer.button.link} font-medium transition-all duration-200`,
    icon: `${masterColors.trainer.button.ghost} p-2 rounded-full transition-all duration-200`,
  },

  // =====================================================
  // 👨‍💼 ADMIN BUTTONS
  // =====================================================
  admin: {
    primary: `${masterColors.admin.button.primary} font-medium transition-all duration-200`,
    primaryLarge: `${masterColors.admin.button.primary} font-medium py-3 text-base transition-all duration-200`,
    secondary: `${masterColors.admin.button.secondary} font-medium transition-all duration-200`,
    ghost: `${masterColors.admin.button.ghost} font-medium transition-all duration-200`,
    link: `${masterColors.admin.button.link} font-medium transition-all duration-200`,
    icon: `${masterColors.admin.button.ghost} p-2 rounded-full transition-all duration-200`,
  },

  // =====================================================
  // 🏠 HOMEPAGE BUTTONS
  // =====================================================
  homepage: {
    primary: `${masterColors.homepage.cta.primary} font-medium transition-all duration-200`,
    secondary: `${masterColors.homepage.cta.secondary} font-medium transition-all duration-200`,
  },

  // =====================================================
  // 🔐 AUTH BUTTONS
  // =====================================================
  auth: {
    primary: `${masterColors.auth.button.primary} font-medium transition-all duration-200`,
    secondary: `${masterColors.auth.button.secondary} font-medium transition-all duration-200`,
  },

  // =====================================================
  // 🎯 COMMON BUTTON STATES
  // =====================================================
  states: {
    loading: 'opacity-50 cursor-not-allowed',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
  },
} as const

// =====================================================
// 📱 RESPONSIVE BREAKPOINTS - COMPLETE
// =====================================================

export const masterBreakpoints = {
  // Mobile first approach
  mobile: 'sm:', // 640px+
  tablet: 'md:', // 768px+
  tabletLandscape: 'tablet-landscape:', // 1024px+ - Tablet 10+ landscape
  desktop: 'lg:', // 1280px+
  wide: 'xl:', // 1536px+
  ultra: '2xl:', // 1920px+

  // Utility per responsive
  hideOnMobile: 'hidden sm:block',
  showOnMobile: 'block sm:hidden',
  hideOnTablet: 'hidden tablet-landscape:block',
  showOnTablet: 'block tablet-landscape:hidden',
  fullWidth: 'w-full',
  responsiveGrid: 'grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3 lg:grid-cols-4',
  responsiveGrid4: 'grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3 lg:grid-cols-4',
  // Grids ottimizzati per tablet landscape
  tabletGrid2: 'grid-cols-1 tablet-landscape:grid-cols-2',
  tabletGrid3: 'grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3',
} as const

// =====================================================
// 🎨 ANIMAZIONI & TRANSIZIONI - COMPLETE
// =====================================================

export const masterAnimations = {
  // Transizioni base
  transition: 'transition-all duration-200',
  transitionSlow: 'transition-all duration-300',
  transitionFast: 'transition-all duration-150',

  // Hover effects
  hover: {
    scale: 'hover:scale-[1.02]',
    scaleSmall: 'hover:scale-[1.05]',
    lift: 'hover:shadow-md hover:-translate-y-1',
    glow: 'hover:shadow-[0_0_10px_rgba(2,179,191,0.3)]',
  },

  // Focus effects (token: primary, ring-offset-background)
  focus: {
    ring: 'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
    outline: 'focus:outline-none',
  },

  // Loading animations
  loading: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
  },

  // Entrance animations
  entrance: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-in-up',
    slideDown: 'animate-slide-in-down',
    scaleIn: 'animate-scale-in',
  },
} as const

// =====================================================
// 🎯 TIPOGRAFIA - COMPLETE SYSTEM
// =====================================================

export const masterTypography = {
  // =====================================================
  // 📝 HEADING STYLES
  // =====================================================
  h1: 'text-text-primary text-3xl font-bold mb-2',
  h2: 'text-text-primary mb-2 text-2xl font-semibold',
  h3: 'text-text-primary mb-2 text-xl font-semibold',
  h4: 'text-text-primary mb-2 text-lg font-medium',
  h5: 'text-text-primary mb-2 text-base font-medium',
  h6: 'text-text-primary mb-2 text-sm font-medium',

  // =====================================================
  // 📄 BODY TEXT
  // =====================================================
  body: 'text-text-primary',
  bodySecondary: 'text-text-secondary',
  bodySmall: 'text-text-secondary text-sm',
  bodyLarge: 'text-text-primary text-lg',

  // =====================================================
  // 🎨 SPECIAL TEXT
  // =====================================================
  accent: 'text-brand font-medium',
  muted: 'text-text-tertiary text-xs',
  error: 'text-red-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',

  // =====================================================
  // 🔗 INTERACTIVE TEXT
  // =====================================================
  link: 'text-brand hover:text-brand-hover font-medium transition-colors duration-200',
  linkSecondary:
    'text-text-secondary hover:text-text-primary font-medium transition-colors duration-200',

  // =====================================================
  // 📱 RESPONSIVE TEXT
  // =====================================================
  responsive: {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base lg:text-lg',
  },
} as const

// =====================================================
// 🔧 UTILITY FUNCTIONS - COMPLETE
// =====================================================

/**
 * Combina classi CSS in modo sicuro
 */
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Applica il design system a una card per account specifico
 */
export const getCardClasses = (
  accountType: 'athlete' | 'trainer' | 'admin' | 'homepage' | 'auth',
  variant: string = 'base',
): string => {
  const accountCards = masterCards[accountType] as Record<string, string> | undefined
  const cardVariant = accountCards?.[variant] || accountCards?.base || ''
  return combineClasses(cardVariant, masterAnimations.transition)
}

/**
 * Applica il design system a un bottone per account specifico
 */
export const getButtonClasses = (
  accountType: 'athlete' | 'trainer' | 'admin' | 'homepage' | 'auth',
  variant: string = 'primary',
): string => {
  const accountButtons = masterButtons[accountType] as Record<string, string> | undefined
  const buttonVariant = accountButtons?.[variant] || accountButtons?.primary || ''
  return combineClasses(buttonVariant, masterAnimations.transition)
}

/**
 * Ottiene il layout per account specifico
 */
export const getLayoutClasses = (
  accountType: 'athlete' | 'trainer' | 'admin' | 'homepage' | 'auth',
  element: string,
): string => {
  const accountLayout = masterLayout[accountType] as Record<string, string> | undefined
  return accountLayout?.[element] || ''
}

/**
 * Ottiene i colori per account specifico
 */
export const getAccountColors = (accountType: 'athlete' | 'trainer' | 'admin') => {
  return masterColors[accountType]
}

/**
 * Ottiene il gradiente principale per account specifico
 */
export const getPrimaryGradient = (accountType: 'athlete' | 'trainer' | 'admin') => {
  return masterColors[accountType].gradient.primary
}

/**
 * Ottiene il tema completo per account specifico
 */
export const getAccountTheme = (accountType: 'athlete' | 'trainer' | 'admin') => {
  return {
    colors: masterColors[accountType],
    layout: masterLayout[accountType],
    cards: masterCards[accountType],
    buttons: masterButtons[accountType],
    typography: masterTypography,
    animations: masterAnimations,
    breakpoints: masterBreakpoints,
  }
}

/**
 * Ottiene il tema completo del progetto
 */
export const getMasterTheme = () => {
  return {
    colors: masterColors,
    layout: masterLayout,
    cards: masterCards,
    buttons: masterButtons,
    typography: masterTypography,
    animations: masterAnimations,
    breakpoints: masterBreakpoints,
  }
}

// =====================================================
// 🎨 ACCOUNT-SPECIFIC SHORTCUTS
// =====================================================

// Shortcuts per atleta (backward compatibility)
export const athleteTheme = getAccountTheme('athlete')
export const getAthleteCardClasses = (variant: string = 'base') =>
  getCardClasses('athlete', variant)
export const getAthleteButtonClasses = (variant: string = 'primary') =>
  getButtonClasses('athlete', variant)

// Shortcuts per trainer
export const trainerTheme = getAccountTheme('trainer')
export const getTrainerCardClasses = (variant: string = 'base') =>
  getCardClasses('trainer', variant)
export const getTrainerButtonClasses = (variant: string = 'primary') =>
  getButtonClasses('trainer', variant)

// Shortcuts per admin
export const adminTheme = getAccountTheme('admin')
export const getAdminCardClasses = (variant: string = 'base') => getCardClasses('admin', variant)
export const getAdminButtonClasses = (variant: string = 'primary') =>
  getButtonClasses('admin', variant)

// Shortcuts per homepage
export const getHomepageCardClasses = (variant: string = 'feature') =>
  getCardClasses('homepage', variant)
export const getHomepageButtonClasses = (variant: string = 'primary') =>
  getButtonClasses('homepage', variant)

// Shortcuts per auth
export const getAuthCardClasses = (variant: string = 'login') => getCardClasses('auth', variant)
export const getAuthButtonClasses = (variant: string = 'primary') =>
  getButtonClasses('auth', variant)

// =====================================================
// 🌈 UNIFIED DESIGN SYSTEM EXPORT
// =====================================================

export const unifiedDesignSystem = {
  // Design Tokens (nuovo sistema semplificato)
  colors: colorTokens,
  layout: layoutTokens,
  typography: typographyTokens,
  animations: animationTokens,
  responsive: responsiveTokens,
  components: componentTokens,
  utils,
} as const

// =====================================================
// 🎨 EXPORT PRINCIPALE (LEGACY + NUOVO SISTEMA)
// =====================================================

export default {
  // 🆕 Nuovo sistema token-based (semplificato)
  tokens: unifiedDesignSystem,

  // 🔧 Core systems (legacy support)
  colors: masterColors,
  layout: masterLayout,
  cards: masterCards,
  buttons: masterButtons,
  typography: masterTypography,
  animations: masterAnimations,
  breakpoints: masterBreakpoints,

  // Utility functions
  utils: {
    // Nuova utility
    combine: utils.combine,
    // Legacy utilities
    combineClasses,
    getCardClasses,
    getButtonClasses,
    getLayoutClasses,
    getAccountColors,
    getPrimaryGradient,
    getAccountTheme,
    getMasterTheme,
  },

  // Account-specific shortcuts (legacy support)
  athlete: {
    theme: athleteTheme,
    getCardClasses: getAthleteCardClasses,
    getButtonClasses: getAthleteButtonClasses,
  },
  trainer: {
    theme: trainerTheme,
    getCardClasses: getTrainerCardClasses,
    getButtonClasses: getTrainerButtonClasses,
  },
  admin: {
    theme: adminTheme,
    getCardClasses: getAdminCardClasses,
    getButtonClasses: getAdminButtonClasses,
  },
  homepage: {
    getCardClasses: getHomepageCardClasses,
    getButtonClasses: getHomepageButtonClasses,
  },
  auth: {
    getCardClasses: getAuthCardClasses,
    getButtonClasses: getAuthButtonClasses,
  },
} as const

// =====================================================
// 📤 TYPE EXPORTS
// =====================================================

export type DesignSystem = typeof unifiedDesignSystem
export type AccountType = 'athlete' | 'trainer' | 'admin' | 'homepage' | 'auth'
export type CardVariant = keyof typeof masterCards.athlete
export type ButtonVariant = keyof typeof masterButtons.athlete
export type LayoutVariant = keyof typeof masterLayout.athlete
