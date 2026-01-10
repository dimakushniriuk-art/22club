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
      {/* Header Notifiche */}
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-lg shadow-teal-500/10 backdrop-blur-xl hover:border-teal-400/50 transition-all duration-200"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                <Bell className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notifiche</h2>
                <p className="text-gray-400">
                  {unreadCount > 0
                    ? `${unreadCount} notifiche non lette`
                    : 'Tutte le notifiche sono state lette'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={onMarkAllAsRead}
                variant="trainer"
                size="sm"
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Segna tutte come lette
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtri e Ricerca */}
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-lg shadow-teal-500/10 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardContent className="p-4 relative">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Ricerca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca nelle notifiche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-zinc-600/50 text-white placeholder-gray-400 focus:border-teal-500/50"
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
        <Card variant="trainer" className="text-center py-12">
          <CardContent>
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nessuna notifica trovata</h3>
            <p className="text-gray-400">
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
              variant="trainer"
              className={`transition-all duration-200 hover:shadow-lg ${
                !notification.read_at ? 'ring-2 ring-teal-500/20 bg-teal-500/5' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icona Categoria */}
                  <div className="flex-shrink-0 mt-1">{getCategoryIcon(notification.category)}</div>

                  {/* Contenuto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`text-lg font-semibold ${
                              !notification.read_at ? 'text-white' : 'text-gray-300'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read_at && (
                            <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                              Nuova
                            </Badge>
                          )}
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>

                        <p className="text-gray-400 mb-3 leading-relaxed">{notification.body}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(notification.sent_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(notification.category)}
                            {notification.type}
                          </div>
                          {notification.read_at && (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="h-3 w-3" />
                              Letta
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Azioni */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="trainer"
                          size="sm"
                          className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border-teal-500/30"
                          onClick={() => (window.location.href = notification.link)}
                        >
                          {notification.action_text}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>

                        {!notification.read_at && (
                          <Button
                            variant="trainer"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="trainer"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
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
