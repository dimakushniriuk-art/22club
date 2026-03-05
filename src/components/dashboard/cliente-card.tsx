import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, Calendar, User, MessageSquare, AlertCircle, MoreVertical } from 'lucide-react'
import { Button, useAvatarInitials } from '@/components/ui'
import { ClienteDropdownMenu } from '@/components/dashboard/cliente-dropdown-menu'
import type { Cliente } from '@/types/cliente'
import { cn } from '@/lib/utils'

interface ClienteCardProps {
  cliente: Cliente
  index?: number
  onEdit?: (cliente: Cliente) => void
  onViewHistory?: (cliente: Cliente) => void
  onViewDocuments?: (cliente: Cliente) => void
  onSendEmail?: (cliente: Cliente) => void
  onStartChat?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onDisable?: (cliente: Cliente) => void
  onEnable?: (cliente: Cliente) => void
}

export const ClienteCard = memo<ClienteCardProps>(function ClienteCard({
  cliente,
  index: _index = 0,
  onEdit,
  onViewHistory,
  onViewDocuments,
  onSendEmail,
  onStartChat,
  onDelete,
  onDisable,
  onEnable,
}) {
  const avatarInitials = useAvatarInitials(cliente.nome, cliente.cognome)
  const isBlocked = Boolean(cliente.invitatoInAttesa)

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/5 bg-background-secondary/35 backdrop-blur-xl shadow-[0_0_40px_rgba(2,179,191,0.05)] p-4 sm:p-5 transition-all duration-300',
        isBlocked
          ? 'opacity-75 pointer-events-none hover:shadow-[0_0_40px_rgba(2,179,191,0.05)]'
          : 'hover:shadow-[0_0_60px_rgba(2,179,191,0.12)] hover:-translate-y-1 max-[851px]:hover:translate-y-0 max-[851px]:hover:shadow-[0_0_40px_rgba(2,179,191,0.05)]',
      )}
    >
      <div className="relative flex flex-col h-full">
        <div className="mb-3 sm:mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-primary/10 shadow-[0_0_20px_rgba(2,179,191,0.25)]">
              {cliente.avatar_url ? (
                <Image
                  src={cliente.avatar_url}
                  alt={`${cliente.nome} ${cliente.cognome}`}
                  className="h-full w-full object-cover"
                  fill
                  unoptimized
                />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {avatarInitials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">
                {cliente.nome} {cliente.cognome}
              </h3>
              {cliente.documenti_scadenza && !isBlocked && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  <span className="text-xs text-warning">Doc. in scadenza</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isBlocked ? (
              <span className="rounded-full bg-warning/10 text-warning border border-warning/25 px-3 py-1 text-xs font-medium">
                Invito in attesa
              </span>
            ) : (
              <>
                {cliente.stato === 'attivo' ? (
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium">
                    Attivo
                  </span>
                ) : (
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium">
                    {cliente.stato}
                  </span>
                )}

                <ClienteDropdownMenu
                  cliente={cliente}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-[44px] min-w-[44px] h-8 w-8 sm:h-8 sm:w-8 rounded-full bg-background-secondary/35 border border-white/5 hover:border-primary/20 hover:bg-primary/10 touch-manipulation"
                      aria-label={`Azioni per ${cliente.nome} ${cliente.cognome}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                  onEdit={onEdit}
                  onViewHistory={onViewHistory}
                  onViewDocuments={onViewDocuments}
                  onSendEmail={onSendEmail}
                  onStartChat={onStartChat}
                  onDelete={onDelete}
                  onDisable={onDisable}
                  onEnable={onEnable}
                />
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 border-t border-white/5 pt-3 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-text-secondary" />
            <span className="truncate text-sm text-text-secondary">{cliente.email}</span>
          </div>
          {cliente.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-text-secondary" />
              <span className="text-sm text-text-secondary">{cliente.phone}</span>
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-text-secondary text-xs">
              <Calendar className="h-4 w-4" />
              Iscritto dal
            </span>
            <span className="text-text-primary text-sm">
              {new Date(cliente.data_iscrizione).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary text-xs">Allenamenti/mese</span>
            <span className={cn('font-bold tracking-tight text-primary', (cliente.allenamenti_mese ?? 0) > 0 && 'drop-shadow-[0_0_10px_rgba(2,179,191,0.4)]')}>{cliente.allenamenti_mese}</span>
          </div>

          {cliente.lessons_remaining !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary text-xs">Rimasti</span>
              <span className={cn('font-bold tracking-tight text-primary', (cliente.lessons_remaining ?? 0) > 0 && 'drop-shadow-[0_0_10px_rgba(2,179,191,0.4)]')}>{cliente.lessons_remaining}</span>
            </div>
          )}

          {cliente.scheda_attiva && (
            <div className="mt-2">
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium inline-block">
                {cliente.scheda_attiva}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto pt-3">
          {isBlocked ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-background-secondary/20 py-3 text-text-secondary text-sm min-h-[44px]">
              Invito in attesa – non disponibile
            </div>
          ) : (
            <>
              <Link href={`/dashboard/atleti/${cliente.id}`} className="flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full min-h-[44px] h-10 rounded-full bg-transparent text-primary border border-white/10 hover:bg-primary/10 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(2,179,191,0.2)] transition-all duration-300 touch-manipulation"
                >
                  <User className="mr-1 h-4 w-4 shrink-0" />
                  Profilo
                </Button>
              </Link>
              <Link href={`/dashboard/atleti/${cliente.id}/chat`}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Chat con cliente"
                  className="min-h-[44px] min-w-[44px] h-10 w-10 rounded-full bg-background-secondary/35 border border-white/5 hover:border-primary/20 hover:bg-primary/10 transition-all duration-300 touch-manipulation"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
})
