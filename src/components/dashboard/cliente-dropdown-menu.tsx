import { Edit, History, Trash, FileText, Mail } from 'lucide-react'
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
  onDelete?: (cliente: Cliente) => void
}

export function ClienteDropdownMenu({
  cliente,
  trigger,
  onEdit,
  onViewHistory,
  onViewDocuments,
  onSendEmail,
  onDelete,
}: ClienteDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
