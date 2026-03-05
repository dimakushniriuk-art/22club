'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'

interface Notification {
  id: string
  type: 'workout' | 'document' | 'appointment' | 'payment'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

interface NotificationsSectionProps {
  notifications?: Notification[]
  loading?: boolean
  onViewAll?: () => void
  onMarkAsRead?: (id: string) => void
}

export function NotificationsSection({
  notifications,
  loading = false,
  onViewAll,
  onMarkAsRead,
}: NotificationsSectionProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return '💪'
      case 'document':
        return '📄'
      case 'appointment':
        return '📅'
      case 'payment':
        return '💰'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'workout':
        return 'text-brand'
      case 'document':
        return 'text-state-warn'
      case 'appointment':
        return 'text-state-info'
      case 'payment':
        return 'text-state-valid'
      default:
        return 'text-text-primary'
    }
  }

  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <div className="animate-pulse">
            <div className="bg-background-tertiary h-6 w-32 rounded" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="bg-background-tertiary h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bg-background-tertiary h-4 w-3/4 rounded" />
                  <div className="bg-background-tertiary h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <CardTitle
            size="md"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Notifiche recenti
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <span className="text-4xl text-teal-400 opacity-50">🔔</span>
            </div>
            <h3 className="text-text-primary mb-2 text-lg font-medium">Nessuna notifica</h3>
            <p className="text-text-secondary text-sm">Le tue notifiche appariranno qui</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle
            size="md"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Notifiche recenti
          </CardTitle>
          {onViewAll && (
            <Button
              variant="link"
              size="sm"
              onClick={onViewAll}
              className="text-teal-400 hover:text-teal-300"
            >
              Tutte le notifiche
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 rounded-lg p-3 transition-colors ${
                notification.isRead
                  ? 'bg-background-tertiary/50'
                  : 'bg-background-tertiary/70 border-teal-500/20 border'
              }`}
              onClick={() => onMarkAsRead?.(notification.id)}
            >
              <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h4
                    className={`text-sm font-medium ${
                      notification.isRead ? 'text-text-secondary' : 'text-text-primary'
                    }`}
                  >
                    {notification.title}
                  </h4>
                  {!notification.isRead && <div className="bg-teal-400 h-2 w-2 rounded-full" />}
                </div>
                <p className="text-text-secondary mb-1 text-xs">{notification.message}</p>
                <p className="text-text-tertiary text-xs">{notification.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
