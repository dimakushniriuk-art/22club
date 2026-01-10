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
    <Card
      variant="trainer"
      className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
    >
      <CardContent className="p-4 relative">
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
