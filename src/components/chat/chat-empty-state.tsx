'use client'

import { Loader2, MessageCircle } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import { CHAT_THEME_CLASSES, type ChatTheme } from './chat-theme'

export type ChatEmptyStateVariant = 'select' | 'loading'

export type ChatEmptyStateProps = {
  variant: ChatEmptyStateVariant
  theme?: ChatTheme
}

const outerClass = 'flex flex-1 items-center justify-center min-h-0 p-6'

const chatIconBoxClass = (t: (typeof CHAT_THEME_CLASSES)[ChatTheme]) =>
  cn(
    'flex !h-14 !w-14 !min-h-[3.5rem] !min-w-[3.5rem] shrink-0 items-center justify-center !rounded-lg border !p-0',
    t.emptyIconBox,
  )

export function ChatEmptyState({ variant, theme: themeKey = 'default' }: ChatEmptyStateProps) {
  const t = CHAT_THEME_CLASSES[themeKey]

  if (variant === 'loading') {
    return (
      <div className={outerClass}>
        <EmptyState
          icon={Loader2}
          title="Caricamento conversazione..."
          density="compact"
          surface="transparent"
          align="center"
          iconSize="small"
          iconWrapperClassName={chatIconBoxClass(t)}
          className={cn(
            'max-w-sm',
            '[&_svg]:animate-spin',
            '[&_h3]:mb-0 [&_h3]:text-sm [&_h3]:font-normal [&_h3]:text-text-secondary',
          )}
        />
      </div>
    )
  }

  return (
    <div className={outerClass}>
      <div className="mx-auto w-full max-w-md">
        <EmptyState
          icon={MessageCircle}
          title="Seleziona una conversazione"
          description="Scegli un atleta dalla lista per iniziare a chattare"
          density="compact"
          surface="subtle"
          align="center"
          iconSize="small"
          iconWrapperClassName={cn(chatIconBoxClass(t), 'animate-[pulse_2s_ease-in-out_infinite]')}
          className="bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] [&_h3]:mb-1.5"
        />
      </div>
    </div>
  )
}
