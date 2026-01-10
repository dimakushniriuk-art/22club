'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, MessageCircle, Clock } from 'lucide-react'
import type { ConversationParticipant } from '@/types/chat'

interface ConversationListProps {
  conversations: ConversationParticipant[]
  currentConversationId?: string
  onSelectConversation: (userId: string) => void
  className?: string
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  className,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()),
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
      case 'atleta':
        return '🏃‍♂️'
      case 'pt':
        return '💪'
      case 'admin':
        return '👑'
      default:
        return '👤'
    }
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Search */}
      <div className="border-b border-teal-500/20 p-4 bg-background-secondary/50">
        <input
          type="text"
          placeholder="Cerca conversazioni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background-secondary/50 text-text-primary placeholder:text-gray-400 focus:ring-teal-500/20 w-full rounded-xl border border-teal-500/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-teal-500/50 transition-colors"
        />
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="bg-teal-500/20 text-teal-400 rounded-full p-4">
                <MessageCircle className="h-8 w-8" />
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
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.other_user_id}
                className={cn(
                  'hover:bg-teal-500/5 cursor-pointer p-3 transition-colors border-teal-500/20',
                  currentConversationId === conversation.other_user_id &&
                    'bg-teal-500/10 border-teal-500/40 shadow-teal-500/10',
                )}
                onClick={() => onSelectConversation(conversation.other_user_id)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-teal-500/20 text-teal-400 flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="text-text-primary truncate font-medium">
                        {conversation.other_user_name}
                      </h4>
                      <span className="text-sm">{getRoleIcon(conversation.other_user_role)}</span>
                    </div>

                    <div className="text-text-secondary flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{formatLastMessageTime(conversation.last_message_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {conversation.unread_count > 0 && (
                      <Badge variant="success" size="sm">
                        {conversation.unread_count}
                      </Badge>
                    )}
                    <MessageCircle className="text-teal-400 h-4 w-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
