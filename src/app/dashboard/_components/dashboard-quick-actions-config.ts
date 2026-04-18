import type { LucideIcon } from 'lucide-react'
import {
  UserPlus,
  Dumbbell,
  MessageSquare,
  BarChart3,
  Activity,
  CalendarDays,
  Users,
  CreditCard,
  CalendarCheck,
  Megaphone,
  Settings2,
  Calendar,
} from 'lucide-react'
import type { StaffDashboardQuickActionId } from '@/lib/dashboard/staff-dashboard-layout-prefs'

/** Stesso stile delle tile scorciatoie sulla dashboard. */
export const DASHBOARD_QUICK_ACTION_CARD_CLASS =
  'group flex min-h-[64px] flex-col items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-2.5 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all hover:border-white/18 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.99] sm:min-h-[72px] sm:p-3'

export type DashboardQuickActionLink = {
  id: StaffDashboardQuickActionId
  href: string
  icon: LucideIcon
  label: string
  iconBoxClass: string
}

export type DashboardQuickActionAppointment = {
  id: StaffDashboardQuickActionId
  href: null
  icon: LucideIcon
  label: string
  iconBoxClass: string
}

export type DashboardQuickActionItem = DashboardQuickActionLink | DashboardQuickActionAppointment

export const DASHBOARD_QUICK_ACTIONS: DashboardQuickActionItem[] = [
  {
    id: 'workouts',
    href: '/dashboard/workouts',
    icon: Activity,
    label: 'Workouts',
    iconBoxClass: 'border-rose-500/30 bg-rose-500/20 text-rose-400',
  },
  {
    id: 'calendar',
    href: '/dashboard/calendario',
    icon: CalendarDays,
    label: 'Calendario',
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    id: 'bookings',
    href: '/dashboard/prenotazioni',
    icon: CalendarCheck,
    label: 'Prenotazioni',
    iconBoxClass: 'border-orange-500/30 bg-orange-500/20 text-orange-300',
  },
  {
    id: 'clients',
    href: '/dashboard/clienti',
    icon: Users,
    label: 'Clienti',
    iconBoxClass: 'border-sky-500/30 bg-sky-500/20 text-sky-300',
  },
  {
    id: 'chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
    label: 'Chat',
    iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
  },
  {
    id: 'stats',
    href: '/dashboard/statistiche',
    icon: BarChart3,
    label: 'Statistiche',
    iconBoxClass: 'border-blue-500/30 bg-blue-500/20 text-blue-400',
  },
  {
    id: 'programs',
    href: '/dashboard/schede',
    icon: Dumbbell,
    label: 'Schede',
    iconBoxClass: 'border-amber-500/30 bg-amber-500/20 text-amber-400',
  },
  {
    id: 'newAppointment',
    href: null,
    icon: Calendar,
    label: 'Nuovo Appuntamento',
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    id: 'subscriptions',
    href: '/dashboard/abbonamenti',
    icon: CreditCard,
    label: 'Abbonamenti',
    iconBoxClass: 'border-lime-500/30 bg-lime-500/20 text-lime-300',
  },
  {
    id: 'inviteClient',
    href: '/dashboard/invita-atleta?new=true',
    icon: UserPlus,
    label: 'Invita cliente',
    iconBoxClass: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'communications',
    href: '/dashboard/comunicazioni',
    icon: Megaphone,
    label: 'Comunicazioni',
    iconBoxClass: 'border-teal-500/30 bg-teal-500/20 text-teal-300',
  },
  {
    id: 'settings',
    href: '/dashboard/impostazioni',
    icon: Settings2,
    label: 'Impostazioni',
    iconBoxClass: 'border-zinc-500/30 bg-zinc-500/20 text-zinc-300',
  },
]
