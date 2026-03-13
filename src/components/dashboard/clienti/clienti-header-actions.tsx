'use client'

import Link from 'next/link'
import type { RefObject } from 'react'
import { Button } from '@/components/ui'
import { UserRoundPlus } from 'lucide-react'

export type ClientiHeaderActionsProps = {
  canAddOrInvite: boolean
  canInvitaCliente: boolean
  onCreaAtleta: () => void
  onInvitaCliente: () => void
  creaAtletaButtonRef?: RefObject<HTMLButtonElement | null>
}

export function ClientiHeaderActions({
  canAddOrInvite,
  canInvitaCliente,
  onCreaAtleta,
  onInvitaCliente,
  creaAtletaButtonRef,
}: ClientiHeaderActionsProps) {
  if (!canAddOrInvite && !canInvitaCliente) return null

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
      {canAddOrInvite && (
        <>
          <Button
            ref={creaAtletaButtonRef}
            onClick={onCreaAtleta}
            variant="primary"
            size="sm"
            className="min-h-[44px] touch-manipulation shrink-0"
            aria-label="Aggiungi atleta"
          >
            Aggiungi Atleta
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="min-h-[44px] touch-manipulation shrink-0 px-2.5 border-white/20 hover:bg-white/5 hover:border-white/30 [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>a]:min-w-0"
          >
            <Link href="/dashboard/invita-atleta" prefetch>
              Invita Atleta
            </Link>
          </Button>
        </>
      )}
      {canInvitaCliente && (
        <Button
          onClick={onInvitaCliente}
          variant="primary"
          size="sm"
          className="min-h-[44px] touch-manipulation"
          aria-label="Invita cliente"
        >
          <UserRoundPlus className="mr-2 h-4 w-4" />
          Invita cliente
        </Button>
      )}
    </div>
  )
}
