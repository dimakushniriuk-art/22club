'use client'
import React, { useState, useEffect, useRef } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:shared:dashboard:sidebar')
import {
  Home,
  Dumbbell,
  Calendar,
  Users,
  Settings,
  MessageSquare,
  Euro,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Send,
  Shield,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo22Club } from '../logo-22club'
import { useAuth } from '@/providers/auth-provider'

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

export const Sidebar = ({ role }: { role: 'staff' }) => {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { role: userRole } = useAuth()
  const isAdmin = userRole === 'admin'
  const nav = staffNav

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
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      logger.error('Errore nel logout', error)
      alert('Errore nel logout')
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
          // Logica migliorata: per le homepage (/dashboard, /home) deve essere esatto
          // per gli altri item, match esatto o sottopagina
          const isHomePage = item.href === '/dashboard' || item.href === '/home'
          const active = isHomePage
            ? path === item.href
            : path === item.href || path.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={handleLinkClick}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group min-w-0 ${
                isCollapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-primary/10 text-primary font-medium shadow-[0_0_10px_rgba(2,179,191,0.3)]'
                  : 'text-text-secondary hover:text-primary hover:bg-surface-200'
              }`}
              title={isCollapsed ? item.label : undefined}
              suppressHydrationWarning
            >
              <Icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${
                  active ? 'text-primary' : 'text-text-secondary group-hover:text-primary'
                }`}
              />
              {!isCollapsed && (
                <>
                  {/* FIX CRITICO #2: Aggiunto whitespace-nowrap per evitare wrapping, flex-1 per occupare spazio disponibile */}
                  <span className="text-sm font-medium whitespace-nowrap flex-1 min-w-0">{item.label}</span>
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
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
              isCollapsed ? 'justify-center' : ''
            } ${
              path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')
                ? 'bg-primary/10 text-primary font-medium shadow-[0_0_10px_rgba(2,179,191,0.3)]'
                : 'text-text-secondary hover:text-primary hover:bg-surface-200'
            }`}
            title={isCollapsed ? 'Admin' : undefined}
            suppressHydrationWarning
          >
            <Shield
              className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${
                path === '/dashboard/admin' || path.startsWith('/dashboard/admin/')
                  ? 'text-primary'
                  : 'text-text-secondary group-hover:text-primary'
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
          className={`mt-auto flex items-center gap-3 p-3 rounded-lg transition-all duration-200 bg-red-500/10 text-white hover:bg-red-500/20 hover:text-white font-medium ${
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
          className="mt-2 flex items-center justify-center p-3 rounded-lg transition-all duration-200 text-white hover:text-white hover:bg-surface-200"
          title={isCollapsed ? 'Espandi sidebar' : 'Riduci sidebar'}
          suppressHydrationWarning
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </nav>
    </aside>
  )
}
