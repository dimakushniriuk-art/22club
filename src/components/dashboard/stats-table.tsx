'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, Search, ChevronUp, ChevronDown, Eye } from 'lucide-react'

export interface AthleteStats {
  athlete_id: string
  nome_atleta: string
  email_atleta: string
  data_iscrizione: string
  entrate_totali: number
  lezioni_acquistate: number
  lezioni_utilizzate: number
  lezioni_rimanenti: number
  schede_assegnate: number
  schede_completate: number
  schede_attive: number
  misurazioni_totali: number
  ultima_misurazione: string
  foto_totali: number
  ultima_foto: string
  percentuale_completamento_schede: number
  percentuale_utilizzo_lezioni: number
}

interface StatsTableProps {
  data: AthleteStats[]
  onExport: () => void
}

type SortField = keyof AthleteStats
type SortDirection = 'asc' | 'desc'

export function StatsTable({ data, onExport }: StatsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('nome_atleta')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([])
  const router = useRouter()

  // Error boundary per dati mancanti
  if (!data || !Array.isArray(data)) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <div className="text-red-400 mb-4">
            <Eye className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-bold mb-2">Errore nei dati della tabella</h3>
          <p className="text-text-secondary">I dati degli atleti non sono disponibili</p>
        </CardContent>
      </Card>
    )
  }

  const filteredData = data.filter(
    (athlete: AthleteStats) =>
      athlete.nome_atleta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.email_atleta.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedData = [...filteredData].sort((a: AthleteStats, b: AthleteStats) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedAthletes.length === sortedData.length) {
      setSelectedAthletes([])
    } else {
      setSelectedAthletes(sortedData.map((athlete) => athlete.athlete_id))
    }
  }

  const handleSelectAthlete = (athleteId: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(athleteId) ? prev.filter((id) => id !== athleteId) : [...prev, athleteId],
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getCompletionBadge = (percentage: number) => {
    if (percentage >= 80) return { variant: 'success' as const, text: 'Ottimo' }
    if (percentage >= 60) return { variant: 'warning' as const, text: 'Buono' }
    if (percentage >= 40) return { variant: 'warning' as const, text: 'Medio' }
    return { variant: 'error' as const, text: 'Basso' }
  }

  const getUsageBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: 'success' as const, text: 'Alto' }
    if (percentage >= 70) return { variant: 'warning' as const, text: 'Medio' }
    return { variant: 'error' as const, text: 'Basso' }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Controlli */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="text-text-tertiary absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Cerca atleta..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 bg-background-secondary border-background-tertiary/50 focus:border-blue-500/50"
            />
          </div>
          <div className="text-text-secondary text-sm font-medium">
            {filteredData.length} atleti trovati
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
            className="flex items-center gap-2 bg-background-secondary border-background-tertiary/50 hover:border-blue-500/50 hover:bg-background-tertiary/50 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Esporta CSV
          </Button>
        </div>
      </div>

      {/* Tabella */}
      <div className="overflow-hidden rounded-xl border border-background-tertiary/50 bg-background-secondary/30 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-background-tertiary/50 to-background-tertiary/30 border-b border-background-tertiary/50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedAthletes.length === sortedData.length && sortedData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </TableHead>
              <TableHead
                className="hover:bg-background-tertiary cursor-pointer"
                onClick={() => handleSort('nome_atleta')}
              >
                <div className="flex items-center gap-2">
                  Nome Atleta
                  <SortIcon field="nome_atleta" />
                </div>
              </TableHead>
              <TableHead
                className="hover:bg-background-tertiary cursor-pointer"
                onClick={() => handleSort('entrate_totali')}
              >
                <div className="flex items-center gap-2">
                  Entrate Totali
                  <SortIcon field="entrate_totali" />
                </div>
              </TableHead>
              <TableHead
                className="hover:bg-background-tertiary cursor-pointer"
                onClick={() => handleSort('lezioni_acquistate')}
              >
                <div className="flex items-center gap-2">
                  Lezioni
                  <SortIcon field="lezioni_acquistate" />
                </div>
              </TableHead>
              <TableHead
                className="hover:bg-background-tertiary cursor-pointer"
                onClick={() => handleSort('percentuale_completamento_schede')}
              >
                <div className="flex items-center gap-2">
                  % Completamento
                  <SortIcon field="percentuale_completamento_schede" />
                </div>
              </TableHead>
              <TableHead
                className="hover:bg-background-tertiary cursor-pointer"
                onClick={() => handleSort('percentuale_utilizzo_lezioni')}
              >
                <div className="flex items-center gap-2">
                  % Utilizzo
                  <SortIcon field="percentuale_utilizzo_lezioni" />
                </div>
              </TableHead>
              <TableHead
                className="hover:bg-background-tertiary cursor-pointer"
                onClick={() => handleSort('ultima_misurazione')}
              >
                <div className="flex items-center gap-2">
                  Ultima Misurazione
                  <SortIcon field="ultima_misurazione" />
                </div>
              </TableHead>
              <TableHead className="w-12">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((athlete) => {
              const completionBadge = getCompletionBadge(athlete.percentuale_completamento_schede)
              const usageBadge = getUsageBadge(athlete.percentuale_utilizzo_lezioni)

              return (
                <TableRow
                  key={athlete.athlete_id}
                  className="hover:bg-background-tertiary/50 border-b border-background-tertiary/30 transition-colors duration-200"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedAthletes.includes(athlete.athlete_id)}
                      onChange={() => handleSelectAthlete(athlete.athlete_id)}
                      className="rounded border-border"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-text-primary font-medium">{athlete.nome_atleta}</div>
                      <div className="text-text-tertiary text-sm">{athlete.email_atleta}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-text-primary font-medium">
                      {formatCurrency(athlete.entrate_totali)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-text-primary">
                      {athlete.lezioni_utilizzate}/{athlete.lezioni_acquistate}
                    </div>
                    <div className="text-text-tertiary text-sm">
                      {athlete.lezioni_rimanenti} rimanenti
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={completionBadge.variant} size="sm">
                      {completionBadge.text} ({athlete.percentuale_completamento_schede.toFixed(0)}
                      %)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usageBadge.variant} size="sm">
                      {usageBadge.text} ({athlete.percentuale_utilizzo_lezioni.toFixed(0)}%)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-text-primary">
                      {formatDate(athlete.ultima_misurazione)}
                    </div>
                    <div className="text-text-tertiary text-sm">
                      {athlete.misurazioni_totali} misurazioni
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        router.push(`/dashboard/atleti/${athlete.athlete_id}`)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="text-text-tertiary flex items-center justify-between text-sm pt-4 border-t border-background-tertiary/30">
        <div className="font-medium">
          Mostrando {sortedData.length} di {data.length} atleti
        </div>
        <div className="flex items-center gap-4">
          <div className="text-text-secondary">
            {selectedAthletes.length > 0 && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                {selectedAthletes.length} selezionati
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2 bg-background-secondary border-background-tertiary/50 hover:border-blue-500/50 hover:bg-background-tertiary/50 transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>
    </div>
  )
}
