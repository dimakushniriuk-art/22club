/**
 * Stili condivisi per pagine auth/pubbliche (login, registrati, forgot-password, reset, privacy, termini).
 * Allineati allo stile trainer/dashboard: sfondo #0d0d0d, card DS, input e link coerenti.
 */

export const AUTH_PAGE_WRAPPER_CLASS =
  'page-login min-h-full min-w-0 w-full flex-1 bg-background text-text-primary flex items-center justify-center px-4 py-4 min-[834px]:px-6 min-[834px]:py-6 safe-area-inset'

export const AUTH_CARD_CLASS =
  'w-full max-w-md min-[834px]:max-w-lg overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl'

export const AUTH_CARD_CONTENT_CLASS = 'p-5 sm:p-6 min-[834px]:p-8'

export const AUTH_INPUT_CLASS =
  'rounded-md min-h-[44px] border border-white/10 bg-white/[0.04] text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background text-sm'

export const AUTH_INPUT_WITH_LEFT_ICON_CLASS = `${AUTH_INPUT_CLASS} pl-9`
export const AUTH_INPUT_PASSWORD_CLASS = `${AUTH_INPUT_CLASS} pl-9 pr-10`

export const AUTH_LOGO_CLASS =
  'w-auto h-24 sm:h-28 min-[834px]:h-32 object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.08)]'

export const AUTH_BUTTON_PRIMARY_CLASS =
  'w-full min-h-[44px] py-3 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 active:from-teal-700 active:to-cyan-700 text-white font-semibold shadow-md shadow-primary/30 border border-teal-500/50 disabled:opacity-60 disabled:from-teal-800 disabled:to-cyan-800'

export const AUTH_ERROR_BOX_CLASS =
  'flex items-start gap-3 rounded-lg p-4 animate-fade-in bg-state-error/10 border border-state-error/20 text-state-error shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

export const AUTH_LINK_BACK_CLASS =
  'inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group'
