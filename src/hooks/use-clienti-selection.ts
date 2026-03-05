import { useState, useEffect } from 'react'
import type { Cliente } from '@/types/cliente'

export function useClientiSelection(clienti: Cliente[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Reset selection quando clienti cambiano (filtri/paginazione)
  // Mantieni solo gli ID presenti nei clienti attuali
  useEffect(() => {
    const currentIds = new Set(clienti.map((c) => c.id))
    setSelectedIds((prev) => {
      // Filtra selectedIds mantenendo solo quelli presenti in clienti attuali
      const filtered = new Set(Array.from(prev).filter((id) => currentIds.has(id)))
      // Aggiorna solo se ci sono state modifiche (evita loop infiniti)
      if (filtered.size !== prev.size || Array.from(filtered).some((id) => !prev.has(id))) {
        return filtered
      }
      return prev
    })
  }, [clienti])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(clienti.map((c) => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = new Set(selectedIds)
    if (e.target.checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const selectedClienti = clienti.filter((c) => selectedIds.has(c.id))

  return {
    selectedIds,
    selectedClienti,
    handleSelectAll,
    handleSelectOne,
    clearSelection,
  }
}
