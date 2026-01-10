'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { ClienteDropdownMenu } from '@/components/dashboard/cliente-dropdown-menu'
import type { Cliente, ClienteSort } from '@/types/cliente'

interface ClientiTableViewProps {
  clienti: Cliente[]
  selectedIds: Set<string>
  sort: ClienteSort
  total: number
  page: number
  totalPages: number
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectOne: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onSort: (field: ClienteSort['field']) => void
  onPageChange: (page: number) => void
  onEdit: (cliente: Cliente) => void
  onViewHistory: (cliente: Cliente) => void
  onViewDocuments: (cliente: Cliente) => void
  onSendEmail: (cliente: Cliente) => void
  onDelete: (cliente: Cliente) => void
}

// Funzione helper pura per generare iniziali (estratto da useAvatarInitials per uso in funzione non-React)
function getAvatarInitials(
  nome?: string,
  cognome?: string,
  email?: string,
): string {
  // Usa nome/cognome se disponibili
  if (nome || cognome) {
    const firstInitial = nome?.charAt(0)?.toUpperCase() || ''
    const lastInitial = cognome?.charAt(0)?.toUpperCase() || ''
    const initials = firstInitial + lastInitial
    if (initials) return initials
  }

  // Fallback: usa iniziali da email (prima lettera prima di @)
  if (email && email.includes('@')) {
    const emailPart = email.split('@')[0]
    if (emailPart.length >= 2) {
      // Prendi prima e seconda lettera dell'email
      return (emailPart.charAt(0) + emailPart.charAt(1)).toUpperCase()
    }
    if (emailPart.length === 1) {
      return emailPart.charAt(0).toUpperCase() + emailPart.charAt(0).toUpperCase()
    }
  }

  // Fallback finale
  return '??'
}

