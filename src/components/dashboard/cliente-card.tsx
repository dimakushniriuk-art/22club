import { memo } from 'react'
import Link from 'next/link'
import { Mail, Phone, Calendar, User, MessageSquare, AlertCircle } from 'lucide-react'
import { Button, Avatar, useAvatarInitials } from '@/components/ui'
import type { Cliente } from '@/types/cliente'

interface ClienteCardProps {
  cliente: Cliente
}

export const ClienteCard = memo<ClienteCardProps>(function ClienteCard({ cliente }) {
  const avatarInitials = useAvatarInitials(cliente.nome, cliente.cognome)

  return (
    <div className="group relative overflow-hidden rounded-lg border border-teal-500/30 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary p-4 transition-all duration-300 hover:scale-[1.02] hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-500/20">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-col h-full">
        {/* Header con avatar e nome */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={cliente.avatar_url}
              alt={`${cliente.nome} ${cliente.cognome}`}
              fallbackText={avatarInitials}
              size="md"
              className="ring-2 ring-teal-500/30"
            />
            <div>
              <h3 className="font-semibold text-white">
                {cliente.nome} {cliente.cognome}
              </h3>
              {cliente.documenti_scadenza && (
                <div className="mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-400" />
                  <span className="text-xs text-orange-400">Doc. in scadenza</span>
                </div>
              )}
            </div>
          </div>

          {/* Stato badge */}
          {cliente.stato === 'attivo' ? (
            <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/30">
              Attivo
            </div>
          ) : (
            <div className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-400 border border-teal-500/30">
              {cliente.stato}
            </div>
          )}
        </div>

        {/* Contatti */}
        <div className="space-y-2 border-b border-background-tertiary/50 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate text-sm text-gray-300">{cliente.email}</span>
          </div>
          {cliente.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="text-sm text-gray-300">{cliente.phone}</span>
            </div>
          )}
        </div>

        {/* Info aggiuntive */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="h-4 w-4" />
              Iscritto dal
            </span>
            <span className="text-white">
              {new Date(cliente.data_iscrizione).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Allenamenti/mese</span>
            <span className="font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {cliente.allenamenti_mese}
            </span>
          </div>

          {cliente.scheda_attiva && (
            <div className="mt-2">
              <div className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-medium text-teal-400 border border-teal-500/30 inline-block">
                {cliente.scheda_attiva}
              </div>
            </div>
          )}
        </div>

        {/* Azioni - allineate in fondo */}
        <div className="flex gap-2 mt-auto pt-3">
          <Link href={`/dashboard/atleti/${cliente.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-teal-500/50 text-white hover:bg-teal-500/10 hover:border-teal-400"
            >
              <User className="mr-1 h-4 w-4" />
              Profilo
            </Button>
          </Link>
          <Link href={`/dashboard/atleti/${cliente.id}/chat`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Chat con cliente"
              className="hover:bg-teal-500/10"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
})
