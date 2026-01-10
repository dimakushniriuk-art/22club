/**
 * Utility per calcolo statistiche clienti lato client
 * Ottimizzato per performance con memoization
 */

import type { Cliente } from '@/types/cliente'

export interface ClientStatsCalculation {
  totali: number
  attivi: number
  inattivi: number
  nuovi_mese: number
  documenti_scadenza: number
}

/**
 * Calcola statistiche da array di clienti
 * Ottimizzato per performance con calcoli in singolo passaggio
 */
export function calculateClientStats(clienti: Cliente[]): ClientStatsCalculation {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Calcolo in singolo passaggio per performance
  let totali = 0
  let attivi = 0
  let inattivi = 0
  let nuovi_mese = 0
  let documenti_scadenza = 0

  for (const cliente of clienti) {
    totali++

    if (cliente.stato === 'attivo') {
      attivi++
    } else if (cliente.stato === 'inattivo') {
      inattivi++
    }

    // Verifica nuovi del mese
    const dataIscrizione = cliente.data_iscrizione || cliente.created_at
    if (dataIscrizione) {
      const iscrizioneDate = new Date(dataIscrizione)
      if (iscrizioneDate >= startOfMonth) {
        nuovi_mese++
      }
    }

    // Verifica documenti in scadenza
    if (cliente.documenti_scadenza === true) {
      documenti_scadenza++
    }
  }

  return {
    totali,
    attivi,
    inattivi,
    nuovi_mese,
    documenti_scadenza,
  }
}

/**
 * Calcola statistiche con filtri applicati
 */
export function calculateFilteredClientStats(
  clienti: Cliente[],
  filters?: {
    stato?: string
    dataIscrizioneDa?: string | null
    dataIscrizioneA?: string | null
    solo_documenti_scadenza?: boolean
  },
): ClientStatsCalculation {
  // Applica filtri se presenti
  let filtered = clienti

  if (filters?.stato && filters.stato !== 'tutti') {
    filtered = filtered.filter((c) => c.stato === filters.stato)
  }

  if (filters?.dataIscrizioneDa) {
    filtered = filtered.filter((c) => {
      const date = c.data_iscrizione || c.created_at
      return date ? new Date(date) >= new Date(filters.dataIscrizioneDa!) : false
    })
  }

  if (filters?.dataIscrizioneA) {
    filtered = filtered.filter((c) => {
      const date = c.data_iscrizione || c.created_at
      return date ? new Date(date) <= new Date(filters.dataIscrizioneA!) : false
    })
  }

  if (filters?.solo_documenti_scadenza) {
    filtered = filtered.filter((c) => c.documenti_scadenza === true)
  }

  return calculateClientStats(filtered)
}
