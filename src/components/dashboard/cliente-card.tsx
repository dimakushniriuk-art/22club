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
  /** default: lista trainer (blocca card se invitatoInAttesa). massaggiatore: stile staff, link area massaggiatore. */
  variant?: 'default' | 'massaggiatore'
  onEdit?: (cliente: Cliente) => void
  onViewHistory?: (cliente: Cliente) => void
  onViewDocuments?: (cliente: Cliente) => void
  onSendEmail?: (cliente: Cliente) => void
  onStartChat?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onDisable?: (cliente: Cliente) => void
  onEnable?: (cliente: Cliente) => void
  onResendStaffInvite?: (cliente: Cliente) => void
  onRemoveFromStaffList?: (cliente: Cliente) => void
}

export const ClienteCard = memo<ClienteCardProps>(function ClienteCard({
  cliente,
  index: _index = 0,
  variant = 'default',
  onEdit,
  onViewHistory,
  onViewDocuments,
  onSendEmail,
  onStartChat,
  onDelete,
  onDisable,
  onEnable,
  onResendStaffInvite,
  onRemoveFromStaffList,
}) {
  const avatarInitials = useAvatarInitials(cliente.nome, cliente.cognome, cliente.email)
  const displayName =
    cliente.nome?.trim() || cliente.cognome?.trim()
      ? `${cliente.nome ?? ''} ${cliente.cognome ?? ''}`.trim()
      : cliente.email || 'Profilo da completare'
  const isMassaggiatore = variant === 'massaggiatore'
  const isBlocked = Boolean(cliente.invitatoInAttesa) && !isMassaggiatore
  const profileHref = isMassaggiatore
    ? `/dashboard/massaggiatore/clienti/${cliente.id}`
    : `/dashboard/atleti/${cliente.id}`
  const chatHref = isMassaggiatore
    ? `/dashboard/massaggiatore/chat?with=${encodeURIComponent(cliente.id)}`
    : `/dashboard/chat?with=${cliente.id}`

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors',
        isBlocked ? 'opacity-75 pointer-events-none' : 'hover:border-white/20',
      )}
    >
      <div className="relative flex flex-col h-full">
        <div className="mb-3 sm:mb-4 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-primary/10">
              {cliente.avatar_url ? (
                <Image
                  src={cliente.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  fill
                  unoptimized
                />
              ) : (
                <span className="text-lg font-semibold text-primary">{avatarInitials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">
                {displayName}
              </h3>
              {cliente.documenti_scadenza && !isBlocked && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  <span className="text-xs text-warning">Doc. in scadenza</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            {isMassaggiatore ? (
              <>
                {cliente.invitatoInAttesa ? (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100/95">
                    Invito in attesa
                  </span>
                ) : cliente.staffCollegato ? (
                  <span className="rounded-full border border-state-valid/25 bg-state-valid/10 px-3 py-1 text-xs font-medium text-state-valid">
                    Collegato
                  </span>
                ) : null}
                {cliente.staffInvitoEmailPendente ? (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100/95">
                    Invito email
                  </span>
                ) : null}
                <ClienteDropdownMenu
                  cliente={cliente}
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-[44px] min-w-[44px] h-8 w-8 sm:h-8 sm:w-8 rounded-full bg-background-secondary/35 border border-white/5 hover:border-primary/20 hover:bg-primary/10 touch-manipulation"
                      aria-label={`Azioni per ${displayName}`}
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
                  onResendStaffInvite={onResendStaffInvite}
                  onRemoveFromStaffList={onRemoveFromStaffList}
                />
              </>
            ) : isBlocked ? (
              <span className="rounded-full bg-warning/10 text-warning border border-warning/25 px-3 py-1 text-xs font-medium">
                Invito in attesa
              </span>
            ) : (
              <>
                {cliente.stato === 'attivo' ? (
                  <span className="rounded-full bg-state-valid/10 text-state-valid border border-state-valid/25 px-3 py-1 text-xs font-medium">
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
                      aria-label={`Azioni per ${displayName}`}
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
              {cliente.data_iscrizione
                ? new Date(cliente.data_iscrizione).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>

          {!isMassaggiatore ? (
            <>
              <div className="space-y-1.5">
                <div className="text-text-secondary text-xs font-medium">Allenamenti</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary text-xs">Acquistati:</span>
                  <span
                    className={cn(
                      'font-medium text-text-primary',
                      (cliente.lessons_acquired ?? 0) > 0 &&
                        'font-bold text-primary drop-shadow-[0_0_10px_rgba(2,179,191,0.4)]',
                    )}
                  >
                    {cliente.lessons_acquired !== undefined ? cliente.lessons_acquired : '–'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary text-xs">Eseguiti:</span>
                  <span
                    className={cn(
                      'font-bold tracking-tight text-primary',
                      (cliente.lessons_used ?? 0) > 0 && 'drop-shadow-[0_0_10px_rgba(2,179,191,0.4)]',
                    )}
                  >
                    {cliente.lessons_used !== undefined ? cliente.lessons_used : '–'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary text-xs">Rimasti:</span>
                  <span
                    className={cn(
                      'font-bold tracking-tight',
                      cliente.lessons_remaining !== undefined &&
                        (cliente.lessons_remaining >= 6
                          ? 'text-[#00C781] drop-shadow-[0_0_10px_rgba(0,199,129,0.35)]'
                          : cliente.lessons_remaining >= 2 && cliente.lessons_remaining <= 4
                            ? 'text-[#FFC107]'
                            : cliente.lessons_remaining <= 1
                              ? 'text-[#FF3B30]'
                              : 'text-primary'),
                    )}
                  >
                    {cliente.lessons_remaining !== undefined ? cliente.lessons_remaining : '–'}
                  </span>
                </div>
              </div>

              {cliente.scheda_attiva && (
                <div className="mt-2">
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-xs font-medium inline-block">
                    {cliente.scheda_attiva}
                  </span>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="flex gap-2 mt-auto pt-3">
          {isBlocked ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-background-secondary/20 py-3 text-text-secondary text-sm min-h-[44px]">
              Invito in attesa – non disponibile
            </div>
          ) : (
            <>
              <Link href={profileHref} className="flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full min-h-[44px] h-10 rounded-full bg-transparent text-primary border border-white/10 hover:bg-primary/10 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(2,179,191,0.2)] transition-all duration-300 touch-manipulation"
                >
                  <User className="mr-1 h-4 w-4 shrink-0" />
                  Profilo
                </Button>
              </Link>
              <Link href={chatHref}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Chat con ${displayName}`}
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
