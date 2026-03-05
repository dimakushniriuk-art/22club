'use client'

import { useMemo } from 'react'

/** Ruoli staff con permessi limitati (solo Invita cliente). Vuoto: solo trainer/admin gestiscono clienti. */
const ROLES_STAFF_READONLY_ADD: readonly string[] = []

export type ClientiPermissions = {
  canAddOrInvite: boolean
  canInvitaCliente: boolean
  canManageClienti: boolean
  canShowStartChat: boolean
}

/**
 * Permessi per la pagina Clienti in base al ruolo.
 * canAddOrInvite: può usare Aggiungi atleta / Invita atleta (trainer, admin).
 * canInvitaCliente: può usare solo Invita cliente (ruoli non più in uso).
 * canManageClienti: come canAddOrInvite (modifica/elimina/storico/documenti).
 * canShowStartChat: mostra azione Avvia chat (ruoli non più in uso).
 */
export function useClientiPermissions(role: string | null): ClientiPermissions {
  return useMemo(() => {
    const canAddOrInvite = role !== null && !ROLES_STAFF_READONLY_ADD.includes(role)
    const canInvitaCliente = role !== null && ROLES_STAFF_READONLY_ADD.includes(role)
    return {
      canAddOrInvite,
      canInvitaCliente,
      canManageClienti: canAddOrInvite,
      canShowStartChat: role !== null && ROLES_STAFF_READONLY_ADD.includes(role),
    }
  }, [role])
}
