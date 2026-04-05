// ============================================================
// Componente Tab Notifiche PT (FASE C - Split File Lunghi)
// ============================================================
// Estratto da profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Select } from '@/components/ui'
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  ArrowRight,
  Clock,
  CheckCircle,
  MoreVertical,
  Users,
  CreditCard,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  link: string
  type: string
  sent_at: string
  read_at: string | null
  action_text: string
  is_push_sent: boolean
  created_at: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

interface PTNotificationsTabProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
}

export function PTNotificationsTab({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: PTNotificationsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all')

  // Calcola notifiche non lette
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_at).length, [notifications])

  // Estrai categorie uniche
  const categories = useMemo(() => {
    const cats = new Set<string>()
    notifications.forEach((n) => {
      if (n.category) cats.add(n.category)
    })
    return Array.from(cats)
  }, [notifications])

  // Filtra notifiche
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // Filtro ricerca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (
          !notification.title.toLowerCase().includes(searchLower) &&
          !notification.body.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      // Filtro tipo (letto/non letto)
      if (filterType === 'unread' && notification.read_at) return false
      if (filterType === 'read' && !notification.read_at) return false

      // Filtro categoria
      if (filterCategory !== 'all' && notification.category !== filterCategory) return false

      return true
    })
  }, [notifications, searchTerm, filterType, filterCategory])

  // Helper per icona categoria
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'client':
        return <Users className="h-4 w-4 text-blue-400" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-400" />
      case 'appointment':
        return <Calendar className="h-4 w-4 text-purple-400" />
      default:
        return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  // Helper per colore priorità
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  // Helper per formattare data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Adesso'
    if (diffMins < 60) return `${diffMins} min fa`
    if (diffHours < 24) return `${diffHours} ore fa`
    if (diffDays < 7) return `${diffDays} giorni fa`
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-6">
      {/* Header Notifiche — Card zinc come Abbonamenti / profilo */}
      <Card variant="default" className="relative overflow-hidden !p-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <Bell className="h-5 w-5 text-cyan-400" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-text-primary">Notifiche</h2>
                <p className="text-text-secondary text-sm">
                  {unreadCount > 0
                    ? `${unreadCount} notifiche non lette`
                    : 'Tutte le notifiche sono state lette'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button onClick={onMarkAllAsRead} variant="primary" size="sm" className="min-h-[44px]">
                <CheckCheck className="h-4 w-4 mr-2 shrink-0" />
                Segna tutte come lette
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtri e Ricerca */}
      <Card variant="default" className="relative overflow-hidden !p-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Ricerca */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                <Input
                  placeholder="Cerca nelle notifiche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/[0.04] border-white/10 text-text-primary placeholder:text-text-tertiary focus:border-primary"
                />
              </div>
            </div>

            {/* Filtri */}
            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as 'all' | 'unread' | 'read')}
                className="w-[140px]"
              >
                <option value="all">Tutte</option>
                <option value="unread">Non lette</option>
                <option value="read">Lette</option>
              </Select>

              <Select
                value={filterCategory}
                onValueChange={(value) => setFilterCategory(value)}
                className="flex-1"
              >
                <option value="all">Tutte le categorie</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Notifiche */}
      {filteredNotifications.length === 0 ? (
        <Card variant="default" className="!p-0 text-center">
          <CardContent className="px-6 py-12">
            <Bell className="h-12 w-12 text-text-tertiary mx-auto mb-4" aria-hidden />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Nessuna notifica trovata</h3>
            <p className="text-text-secondary text-sm">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Non ci sono notifiche al momento'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              variant="default"
              className={cn(
                '!p-0 transition-colors duration-200 hover:border-white/15',
                !notification.read_at && 'ring-1 ring-cyan-500/20 bg-white/[0.02]',
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">{getCategoryIcon(notification.category)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3
                            className={cn(
                              'text-lg font-semibold',
                              !notification.read_at ? 'text-text-primary' : 'text-text-secondary',
                            )}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read_at && (
                            <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25">
                              Nuova
                            </Badge>
                          )}
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>

                        <p className="text-text-secondary mb-3 leading-relaxed">{notification.body}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" aria-hidden />
                            {formatDate(notification.sent_at)}
                          </div>
                          <div className="flex items-center gap-1 min-w-0">
                            {getCategoryIcon(notification.category)}
                            <span className="truncate">{notification.type}</span>
                          </div>
                          {notification.read_at && (
                            <div className="flex items-center gap-1 text-[color:var(--color-success)]">
                              <CheckCircle className="h-3 w-3 shrink-0" aria-hidden />
                              Letta
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0 sm:flex-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] whitespace-nowrap border-white/10 text-cyan-400 hover:bg-white/[0.06] hover:text-cyan-300 max-[851px]:w-full max-[851px]:justify-center"
                          onClick={() => {
                            window.location.href = notification.link
                          }}
                        >
                          {notification.action_text}
                          <ArrowRight className="h-3 w-3 ml-1 shrink-0" />
                        </Button>

                        {!notification.read_at && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="min-h-[44px] min-w-[44px] border-white/10 text-[color:var(--color-success)] hover:bg-white/[0.06]"
                            aria-label="Segna come letta"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                          className="min-h-[44px] min-w-[44px] border-white/10 text-red-400 hover:bg-red-500/10"
                          aria-label="Elimina o altre azioni"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
