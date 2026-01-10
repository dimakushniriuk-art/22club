export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  type: 'text' | 'file' | 'system'
  file_url?: string
  file_name?: string
  file_size?: number
  read_at?: string
  created_at: string
}

export interface ConversationParticipant {
  other_user_id: string
  other_user_name: string
  other_user_role: string
  last_message_at: string
  unread_count: number
  avatar?: string | null
}

export interface ChatConversation {
  participant: ConversationParticipant
  messages: ChatMessage[]
  isLoading: boolean
  hasMore: boolean
}

export interface ChatFile {
  file: File
  preview?: string
  type: 'image' | 'pdf' | 'other'
}

export interface EmojiData {
  emoji: string
  name: string
  shortcodes: string[]
}

export interface ChatState {
  conversations: ConversationParticipant[]
  currentConversation: ChatConversation | null
  isLoading: boolean
  error: string | null
}
