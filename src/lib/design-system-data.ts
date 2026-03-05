/**
 * 22Club Design System — Unica fonte di verità per dati della pagina /design-system e per l'app.
 * Colori accento derivano da @/lib/design-tokens (colors.athleteAccents).
 */

import { colors, roleThemes } from '@/lib/design-tokens'
import type { AthleteAccentKey } from '@/lib/design-tokens'

// --- Accenti atleta (da token + label per UI) ---
const ACCENT_LABELS: Record<AthleteAccentKey, string> = {
  teal: 'Teal (schede, chat, profilo)',
  cyan: 'Cyan (appuntamenti, documenti)',
  green: 'Green (progressi)',
  emerald: 'Emerald (nutrizionista)',
  amber: 'Amber (massaggiatore)',
}

export const ACCENTI_ATLETA: Record<
  AthleteAccentKey,
  { border: string; bar: string; label: string; iconBg: string }
> = (() => {
  const acc = colors.athleteAccents
  return {
    teal: {
      border: acc.teal.border,
      bar: acc.teal.bar,
      label: ACCENT_LABELS.teal,
      iconBg: acc.teal.iconBg,
    },
    cyan: {
      border: acc.cyan.border,
      bar: acc.cyan.bar,
      label: ACCENT_LABELS.cyan,
      iconBg: acc.cyan.iconBg,
    },
    green: {
      border: acc.green.border,
      bar: acc.green.bar,
      label: ACCENT_LABELS.green,
      iconBg: acc.green.iconBg,
    },
    emerald: {
      border: acc.emerald.border,
      bar: acc.emerald.bar,
      label: ACCENT_LABELS.emerald,
      iconBg: acc.emerald.iconBg,
    },
    amber: {
      border: acc.amber.border,
      bar: acc.amber.bar,
      label: ACCENT_LABELS.amber,
      iconBg: acc.amber.iconBg,
    },
  }
})()

export const ACCENT_HEX: Record<string, string> = {
  teal: colors.athleteAccents.teal.bar,
  cyan: colors.athleteAccents.cyan.bar,
  green: colors.athleteAccents.green.bar,
  emerald: colors.athleteAccents.emerald.bar,
  amber: colors.athleteAccents.amber.bar,
  background: colors.background.DEFAULT,
  surface: colors.surface[200],
  'text-primary': colors.text.primary,
  primary: colors.primary.DEFAULT,
}

/** Card Trainer / Admin: token da @/lib/design-tokens (roleThemes). Usati in Moduli e dashboard. */
export const RUOLI_CARD: Record<
  'trainer' | 'admin',
  { label: string; gradientPrimary: string; borderPrimary: string; primary: string }
> = {
  trainer: {
    label: 'Trainer (PT)',
    gradientPrimary: roleThemes.trainer.gradientPrimary,
    borderPrimary: roleThemes.trainer.borderPrimary,
    primary: roleThemes.trainer.primary,
  },
  admin: {
    label: 'Admin',
    gradientPrimary: roleThemes.admin.gradientPrimary,
    borderPrimary: roleThemes.admin.borderPrimary,
    primary: roleThemes.admin.primary,
  },
}

// Mappa blocco home -> accent key (per home/page e design-home)
export const BLOCCHI_ACCENT_MAP: Record<string, AthleteAccentKey> = {
  schede: 'teal',
  appuntamenti: 'cyan',
  progressi: 'green',
  chat: 'teal',
  nutrizionista: 'emerald',
  massaggiatore: 'amber',
  documenti: 'cyan',
  'foto-risultati': 'green',
  foto: 'green',
  profilo: 'teal',
}

export type BloccoAccentColors = {
  border: string
  bar: string
  iconBg: string
  glow: string
  gradientStart: string
}

/** Restituisce i colori accento per un blocco home (usa token). */
export function getBloccoAccentColors(bloccoId: string): BloccoAccentColors {
  const key = BLOCCHI_ACCENT_MAP[bloccoId] ?? 'teal'
  const a = colors.athleteAccents[key] as typeof colors.athleteAccents.teal
  return {
    border: a.border,
    bar: a.bar,
    iconBg: a.iconBg,
    glow: a.glow,
    gradientStart: a.gradientStart,
  }
}

