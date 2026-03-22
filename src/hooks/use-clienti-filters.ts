import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ClienteFilters, ClienteSort } from '@/types/cliente'

const DEFAULT_STATO = 'tutti' as const

export function useClientiFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State per filtri e ricerca (iniziale da URL)
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '')
  const [statoFilter, setStatoFilter] = useState<'tutti' | 'attivo' | 'inattivo' | 'sospeso'>(
    () => {
      const s = searchParams.get('stato') as 'tutti' | 'attivo' | 'inattivo' | 'sospeso' | null
      return s && ['tutti', 'attivo', 'inattivo', 'sospeso'].includes(s) ? s : DEFAULT_STATO
    },
  )
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get('page'))
    return Number.isFinite(p) && p >= 1 ? p : 1
  })

  // Sincronizza stato da URL (es. indietro/avanti del browser)
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
    const s = searchParams.get('stato') as 'tutti' | 'attivo' | 'inattivo' | 'sospeso' | null
    setStatoFilter(s && ['tutti', 'attivo', 'inattivo', 'sospeso'].includes(s) ? s : DEFAULT_STATO)
    const p = Number(searchParams.get('page'))
    setPage(Number.isFinite(p) && p >= 1 ? p : 1)
  }, [searchParams])

  // Sorting state
  const [sort, setSort] = useState<ClienteSort>({
    field: 'data_iscrizione',
    direction: 'desc',
  })

  // Filtri avanzati
  const [advancedFilters, setAdvancedFilters] = useState<Partial<ClienteFilters>>({
    dataIscrizioneDa: null,
    dataIscrizioneA: null,
    allenamenti_min: null,
    solo_documenti_scadenza: false,
  })

  // Debounce della ricerca
  const debouncedSearch = useDebouncedValue(searchTerm, 300)

  // Costruisci filtri completi
  // Normalizza advancedFilters per evitare ricreazioni quando i valori sono identici
  const normalizedAdvancedFilters = useMemo(() => {
    return {
      dataIscrizioneDa: advancedFilters.dataIscrizioneDa || null,
      dataIscrizioneA: advancedFilters.dataIscrizioneA || null,
      allenamenti_min: advancedFilters.allenamenti_min || null,
      solo_documenti_scadenza: advancedFilters.solo_documenti_scadenza || false,
      tags: advancedFilters.tags || [],
    }
  }, [
    advancedFilters.dataIscrizioneDa,
    advancedFilters.dataIscrizioneA,
    advancedFilters.allenamenti_min,
    advancedFilters.solo_documenti_scadenza,
    advancedFilters.tags,
  ])

  const filters: Partial<ClienteFilters> = useMemo(
    () => ({
      search: debouncedSearch || '',
      stato: statoFilter || 'tutti',
      ...normalizedAdvancedFilters,
    }),
    [debouncedSearch, statoFilter, normalizedAdvancedFilters],
  )

  // Aggiorna URL quando cambiano i filtri (replace per non accumulare history)
  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    const query = newParams.toString()
    router.replace(query ? `/dashboard/clienti?${query}` : '/dashboard/clienti', { scroll: false })
  }

  // Handler per ordinamento colonne
  const handleSort = (field: ClienteSort['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value)
    updateURL({ search: value })
  }

  const updateStatoFilter = (value: 'tutti' | 'attivo' | 'inattivo' | 'sospeso') => {
    setStatoFilter(value)
    updateURL({ stato: value })
  }

  const updatePage = (newPage: number) => {
    setPage(newPage)
    updateURL({ page: String(newPage) })
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatoFilter('tutti')
    setAdvancedFilters({})
    setPage(1)
    updateURL({ search: '', stato: 'tutti', page: '1' })
  }

  return {
    searchTerm,
    statoFilter,
    page,
    sort,
    advancedFilters,
    filters,
    updateSearchTerm,
    updateStatoFilter,
    updatePage,
    setSort,
    handleSort,
    setAdvancedFilters,
    resetFilters,
  }
}
