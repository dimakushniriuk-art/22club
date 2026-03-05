import { Edit, History, Trash, FileText, Mail, MessageCircle, UserX, UserCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui'
import type { Cliente } from '@/types/cliente'

interface ClienteDropdownMenuProps {
  cliente: Cliente
  trigger: React.ReactNode
  onEdit?: (cliente: Cliente) => void
  onViewHistory?: (cliente: Cliente) => void
  onViewDocuments?: (cliente: Cliente) => void
  onSendEmail?: (cliente: Cliente) => void
  onStartChat?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onDisable?: (cliente: Cliente) => void
  onEnable?: (cliente: Cliente) => void
}

export function ClienteDropdownMenu({
  cliente,
  trigger,
  onEdit,
  onViewHistory,
  onViewDocuments,
  onSendEmail,
  onStartChat,
  onDelete,
  onDisable,
  onEnable,
}: ClienteDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onStartChat && (
          <DropdownMenuItem onClick={() => onStartChat(cliente)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(cliente)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica profilo
          </DropdownMenuItem>
        )}
        {onViewHistory && (
          <DropdownMenuItem onClick={() => onViewHistory(cliente)}>
            <History className="mr-2 h-4 w-4" />
            Storico allenamenti
          </DropdownMenuItem>
        )}
        {onViewDocuments && (
          <DropdownMenuItem onClick={() => onViewDocuments(cliente)}>
            <FileText className="mr-2 h-4 w-4" />
            Documenti
          </DropdownMenuItem>
        )}
        {onSendEmail && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSendEmail(cliente)}>
              <Mail className="mr-2 h-4 w-4" />
              Invia email
            </DropdownMenuItem>
          </>
        )}
        {(onDisable || onEnable) && (
          <>
            <DropdownMenuSeparator />
            {onDisable && cliente.stato === 'attivo' && (
              <DropdownMenuItem onClick={() => onDisable(cliente)}>
                <UserX className="mr-2 h-4 w-4" />
                Disabilita atleta
              </DropdownMenuItem>
            )}
            {onEnable && (cliente.stato === 'inattivo' || cliente.stato === 'sospeso') && (
              <DropdownMenuItem onClick={() => onEnable(cliente)}>
                <UserCheck className="mr-2 h-4 w-4" />
                Riattiva atleta
              </DropdownMenuItem>
            )}
          </>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(cliente)}
              className="text-state-error hover:bg-state-error/10"
            >
              <Trash className="mr-2 h-4 w-4" />
              Elimina cliente
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