// --- Design Home: blocchi per preview in design-system (id, label, desc, accentKey, iconId) ---
export const HOME_BLOCCHI_DATA: Array<{
  id: string
  label: string
  desc: string
  accentKey: AthleteAccentKey
  iconId: string
}> = [
  {
    id: 'schede',
    label: 'SCHEDE',
    desc: 'Il tuo programma',
    accentKey: 'teal',
    iconId: 'Dumbbell',
  },
  {
    id: 'appuntamenti',
    label: 'APPUNTAMENTI',
    desc: 'Sessioni con il PT',
    accentKey: 'cyan',
    iconId: 'Calendar',
  },
  {
    id: 'progressi',
    label: 'PROGRESSI',
    desc: 'Misure e risultati',
    accentKey: 'green',
    iconId: 'BarChart3',
  },
  {
    id: 'nutrizionista',
    label: 'NUTRIZIONISTA',
    desc: 'Consigli alimentari',
    accentKey: 'emerald',
    iconId: 'Salad',
  },
  {
    id: 'massaggiatore',
    label: 'MASSAGGIATORE',
    desc: 'Trattamenti',
    accentKey: 'amber',
    iconId: 'Hand',
  },
  {
    id: 'documenti',
    label: 'DOCUMENTI',
    desc: 'Referti e file',
    accentKey: 'cyan',
    iconId: 'FileText',
  },
]

export const HOME_ICONS_DATA: Array<{ id: string; iconId: string; accentKey: AthleteAccentKey }> = [
  { id: 'schede', iconId: 'Dumbbell', accentKey: 'teal' },
  { id: 'appuntamenti', iconId: 'Calendar', accentKey: 'cyan' },
  { id: 'progressi', iconId: 'BarChart3', accentKey: 'green' },
  { id: 'chat', iconId: 'MessageSquare', accentKey: 'teal' },
  { id: 'nutrizionista', iconId: 'Salad', accentKey: 'emerald' },
  { id: 'massaggiatore', iconId: 'Hand', accentKey: 'amber' },
  { id: 'documenti', iconId: 'FileText', accentKey: 'cyan' },
  { id: 'foto', iconId: 'Image', accentKey: 'green' },
  { id: 'profilo', iconId: 'User', accentKey: 'teal' },
]

// --- Pagine Home: documentazione per ogni route ---
export interface HomePageDesignItem {
  path: string
  label: string
  colori: string[]
  tipografia: string[]
  icone: string[]
  moduli: string[]
  radius: string[]
  spacing: string[]
}

