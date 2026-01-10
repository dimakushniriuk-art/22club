'use client'

import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import { Search, X } from 'lucide-react'
import { PAYMENT_METHODS, PAYMENT_FILTERS } from '@/data/mock-payments-data'

interface PaymentsFiltersProps {
  searchTerm: string
  methodFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onMethodFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onReset: () => void
}

export function PaymentsFilters({
  searchTerm,
  methodFilter,
  statusFilter,
  onSearchChange,
  onMethodFilterChange,
  onStatusFilterChange,
  onReset,
}: PaymentsFiltersProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
    >
      <CardContent className="p-4 relative">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input
            placeholder="Cerca per atleta, metodo o note..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />

          <SimpleSelect
            value={methodFilter}
            onValueChange={onMethodFilterChange}
            options={PAYMENT_METHODS}
            placeholder="Tutti i metodi"
          />

          <SimpleSelect
            value={statusFilter}
            onValueChange={onStatusFilterChange}
            options={PAYMENT_FILTERS}
            placeholder="Tutti i pagamenti"
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
