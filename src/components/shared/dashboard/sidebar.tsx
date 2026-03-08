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
  User,
  Megaphone,
  BarChart2,
  FileText,
  Layers,
  Zap,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo22Club } from '../logo-22club'
import { useAuth } from '@/providers/auth-provider'

const staffNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Clienti', icon: Users, href: '/dashboard/clienti' },
  { label: 'Schede', icon: Dumbbell, href: '/dashboard/schede' },
  { label: 'Appuntamenti', icon: CalendarCheck, href: '/dashboard/appuntamenti' },
  { label: 'Calendario', icon: CalendarDays, href: '/dashboard/calendario' },
  { label: 'Esercizi', icon: Dumbbell, href: '/dashboard/esercizi' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/abbonamenti' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Comunicazioni', icon: Mail, href: '/dashboard/comunicazioni' },
  { label: 'Invita Atleta', icon: UserPlus, href: '/dashboard/invita-atleta' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/impostazioni' },
]

const nutrizionistaNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard/nutrizionista' },
  { label: 'Clienti', icon: Users, href: '/dashboard/nutrizionista/atleti' },
  { label: 'Piani', icon: ClipboardList, href: '/dashboard/nutrizionista/piani' },
  { label: 'Progressi', icon: TrendingUp, href: '/dashboard/nutrizionista/progressi' },
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
  { label: 'Profilo', icon: User, href: '/dashboard/massaggiatore/profilo' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/massaggiatore/abbonamenti' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/massaggiatore/impostazioni' },
]

export const Sidebar = ({ role }: { role: 'staff' }) => {
  const path = usePathname()
  const { role: userRole, signOut } = useAuth()
  const isAdmin = userRole === 'admin'
  const { notify } = useNotify()

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

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      logger.error('Errore nel logout', error)
      notify('Si è verificato un errore durante il logout. Riprova.', 'error', 'Errore logout')
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

  return (
    <aside
      className={`hidden md:flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } p-4`}
      suppressHydrationWarning
    >
      {/* Logo - nascosto quando collassata */}
      {!isCollapsed && (
        <div className="mb-[7px] flex items-center justify-center">
          <Logo22Club className="w-full max-w-[180px] h-auto" />
        </div>
      )}
      <nav className="flex flex-col gap-2 flex-1" suppressHydrationWarning>
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
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 group min-w-0 ring-1 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-primary/12 ring-primary/25 text-primary font-medium'
                  : 'ring-white/5 text-text-secondary/95 hover:text-primary hover:bg-white/4 hover:ring-white/8'
              }`}
              title={isCollapsed ? item.label : undefined}
              suppressHydrationWarning
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${
                  active ? 'text-primary' : 'text-text-secondary/95 group-hover:text-primary'
                }`}
              />
              {!isCollapsed && (
                <>
                  {/* FIX CRITICO #2: Aggiunto whitespace-nowrap per evitare wrapping, flex-1 per occupare spazio disponibile */}
                  <span className="text-sm font-medium whitespace-nowrap flex-1 min-w-0">
                    {item.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0" />
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
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 group ring-1 ${
              isCollapsed ? 'justify-center' : ''
            } ${
              path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')
                ? 'bg-primary/12 ring-primary/25 text-primary font-medium'
                : 'ring-white/5 text-text-secondary/95 hover:text-primary hover:bg-white/4 hover:ring-white/8'
            }`}
            title={isCollapsed ? 'Admin' : undefined}
            suppressHydrationWarning
          >
            <Shield
              className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${
                path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')
                  ? 'text-primary'
                  : 'text-text-secondary/95 group-hover:text-primary'
              }`}
            />
            {!isCollapsed && (
              <>
                {/* FIX CRITICO #2: Aggiunto whitespace-nowrap e min-w-0 per evitare troncamento errato del testo */}
                <span className="text-sm font-medium whitespace-nowrap min-w-0 flex-1">Admin</span>
                {(path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')) && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0" />
                )}
              </>
            )}
          </Link>
        )}
        {/* Bottone Logout */}
        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-state-error hover:bg-state-error/10 font-medium ${
            isCollapsed ? 'justify-center' : 'min-w-0'
          }`}
          title={isCollapsed ? 'Esci' : undefined}
          suppressHydrationWarning
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" />
          {/* FIX CRITICO #2: Aggiunto whitespace-nowrap per evitare troncamento errato del testo */}
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Esci</span>}
        </button>
        {/* Bottone Toggle Collapse */}
        <button
          onClick={toggleCollapse}
          className="mt-2 flex items-center justify-center p-3 rounded-lg transition-colors duration-200 text-text-primary hover:bg-muted/60"
          title={isCollapsed ? 'Espandi sidebar' : 'Riduci sidebar'}
          suppressHydrationWarning
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </nav>
    </aside>
  )
}
