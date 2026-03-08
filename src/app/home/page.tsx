'use client'

import React, { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { isValidProfile } from '@/lib/utils/type-guards'
import { useInvitiCliente } from '@/hooks/use-inviti-cliente'
import { InvitoClienteWizard } from '@/components/home/invito-cliente-wizard'
import {
  Dumbbell,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  User,
  Image,
  Mail,
} from 'lucide-react'
import { iconMap } from '@/components/ui/professional-icons'
import { getBloccoAccentColors, type BloccoAccentColors } from '@/lib/design-system-data'
import { colors } from '@/lib/design-tokens'

/** Blocchi che usano icona Lucide invece di emoji (single source of truth). */
const LUCIDE_BLOCCO_IDS = new Set([
  'schede',
  'progressi',
  'foto-risultati',
])

function isLucideBlocco(bloccoId: string): boolean {
  return LUCIDE_BLOCCO_IDS.has(bloccoId)
}

const blocchiItems = [
  { id: 'schede', label: 'SCHEDE', href: '/home/allenamenti', icon: '💪', lucideIcon: Dumbbell, description: 'Il tuo programma di allenamento' },
  { id: 'appuntamenti', label: 'CALENDARIO', href: '/home/appuntamenti', icon: '📅', lucideIcon: Calendar, description: 'Sessioni con il tuo Trainer' },
  { id: 'progressi', label: 'PROGRESSI', href: '/home/progressi', icon: '📊', lucideIcon: BarChart3, description: 'Misure, foto e risultati' },
  { id: 'chat', label: 'CHAT', href: '/home/chat', icon: '💬', lucideIcon: MessageSquare, description: 'Scrivi al tuo trainer' },
  { id: 'documenti', label: 'DOCUMENTI', href: '/home/documenti', icon: '📄', lucideIcon: FileText, description: 'Referti, piani e file' },
  { id: 'foto-risultati', label: 'FOTO / RISULTATI', href: '/home/foto-risultati', icon: '📷', lucideIcon: Image, description: 'Foto e risultati del tuo percorso' },
  { id: 'profilo', label: 'PROFILO', href: '/home/profilo', icon: '👤', lucideIcon: User, description: 'Dati personali e obiettivi' },
] as const

type BloccoItem = (typeof blocchiItems)[number]

// --- Skeleton (stile costante, nessun oggetto inline per evitare re-render inutili) ---
const SKELETON_CONTAINER_STYLE = { overflow: 'auto' as const }

// --- Sub-componenti (stesso file, nessuna modifica ad altri file) ---

const PLACEHOLDER_NAMES = new Set(['Nome', 'Cognome', 'Nome Cognome'])

function toDisplayName(nome: string | undefined, cognome: string | undefined): string {
  const raw = [nome, cognome].filter(Boolean).join(' ').trim()
  return PLACEHOLDER_NAMES.has(raw) ? '' : raw
}

interface WelcomeHeaderProps {
  nome: string | undefined
  cognome: string | undefined
  isAtleta: boolean
  invitiCount: number
  onOpenWizard: () => void
}

function WelcomeHeader({ nome, cognome, isAtleta, invitiCount, onOpenWizard }: WelcomeHeaderProps) {
  const displayName = toDisplayName(nome, cognome)
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl min-[834px]:p-5 animate-fade-in"
      style={{
        border: '1px solid rgba(2, 179, 191, 0.4)',
        background: 'linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.06) 100%)',
        boxShadow: '0 4px 28px rgba(0,0,0,0.22), 0 0 0 1px rgba(2,179,191,0.12) inset',
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-70"
        style={{ background: 'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)' }}
        aria-hidden
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-lg font-bold tracking-tight text-white min-[834px]:text-xl">
            Benvenuto{displayName ? `, ${displayName}` : ''} 👋
          </h1>
          <p className="text-xs text-text-secondary min-[834px]:text-sm">
            Gestisci i tuoi allenamenti, progressi e molto altro
          </p>
          <p className="mt-2 text-[11px] font-medium min-[834px]:text-xs text-primary">
            Pronto per l&apos;allenamento? Tutto sotto il tuo controllo.
          </p>
        </div>
        {isAtleta && invitiCount > 0 && (
          <button
            type="button"
            onClick={onOpenWizard}
            className="flex shrink-0 items-center justify-center rounded-xl w-10 h-10 text-white shadow-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-background border-0"
            style={{
              background: `linear-gradient(to right, ${colors.athleteAccents.teal.bar}, ${colors.athleteAccents.cyan.bar})`,
              boxShadow: `0 8px 16px -4px ${colors.athleteAccents.teal.bar}50`,
            }}
            aria-label="Nuovo invito da un professionista"
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden />
            {invitiCount > 1 && <span className="sr-only">({invitiCount})</span>}
          </button>
        )}
      </div>
    </div>
  )
}

interface HomeBloccoCardProps {
  blocco: BloccoItem
  accent: BloccoAccentColors
  useLucide: boolean
  EmojiIconComponent: React.ComponentType<{ size?: number; color?: string; className?: string }> | null
}

function HomeBloccoCard({ blocco, accent, useLucide, EmojiIconComponent }: HomeBloccoCardProps) {
  const IconComponent = blocco.lucideIcon
  const isProfilo = blocco.id === 'profilo'

  return (
    <Link
      href={blocco.href}
      prefetch={true}
      className={`group relative flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-2xl py-4 px-3 backdrop-blur-md transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background min-[834px]:min-h-[112px] min-[834px]:gap-2.5 min-[834px]:py-5 min-[834px]:px-4 ${isProfilo ? 'col-span-2 min-[834px]:col-span-3 min-[834px]:min-h-[100px] w-full' : ''}`}
      style={{
        border: `1px solid ${accent.border}`,
        background: 'linear-gradient(145deg, rgba(26,26,30,0.88) 0%, rgba(22,22,26,0.92) 100%)',
        boxShadow: `inset 6px 0 0 0 ${accent.bar}, inset -6px 0 0 0 ${accent.bar}, 0 4px 20px rgba(0,0,0,0.24), 0 0 0 1px rgba(255,255,255,0.04) inset`,
      }}
      aria-label={`Vai a ${blocco.label}`}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-100 transition-opacity duration-200 ease-out group-hover:opacity-0"
        style={{
          background: `radial-gradient(ellipse 85% 60% at 50% 0%, ${accent.gradientStart} 0%, transparent 65%)`,
          boxShadow: `inset 0 0 32px ${accent.glow}`,
        }}
        aria-hidden
      />
      <div className="relative z-10 flex items-center justify-center">
        {useLucide && IconComponent ? (
          <div
            className="rounded-xl p-2.5 transition-transform duration-200 ease-out group-hover:scale-110 group-active:scale-100 min-[834px]:p-3"
            style={{ backgroundColor: accent.iconBg }}
          >
            <IconComponent className="h-6 w-6 text-white min-[834px]:h-8 min-[834px]:w-8" strokeWidth={2.25} />
          </div>
        ) : EmojiIconComponent ? (
          <div
            className="rounded-xl p-2.5 transition-transform duration-200 ease-out group-hover:scale-110 group-active:scale-100 min-[834px]:p-3"
            style={{ backgroundColor: accent.iconBg }}
          >
            <EmojiIconComponent size={24} color="#ffffff" className="h-6 w-6 min-[834px]:h-8 min-[834px]:w-8" />
          </div>
        ) : null}
      </div>
      <span className="relative z-10 text-center text-[11px] font-bold uppercase leading-tight tracking-wider text-white min-[834px]:text-xs">
        {blocco.label}
      </span>
      <span className="relative z-10 line-clamp-2 px-1 text-center text-[10px] leading-snug text-white/65 transition-colors duration-200 group-hover:text-white/90 min-[834px]:text-xs">
        {blocco.description}
      </span>
      <div
        className="absolute bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full transition-all duration-200 ease-out group-hover:w-12"
        style={{ backgroundColor: accent.bar }}
      />
    </Link>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const profileId = user?.id ?? null
  const isAtleta = user?.role === 'athlete'
  const { inviti, refetch: refetchInviti } = useInvitiCliente(isAtleta ? profileId : null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedInvitoIndex, setSelectedInvitoIndex] = useState(0)
  const selectedInvito = inviti[selectedInvitoIndex] ?? null

  const openWizard = useCallback(() => {
    setSelectedInvitoIndex(0)
    setWizardOpen(true)
  }, [])

  const handleWizardSuccess = useCallback(() => {
    refetchInviti()
  }, [refetchInviti])

  const isValidUser = user && isValidProfile(user)

  const emojiIconComponents = useMemo(() => {
    const iconComponents: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {}
    for (const blocco of blocchiItems) {
      if (!isLucideBlocco(blocco.id)) {
        const IconComponent = iconMap[blocco.icon as keyof typeof iconMap]
        if (IconComponent) iconComponents[blocco.id] = IconComponent
      }
    }
    return iconComponents
  }, [])

  const accentMap = useMemo(() => {
    return Object.fromEntries(blocchiItems.map((b) => [b.id, getBloccoAccentColors(b.id)])) as Record<string, BloccoAccentColors>
  }, [])

  const mainContainerStyle = useMemo(
    () => ({
      overflow: 'auto' as const,
      minHeight: 'calc(100dvh - 56px)',
      background: 'radial-gradient(ellipse 120% 80% at 70% -20%, rgba(2,179,191,0.07) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 0% 50%, rgba(6,182,212,0.05) 0%, transparent 45%), #101012',
    }),
    []
  )

  if (!user || !isValidUser) {
    return (
      <div
        className="bg-background min-h-dvh space-y-3 px-3 sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5"
        style={SKELETON_CONTAINER_STYLE}
      >
        <div className="animate-pulse space-y-3">
          <div className="bg-background-tertiary h-6 w-40 rounded" />
          <div className="grid grid-cols-2 min-[834px]:grid-cols-3 gap-2.5 min-[834px]:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-background-tertiary h-28 min-[834px]:h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-0 w-full max-w-full space-y-5 min-[834px]:space-y-6 px-3 pb-6 pt-4 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:py-5"
      style={mainContainerStyle}
    >
      <WelcomeHeader
        nome={user.nome}
        cognome={user.cognome}
        isAtleta={isAtleta}
        invitiCount={inviti.length}
        onOpenWizard={openWizard}
      />
      <InvitoClienteWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        invito={selectedInvito}
        onSuccess={handleWizardSuccess}
        onRefetchInviti={refetchInviti}
      />
      <div className="relative z-10 grid grid-cols-2 gap-3 min-[834px]:grid-cols-3 min-[834px]:gap-5">
        {blocchiItems.map((blocco) => (
          <HomeBloccoCard
            key={blocco.id}
            blocco={blocco}
            accent={accentMap[blocco.id] ?? getBloccoAccentColors(blocco.id)}
            useLucide={isLucideBlocco(blocco.id)}
            EmojiIconComponent={isLucideBlocco(blocco.id) ? null : emojiIconComponents[blocco.id] ?? null}
          />
        ))}
      </div>
    </div>
  )
}