export const HOME_PAGES_DESIGN: HomePageDesignItem[] = [
  {
    path: '/home',
    label: 'Home (blocchi)',
    colori: ['bg-background', 'text-text-primary', 'border-primary/30', 'bg-primary/10'],
    tipografia: [
      'text-lg font-bold',
      'text-sm text-text-secondary',
      'text-[10px] uppercase tracking-wide',
    ],
    icone: [
      'Dumbbell',
      'Calendar',
      'BarChart3',
      'MessageSquare',
      'FileText',
      'User',
      'Salad',
      'Hand',
      'Image',
    ],
    moduli: ['Link (blocchi card)', 'Card athlete', 'professional-icons (emoji)'],
    radius: ['rounded-xl', 'rounded-2xl'],
    spacing: ['gap-4', 'p-4 min-[834px]:p-5', 'min-h-[44px]'],
  },
  {
    path: '/home/profilo',
    label: 'Profilo',
    colori: [
      'Glass primary',
      'border-primary/30',
      'bg-primary/10',
      'text-text-primary',
      'bg-background-secondary/50',
    ],
    tipografia: [
      'text-2xl md:text-3xl font-semibold',
      'text-xs text-text-tertiary',
      'text-sm font-medium',
    ],
    icone: [
      'User',
      'TrendingUp',
      'LogOut',
      'Heart',
      'Dumbbell',
      'Utensils',
      'Hand',
      'CreditCard',
      'BarChart3',
      'ArrowLeft',
    ],
    moduli: [
      'Card',
      'CardContent',
      'Button',
      'Tabs',
      'TabsList',
      'TabsTrigger',
      'TabsContent',
      'LoadingState',
      'ErrorState',
    ],
    radius: ['rounded-xl', 'rounded-lg', 'min-h-[44px]'],
    spacing: ['px-3 sm:px-4 min-[834px]:px-6', 'py-4 min-[834px]:py-5', 'space-y-4', 'gap-3'],
  },
  {
    path: '/home/allenamenti',
    label: 'Allenamenti (lista)',
    colori: [
      'Compatto primary',
      'border-primary/30',
      'bg-primary/10',
      'text-primary',
      'Badge success/warning',
    ],
    tipografia: [
      'text-2xl md:text-3xl font-semibold',
      'text-xs text-text-tertiary',
      'text-sm',
      'font-bold',
    ],
    icone: [
      'Calendar',
      'Play',
      'CheckCircle',
      'TrendingUp',
      'Award',
      'Clock',
      'Target',
      'Activity',
      'ArrowLeft',
    ],
    moduli: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'Button', 'Badge', 'Link'],
    radius: ['rounded-xl', 'rounded-lg'],
    spacing: ['gap-3', 'p-3 min-[834px]:p-4', 'min-h-[44px]'],
  },
  {
    path: '/home/allenamenti/[id]',
    label: 'Allenamenti — Dettaglio scheda',
    colori: ['Compatto primary', 'border-primary/30', 'bg-primary/10'],
    tipografia: ['text-lg font-semibold', 'text-sm text-text-secondary'],
    icone: [
      'ArrowLeft',
      'ChevronDown',
      'ChevronRight',
      'Dumbbell',
      'Play',
      'Calendar',
      'Target',
      'Activity',
      'Zap',
      'Info',
    ],
    moduli: ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'Button', 'Badge'],
    radius: ['rounded-xl'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/allenamenti/oggi',
    label: 'Allenamenti — Oggi (workout)',
    colori: ['Compatto primary', 'border-primary/30', 'RestTimer', 'TrainerSessionModal'],
    tipografia: ['text-xl font-bold', 'text-sm', 'text-text-muted'],
    icone: ['ArrowLeft', 'Check', 'Target', 'Dumbbell', 'Edit2', 'Info'],
    moduli: [
      'Card',
      'CardHeader',
      'CardTitle',
      'CardContent',
      'Button',
      'Input',
      'Dialog',
      'DialogContent',
      'DialogHeader',
      'DialogTitle',
      'DialogDescription',
    ],
    radius: ['rounded-xl', 'rounded-full'],
    spacing: ['gap-3', 'min-h-[44px]', 'space-y-4'],
  },
  {
    path: '/home/allenamenti/riepilogo',
    label: 'Allenamenti — Riepilogo',
    colori: ['Compatto primary', 'border-primary/30', 'Progress', 'Badge'],
    tipografia: ['text-2xl font-semibold', 'text-sm', 'font-medium'],
    icone: [
      'ArrowLeft',
      'Send',
      'Target',
      'Weight',
      'Trophy',
      'CheckCircle2',
      'TrendingUp',
      'Activity',
      'Clock',
    ],
    moduli: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'Button', 'Badge', 'Progress'],
    radius: ['rounded-xl'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/allenamenti/esercizio/[exerciseId]',
    label: 'Allenamenti — Esercizio',
    colori: ['Compatto primary', 'border-primary/30', 'bg-primary/10'],
    tipografia: ['text-lg font-semibold', 'text-sm text-text-secondary'],
    icone: ['ArrowLeft', 'Dumbbell', 'Target', 'Activity'],
    moduli: ['Card', 'CardContent', 'Button', 'Badge', 'Image (Next)'],
    radius: ['rounded-xl', 'rounded-lg'],
    spacing: ['gap-3', 'min-h-[44px]'],
  },
  {
    path: '/home/progressi',
    label: 'Progressi (dashboard)',
    colori: ['Glass primary', 'border-primary/30', 'bg-primary/10', 'primary card nav'],
    tipografia: [
      'text-2xl md:text-3xl',
      'text-[10px] uppercase tracking-wide',
      'text-xl font-bold text-primary',
    ],
    icone: ['Scale', 'TrendingUp', 'Activity', 'BarChart3', 'ArrowLeft', 'History', 'Image'],
    moduli: ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'Button', 'Link'],
    radius: ['rounded-xl', 'rounded-l-xl (barra)', 'rounded-lg'],
    spacing: ['gap-4', 'space-y-4', 'min-[834px]:space-y-5', 'min-h-[44px]'],
  },
  {
    path: '/home/progressi/misurazioni',
    label: 'Progressi — Misurazioni',
    colori: ['Glass primary', 'border-primary/30', 'bg-primary/10', 'primary grafici'],
    tipografia: ['text-lg font-semibold', 'text-sm', 'text-[10px] uppercase'],
    icone: ['ArrowLeft', 'Plus', 'Scale', 'Dumbbell'],
    moduli: ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'Button'],
    radius: ['rounded-xl'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/progressi/nuovo',
    label: 'Progressi — Nuova misurazione',
    colori: ['Glass primary', 'border-primary/30', 'bg-primary/10'],
    tipografia: ['text-lg font-semibold', 'text-sm', 'label font-medium'],
    icone: ['ArrowLeft', 'Plus', 'Scale', 'Dumbbell', 'History'],
    moduli: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'Button', 'Input'],
    radius: ['rounded-xl', 'rounded-md'],
    spacing: ['gap-4', 'space-y-4', 'min-h-[44px]'],
  },
  {
    path: '/home/progressi/storico',
    label: 'Progressi — Storico',
    colori: ['Glass primary', 'border-primary/30', 'Badge'],
    tipografia: ['text-lg font-semibold', 'text-sm text-text-secondary'],
    icone: ['Calendar', 'Dumbbell', 'Clock', 'TrendingUp', 'ArrowLeft', 'History', 'Download'],
    moduli: ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'Button', 'Badge'],
    radius: ['rounded-xl'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/progressi/allenamenti',
    label: 'Progressi — Statistiche allenamenti',
    colori: ['Glass primary', 'border-primary/30', 'WorkoutExerciseCharts'],
    tipografia: ['text-lg font-semibold', 'text-sm'],
    icone: ['ArrowLeft', 'Activity', 'BarChart3', 'Calendar'],
    moduli: ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'Button', 'Skeleton'],
    radius: ['rounded-xl'],
    spacing: ['gap-4', 'space-y-4', 'min-h-[44px]'],
  },
  {
    path: '/home/progressi/foto',
    label: 'Progressi — Foto',
    colori: ['Glass primary', 'border-primary/30', 'ProgressPhotoImage'],
    tipografia: ['text-lg font-semibold', 'text-sm', 'text-xs text-text-muted'],
    icone: [
      'ArrowLeft',
      'Camera',
      'Calendar',
      'Image',
      'ZoomIn',
      'Download',
      'Share2',
      'RotateCcw',
      'Loader2',
    ],
    moduli: ['Card', 'CardContent', 'CardHeader', 'CardTitle', 'Badge', 'Button'],
    radius: ['rounded-xl', 'rounded-lg'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/appuntamenti',
    label: 'Appuntamenti',
    colori: ['Compatto primary', 'border-primary/30', 'bg-primary/10', 'Badge status'],
    tipografia: ['text-2xl md:text-3xl font-semibold', 'text-xs text-text-tertiary', 'text-sm'],
    icone: ['Calendar', 'Clock', 'MapPin', 'User', 'MessageSquare', 'ArrowLeft'],
    moduli: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'Badge', 'Button'],
    radius: ['rounded-xl'],
    spacing: ['gap-3', 'p-3 min-[834px]:p-4', 'min-h-[44px]'],
  },
  {
    path: '/home/chat',
    label: 'Chat',
    colori: ['bg-background', 'text-text-primary', 'MessageList/MessageInput'],
    tipografia: ['text-sm', 'text-xs text-text-muted'],
    icone: ['ArrowLeft', 'User', 'MessageCircle'],
    moduli: ['Card', 'Button', 'MessageList', 'MessageInput'],
    radius: ['rounded-xl', 'rounded-full'],
    spacing: ['gap-2', 'p-4', 'min-h-[44px]'],
  },
  {
    path: '/home/documenti',
    label: 'Documenti',
    colori: ['Glass primary', 'border-primary/30', 'primary/warn', 'Dialog', 'SimpleSelect'],
    tipografia: ['text-2xl md:text-3xl font-semibold', 'text-sm', 'text-xs'],
    icone: [
      'ArrowLeft',
      'FileText',
      'Calendar',
      'Download',
      'Eye',
      'X',
      'AlertCircle',
      'CheckCircle2',
      'Upload',
      'Loader2',
    ],
    moduli: [
      'Card',
      'CardContent',
      'Badge',
      'Button',
      'Dialog',
      'SimpleSelect',
      'LoadingState',
      'ErrorState',
    ],
    radius: ['rounded-xl', 'rounded-lg'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/nutrizionista',
    label: 'Nutrizionista',
    colori: ['Glass primary', 'border-primary/30', 'bg-primary/10', 'emerald'],
    tipografia: ['text-2xl md:text-3xl font-semibold', 'text-sm', 'text-xs text-text-tertiary'],
    icone: ['ArrowLeft', 'Salad', 'Utensils', 'Apple'],
    moduli: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'Button', 'AthleteNutritionTab'],
    radius: ['rounded-xl'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/massaggiatore',
    label: 'Massaggiatore',
    colori: ['Glass primary', 'border-primary/30', 'bg-primary/10', 'amber'],
    tipografia: ['text-2xl md:text-3xl font-semibold', 'text-sm', 'text-xs text-text-tertiary'],
    icone: ['ArrowLeft', 'Hand', 'Calendar', 'Sparkles'],
    moduli: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'Button', 'AthleteMassageTab'],
    radius: ['rounded-xl'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/pagamenti',
    label: 'Pagamenti',
    colori: ['bg-background', 'text-text-primary', 'Card trainer', 'Euro icon', 'border-border'],
    tipografia: ['text-2xl font-semibold', 'text-sm', 'text-xs'],
    icone: ['Euro', 'FileText', 'Download', 'Eye', 'X'],
    moduli: ['Card', 'CardContent', 'Button'],
    radius: ['rounded-xl', 'rounded-lg'],
    spacing: ['gap-4', 'px-4', 'py-4', 'min-h-[44px]'],
  },
  {
    path: '/home/foto-risultati',
    label: 'Foto risultati (lista)',
    colori: ['Compatto primary', 'border-primary/30', 'Loader2', 'Trash2'],
    tipografia: ['text-2xl md:text-3xl font-semibold', 'text-sm', 'text-xs'],
    icone: ['ArrowLeft', 'Image', 'Calendar', 'Loader2', 'Trash2'],
    moduli: ['Button'],
    radius: ['rounded-xl'],
    spacing: ['min-h-[44px]'],
  },
  {
    path: '/home/foto-risultati/aggiungi',
    label: 'Foto risultati — Aggiungi',
    colori: ['bg-background', 'border-primary/30', 'Dialog', 'figure body'],
    tipografia: ['text-lg font-semibold', 'text-sm', 'label'],
    icone: ['ArrowLeft', 'Loader2', 'ImagePlus', 'Camera', 'CheckCircle2', 'Image'],
    moduli: ['Button', 'Input', 'SimpleSelect', 'Dialog', 'Card', 'Badge'],
    radius: ['rounded-xl', 'rounded-full'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
  {
    path: '/home/trainer',
    label: 'Trainer',
    colori: ['bg-background', 'Card trainer', 'text-text-primary', 'border-border'],
    tipografia: ['text-xl font-semibold', 'text-sm text-text-secondary'],
    icone: [
      'ArrowLeft',
      'User',
      'Mail',
      'Phone',
      'Award',
      'BookOpen',
      'Briefcase',
      'Quote',
      'Target',
      'Video',
      'ImageIcon',
      'ClipboardList',
      'FileText',
    ],
    moduli: ['Card', 'CardContent', 'Button'],
    radius: ['rounded-xl', 'rounded-full'],
    spacing: ['gap-4', 'min-h-[44px]'],
  },
]

// --- Path meta (token table + header + accent per route) ---
export interface PathMetaItem {
  tokenTable: Array<{ token: string; value: string }>
  header?: 'glass' | 'compact'
  accent?: AthleteAccentKey
}

export const PATH_META: Record<string, PathMetaItem> = {
  '/home': {
    tokenTable: [
      { token: 'Layout', value: 'flex flex-col, overflow-auto, minHeight 100dvh - 56px' },
      {
        token: 'Container',
        value:
          'px-3 sm:px-4 min-[834px]:px-6, py-4 min-[834px]:py-5, space-y-5 min-[834px]:space-y-6',
      },
      {
        token: 'Griglia blocchi',
        value: 'grid grid-cols-2 min-[834px]:grid-cols-3, gap-3 min-[834px]:gap-5',
      },
      {
        token: 'Blocco (card)',
        value: 'min-h-[100px] min-[834px]:min-h-[112px], rounded-2xl, barra inset 6px 0 0 bar',
      },
      { token: 'Header Benvenuto', value: 'Glass primary, rounded-2xl, backdrop-blur-xl' },
      { token: 'Breakpoint', value: 'min-[834px] (tablet)' },
      { token: 'Focus', value: 'ring-2 ring-primary ring-offset-2 ring-offset-background' },
    ],
  },
  '/home/profilo': {
    tokenTable: [
      { token: 'Layout', value: 'flex flex-col, overflow-auto, minHeight 100dvh - 56px' },
      {
        token: 'Container',
        value: 'px-3 sm:px-4 min-[834px]:px-6, py-4 min-[834px]:py-5, space-y-4',
      },
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal' },
      { token: 'Tabs', value: 'Anagrafica, Medico, Fitness, Nutrizione, Massaggi' },
      { token: 'Breakpoint', value: 'min-[834px]' },
      { token: 'Focus', value: 'ring-2 ring-primary ring-offset-2 ring-offset-background' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/allenamenti': {
    tokenTable: [
      { token: 'Header', value: 'Compatto (primary)' },
      { token: 'Accento', value: 'cyan' },
      { token: 'Layout', value: 'Lista schede, Badge stato, Link a [id] / oggi' },
      { token: 'Breakpoint', value: 'min-[834px]' },
    ],
    header: 'compact',
    accent: 'cyan',
  },
  '/home/allenamenti/[id]': {
    tokenTable: [
      { token: 'Header', value: 'Compatto (primary)' },
      { token: 'Accento', value: 'cyan' },
      { token: 'Layout', value: 'Dettaglio scheda, giorni, esercizi' },
    ],
    header: 'compact',
    accent: 'cyan',
  },
  '/home/allenamenti/oggi': {
    tokenTable: [
      { token: 'Header', value: 'Compatto (primary)' },
      { token: 'Accento', value: 'cyan' },
      { token: 'Moduli', value: 'RestTimer, TrainerSessionModal, Dialog' },
    ],
    header: 'compact',
    accent: 'cyan',
  },
  '/home/allenamenti/riepilogo': {
    tokenTable: [
      { token: 'Header', value: 'Compatto (primary)' },
      { token: 'Accento', value: 'cyan' },
      { token: 'Moduli', value: 'Progress, Badge' },
    ],
    header: 'compact',
    accent: 'cyan',
  },
  '/home/allenamenti/esercizio/[exerciseId]': {
    tokenTable: [
      { token: 'Header', value: 'Compatto (primary)' },
      { token: 'Accento', value: 'cyan' },
    ],
    header: 'compact',
    accent: 'cyan',
  },
  '/home/progressi': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal / cyan / green card nav' },
      { token: 'Layout', value: 'Dashboard, link misurazioni/nuovo/storico/allenamenti/foto' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/progressi/misurazioni': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal, green grafici' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/progressi/nuovo': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal' },
      { token: 'Moduli', value: 'Input, form' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/progressi/storico': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal, Badge' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/progressi/allenamenti': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal, WorkoutExerciseCharts' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/progressi/foto': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal, ProgressPhotoImage' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/appuntamenti': {
    tokenTable: [
      { token: 'Header', value: 'Compatto (primary)' },
      { token: 'Accento', value: 'cyan, Badge status' },
    ],
    header: 'compact',
    accent: 'cyan',
  },
  '/home/chat': {
    tokenTable: [
      { token: 'Layout', value: 'MessageList, MessageInput' },
      { token: 'Radius', value: 'rounded-xl, rounded-full' },
    ],
  },
  '/home/documenti': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'primary/warn, Dialog, SimpleSelect' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/nutrizionista': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal, emerald AthleteNutritionTab' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/massaggiatore': {
    tokenTable: [
      { token: 'Header', value: 'Glass (primary)' },
      { token: 'Accento', value: 'teal, amber AthleteMassageTab' },
    ],
    header: 'glass',
    accent: 'teal',
  },
  '/home/pagamenti': {
    tokenTable: [
      { token: 'Layout', value: 'h1 + Euro, Card trainer, tabella' },
      { token: 'Accento', value: 'border-border' },
    ],
  },
  '/home/foto-risultati': {
    tokenTable: [
      { token: 'Header', value: 'Compatto (primary)' },
      { token: 'Accento', value: 'cyan' },
    ],
    header: 'compact',
    accent: 'cyan',
  },
  '/home/foto-risultati/aggiungi': {
    tokenTable: [
      { token: 'Layout', value: 'Dialog, figure body, SimpleSelect' },
      { token: 'Accento', value: 'cyan' },
    ],
    accent: 'cyan',
  },
  '/home/trainer': {
    tokenTable: [
      { token: 'Layout', value: 'Link Indietro, Card profilo PT' },
      { token: 'Accento', value: 'border-border' },
    ],
  },
}

export const RADIUS_PX: Record<string, string> = {
  'rounded-2xl': '16px',
  'rounded-xl': '12px',
  'rounded-lg': '8px',
  'rounded-l-xl': '12px',
  'rounded-full': '9999px',
}

// Nomi icone Lucide per la sezione Icone (design-system page costruisce ICON_SAMPLES da questo)
export const ICON_NAMES: string[] = [
  'Activity',
  'AlertCircle',
  'AlertTriangle',
  'Apple',
  'ArrowLeft',
  'ArrowRight',
  'Award',
  'Ban',
  'BarChart3',
  'Bell',
  'BookOpen',
  'Brain',
  'Briefcase',
  'Bug',
  'Building2',
  'Calendar',
  'Camera',
  'Check',
  'CheckCheck',
  'CheckCircle',
  'CheckCircle2',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'ClipboardList',
  'Clock',
  'Copy',
  'CreditCard',
  'Download',
  'Dumbbell',
  'Edit',
  'Edit2',
  'Euro',
  'Eye',
  'EyeOff',
  'File',
  'FileCheck',
  'FileSpreadsheet',
  'FileText',
  'Filter',
  'Globe',
  'Goal',
  'GraduationCap',
  'Grid3x3',
  'GripVertical',
  'Hand',
  'Heart',
  'History',
  'Home',
  'Image',
  'ImagePlus',
  'Info',
  'Keyboard',
  'Layout',
  'LayoutGrid',
  'List',
  'Loader2',
  'Lock',
  'LogOut',
  'Mail',
  'MapPin',
  'Menu',
  'MessageCircle',
  'MessageSquare',
  'Minus',
  'MoreVertical',
  'Paperclip',
  'Pencil',
  'Phone',
  'Play',
  'Plus',
  'Quote',
  'RefreshCw',
  'Repeat',
  'RotateCcw',
  'Ruler',
  'Salad',
  'Save',
  'Scale',
  'Search',
  'Send',
  'Settings',
  'Share2',
  'Shield',
  'Smartphone',
  'Smile',
  'Sparkles',
  'Square',
  'Star',
  'TableIcon',
  'Tag',
  'Target',
  'Trash2',
  'TrendingDown',
  'TrendingUp',
  'Trophy',
  'Type',
  'Upload',
  'User',
  'UserCheck',
  'UserCircle',
  'UserPlus',
  'Users',
  'Utensils',
  'Video',
  'Weight',
  'WifiOff',
  'X',
  'XCircle',
  'Zap',
  'ZoomIn',
]
