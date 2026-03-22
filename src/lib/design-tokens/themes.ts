/**
 * 22Club Design Tokens — Role themes
 * athlete / trainer / admin: primary, accent, gradients. Rest is shared.
 */

export interface RoleTheme {
  primary: string
  primaryHover: string
  primaryActive: string
  gradientPrimary: string
  gradientHover: string
  borderPrimary: string
  borderAccent: string
  textAccent: string
  textAccentHover: string
  /** Tailwind class for button primary */
  buttonPrimary: string
  buttonSecondary: string
  buttonGhost: string
}

export const roleThemes: Record<'athlete' | 'trainer' | 'admin', RoleTheme> = {
  athlete: {
    primary: '#02B3BF',
    primaryHover: '#03C9D5',
    primaryActive: '#019AA6',
    gradientPrimary: 'bg-slate-900/95',
    gradientHover: 'hover:bg-slate-800/95',
    borderPrimary:
      'border border-slate-600/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] border-l-[3px] border-l-teal-500/80',
    borderAccent: 'border-teal-500',
    textAccent: 'text-teal-400',
    textAccentHover: 'hover:text-teal-300',
    buttonPrimary:
      'bg-teal-500 hover:bg-teal-600 text-white focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-black',
    buttonSecondary: 'border-teal-500 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400',
    buttonGhost: 'text-teal-400 hover:text-teal-300 hover:bg-teal-500/10',
  },
  trainer: {
    primary: '#3b82f6',
    primaryHover: '#60a5fa',
    primaryActive: '#2563eb',
    gradientPrimary: 'bg-slate-900/95',
    gradientHover: 'hover:bg-slate-800/95',
    borderPrimary:
      'border border-slate-600/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] border-l-[3px] border-l-indigo-500/80',
    borderAccent: 'border-blue-500',
    textAccent: 'text-blue-400',
    textAccentHover: 'hover:text-blue-300',
    buttonPrimary:
      'bg-blue-500 hover:bg-blue-600 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black',
    buttonSecondary: 'border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400',
    buttonGhost: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
  },
  admin: {
    primary: '#8b5cf6',
    primaryHover: '#a78bfa',
    primaryActive: '#7c3aed',
    gradientPrimary: 'bg-slate-900/95',
    gradientHover: 'hover:bg-slate-800/95',
    borderPrimary:
      'border border-slate-600/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] border-l-[3px] border-l-violet-500/70',
    borderAccent: 'border-purple-500',
    textAccent: 'text-purple-400',
    textAccentHover: 'hover:text-purple-300',
    buttonPrimary:
      'bg-purple-500 hover:bg-purple-600 text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black',
    buttonSecondary:
      'border-purple-500 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400',
    buttonGhost: 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10',
  },
}

export type RoleKey = keyof typeof roleThemes
