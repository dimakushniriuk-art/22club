'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useNotify } from '@/lib/ui/notify'
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

/** Superficie allineata a /home/profilo (shell app, vetro + alone). */
const HOME_SURFACE_CLASS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200'

/** Blocchi che usano icona Lucide invece di emoji (single source of truth). */
const LUCIDE_BLOCCO_IDS = new Set(['schede', 'progressi', 'foto-risultati'])

function isLucideBlocco(bloccoId: string): boolean {
  return LUCIDE_BLOCCO_IDS.has(bloccoId)
}

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
    label: 'CALENDARIO',
    href: '/home/appuntamenti',
    icon: '📅',
    lucideIcon: Calendar,
    description: 'Sessioni con il tuo Trainer',
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
    description: 'Scrivi al tuo trainer',
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
    id: 'foto-risultati',
    label: 'FOTO / RISULTATI',
    href: '/home/foto-risultati',
    icon: '📷',
    lucideIcon: Image,
    description: 'Foto e risultati del tuo percorso',
  },
  {
    id: 'profilo',
    label: 'PROFILO',
    href: '/home/profilo',
    icon: '👤',
    lucideIcon: User,
    description: 'Dati personali e obiettivi',
  },
] as const

type BloccoItem = (typeof blocchiItems)[number]

/**
 * Gestisce link da email: /home?invito_cliente=UUID&azione=accetta|rifiuta
 * (useSearchParams in Suspense per compatibilità build Next.js)
 */
