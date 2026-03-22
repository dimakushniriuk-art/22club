'use client'

import { Card } from '@/components/ui'
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
      variant="default"
      className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
    >
      <div className="relative">
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
            className="rounded-lg border-white/20 text-text-secondary hover:bg-white/5 hover:border-white/30 transition-all duration-200"
            onClick={onReset}
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  )
}
