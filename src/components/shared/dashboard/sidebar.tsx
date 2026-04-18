'use client'
import React, { useState, useEffect, useRef } from 'react'
import { createLogger } from '@/lib/logger'
import { useNotify } from '@/lib/ui/notify'

const logger = createLogger('components:shared:dashboard:sidebar')
import {
  Home,
  Dumbbell,
  CalendarCheck,
  CalendarDays,
  Users,
  Settings,
  MessageSquare,
  Euro,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  UserPlus,
  Megaphone,
  BarChart2,
  FileText,
  Layers,
  Zap,
  ClipboardList,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Database,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo22Club } from '../logo-22club'
import { useAuth } from '@/providers/auth-provider'
import { useStaffWorkoutSlotsIndicator } from '@/hooks/use-staff-workout-slots-indicator'

const staffNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Prenotazioni', icon: ClipboardList, href: '/dashboard/prenotazioni' },
  { label: 'Workouts', icon: Activity, href: '/dashboard/workouts' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Schede', icon: Dumbbell, href: '/dashboard/schede' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/abbonamenti' },
  { label: 'Comunicazioni', icon: Mail, href: '/dashboard/comunicazioni' },
  { label: 'Database', icon: Database, href: '/dashboard/database' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/impostazioni' },
]

const nutrizionistaNav = [
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

const massaggiatoreNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard/massaggiatore' },
  { label: 'Appuntamenti', icon: CalendarCheck, href: '/dashboard/massaggiatore/appuntamenti' },
  { label: 'Calendario', icon: CalendarDays, href: '/dashboard/massaggiatore/calendario' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/massaggiatore/chat' },
  { label: 'Statistiche', icon: BarChart2, href: '/dashboard/massaggiatore/statistiche' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/massaggiatore/abbonamenti' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/massaggiatore/impostazioni' },
]

export const Sidebar = ({ role }: { role: 'staff' }) => {
  const path = usePathname()
  const { role: userRole, signOut } = useAuth()
  const isAdmin = userRole === 'admin'
  const { notify } = useNotify()
  const staffWorkoutsSlotsActive = useStaffWorkoutSlotsIndicator()

  // Filtra nav in base al ruolo
  let nav = staffNav
  if (userRole === 'marketing') {
    nav = [
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
  } else if (userRole === 'nutrizionista') {
    nav = nutrizionistaNav
  } else if (userRole === 'massaggiatore') {
    nav = massaggiatoreNav
  } else {
    nav = staffNav
  }

  // Stato per sidebar collassata - inizializzato sempre a false per evitare hydration mismatch
  // Verrà aggiornato da localStorage solo dopo il mount (client-side)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isCollapsedRef = useRef(isCollapsed)
  const [isMounted, setIsMounted] = useState(false)

  // Leggi da localStorage solo dopo il mount (client-side)
  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        const parsed = JSON.parse(saved)
        setIsCollapsed(parsed)
        isCollapsedRef.current = parsed
      }
    } catch {
      // Ignora errori di parsing
    }
  }, [])

  // Sincronizza ref con stato
  useEffect(() => {
    isCollapsedRef.current = isCollapsed
  }, [isCollapsed])

  // Salva stato in localStorage quando cambia (solo dopo mount)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, isMounted])

  const [logoutPending, setLogoutPending] = useState(false)

  const handleLogout = async () => {
    if (logoutPending) return
    setLogoutPending(true)
    try {
      const result = await signOut()
      if (!result.success) {
        notify(result.error ?? 'Logout non riuscito. Riprova.', 'error', 'Errore logout')
      }
    } catch (error) {
      logger.error('Errore nel logout', error)
      notify('Si è verificato un errore durante il logout. Riprova.', 'error', 'Errore logout')
    } finally {
      setLogoutPending(false)
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      isCollapsedRef.current = newState
      return newState
    })
  }

  // Previeni qualsiasi modifica dello stato quando si clicca su un link
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Forza lo stato a rimanere quello attuale (non modificabile dai link)
    if (isCollapsedRef.current !== isCollapsed) {
      setIsCollapsed(isCollapsedRef.current)
    }
    e.stopPropagation()
  }

  const linkBase =
    'flex items-center gap-3 min-h-[44px] p-3 rounded-lg transition-colors duration-200 group min-w-0 border'
  const linkActive = 'bg-white/[0.06] border-white/10 text-primary font-medium'
  const linkInactive =
    'border-transparent text-text-secondary hover:text-primary hover:bg-white/[0.04] hover:border-white/20'

  return (
    <aside
      className={`hidden md:flex md:h-full md:max-h-full flex-col min-h-0 transition-all duration-300 shrink-0 border-r border-white/10 bg-transparent ${
        isCollapsed ? 'w-20' : 'w-64'
      } p-4`}
      suppressHydrationWarning
    >
      {/* Logo - nascosto quando collassata */}
      {!isCollapsed && (
        <div className="mb-5 flex items-center justify-center shrink-0">
          <Logo22Club className="w-full max-w-[180px] h-auto" />
        </div>
      )}
      <nav className="flex flex-col flex-1 min-h-0 gap-0" suppressHydrationWarning>
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          {nav.map((item) => {
            const itemPath = item.href.split('?')[0]
            const isHomePage =
              itemPath === '/dashboard' ||
              itemPath === '/home' ||
              itemPath === '/dashboard/nutrizionista' ||
              itemPath === '/dashboard/massaggiatore'
            const active = isHomePage
              ? path === itemPath
              : path === itemPath || path.startsWith(itemPath + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={handleLinkClick}
                className={`${linkBase} relative ${isCollapsed ? 'justify-center' : ''} ${
                  active ? linkActive : linkInactive
                }`}
                title={isCollapsed ? item.label : undefined}
                suppressHydrationWarning
              >
                {item.href === '/dashboard/workouts' && staffWorkoutsSlotsActive ? (
                  <span
                    className="pointer-events-none absolute top-1.5 right-1.5 z-[1] h-2 w-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(0,0,0,0.45)]"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    active ? 'text-primary' : 'text-text-secondary group-hover:text-primary'
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium whitespace-nowrap flex-1 min-w-0 truncate">
                      {item.label}
                    </span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </>
                )}
              </Link>
            )
          })}
          {/* Link Admin - solo se l'utente è admin */}
          {role === 'staff' && isAdmin && (
            <Link
              href="/dashboard/admin"
              onClick={handleLinkClick}
              className={`${linkBase} ${isCollapsed ? 'justify-center' : ''} ${
                path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')
                  ? linkActive
                  : linkInactive
              }`}
              title={isCollapsed ? 'Admin' : undefined}
              suppressHydrationWarning
            >
              <Shield
                className={`w-5 h-5 shrink-0 transition-colors ${
                  path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')
                    ? 'text-primary'
                    : 'text-text-secondary group-hover:text-primary'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap min-w-0 flex-1 truncate">
                    Admin
                  </span>
                  {(path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')) && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  )}
                </>
              )}
            </Link>
          )}
        </div>
        {/* Esci + toggle: footer fuori area scroll (sempre in vista) */}
        <div className="shrink-0 pt-3 border-t border-white/10 space-y-1.5">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutPending}
            aria-busy={logoutPending}
            className={`flex w-full cursor-pointer items-center gap-3 min-h-[44px] p-3 rounded-lg transition-colors duration-200 text-state-error font-medium border border-transparent hover:bg-state-error/10 hover:border-state-error/30 active:bg-state-error/15 disabled:pointer-events-none disabled:opacity-60 ${
              isCollapsed ? 'justify-center' : 'min-w-0'
            }`}
            title={isCollapsed ? 'Esci' : undefined}
            suppressHydrationWarning
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Esci</span>}
          </button>
          <button
            type="button"
            onClick={toggleCollapse}
            className="flex w-full items-center justify-center min-h-[44px] p-3 rounded-lg transition-colors duration-200 text-text-secondary hover:text-primary border border-transparent hover:bg-white/[0.04] hover:border-white/20"
            title={isCollapsed ? 'Espandi sidebar' : 'Riduci sidebar'}
            suppressHydrationWarning
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>
    </aside>
  )
}
