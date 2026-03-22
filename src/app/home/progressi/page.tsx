'use client'

import type { ReactNode } from 'react'
import { Scale, TrendingUp, Activity, BarChart3, History, Image } from 'lucide-react'
import { PageHeaderGlass } from '@/components/layout'
import { ProgressiNavCard, type Accent } from '@/components/home/progressi-nav-card'

const SCROLL_CONTAINER_STYLE = { minHeight: 'calc(100dvh - var(--nav-height, 56px))' } as const

const SCROLL_CONTAINER_CLASS =
  'min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-24'

const ICON_CLASS = 'h-4 w-4 min-[834px]:h-5 min-[834px]:w-5'
const CTA_ICON_CLASS = 'h-3 w-3 group-hover:translate-x-0.5 transition-transform'

const PROGRESSI_CARDS: Array<{
  href: string
  accent: Accent
  icon: ReactNode
  title: string
  description: string
  ctaText: string
  ctaIcon: ReactNode
}> = [
  {
    href: '/home/progressi/misurazioni',
    accent: 'white',
    icon: <Scale className={`${ICON_CLASS} text-white/90`} />,
    title: 'Misurazioni del Corpo',
    description:
      'Monitora peso, composizione corporea, circonferenze e misure antropometriche con grafici e statistiche dettagliate.',
    ctaText: 'Visualizza misurazioni',
    ctaIcon: <TrendingUp className={CTA_ICON_CLASS} />,
  },
  {
    href: '/home/progressi/allenamenti',
    accent: 'cyan',
    icon: <Activity className={`${ICON_CLASS} text-cyan-400`} />,
    title: 'Statistiche Allenamenti',
    description:
      "Analizza l'andamento dei pesi utilizzati, tempi di esecuzione e progressi per ogni esercizio delle tue schede di allenamento.",
    ctaText: 'Visualizza statistiche',
    ctaIcon: <BarChart3 className={CTA_ICON_CLASS} />,
  },
  {
    href: '/home/progressi/storico',
    accent: 'purple',
    icon: <History className={`${ICON_CLASS} text-purple-400`} />,
    title: 'Storico Allenamenti',
    description:
      'Visualizza tutti i tuoi allenamenti completati, statistiche dettagliate e progressi nel tempo con grafici e report.',
    ctaText: 'Visualizza storico',
    ctaIcon: <History className={CTA_ICON_CLASS} />,
  },
  {
    href: '/home/progressi/foto',
    accent: 'emerald',
    icon: (
      /* eslint-disable-next-line jsx-a11y/alt-text -- Icona Lucide decorativa */
      <Image className={`${ICON_CLASS} text-emerald-400`} aria-hidden />
    ),
    title: 'Foto progressi',
    description:
      'Carica e confronta le tue foto nel tempo per tracciare i progressi visivi del tuo percorso.',
    ctaText: 'Visualizza foto',
    ctaIcon: (
      /* eslint-disable-next-line jsx-a11y/alt-text -- Icona Lucide decorativa */
      <Image className={CTA_ICON_CLASS} aria-hidden />
    ),
  },
]

export default function ProgressiPage() {
  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div className={SCROLL_CONTAINER_CLASS} style={SCROLL_CONTAINER_STYLE}>
        <PageHeaderGlass
          title="Progressi"
          subtitle="Monitora i tuoi progressi e le tue statistiche"
          backHref="/home"
          icon={<BarChart3 className="h-6 w-6 min-[834px]:h-7 min-[834px]:w-7 text-primary" />}
        />

        <div className="grid grid-cols-1 min-[834px]:grid-cols-2 gap-3 min-[834px]:gap-4">
          {PROGRESSI_CARDS.map((card) => (
            <ProgressiNavCard
              key={card.href}
              href={card.href}
              accent={card.accent}
              icon={card.icon}
              title={card.title}
              description={card.description}
              ctaText={card.ctaText}
              ctaIcon={card.ctaIcon}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
