import { Mail, Trash, X, Users } from 'lucide-react'
import { Button } from '@/components/ui'

interface ClientiBulkActionsProps {
  selectedCount: number
  onSendEmail: () => void
  onDelete: () => void
  onClear: () => void
}

export function ClientiBulkActions({
  selectedCount,
  onSendEmail,
  onDelete,
  onClear,
}: ClientiBulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-blue-500/20 blur-xl" />

      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-background-secondary/95 backdrop-blur-xl shadow-2xl shadow-teal-500/20">
        {/* Decorative gradient top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

        <div className="relative flex items-center gap-4 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-teal-500/10 to-cyan-500/10 px-3 py-2">
            <Users className="h-4 w-4 text-teal-400" />
            <p className="text-text-primary text-sm font-semibold">
              {selectedCount} {selectedCount === 1 ? 'cliente selezionato' : 'clienti selezionati'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onSendEmail}
              className="gap-2 border-teal-500/30 hover:bg-teal-500/10 hover:border-teal-500/50"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="gap-2 border-red-500/30 text-state-error hover:bg-state-error/10 hover:border-red-500/50"
            >
              <Trash className="h-4 w-4" />
              <span className="hidden sm:inline">Elimina</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClear}
              aria-label="Deseleziona tutti"
              className="hover:bg-background-tertiary/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
