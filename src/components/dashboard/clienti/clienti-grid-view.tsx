'use client'

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
  onStartChat?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onDisable?: (cliente: Cliente) => void
  onEnable?: (cliente: Cliente) => void
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
  onStartChat,
  onDelete,
  onDisable,
  onEnable,
}: ClientiGridViewProps) {
  return (
    <div className="relative p-4 sm:p-5 md:p-6">
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary truncate">
          Lista Clienti ({total})
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clienti.map((cliente, index) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            index={index}
            onEdit={onEdit}
            onViewHistory={onViewHistory}
            onViewDocuments={onViewDocuments}
            onSendEmail={onSendEmail}
            onStartChat={onStartChat}
            onDelete={onDelete}
            onDisable={onDisable}
            onEnable={onEnable}
          />
        ))}
      </div>

      {/* FIX: Paginazione con aria-label per accessibilità (consistente con table view) */}
      {totalPages > 1 && (
        <nav
          className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          aria-label="Paginazione clienti"
        >
          <p
            className="text-text-secondary text-sm order-2 sm:order-1"
            role="status"
            aria-live="polite"
          >
            Pagina {page} di {totalPages} ({total} totali)
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label={`Vai alla pagina precedente${page > 1 ? ` (pagina ${page - 1})` : ''}`}
              aria-disabled={page === 1}
              className="min-h-[44px] min-w-[44px] touch-manipulation max-[851px]:flex-1 rounded-lg border-white/20 hover:bg-white/5"
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
              className="min-h-[44px] min-w-[44px] touch-manipulation max-[851px]:flex-1 rounded-lg border-white/20 hover:bg-white/5"
            >
              Successiva
            </Button>
          </div>
        </nav>
      )}
    </div>
  )
}
