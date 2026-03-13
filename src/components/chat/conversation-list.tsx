'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageCircle, Clock, MoreVertical, User, Trash2 } from 'lucide-react'
import type { ConversationParticipant } from '@/types/chat'
import { CHAT_THEME_CLASSES, type ChatTheme } from './chat-theme'

function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return trimmed.charAt(0).toUpperCase()
}

interface ConversationListProps {
  conversations: ConversationParticipant[]
  currentConversationId?: string
  onSelectConversation: (userId: string) => void
  onRemoveFromList?: (userId: string) => void
  className?: string
  theme?: ChatTheme
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onRemoveFromList,
  className,
  theme: themeKey = 'default',
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const t = CHAT_THEME_CLASSES[themeKey]

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isStaffRole = (role: string) =>
    ['admin', 'trainer', 'nutrizionista', 'massaggiatore', 'marketing', 'staff'].includes(
      (role ?? '').toLowerCase(),
    )
  const staffConversations = filteredConversations.filter((c) =>
    isStaffRole(c.other_user_role),
  )
  const athleteConversations = filteredConversations.filter(
    (c) => !isStaffRole(c.other_user_role),
  )

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffInHours < 48) {
      return 'Ieri'
    } else {
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'athlete':
        return '🏃‍♂️'
      case 'trainer':
        return '💪'
      case 'admin':
        return '👑'
      case 'marketing':
        return '📢'
      default:
        return '👤'
    }
  }

  return (
    <div className={cn('flex h-full max-h-full flex-col min-h-0 overflow-hidden', className)}>
      {/* Search - stile profilo atleta */}
      <div className="p-3 sm:p-4 border-b border-white/10 shrink-0">
        <input
          type="text"
          placeholder="Cerca conversazioni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full rounded-md border border-white/10 bg-white/[0.04] text-text-primary placeholder:text-text-tertiary px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors min-h-[44px] touch-manipulation ${t.searchRing}`}
        />
      </div>

      {/* Lista conversazioni - max ~12 voci visibili, resto scrollabile */}
      <div className="flex-1 min-h-0 max-h-[min(768px,70vh)] overflow-y-auto overflow-x-hidden overscroll-contain p-2 sm:p-3">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border', t.emptyIconBox)}>
                <MessageCircle className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-text-primary mb-1 text-sm font-medium">
              {searchTerm ? 'Nessuna conversazione trovata' : 'Nessuna conversazione'}
            </h3>
            <p className="text-text-secondary text-xs">
              {searchTerm
                ? 'Prova con un altro termine di ricerca'
                : 'Inizia una conversazione con un atleta'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {staffConversations.length > 0 && (
              <div className="space-y-2">
                <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Staff
                </h3>
                {staffConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.other_user_id}
                    conversation={conversation}
                    currentConversationId={currentConversationId}
                    onSelectConversation={onSelectConversation}
                    onRemoveFromList={onRemoveFromList}
                    t={t}
                    formatLastMessageTime={formatLastMessageTime}
                    getRoleIcon={getRoleIcon}
                  />
                ))}
              </div>
            )}
            {athleteConversations.length > 0 && (
              <div className="space-y-2">
                <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Atleti
                </h3>
                {athleteConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.other_user_id}
                    conversation={conversation}
                    currentConversationId={currentConversationId}
                    onSelectConversation={onSelectConversation}
                    onRemoveFromList={onRemoveFromList}
                    t={t}
                    formatLastMessageTime={formatLastMessageTime}
                    getRoleIcon={getRoleIcon}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationItem({
  conversation,
  currentConversationId,
  onSelectConversation,
  onRemoveFromList,
  t,
  formatLastMessageTime,
  getRoleIcon,
}: {
  conversation: ConversationParticipant
  currentConversationId?: string
  onSelectConversation: (userId: string) => void
  onRemoveFromList?: (userId: string) => void
  t: (typeof CHAT_THEME_CLASSES)[keyof typeof CHAT_THEME_CLASSES]
  formatLastMessageTime: (dateString: string) => string
  getRoleIcon: (role: string) => string
}) {
  return (
    <div
      key={conversation.other_user_id}
      role="button"
      tabIndex={0}
      onClick={() => onSelectConversation(conversation.other_user_id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelectConversation(conversation.other_user_id)
        }
      }}
      className={cn(
        'w-full text-left rounded-lg border border-white/10 bg-white/[0.02] p-3 transition-colors min-h-[56px] flex items-center gap-2 sm:gap-3 hover:border-white/20 cursor-pointer group touch-manipulation active:scale-[0.99]',
        currentConversationId === conversation.other_user_id && t.selectedItem,
      )}
    >
      <Avatar
        src={conversation.avatar ?? undefined}
        alt={conversation.other_user_name}
        fallbackText={getInitial(conversation.other_user_name)}
        size="md"
        className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5 sm:gap-2">
          <h4 className="text-text-primary truncate text-sm font-medium">
            {conversation.other_user_name}
          </h4>
          <span className="text-xs shrink-0">{getRoleIcon(conversation.other_user_role)}</span>
        </div>
        <div className="text-text-secondary flex items-center gap-1.5 text-xs">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">{formatLastMessageTime(conversation.last_message_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {conversation.unread_count > 0 && (
          <Badge variant="success" size="sm">
            {conversation.unread_count}
          </Badge>
        )}
        <MessageCircle className={cn('h-4 w-4 opacity-70', t.iconColor)} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] h-8 w-8 opacity-70 group-hover:opacity-100 touch-manipulation"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Azioni per ${conversation.other_user_name}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/atleti/${conversation.other_user_id}`}
                className="flex items-center"
              >
                <User className="mr-2 h-4 w-4" />
                Vedi profilo
              </Link>
            </DropdownMenuItem>
            {onRemoveFromList && (
              <DropdownMenuItem
                onClick={() => onRemoveFromList(conversation.other_user_id)}
                className="text-state-error focus:text-state-error"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Rimuovi dalla lista
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