export function ClientiTableView({
  clienti,
  selectedIds,
  sort,
  total,
  page,
  totalPages,
  onSelectAll,
  onSelectOne,
  onSort,
  onPageChange,
  onEdit,
  onViewHistory,
  onViewDocuments,
  onSendEmail,
  onDelete,
}: ClientiTableViewProps) {
  // Helper per generare iniziali migliori (con fallback email)
  const getInitials = (cliente: Cliente): string => {
    return getAvatarInitials(
      cliente.first_name || cliente.nome || undefined,
      cliente.last_name || cliente.cognome || undefined,
      cliente.email || undefined,
    )
  }

  const renderSortIcon = (field: ClienteSort['field']) => {
    if (sort.field !== field) return <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />
    return sort.direction === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    )
  }

  const formatData = (dataString: string | null | undefined) => {
    if (!dataString || typeof dataString !== 'string') {
      return 'N/A'
    }
    
    try {
      const date = new Date(dataString)
      if (isNaN(date.getTime())) {
        return 'Data non valida'
      }
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return 'Data non valida'
    }
  }

  const getStatoBadge = (stato: string | null | undefined) => {
    // Validazione input: verifica se stato è valido
    if (!stato || typeof stato !== 'string') {
      return (
        <Badge variant="primary" size="sm">
          Non specificato
        </Badge>
      )
    }

    switch (stato) {
      case 'attivo':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle className="mr-1 h-3 w-3" />
            Attivo
          </Badge>
        )
      case 'inattivo':
        return (
          <Badge variant="primary" size="sm">
            Inattivo
          </Badge>
        )
      case 'sospeso':
        return (
          <Badge variant="warning" size="sm">
            Sospeso
          </Badge>
        )
      default:
        return (
          <Badge variant="warning" size="sm">
            Stato non valido: {stato}
          </Badge>
        )
    }
  }

  return (
    <div className="relative p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-teal-400">
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Lista Clienti ({total})</h3>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === clienti.length && clienti.length > 0}
                  onChange={onSelectAll}
                  aria-label={`Seleziona tutti (pagina corrente - ${clienti.length} clienti)`}
                />
              </TableHead>
              {/* FIX #9: Aggiunto aria-label per intestazione colonna cliccabile */}
              <TableHead 
                className="cursor-pointer select-none" 
                onClick={() => onSort('nome')}
                role="button"
                tabIndex={0}
                aria-label={`Ordina per nome ${sort.field === 'nome' ? (sort.direction === 'asc' ? 'crescente' : 'decrescente') : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSort('nome')
                  }
                }}
              >
                <div className="flex items-center">
                  Cliente
                  {renderSortIcon('nome')}
                </div>
              </TableHead>
              <TableHead>Contatti</TableHead>
              {/* FIX #9: Aggiunto aria-label per intestazione colonna cliccabile */}
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort('data_iscrizione')}
                role="button"
                tabIndex={0}
                aria-label={`Ordina per data iscrizione ${sort.field === 'data_iscrizione' ? (sort.direction === 'asc' ? 'crescente' : 'decrescente') : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSort('data_iscrizione')
                  }
                }}
              >
                <div className="flex items-center">
                  Iscrizione
                  {renderSortIcon('data_iscrizione')}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => onSort('stato')}>
                <div className="flex items-center">
                  Stato
                  {renderSortIcon('stato')}
                </div>
              </TableHead>
              {/* FIX #9: Aggiunto aria-label per intestazione colonna cliccabile */}
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort('allenamenti_mese')}
                role="button"
                tabIndex={0}
                aria-label={`Ordina per allenamenti mensili ${sort.field === 'allenamenti_mese' ? (sort.direction === 'asc' ? 'crescente' : 'decrescente') : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSort('allenamenti_mese')
                  }
                }}
              >
                <div className="flex items-center">
                  Allenamenti/mese
                  {renderSortIcon('allenamenti_mese')}
                </div>
              </TableHead>
              <TableHead>Scheda attiva</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clienti.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(cliente.id)}
                    onChange={(e) => onSelectOne(cliente.id, e)}
                    aria-label={`Seleziona ${cliente.nome} ${cliente.cognome}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold">
                      {getInitials(cliente)}
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">
                        {cliente.first_name || cliente.nome || 'Nome'}{' '}
                        {cliente.last_name || cliente.cognome || 'Cognome'}
                      </p>
                      {cliente.documenti_scadenza && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="text-state-warn h-3 w-3" />
                          <span className="text-state-warn text-xs">Doc. in scadenza</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="text-text-tertiary h-3 w-3" aria-hidden="true" />
                      <span className="text-text-secondary text-sm">{cliente.email}</span>
                    </div>
                    {cliente.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="text-text-tertiary h-3 w-3" aria-hidden="true" />
                        <span className="text-text-secondary text-sm">{cliente.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-text-tertiary h-4 w-4" aria-hidden="true" />
                    <span className="text-text-secondary text-sm">
                      {formatData(cliente.data_iscrizione)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatoBadge(cliente.stato)}</TableCell>
                <TableCell>
                  <div className="text-center">
                    <p className="text-text-primary font-bold">{cliente.allenamenti_mese}</p>
                    <p className="text-text-tertiary text-xs">questo mese</p>
                  </div>
                </TableCell>
                <TableCell>
                  {cliente.scheda_attiva ? (
                    <Badge variant="primary" size="sm">
                      {cliente.scheda_attiva}
                    </Badge>
                  ) : (
                    <span className="text-text-tertiary text-sm">Nessuna</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/atleti/${cliente.id}`}>
                      <Button variant="outline" size="sm">
                        <User className="mr-1 h-4 w-4" />
                        Profilo
                      </Button>
                    </Link>
                    <Link href={`/dashboard/atleti/${cliente.id}/chat`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Chat con ${cliente.nome} ${cliente.cognome}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </Link>
                    <ClienteDropdownMenu
                      cliente={cliente}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Altre azioni per ${cliente.nome} ${cliente.cognome}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                      onEdit={onEdit}
                      onViewHistory={onViewHistory}
                      onViewDocuments={onViewDocuments}
                      onSendEmail={onSendEmail}
                      onDelete={onDelete}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* FIX #8: Paginazione con aria-label per accessibilità */}
        {totalPages > 1 && (
          <nav className="mt-4 flex items-center justify-between" aria-label="Paginazione clienti">
            <p className="text-text-secondary text-sm" role="status" aria-live="polite">
              Pagina {page} di {totalPages} ({total} totali)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label={`Vai alla pagina precedente${page > 1 ? ` (pagina ${page - 1})` : ''}`}
                aria-disabled={page === 1}
              >
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label={`Vai alla pagina successiva${page < totalPages ? ` (pagina ${page + 1})` : ''}`}
                aria-disabled={page === totalPages}
              >
                Successiva
              </Button>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
