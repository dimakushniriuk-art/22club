'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:header')
import { Badge } from '@/components/ui'
import { Bell, Settings, LogOut, User } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { useAuth } from '@/hooks/use-auth'

interface HeaderProps {
  title?: string
  showNotifications?: boolean
  showUserMenu?: boolean
}

export function Header({
  title = '22Club',
  showNotifications = true,
  showUserMenu = true,
}: HeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const { user, signOut } = useAuth()
  const role = user?.role
  const { unreadCount, hasUnread, getUnreadNotifications } = useNotifications({
    userId: user?.id,
  })

  const unreadNotifications = getUnreadNotifications()

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown)
    // Naviga alla pagina notifiche
    window.location.href = '/dashboard/notifiche'
  }

  const handleUserMenuClick = () => {
    setShowUserDropdown(!showUserDropdown)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      logger.error('Error during logout', error, { userId: user?.id })
    }
  }

  const getUserDisplayName = () => {
    if (!user) return 'Utente'
    return user.email?.split('@')[0] || 'Utente'
  }

  const getRoleDisplayName = () => {
    switch (role) {
      case 'admin':
        return 'Amministratore'
      case 'pt':
        return 'Personal Trainer'
      case 'atleta':
        return 'Atleta'
      default:
        return 'Utente'
    }
  }

  return (
    <header className="bg-background-secondary border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-text-primary text-xl font-bold">{title}</h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifiche */}
          {showNotifications && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {hasUnread && (
                  <Badge
                    variant="warning"
                    size="sm"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}

          {/* User Menu */}
          {showUserMenu && user && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUserMenuClick}
                className="flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                <span className="text-text-primary hidden md:inline">{getUserDisplayName()}</span>
              </Button>

              {showUserDropdown && (
                <div className="bg-background-secondary absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border shadow-lg">
                  <div className="border-b border-border p-4">
                    <div className="text-text-primary font-medium">{getUserDisplayName()}</div>
                    <div className="text-text-secondary text-sm">{getRoleDisplayName()}</div>
                  </div>

                  <div className="p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowUserDropdown(false)
                        window.location.href = '/dashboard/notifiche'
                      }}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notifiche
                      {hasUnread && (
                        <Badge variant="warning" size="sm" className="ml-auto">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowUserDropdown(false)
                        window.location.href =
                          role === 'atleta' ? '/home/profilo' : '/dashboard/impostazioni'
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Impostazioni
                    </Button>

                    <div className="my-2 border-t border-border" />

                    <Button
                      variant="ghost"
                      className="text-state-error hover:text-state-error hover:bg-state-error/10 w-full justify-start"
                      onClick={() => {
                        setShowUserDropdown(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification Preview (se mostrato) */}
      {showNotificationDropdown && unreadNotifications.length > 0 && (
        <div className="bg-background-secondary absolute right-6 top-full z-50 mt-2 w-80 rounded-lg border border-border shadow-lg">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-text-primary font-medium">Notifiche non lette</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNotificationDropdown(false)
                  window.location.href = '/dashboard/notifiche'
                }}
              >
                Vedi tutte
              </Button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {unreadNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="hover:bg-background-tertiary cursor-pointer border-b border-border p-3 last:border-b-0"
                onClick={() => {
                  setShowNotificationDropdown(false)
                  if (notification.link) {
                    window.location.href = notification.link
                  }
                }}
              >
                <div className="text-text-primary mb-1 text-sm font-medium">
                  {notification.title}
                </div>
                <div className="text-text-secondary line-clamp-2 text-xs">{notification.body}</div>
                <div className="text-text-tertiary mt-1 text-xs">
                  {new Date(notification.sent_at || notification.created_at).toLocaleDateString(
                    'it-IT',
                    {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    },
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
