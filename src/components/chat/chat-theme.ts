/**
 * Tema colori per la chat: default (primary), teal (nutrizionista), amber (massaggiatore).
 * Usato da dashboard/chat/page e da ConversationList, ChatEmptyState.
 */

export type ChatTheme = 'default' | 'teal' | 'amber'

const GLASS =
  'bg-gradient-to-br from-background-secondary/38 via-background-secondary/18 to-cyan-950/22 backdrop-blur-xl'
const GLASS_AMBER =
  'bg-gradient-to-br from-background-secondary/38 via-background-secondary/18 to-amber-950/22 backdrop-blur-xl'

export const CHAT_THEME_CLASSES = {
  default: {
    frame: 'border border-primary/22 hover:border-primary/30 transition',
    backButton: 'hover:bg-primary/10 hover:text-primary',
    underline: 'bg-gradient-to-r from-primary via-primary/60 to-transparent',
    glass: GLASS,
    searchRing: 'focus:ring-primary/20 focus:border-primary/30',
    emptyIconBox: 'bg-primary/12 text-primary border-primary/22',
    selectedItem: 'bg-primary/10 border-primary/30 ring-1 ring-primary/20',
    iconColor: 'text-primary',
    spinner: 'border-2 border-primary border-t-transparent',
  },
  teal: {
    frame: 'border border-teal-500/22 hover:border-teal-500/30 transition',
    backButton: 'hover:bg-teal-500/10 hover:text-teal-400',
    underline: 'bg-gradient-to-r from-teal-400 via-teal-400/60 to-transparent',
    glass: GLASS,
    searchRing: 'focus:ring-teal-500/20 focus:border-teal-500/30',
    emptyIconBox: 'bg-teal-500/12 text-teal-400 border-teal-500/22',
    selectedItem: 'bg-teal-500/10 border-teal-500/30 ring-1 ring-teal-500/20',
    iconColor: 'text-teal-400',
    spinner: 'border-2 border-teal-400 border-t-transparent',
  },
  amber: {
    frame: 'border border-amber-500/22 hover:border-amber-500/30 transition',
    backButton: 'hover:bg-amber-500/10 hover:text-amber-400',
    underline: 'bg-gradient-to-r from-amber-400 via-amber-400/60 to-transparent',
    glass: GLASS_AMBER,
    searchRing: 'focus:ring-amber-500/20 focus:border-amber-500/30',
    emptyIconBox: 'bg-amber-500/12 text-amber-400 border-amber-500/22',
    selectedItem: 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20',
    iconColor: 'text-amber-400',
    spinner: 'border-2 border-amber-400 border-t-transparent',
  },
} as const
