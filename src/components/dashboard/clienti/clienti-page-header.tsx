'use client'

import Link from 'next/link'
import type { RefObject } from 'react'
import { Button } from '@/components/ui'
import { UserPlus, UserRoundPlus } from 'lucide-react'
import { colors } from '@/lib/design-tokens'

export type ClientiPageHeaderProps = {
  canAddOrInvite: boolean
  canInvitaCliente: boolean
  onCreaAtleta: () => void
  onInvitaCliente: () => void
  /** Ref per focus dopo chiusura modale Crea Atleta */
  creaAtletaButtonRef?: RefObject<HTMLButtonElement | null>
}

export function ClientiPageHeader({
  canAddOrInvite,
  canInvitaCliente,
  onCreaAtleta,
  onInvitaCliente,
  creaAtletaButtonRef,
}: ClientiPageHeaderProps) {
  return (
    <header className="shrink-0">
      <div className="rounded-3xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border border-white/5 backdrop-blur-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Clienti
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Gestisci i tuoi atleti e monitora i progressi
            </p>
            <div className="mt-3 sm:mt-4 h-[3px] w-28 rounded-full bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
          </div>
          <div className="flex flex-wrap gap-2">
            {canAddOrInvite && (
              <>
                <Button
                  ref={creaAtletaButtonRef}
                  onClick={onCreaAtleta}
                  size="sm"
                  className="min-h-[44px] touch-manipulation rounded-full bg-gradient-to-br from-primary/90 to-primary/80 text-white font-semibold shadow-md shadow-primary/25 ring-1 ring-primary/30 hover:shadow-glow transition-all duration-200"
                  aria-label="Aggiungi atleta"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Aggiungi Atleta
                </Button>
                <Link href="/dashboard/invita-atleta" prefetch>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[44px] touch-manipulation rounded-full border border-white/5 bg-background-secondary/35 text-text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-300"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invita Atleta
                  </Button>
                </Link>
              </>
            )}
            {canInvitaCliente && (
              <Button
                onClick={onInvitaCliente}
                size="md"
                className="min-h-[44px] touch-manipulation px-5 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 hover:opacity-90 border-0"
                style={{
                  background: `linear-gradient(to right, ${colors.athleteAccents.teal.bar}, ${colors.athleteAccents.cyan.bar})`,
                  boxShadow: `0 10px 15px -3px ${colors.athleteAccents.teal.bar}40`,
                }}
              >
                <UserRoundPlus className="mr-2 h-5 w-5" aria-hidden />
                Invita cliente
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