function HomeInvitoDaEmailHandler({
  refetchInviti,
}: {
  refetchInviti: () => void | Promise<void>
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { notify } = useNotify()

  useEffect(() => {
    const invitoId = searchParams.get('invito_cliente')
    const azione = searchParams.get('azione')
    if (!invitoId || (azione !== 'accetta' && azione !== 'rifiuta')) return

    const storageKey = `invito_email_link_${invitoId}_${azione}`
    if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
      router.replace('/home')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const rpcName =
          azione === 'accetta' ? 'accetta_invito_cliente' : 'rifiuta_invito_cliente'
        const { data, error } = await supabase.rpc(rpcName, { p_invito_id: invitoId })
        if (cancelled) return
        if (error) {
          notify(error.message ?? 'Operazione non riuscita', 'error', 'Invito')
        } else {
          const res = data as { success?: boolean; error?: string } | null
          if (res?.success) {
            if (typeof window !== 'undefined') sessionStorage.setItem(storageKey, '1')
            notify(
              azione === 'accetta' ? 'Invito accettato.' : 'Invito rifiutato.',
              'success',
              'Invito',
            )
          } else {
            notify(res?.error ?? 'Operazione non riuscita', 'error', 'Invito')
          }
        }
      } catch (e) {
        if (!cancelled) notify(e instanceof Error ? e.message : 'Errore', 'error', 'Invito')
      } finally {
        if (!cancelled) {
          router.replace('/home')
          void refetchInviti()
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, router, notify, refetchInviti])

  return null
}

// --- Sub-componenti (stesso file, nessuna modifica ad altri file) ---

interface WelcomeHeaderProps {
  nome: string | undefined
  cognome: string | undefined
  isAtleta: boolean
  invitiCount: number
  onOpenWizard: () => void
}

function WelcomeHeader({
  nome,
  cognome: _cognome,
  isAtleta,
  invitiCount,
  onOpenWizard,
}: WelcomeHeaderProps) {
  return (
    <div
      className={`relative overflow-hidden p-4 min-[834px]:p-5 animate-fade-in ${HOME_SURFACE_CLASS} hover:border-white/15`}
    >
      <div
        className={`relative text-center${isAtleta && invitiCount > 0 ? ' pr-12 min-[834px]:pr-14' : ''}`}
      >
        {isAtleta && invitiCount > 0 && (
          <button
            type="button"
            onClick={onOpenWizard}
            className="absolute right-0 top-0 z-10 flex min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Nuovo invito da un professionista"
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden />
            {invitiCount > 1 && <span className="sr-only">({invitiCount})</span>}
          </button>
        )}
        <h1 className="mb-1 text-lg font-bold tracking-tight text-cyan-400 min-[834px]:text-xl">
          Ciao! 👋{nome?.trim() ? ` ${nome.trim()}` : ''}
        </h1>
        <p className="text-xs text-text-secondary min-[834px]:text-sm">
          Gestisci i tuoi allenamenti, progressi e molto altro
        </p>
      </div>
    </div>
  )
}

interface HomeBloccoCardProps {
  blocco: BloccoItem
  accent: BloccoAccentColors
  useLucide: boolean
  EmojiIconComponent: React.ComponentType<{
    size?: number
    color?: string
    className?: string
  }> | null
}

function HomeBloccoCard({
  blocco,
  accent: _accent,
  useLucide,
  EmojiIconComponent,
}: HomeBloccoCardProps) {
  const IconComponent = blocco.lucideIcon
  const isProfilo = blocco.id === 'profilo'

  return (
    <Link
      href={blocco.href}
      prefetch={true}
      className={`group relative flex min-h-[104px] touch-manipulation flex-col items-center justify-center gap-2 py-4 px-3 transition-all duration-200 ease-out hover:border-white/20 hover:scale-[1.01] active:scale-[0.99] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background min-[834px]:min-h-[118px] min-[834px]:gap-2.5 min-[834px]:py-5 min-[834px]:px-4 ${HOME_SURFACE_CLASS} hover:border-white/20 ${isProfilo ? 'col-span-2 min-[834px]:col-span-3 min-[834px]:min-h-[104px] w-full' : ''}`}
      aria-label={`Vai a ${blocco.label}`}
    >
      <div className="relative z-10 flex items-center justify-center">
        {useLucide && IconComponent ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-100 min-[834px]:p-3">
            <IconComponent
              className="h-6 w-6 text-cyan-400 min-[834px]:h-8 min-[834px]:w-8"
              strokeWidth={2.25}
            />
          </div>
        ) : EmojiIconComponent ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-100 min-[834px]:p-3">
            <EmojiIconComponent
              size={24}
              color="#22d3ee"
              className="h-6 w-6 min-[834px]:h-8 min-[834px]:w-8"
            />
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
        className="absolute bottom-2 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-white/30 transition-all duration-200 ease-out group-hover:w-12"
        aria-hidden
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
    const iconComponents: Record<
      string,
      React.ComponentType<{ size?: number; color?: string; className?: string }>
    > = {}
    for (const blocco of blocchiItems) {
      if (!isLucideBlocco(blocco.id)) {
        const IconComponent = iconMap[blocco.icon as keyof typeof iconMap]
        if (IconComponent) iconComponents[blocco.id] = IconComponent
      }
    }
    return iconComponents
  }, [])

  const accentMap = useMemo(() => {
    return Object.fromEntries(
      blocchiItems.map((b) => [b.id, getBloccoAccentColors(b.id)]),
    ) as Record<string, BloccoAccentColors>
  }, [])

  if (!user || !isValidUser) {
    return (
      <div className="bg-background min-h-dvh px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24" />
    )
  }

  return (
    <div className="relative w-full max-w-full bg-background px-3 pb-28 pt-0.5 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24">
      <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl">
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
        {isAtleta ? (
          <Suspense fallback={null}>
            <HomeInvitoDaEmailHandler refetchInviti={refetchInviti} />
          </Suspense>
        ) : null}
        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 min-[834px]:grid-cols-3">
          {blocchiItems.map((blocco) => (
            <HomeBloccoCard
              key={blocco.id}
              blocco={blocco}
              accent={accentMap[blocco.id] ?? getBloccoAccentColors(blocco.id)}
              useLucide={isLucideBlocco(blocco.id)}
              EmojiIconComponent={
                isLucideBlocco(blocco.id) ? null : (emojiIconComponents[blocco.id] ?? null)
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
