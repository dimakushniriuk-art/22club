'use client'

import { User } from 'lucide-react'
import { ClienteCard } from '@/components/dashboard/cliente-card'
import type { Cliente } from '@/types/cliente'

import { Button } from '@/components/ui'

interface ClientiGridViewProps {
  clienti: Cliente[]
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit?: (cliente: Cliente) => void
  onViewHistory?: (cliente: Cliente) => void
  onViewDocuments?: (cliente: Cliente) => void
  onSendEmail?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
}

export function ClientiGridView({
  clienti,
  total,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onViewHistory,
  onViewDocuments,
  onSendEmail,
  onDelete,
}: ClientiGridViewProps) {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clienti.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            onEdit={onEdit}
            onViewHistory={onViewHistory}
            onViewDocuments={onViewDocuments}
            onSendEmail={onSendEmail}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* FIX: Paginazione con aria-label per accessibilità (consistente con table view) */}
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
  )
}
