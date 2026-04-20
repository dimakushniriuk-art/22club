'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
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
} from 'lucide-react'
import { ClienteDropdownMenu } from '@/components/dashboard/cliente-dropdown-menu'
import type { Cliente, ClienteSort } from '@/types/cliente'

function getAvatarInitials(nome?: string, cognome?: string, email?: string): string {
  if (nome || cognome) {
    const firstInitial = nome?.charAt(0)?.toUpperCase() || ''
    const lastInitial = cognome?.charAt(0)?.toUpperCase() || ''
    const initials = firstInitial + lastInitial
    if (initials) return initials
  }
  if (email && email.includes('@')) {
    const emailPart = email.split('@')[0]
    if (emailPart.length >= 2) {
      return (emailPart.charAt(0) + emailPart.charAt(1)).toUpperCase()
    }
    if (emailPart.length === 1) {
      return emailPart.charAt(0).toUpperCase() + emailPart.charAt(0).toUpperCase()
    }
  }
  return '??'
}

export interface MassaggiatoreClientiTableViewProps {
  clienti: Cliente[]
  selectedIds: Set<string>
  sort: ClienteSort
  total: number
  page: number
  totalPages: number
  /** Se true, tutte le righe sono selezionabili (bulk email anche con solo invito). */
  allRowsSelectable?: boolean
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSelectOne: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onSort: (field: ClienteSort['field']) => void
  onPageChange: (page: number) => void
  onSendEmail?: (cliente: Cliente) => void
  onStartChat?: (cliente: Cliente) => void
  onResendStaffInvite?: (cliente: Cliente) => void
  onRemoveFromStaffList?: (cliente: Cliente) => void
}

export function MassaggiatoreClientiTableView({
  clienti,
  selectedIds,
  sort,
  total,
  page,
  totalPages,
  allRowsSelectable = true,
  onSelectAll,
  onSelectOne,
  onSort,
  onPageChange,
  onSendEmail,
  onStartChat,
  onResendStaffInvite,
  onRemoveFromStaffList,
}: MassaggiatoreClientiTableViewProps) {
  const renderSortIcon = (field: ClienteSort['field']) => {
    if (sort.field !== field) return <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />
    return sort.direction === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    )
  }

  const formatData = (dataString: string | null | undefined) => {
    if (!dataString || typeof dataString !== 'string') return '—'
    try {
      const date = new Date(dataString)
      if (Number.isNaN(date.getTime())) return '—'
      return date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  const selectableCount = allRowsSelectable
    ? clienti.length
    : clienti.filter((c) => !c.invitatoInAttesa).length

  return (
    <div className="relative p-4 sm:p-5 md:p-6">
      <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
        <h3 className="truncate text-base font-semibold text-text-primary sm:text-lg">
          Lista clienti ({total})
        </h3>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === selectableCount && selectableCount > 0}
                  onChange={onSelectAll}
                  aria-label={`Seleziona tutti (${selectableCount} in pagina)`}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort('nome')}
                role="button"
                tabIndex={0}
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
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => onSort('data_iscrizione')}
                role="button"
                tabIndex={0}
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
              <TableHead>Collegamento</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clienti.map((cliente) => {
              const rowSelectable = allRowsSelectable || !cliente.invitatoInAttesa
              const display =
                cliente.first_name ||
                cliente.nome ||
                cliente.last_name ||
                cliente.cognome
                  ? `${cliente.first_name ?? cliente.nome ?? ''} ${cliente.last_name ?? cliente.cognome ?? ''}`.trim()
                  : cliente.email || '—'
              const profileHref = `/dashboard/massaggiatore/clienti/${cliente.id}`
              const chatHref = `/dashboard/massaggiatore/chat?with=${encodeURIComponent(cliente.id)}`

              return (
                <TableRow key={cliente.id}>
                  <TableCell>
                    {rowSelectable ? (
                      <Checkbox
                        checked={selectedIds.has(cliente.id)}
                        onChange={(e) => onSelectOne(cliente.id, e)}
                        aria-label={`Seleziona ${display}`}
                      />
                    ) : (
                      <span className="sr-only">Non selezionabile</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-primary/10 font-bold text-primary">
                        {getAvatarInitials(
                          cliente.first_name || cliente.nome || undefined,
                          cliente.last_name || cliente.cognome || undefined,
                          cliente.email || undefined,
                        )}
                      </div>
                      <p className="font-medium text-text-primary">{display}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-text-tertiary" aria-hidden />
                        <span className="text-sm text-text-secondary">{cliente.email || '—'}</span>
                      </div>
                      {cliente.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-text-tertiary" aria-hidden />
                          <span className="text-sm text-text-secondary">{cliente.phone}</span>
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-text-tertiary" aria-hidden />
                      <span className="text-sm text-text-secondary">
                        {formatData(cliente.data_iscrizione)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {cliente.staffCollegato ? (
                        <span className="rounded-full border border-state-valid/30 bg-state-valid/10 px-2 py-0.5 text-xs font-medium text-state-valid">
                          Collegato
                        </span>
                      ) : null}
                      {cliente.staffInvitoEmailPendente ? (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-100/95">
                          Invito email
                        </span>
                      ) : cliente.invitatoInAttesa ? (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-100/95">
                          Invito in attesa
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={profileHref}>
                        <Button variant="outline" size="sm" className="min-h-[40px]">
                          <User className="mr-1 h-4 w-4" />
                          Profilo
                        </Button>
                      </Link>
                      <Link href={chatHref}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="min-h-[40px] min-w-[40px]"
                          aria-label={`Chat con ${display}`}
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
                            className="min-h-[40px] min-w-[40px]"
                            aria-label={`Altre azioni per ${display}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                        onSendEmail={onSendEmail}
                        onStartChat={onStartChat}
                        onResendStaffInvite={onResendStaffInvite}
                        onRemoveFromStaffList={onRemoveFromStaffList}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {totalPages > 1 ? (
          <nav
            className="mt-4 flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between"
            aria-label="Paginazione clienti"
          >
            <p className="text-sm text-text-secondary" role="status" aria-live="polite">
              Pagina {page} di {totalPages} ({total} totali)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="min-h-[44px] touch-manipulation"
              >
                Precedente
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="min-h-[44px] touch-manipulation"
              >
                Successiva
              </Button>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
