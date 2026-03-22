'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Dumbbell,
  Calendar,
  Users,
  Settings,
  MessageSquare,
  Euro,
  LogOut,
  Send,
  Shield,
  UserPlus,
  User,
  Menu,
  Megaphone,
  BarChart2,
  FileText,
  Layers,
  Zap,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'
import { Logo22Club } from '../logo-22club'
import { useAuth } from '@/providers/auth-provider'
import { useNotify } from '@/lib/ui/notify'
import { createLogger } from '@/lib/logger'
import { Drawer } from '@/components/ui'
import { cn } from '@/lib/utils'

const logger = createLogger('components:shared:dashboard:mobile-nav')

const staffNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Clienti', icon: Users, href: '/dashboard/clienti' },
  { label: 'Schede', icon: Dumbbell, href: '/dashboard/schede' },
  { label: 'Appuntamenti', icon: Calendar, href: '/dashboard/appuntamenti' },
  { label: 'Calendario', icon: Calendar, href: '/dashboard/calendario' },
  { label: 'Esercizi', icon: Dumbbell, href: '/dashboard/esercizi' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/abbonamenti' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Comunicazioni', icon: Send, href: '/dashboard/comunicazioni' },
  { label: 'Invita Atleta', icon: UserPlus, href: '/dashboard/invita-atleta' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/impostazioni' },
]

const nutrizionistaNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard/nutrizionista' },
  { label: 'Clienti', icon: Users, href: '/dashboard/nutrizionista/atleti' },
  { label: 'Piani', icon: ClipboardList, href: '/dashboard/nutrizionista/piani' },
  { label: 'Progressi', icon: TrendingUp, href: '/dashboard/nutrizionista/progressi' },
  { label: 'Analisi settimanale', icon: BarChart2, href: '/dashboard/nutrizionista/analisi' },
  { label: 'Calendario', icon: Calendar, href: '/dashboard/nutrizionista/calendario' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/nutrizionista/chat' },
  { label: 'Documenti', icon: FileText, href: '/dashboard/nutrizionista/documenti' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/nutrizionista/abbonamenti' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/nutrizionista/impostazioni' },
]

const massaggiatoreNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard/massaggiatore' },
  { label: 'Appuntamenti', icon: Calendar, href: '/dashboard/massaggiatore/appuntamenti' },
  { label: 'Calendario', icon: Calendar, href: '/dashboard/massaggiatore/calendario' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/massaggiatore/chat' },
  { label: 'Statistiche', icon: BarChart2, href: '/dashboard/massaggiatore/statistiche' },
  { label: 'Profilo', icon: User, href: '/dashboard/massaggiatore/profilo' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/massaggiatore/abbonamenti' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/massaggiatore/impostazioni' },
]

export function DashboardMobileNav() {
  const path = usePathname()
  const { role: userRole, signOut } = useAuth()
  const { notify } = useNotify()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isAdmin = userRole === 'admin'
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
  }

  const handleLogout = useCallback(async () => {
    setDrawerOpen(false)
    try {
      await signOut()
    } catch (error) {
      logger.error('Errore nel logout', error)
      notify('Si è verificato un errore durante il logout. Riprova.', 'error', 'Errore logout')
    }
  }, [signOut, notify])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      {/* Header mobile: solo sotto md */}
      <header className="md:hidden flex items-center justify-between gap-3 h-14 px-4 shrink-0 border-b border-white/5 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation"
          aria-label="Apri menu"
        >
          <Menu className="w-6 h-6 text-text-primary" />
        </button>
        <Link
          href={
            userRole === 'marketing'
              ? '/dashboard/marketing'
              : userRole === 'nutrizionista'
                ? '/dashboard/nutrizionista'
                : userRole === 'massaggiatore'
                  ? '/dashboard/massaggiatore'
                  : '/dashboard'
          }
          className="flex-1 flex justify-center min-w-0"
        >
          <Logo22Club className="h-7 w-auto max-w-[140px]" />
        </Link>
        <div className="w-11" />
      </header>

      {/* Drawer navigazione */}
      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        side="left"
        size="md"
        className="w-[280px] max-w-[85vw] h-full"
      >
        <div className="flex flex-col h-full bg-background-secondary">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <Logo22Club className="h-6 w-auto max-w-[140px]" />
            <button
              type="button"
              onClick={closeDrawer}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/5 text-text-secondary touch-manipulation"
              aria-label="Chiudi menu"
            >
              <span className="text-lg font-medium">✕</span>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
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
                  onClick={closeDrawer}
                  className={cn(
                    'flex items-center gap-3 min-h-[44px] px-3 rounded-xl transition-colors duration-200',
                    active
                      ? 'bg-primary/12 ring-1 ring-primary/25 text-primary font-medium'
                      : 'text-text-secondary hover:text-primary hover:bg-white/5 ring-1 ring-transparent',
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {active && <div className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                onClick={closeDrawer}
                className={cn(
                  'flex items-center gap-3 min-h-[44px] px-3 rounded-xl transition-colors duration-200',
                  path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')
                    ? 'bg-primary/12 ring-1 ring-primary/25 text-primary font-medium'
                    : 'text-text-secondary hover:text-primary hover:bg-white/5',
                )}
              >
                <Shield className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Admin</span>
              </Link>
            )}
          </nav>
          <div className="p-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full min-h-[44px] px-3 rounded-xl text-state-error hover:bg-state-error/10 font-medium transition-colors touch-manipulation"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="text-sm">Esci</span>
            </button>
          </div>
        </div>
      </Drawer>
    </>
  )
}
