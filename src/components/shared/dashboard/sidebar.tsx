'use client'
import React, { useState, useEffect, useRef } from 'react'
import { createLogger } from '@/lib/logger'
import { useNotify } from '@/lib/ui/notify'

const logger = createLogger('components:shared:dashboard:sidebar')
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo22Club } from '../logo-22club'
import { useAuth } from '@/providers/auth-provider'
import { useStaffWorkoutSlotsIndicator } from '@/hooks/use-staff-workout-slots-indicator'
import {
  loadProfileLocalStorageJson,
  saveProfileLocalStorageJson,
} from '@/lib/prefs/profile-local-storage'
import {
  dashboardSidebarAdminLinkMetadata,
  getDashboardSidebarNavForRole,
} from '@/config/navigation/dashboard-sidebar'

export const Sidebar = ({ role }: { role: 'staff' }) => {
  const path = usePathname()
  const { role: userRole, signOut, user } = useAuth()
  const isAdmin = userRole === 'admin'
  const profileId = user?.id ?? null
  const { notify } = useNotify()
  const staffWorkoutsSlotsActive = useStaffWorkoutSlotsIndicator()

  const nav = getDashboardSidebarNavForRole(userRole)

  // Stato per sidebar collassata - inizializzato sempre a false per evitare hydration mismatch
  // Verrà aggiornato da localStorage solo dopo il mount (client-side)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isCollapsedRef = useRef(isCollapsed)
  const [isMounted, setIsMounted] = useState(false)

  // Leggi da localStorage solo dopo il mount (client-side)
  useEffect(() => {
    setIsMounted(true)
    const stored = loadProfileLocalStorageJson<boolean>(
      'sidebar-collapsed',
      profileId,
      (raw) => (typeof raw === 'boolean' ? raw : false),
      { legacyKeys: ['sidebar-collapsed'], defaultValue: false },
    )
    setIsCollapsed(stored.value)
    isCollapsedRef.current = stored.value
  }, [profileId])

  // Sincronizza ref con stato
  useEffect(() => {
    isCollapsedRef.current = isCollapsed
  }, [isCollapsed])

  // Salva stato in localStorage quando cambia (solo dopo mount)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      saveProfileLocalStorageJson('sidebar-collapsed', profileId, isCollapsed)
    }
  }, [isCollapsed, isMounted, profileId])

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

  const adminHref = dashboardSidebarAdminLinkMetadata.href
  const adminLabel = dashboardSidebarAdminLinkMetadata.label
  const AdminIcon = dashboardSidebarAdminLinkMetadata.icon
  const adminNavActive = path === adminHref || path.startsWith(`${adminHref}/`)

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
              href={adminHref}
              onClick={handleLinkClick}
              className={`${linkBase} ${isCollapsed ? 'justify-center' : ''} ${
                adminNavActive ? linkActive : linkInactive
              }`}
              title={isCollapsed ? adminLabel : undefined}
              suppressHydrationWarning
            >
              <AdminIcon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  adminNavActive ? 'text-primary' : 'text-text-secondary group-hover:text-primary'
                }`}
              />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium whitespace-nowrap min-w-0 flex-1 truncate">
                    {adminLabel}
                  </span>
                  {adminNavActive && (
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
