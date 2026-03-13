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
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-lg border ${t.emptyIconBox}`}
          >
            <div className={`h-6 w-6 animate-spin rounded-full ${t.spinner}`} />
          </div>
          <p className="text-text-secondary text-sm">Caricamento conversazione...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-6 sm:p-8 text-center max-w-md transition">
        <div className="mb-4 flex justify-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-lg border animate-[pulse_2s_ease-in-out_infinite] ${t.emptyIconBox}`}
          >
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
