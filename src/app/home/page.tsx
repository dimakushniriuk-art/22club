'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { isValidProfile } from '@/lib/utils/type-guards'
import {
  Dumbbell,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  User,
  Salad,
  Hand,
} from 'lucide-react'
import { iconMap } from '@/components/ui/professional-icons'

const blocchiItems = [
  {
    id: 'schede',
    label: 'SCHEDE',
    href: '/home/allenamenti',
    icon: '💪',
    lucideIcon: Dumbbell,
    description: 'Il tuo programma di allenamento',
  },
  {
    id: 'appuntamenti',
    label: 'APPUNTAMENTI',
    href: '/home/appuntamenti',
    icon: '📅',
    lucideIcon: Calendar,
    description: 'Sessioni con il tuo PT',
  },
  {
    id: 'progressi',
    label: 'PROGRESSI',
    href: '/home/progressi',
    icon: '📊',
    lucideIcon: BarChart3,
    description: 'Misure, foto e risultati',
  },
  {
    id: 'chat',
    label: 'CHAT',
    href: '/home/chat',
    icon: '💬',
    lucideIcon: MessageSquare,
    description: 'Scrivi al tuo personal trainer',
  },
  {
    id: 'nutrizionista',
    label: 'NUTRIZIONISTA',
    href: '/home/nutrizionista',
    icon: '🍎',
    lucideIcon: Salad,
    description: 'Consigli alimentari personalizzati',
  },
  {
    id: 'massagiatore',
    label: 'MASSAGGIATORE',
    href: '/home/massaggiatore',
    icon: '💆',
    lucideIcon: Hand,
    description: 'Prenota e gestisci trattamenti',
  },
  {
    id: 'documenti',
    label: 'DOCUMENTI',
    href: '/home/documenti',
    icon: '📄',
    lucideIcon: FileText,
    description: 'Referti, piani e file',
  },
  {
    id: 'profilo',
    label: 'PROFILO',
    href: '/home/profilo',
    icon: '👤',
    lucideIcon: User,
    description: 'Dati personali e obiettivi',
  },
]

export default function HomePage() {
  const { user } = useAuth()

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // Prepara tutte le icone emoji necessarie prima del map (memorizza i componenti, non il JSX)
  const emojiIconComponents = useMemo(() => {
    const iconComponents: Record<
      string,
      React.ComponentType<{ size?: number; color?: string; className?: string }>
    > = {}
    for (const blocco of blocchiItems) {
      const useLucideIcon =
        blocco.id === 'schede' ||
        blocco.id === 'nutrizionista' ||
        blocco.id === 'massagiatore' ||
        blocco.id === 'progressi'
      if (!useLucideIcon) {
        const IconComponent = iconMap[blocco.icon as keyof typeof iconMap]
        if (IconComponent) {
          iconComponents[blocco.id] = IconComponent
        }
      }
    }
    return iconComponents
  }, [])

  // Il layout gestisce già autenticazione e loading, quindi qui possiamo assumere che user sia valido
  // Se non c'è user, il layout mostrerà loading o farà redirect
  if (!user || !isValidUser) {
    // Mostra skeleton durante il caricamento (il layout gestirà il redirect se necessario)
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-3 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse space-y-3">
          <div className="bg-background-tertiary h-6 w-40 rounded" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-background-tertiary h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header Benvenuto - Design Moderno */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-4 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10">
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent mb-1">
            Benvenuto{user?.nome ? `, ${user.nome}` : ''} 👋
          </h1>
          <p className="text-xs text-text-secondary">
            Gestisci i tuoi allenamenti, progressi e molto altro
          </p>
        </div>
      </div>

      {/* Griglia Blocchi - Design Uniforme e Moderno */}
      <div className="grid grid-cols-2 gap-2.5">
        {blocchiItems.map((blocco) => {
          const IconComponent = blocco.lucideIcon
          // Per SCHEDE, NUTRIZIONISTA, MASSAGGIATORE e PROGRESSI usa sempre l'icona Lucide, per gli altri usa emoji
          const useLucideIcon =
            blocco.id === 'schede' ||
            blocco.id === 'nutrizionista' ||
            blocco.id === 'massagiatore' ||
            blocco.id === 'progressi'
          const EmojiIconComponent = !useLucideIcon ? emojiIconComponents[blocco.id] : null

          return (
            <Link
              key={blocco.id}
              href={blocco.href}
              prefetch={true}
              className="group relative flex flex-col items-center justify-center gap-1.5 py-3.5 px-2.5 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 border border-teal-500/30 hover:border-teal-400/60 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
              aria-label={`Vai a ${blocco.label}`}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm" />

              {/* Icona - Design Moderno */}
              <div className="relative z-10 flex items-center justify-center mb-0.5">
                {useLucideIcon && IconComponent ? (
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <IconComponent
                      className="h-6 w-6 text-teal-300 group-hover:text-teal-200"
                      strokeWidth={2}
                    />
                  </div>
                ) : EmojiIconComponent ? (
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <EmojiIconComponent size={24} color="#5eead4" className="h-6 w-6" />
                  </div>
                ) : null}
              </div>

              {/* Label - Design Compatto */}
              <span className="relative z-10 text-teal-300 group-hover:text-teal-200 font-bold text-[11px] uppercase tracking-wider transition-colors duration-300 text-center leading-tight">
                {blocco.label}
              </span>

              {/* Descrizione - Design Sottile */}
              <span className="relative z-10 text-white/60 group-hover:text-white/80 text-[10px] text-center px-1 leading-tight line-clamp-2 transition-colors duration-300">
                {blocco.description}
              </span>

              {/* Indicatore hover - Design Moderno */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 group-hover:w-10 transition-all duration-300 rounded-full" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
