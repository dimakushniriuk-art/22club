'use client'

import { Card, CardContent } from '@/components/ui'
import type { Document } from '@/types/document'

interface DocumentsStatsCardsProps {
  documents: Document[]
}

export function DocumentsStatsCards({ documents }: DocumentsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-4">
      <Card
        variant="default"
        className="relative overflow-hidden border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200"
        style={{ animationDelay: '100ms' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
        <CardContent className="p-4 text-center relative">
          <div className="text-green-400 text-2xl font-bold">
            {documents.filter((d) => d.status === 'valido').length}
          </div>
          <div className="text-text-secondary text-sm">Validi</div>
        </CardContent>
      </Card>
      <Card
        variant="default"
        className="relative overflow-hidden border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200"
        style={{ animationDelay: '200ms' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />
        <CardContent className="p-4 text-center relative">
          <div className="text-orange-400 text-2xl font-bold">
            {documents.filter((d) => d.status === 'in_scadenza').length}
          </div>
          <div className="text-text-secondary text-sm">In scadenza</div>
        </CardContent>
      </Card>
      <Card
        variant="default"
        className="relative overflow-hidden border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200"
        style={{ animationDelay: '300ms' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5" />
        <CardContent className="p-4 text-center relative">
          <div className="text-red-400 text-2xl font-bold">
            {documents.filter((d) => d.status === 'scaduto').length}
          </div>
          <div className="text-text-secondary text-sm">Scaduti</div>
        </CardContent>
      </Card>
      <Card
        variant="default"
        className="relative overflow-hidden border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200"
        style={{ animationDelay: '400ms' }}
      >
        <CardContent className="p-4 text-center relative">
          <div className="text-teal-400 text-2xl font-bold">{documents.length}</div>
          <div className="text-text-secondary text-sm">Totali</div>
        </CardContent>
      </Card>
    </div>
  )
}
