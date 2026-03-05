'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { Badge, Button } from '@/components/ui'
// RIMOSSO: useNavigationState non serve più perché Next.js Link gestisce già la navigazione
// import { useNavigationState } from '@/hooks/use-navigation-state'
import { X, Menu, Zap, Star } from 'lucide-react'
import { useIcon } from '@/components/ui/professional-icons'

const logger = createLogger('components:dashboard:sidebar')

interface SidebarItem {
  label: string
  href: string
  icon: string
  badge?: boolean
  description?: string
  isNew?: boolean
  isPopular?: boolean
  color: string
}

// Lista ottimizzata di elementi sidebar
const sidebarItems: SidebarItem[] = [
  // BLU (Panoramica)
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    badge: false,
    description: 'Panoramica generale',
    isNew: false,
    isPopular: true,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    label: 'Statistiche',
    href: '/dashboard/statistiche',
    icon: '📈',
    badge: false,
    description: 'Metriche e report',
    isNew: false,
    isPopular: false,
    color: 'from-blue-500 to-cyan-500',
  },
  // VERDE (Gestione Clienti)
  {
    label: 'Clienti',
    href: '/dashboard/clienti',
    icon: '👥',
    badge: false,
    description: 'Gestisci i tuoi atleti',
    isNew: false,
    isPopular: true,
    color: 'from-green-500 to-emerald-500',
  },
  {
    label: 'Invita Atleta',
    href: '/dashboard/invita-atleta',
    icon: '➕',
    badge: false,
    description: 'Aggiungi nuovo cliente',
    isNew: true,
    isPopular: false,
    color: 'from-green-500 to-emerald-500',
  },
  {
    label: 'Chat',
    href: '/dashboard/chat',
    icon: '💬',
    badge: true,
    description: 'Messaggi con clienti',
    isNew: false,
    isPopular: false,
    color: 'from-green-500 to-emerald-500',
  },
  // ARANCIONE (Schede)
  {
    label: 'Schede',
    href: '/dashboard/schede',
    icon: '📋',
    badge: false,
    description: 'Schede di allenamento',
    isNew: false,
    isPopular: false,
    color: 'from-orange-500 to-red-500',
  },
  {
    label: 'DB Esercizi',
    href: '/dashboard/esercizi',
    icon: '📚',
    badge: false,
    description: 'Catalogo esercizi',
    isNew: false,
    isPopular: false,
    color: 'from-orange-500 to-red-500',
  },
  {
    label: 'Calendario',
    href: '/dashboard/calendario',
    icon: '📅',
    badge: false,
    description: 'Pianifica sessioni',
    isNew: false,
    isPopular: false,
    color: 'from-orange-500 to-red-500',
  },
  // VIOLA (Amministrazione)
  {
    label: 'Documenti',
    href: '/dashboard/documenti',
    icon: '📄',
    badge: false,
    description: 'Certificati e documenti',
    isNew: false,
    isPopular: false,
    color: 'from-purple-500 to-pink-500',
  },
  {
    label: 'Pagamenti',
    href: '/dashboard/pagamenti',
    icon: '💰',
    badge: false,
    description: 'Fatture e pagamenti',
    isNew: false,
    isPopular: false,
    color: 'from-purple-500 to-pink-500',
  },
  {
    label: 'Comunicazioni',
    href: '/dashboard/comunicazioni',
    icon: '📢',
    badge: false,
    description: 'Annunci e newsletter',
    isNew: false,
    isPopular: false,
    color: 'from-purple-500 to-pink-500',
  },
  // GRIGIO (Sistema)
  {
    label: 'Notifiche',
    href: '/dashboard/notifiche',
    icon: '🔔',
    badge: true,
    description: 'Avvisi e notifiche',
    isNew: false,
    isPopular: false,
    color: 'from-gray-500 to-slate-500',
  },
  {
    label: 'Profilo',
    href: '/dashboard/profilo',
    icon: '👤',
    badge: false,
    description: 'Il tuo profilo',
    isNew: false,
    isPopular: false,
    color: 'from-gray-500 to-slate-500',
  },
  {
    label: 'Impostazioni',
    href: '/dashboard/impostazioni',
    icon: '⚙️',
    badge: false,
    description: 'Configurazioni',
    isNew: false,
    isPopular: false,
    color: 'from-gray-500 to-slate-500',
  },
]

