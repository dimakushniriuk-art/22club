import { useState, useMemo } from 'react'
import { extractFileName } from '@/lib/documents'
import type { Document } from '@/types/document'

export function useDocumentsFilters(documents: Document[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Filtra documenti
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents]

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.athlete_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          extractFileName(doc.file_url).toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((doc) => doc.status === statusFilter)
    }

    if (categoryFilter) {
      filtered = filtered.filter((doc) => doc.category === categoryFilter)
    }

    return filtered
  }, [documents, searchTerm, statusFilter, categoryFilter])

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setCategoryFilter('')
  }

  return {
    searchTerm,
    statusFilter,
    categoryFilter,
    filteredDocuments,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    resetFilters,
  }
}
