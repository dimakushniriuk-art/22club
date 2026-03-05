'use client'

import { MessageCircle } from 'lucide-react'
import { CHAT_THEME_CLASSES, type ChatTheme } from './chat-theme'

export type ChatEmptyStateVariant = 'select' | 'loading'

export type ChatEmptyStateProps = {
  variant: ChatEmptyStateVariant
  theme?: ChatTheme
}

export function ChatEmptyState({ variant, theme: themeKey = 'default' }: ChatEmptyStateProps) {
  const wrapperClass = 'flex flex-1 items-center justify-center min-h-0 p-6'
  const t = CHAT_THEME_CLASSES[themeKey]

  if (variant === 'loading') {
    return (
      <div className={wrapperClass}>
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${t.emptyIconBox}`}>
            <div className={`h-6 w-6 animate-spin rounded-full ${t.spinner}`} />
          </div>
          <p className="text-text-secondary text-sm">Caricamento conversazione...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <div className={`rounded-3xl backdrop-blur-xl transition p-6 sm:p-8 text-center max-w-md ${t.glass} ${t.frame}`}>
        <div className="mb-4 flex justify-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border animate-[pulse_2s_ease-in-out_infinite] ${t.emptyIconBox}`}>
            <MessageCircle className="h-7 w-7" />
          </div>
        </div>
        <h3 className="text-text-primary mb-1.5 text-lg font-semibold">
          Seleziona una conversazione
        </h3>
        <p className="text-text-secondary text-sm">
          Scegli un atleta dalla lista per iniziare a chattare
        </p>
      </div>
    </div>
  )
}
