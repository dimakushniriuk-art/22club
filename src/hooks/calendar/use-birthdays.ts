'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface BirthdayEntry {
  id: string
  name: string
}

/**
 * Atleti con compleanno nel giorno della data passata (mese/giorno).
 * orgId: filtra per organizzazione; se null non fa fetch.
 */
export function useBirthdays(date: Date, orgId: string | null): BirthdayEntry[] {
  const [entries, setEntries] = useState<BirthdayEntry[]>([])
  const dateTs = date.getTime()

  useEffect(() => {
    if (!orgId) {
      setEntries([])
      return
    }
    let cancelled = false
    const month = date.getMonth() + 1
    const day = date.getDate()
    supabase
      .from('profiles')
      .select('id, nome, cognome, data_nascita')
      .eq('org_id', orgId)
      .in('role', ['athlete', 'atleta'])
      .not('data_nascita', 'is', null)
      .then(({ data, error }) => {
        if (cancelled || error) return
        const list: BirthdayEntry[] = []
        ;(data ?? []).forEach(
          (row: {
            id: string
            nome?: string | null
            cognome?: string | null
            data_nascita?: string | null
          }) => {
            const d = row.data_nascita
            if (!d) return
            const birth = new Date(d)
            if (birth.getMonth() + 1 === month && birth.getDate() === day) {
              const name = `${row.nome ?? ''} ${row.cognome ?? ''}`.trim() || 'Atleta'
              list.push({ id: row.id, name })
            }
          },
        )
        setEntries(list)
      })
    return () => {
      cancelled = true
    }
    // dateTs deriva da date; dipendere da date causerebbe re-run a ogni render se il parent passa new Date()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, dateTs])

  return entries
}
