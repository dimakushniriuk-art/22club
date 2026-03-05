// ============================================================
// Componente Search Comunicazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { Input } from '@/components/ui'
import { Search } from 'lucide-react'

interface CommunicationsSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function CommunicationsSearch({ searchTerm, onSearchChange }: CommunicationsSearchProps) {
  return (
    <Card variant="elevated" className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cerca comunicazione..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
