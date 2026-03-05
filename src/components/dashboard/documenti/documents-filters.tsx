'use client'

import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import { Search, X } from 'lucide-react'
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUSES } from '@/data/mock-documents-data'

interface DocumentsFiltersProps {
  searchTerm: string
  statusFilter: string
  categoryFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onReset: () => void
}

export function DocumentsFilters({
  searchTerm,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onReset,
}: DocumentsFiltersProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
    >
      <CardContent className="p-4 relative">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input
            placeholder="Cerca per atleta, file o categoria..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />

          <SimpleSelect
            value={statusFilter}
            onValueChange={onStatusFilterChange}
            options={DOCUMENT_STATUSES}
          />

          <SimpleSelect
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
            options={DOCUMENT_CATEGORIES}
          />

          <Button
            variant="outline"
            className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
            onClick={onReset}
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
