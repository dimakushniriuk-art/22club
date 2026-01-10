import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ClienteFilters, ClienteSort } from '@/types/cliente'

export function useClientiFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State per filtri e ricerca
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statoFilter, setStatoFilter] = useState<'tutti' | 'attivo' | 'inattivo' | 'sospeso'>(
    (searchParams.get('stato') as 'tutti' | 'attivo' | 'inattivo' | 'sospeso') || 'tutti',
  )
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

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

  // Aggiorna URL quando cambiano i filtri
  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    router.push(`?${newParams.toString()}`)
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
