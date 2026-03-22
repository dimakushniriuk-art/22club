'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface InvitoClienteRow {
  id: string
  staff_id: string
  atleta_id: string
  stato: string
  created_at: string
  expires_at: string | null
  responded_at: string | null
}

/** Invito con dati staff (nome, cognome, ruolo, avatar) per wizard */
export interface InvitoClienteConStaff extends InvitoClienteRow {
  staff_nome: string | null
  staff_cognome: string | null
  staff_role: string | null
  staff_avatar_url: string | null
  /** true se l'atleta ha già un altro professionista attivo (stesso tipo) → può disdire per accettare questo */
  atleta_ha_altro_attivo?: boolean
}

/**
 * Fetch inviti in attesa per l'atleta corrente (atleta_id = profileId).
 * Filtra: stato = 'in_attesa' e (expires_at IS NULL OR expires_at > NOW()).
 */
export function useInvitiCliente(profileId: string | null) {
  const [inviti, setInviti] = useState<InvitoClienteConStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!profileId) {
      setInviti([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: rows, error: fetchError } = await supabase.rpc(
        'get_inviti_cliente_atleta_con_staff',
      )

      if (fetchError) {
        setError(fetchError.message)
        setInviti([])
        return
      }

      const list = (rows ?? []) as InvitoClienteConStaff[]
      setInviti(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento inviti')
      setInviti([])
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { inviti, loading, error, refetch }
}

/** Riga restituita da get_inviti_cliente_pendenti_staff (inviti in attesa per lo staff) */
export interface InvitoPendenteStaff {
  invito_id: string
  atleta_id: string
  nome: string | null
  cognome: string | null
  email: string | null
  created_at: string | null
}

/**
 * Fetch inviti in attesa creati dallo staff corrente (nutrizionista/massaggiatore).
 * Usato in Dashboard Clienti con filtro Inattivi per mostrare atleti invitati ma non ancora accettati.
 */
export function useInvitiClientePendentiStaff(staffProfileId: string | null) {
  const [pendenti, setPendenti] = useState<InvitoPendenteStaff[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!staffProfileId) {
      setPendenti([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: rpcError } = await supabase.rpc('get_inviti_cliente_pendenti_staff')

      if (rpcError) {
        setError(rpcError.message)
        setPendenti([])
        return
      }

      const list = (data ?? []) as InvitoPendenteStaff[]
      setPendenti(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore caricamento inviti pendenti')
      setPendenti([])
    } finally {
      setLoading(false)
    }
  }, [staffProfileId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { pendenti, loading, error, refetch }
}
