import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart2,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Database,
  Dumbbell,
  Euro,
  FileText,
  Home,
  Layers,
  Mail,
  Megaphone,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import type { UserRole } from '@/types/user'

/** Voce nav desktop sidebar dashboard (shared). */
export type DashboardSidebarNavItem = {
  label: string
  icon: LucideIcon
  href: string
}

export const dashboardSidebarStaffNav: readonly DashboardSidebarNavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Appuntamenti', icon: CalendarCheck, href: '/dashboard/appuntamenti' },
  { label: 'Workouts', icon: Activity, href: '/dashboard/workouts' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Statistiche', icon: BarChart2, href: '/dashboard/statistiche' },
  { label: 'Schede', icon: Dumbbell, href: '/dashboard/schede' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/abbonamenti' },
  { label: 'Comunicazioni', icon: Mail, href: '/dashboard/comunicazioni' },
  { label: 'Database', icon: Database, href: '/dashboard/database' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/impostazioni' },
]

export const dashboardSidebarMarketingNav: readonly DashboardSidebarNavItem[] = [
  { label: 'Overview', icon: Home, href: '/dashboard/marketing' },
  { label: 'Atleti', icon: Users, href: '/dashboard/marketing/athletes' },
  { label: 'Segmenti', icon: Layers, href: '/dashboard/marketing/segments' },
  { label: 'Automazioni', icon: Zap, href: '/dashboard/marketing/automations' },
  { label: 'Leads', icon: UserPlus, href: '/dashboard/marketing/leads' },
  { label: 'Campagne', icon: Megaphone, href: '/dashboard/marketing/campaigns' },
  { label: 'Analytics', icon: BarChart2, href: '/dashboard/marketing/analytics' },
  { label: 'Report', icon: FileText, href: '/dashboard/marketing/report' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/marketing/impostazioni' },
]

export const dashboardSidebarNutrizionistaNav: readonly DashboardSidebarNavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard/nutrizionista' },
  { label: 'Clienti', icon: Users, href: '/dashboard/nutrizionista/atleti' },
  { label: 'Piani', icon: ClipboardList, href: '/dashboard/nutrizionista/piani' },
  { label: 'Progressi', icon: TrendingUp, href: '/dashboard/nutrizionista/progressi' },
  { label: 'Check-in', icon: ClipboardCheck, href: '/dashboard/nutrizionista/checkin' },
  { label: 'Analisi settimanale', icon: BarChart2, href: '/dashboard/nutrizionista/analisi' },
  { label: 'Calendario', icon: CalendarDays, href: '/dashboard/nutrizionista/calendario' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/nutrizionista/chat' },
  { label: 'Documenti', icon: FileText, href: '/dashboard/nutrizionista/documenti' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/nutrizionista/abbonamenti' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/nutrizionista/impostazioni' },
]

export const dashboardSidebarMassaggiatoreNav: readonly DashboardSidebarNavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard/massaggiatore' },
  { label: 'Clienti', icon: Users, href: '/dashboard/massaggiatore/clienti' },
  { label: 'Appuntamenti', icon: CalendarCheck, href: '/dashboard/massaggiatore/appuntamenti' },
  { label: 'Calendario', icon: CalendarDays, href: '/dashboard/massaggiatore/calendario' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/massaggiatore/chat' },
  { label: 'Statistiche', icon: BarChart2, href: '/dashboard/massaggiatore/statistiche' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/massaggiatore/abbonamenti' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/massaggiatore/impostazioni' },
]

/** Link Admin renderizzato dopo le voci nav, solo se `role === 'staff'` e utente admin (sidebar). */
export const dashboardSidebarAdminLinkMetadata = {
  href: '/dashboard/admin',
  label: 'Admin',
  icon: Shield,
} as const satisfies {
  href: string
  label: string
  icon: LucideIcon
}

/**
 * Seleziona l'array nav in base al ruolo profilo (stessa logica della sidebar shared pre-refactor).
 */
export function getDashboardSidebarNavForRole(
  userRole: UserRole | null,
): DashboardSidebarNavItem[] {
  if (userRole === 'marketing') {
    return [...dashboardSidebarMarketingNav]
  }
  if (userRole === 'nutrizionista') {
    return [...dashboardSidebarNutrizionistaNav]
  }
  if (userRole === 'massaggiatore') {
    return [...dashboardSidebarMassaggiatoreNav]
  }
  return [...dashboardSidebarStaffNav]
}