const quickActions = [
  {
    label: 'Nuovo Cliente',
    href: '/dashboard/invita-atleta',
    icon: '👥',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    label: 'Programma Sessione',
    href: '/dashboard/calendario',
    icon: '📅',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    label: 'Invia Messaggio',
    href: '/dashboard/chat',
    icon: '💬',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  {
    label: 'Vedi Report',
    href: '/dashboard/statistiche',
    icon: '📊',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [notificationCount, setNotificationCount] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  // RIMOSSO: isLoading non serve più perché Next.js Link gestisce già la navigazione
  // const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  // RIMOSSO: navigationState non serve più perché Next.js Link gestisce già la navigazione
  // const navigationState = useNavigationState()

  // Prepara tutte le icone necessarie per la sidebar
  const sidebarIcons = {
    '📊': useIcon('📊', { size: 16, className: 'text-white' }),
    '📈': useIcon('📈', { size: 16, className: 'text-white' }),
    '👥': useIcon('👥', { size: 16, className: 'text-white' }),
    '💪': useIcon('💪', { size: 16, className: 'text-white' }),
    '📅': useIcon('📅', { size: 16, className: 'text-white' }),
    '💰': useIcon('💰', { size: 16, className: 'text-white' }),
    '📄': useIcon('📄', { size: 16, className: 'text-white' }),
    '⚙️': useIcon('⚙️', { size: 16, className: 'text-white' }),
  }

  // Helper function per le icone
  const getIcon = (icon: string) => sidebarIcons[icon as keyof typeof sidebarIcons] || icon

  // Rilevamento tablet e gestione responsive
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTabletSize = (width >= 768 && width <= 1024) || (height >= 768 && height <= 1024)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsTablet(isTabletSize && isTouchDevice)

      // Auto-collapse su tablet portrait
      if (isTabletSize && width < height && width < 900) {
        setIsCollapsed(true)
      } else if (width >= 1024) {
        setIsCollapsed(false)
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  // Carica conteggio notifiche ottimizzato
  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 3

    const loadNotifications = async () => {
      let user: { id: string } | null = null
      try {
        const {
          data: { user: fetchedUser },
        } = await supabase.auth.getUser()
        user = fetchedUser
        if (!user || !mounted) return

        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .is('read_at', null)

        if (error) {
          logger.warn('Errore caricamento notifiche', undefined, {
            errorMessage: error.message,
            userId: user.id,
            retryCount,
          })
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(loadNotifications, 1000 * retryCount)
          }
          return
        }

        if (mounted) {
          setNotificationCount(count || 0)
        }
      } catch (err) {
        logger.warn('Errore caricamento notifiche', err, {
          userId: user?.id,
          retryCount,
        })
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(loadNotifications, 1000 * retryCount)
        }
      }
    }

    void loadNotifications()

    // Subscription realtime ottimizzata
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          if (mounted) void loadNotifications()
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          if (mounted) void loadNotifications()
        },
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Gestione navigazione con loading - RIMOSSA: Next.js Link gestisce già la navigazione
  // Non serve più chiamare handleNavigation sui Link perché Next.js Link gestisce automaticamente
  // la navigazione e il refresh. Questo causava refresh multipli.
  // const handleNavigation = useCallback(
  //   (href: string) => {
  //     if (href !== pathname && !isLoading) {
  //       setIsLoading(true)
  //       navigationState.startNavigation(href)
  //
  //       // Timeout di sicurezza
  //       setTimeout(() => {
  //         setIsLoading(false)
  //         navigationState.endNavigation()
  //       }, 5000)
  //     }
  //   },
  //   [pathname, isLoading, navigationState],
  // )

  // Gestione click fuori sidebar per mobile/tablet
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        (window.innerWidth < 1024 || isTablet)
      ) {
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }

    return undefined
  }, [isOpen, onClose, isTablet])

  // Focus trap: Esc chiude, focus loop su Tab
  useEffect(() => {
    if (!isOpen || !onClose) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      // Focus trap con Tab
      if (e.key === 'Tab' && sidebarRef.current) {
        const focusable = sidebarRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const first = focusable[0] as HTMLElement
        const last = focusable[focusable.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Auto-focus su bottone close quando drawer si apre
  useEffect(() => {
    if (isOpen && onClose) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen, onClose])

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Overlay per mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-in-out',
          'bg-gradient-to-b from-background/95 to-background-secondary/95',
          'backdrop-blur-xl border-r border-border/50',
          'shadow-2xl shadow-black/20',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-20' : isTablet ? 'w-80' : 'w-96',
          'lg:relative lg:translate-x-0',
          isTablet ? 'sidebar-tablet' : 'sidebar-mobile',
          isTablet && 'touch-pan-y',
          isCollapsed && isTablet && 'collapsed',
        )}
        role="dialog"
        aria-modal={onClose ? 'true' : 'false'}
        aria-label="Navigazione principale"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-8 border-b border-border/50 flex-shrink-0">
          <div className={cn('flex items-center space-x-3', isCollapsed && 'justify-center')}>
            {!isCollapsed && (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-sm">
                  22
                </div>
                <div>
                  <h1 className="text-lg font-bold text-text-primary">22Club</h1>
                  <p className="text-xs text-text-secondary">Staff Dashboard</p>
                </div>
              </>
            )}
            {isCollapsed && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-sm">
                22
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle collapse */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex hover:bg-background-tertiary"
              aria-label={isCollapsed ? 'Espandi sidebar' : 'Comprimi sidebar'}
            >
              <Menu size={16} />
            </Button>

            {/* Close per mobile */}
            {onClose && (
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="lg:hidden hover:bg-background-tertiary"
                aria-label="Chiudi menu"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-b border-border/30 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-text-primary">Azioni Rapide</span>
            </div>
          )}

          <div className={cn('grid gap-2', isCollapsed ? 'grid-cols-1' : 'grid-cols-2')}>
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => {
                  onClose?.()
                }}
                className={cn(
                  'group relative overflow-hidden rounded-lg text-center transition-all duration-200',
                  isTablet ? 'p-5' : 'p-4',
                  isTablet
                    ? 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl active:shadow-lg'
                    : 'hover:scale-105 hover:shadow-lg',
                  action.color,
                )}
                title={isCollapsed ? action.label : undefined}
              >
                <div className="flex flex-col items-center space-y-1">
                  {getIcon(action.icon)}
                  {!isCollapsed && (
                    <span className="text-xs font-medium text-white">{action.label}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />

                {/* Tooltip per Quick Actions collassate */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-medium">{action.label}</div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
          {sidebarItems.map((item) => {
            const active = isActive(item.href)
            const showBadge = item.badge && notificationCount > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => {
                  onClose?.()
                }}
                className={cn(
                  'group flex items-center rounded-lg text-sm transition-all duration-200 relative',
                  // Layout diverso per collassato vs espanso
                  isCollapsed ? 'justify-center px-3 py-4' : 'justify-between px-4 py-3',
                  isTablet ? 'px-5 py-4' : 'px-4 py-3',
                  active
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 shadow-sm border border-teal-500/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary/50',
                  isTablet
                    ? 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-md active:bg-background-tertiary/70'
                    : 'hover:shadow-sm hover:scale-[1.02]',
                  // RIMOSSO: isLoading non serve più
                  // isLoading && 'opacity-50 pointer-events-none',
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Icona colorata con gradiente della categoria */}
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r transition-all duration-200 relative',
                    item.color,
                    active && 'shadow-lg scale-105',
                    isCollapsed && 'mx-auto',
                  )}
                >
                  {getIcon(item.icon)}

                  {/* Badge notifiche per stato collassato */}
                  {isCollapsed && showBadge && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </div>
                  )}
                </div>

                {/* Contenuto testuale - solo se non collassato */}
                {!isCollapsed && (
                  <>
                    <div className="min-w-0 flex-1 ml-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium truncate">{item.label}</span>
                        {item.isNew && (
                          <span className="inline-flex items-center rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
                            Nuovo
                          </span>
                        )}
                        {item.isPopular && <Star className="h-3 w-3 text-yellow-400" />}
                      </div>
                      {item.description && (
                        <p className="text-xs text-text-tertiary truncate">{item.description}</p>
                      )}
                    </div>

                    {/* Badge notifiche */}
                    {showBadge && (
                      <Badge variant="warning" size="sm" className="animate-pulse ml-2">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Badge>
                    )}
                  </>
                )}

                {/* Tooltip per stato collassato */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                    )}
                    {showBadge && (
                      <div className="text-xs text-orange-400 mt-1">
                        {notificationCount > 99 ? '99+' : notificationCount} notifiche
                      </div>
                    )}
                    {/* Freccia del tooltip */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-6 flex-shrink-0">
          <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'space-x-3')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold">
              M
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">Marco Rossi</p>
                <p className="text-xs text-text-secondary">Personal Trainer</p>
              </div>
            )}
          </div>
        </div>

        {/* Loading indicator - RIMOSSO: Next.js Link gestisce già la navigazione */}
        {/* {isLoading && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
            <div className="flex items-center space-x-2 text-teal-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-400"></div>
              <span className="text-sm font-medium">Caricamento...</span>
            </div>
          </div>
        )} */}
      </div>
    </>
  )
}
