'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface User {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
}

interface UserDeleteDialogProps {
  user: User
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function UserDeleteDialog({ user, open, onClose, onConfirm }: UserDeleteDialogProps) {
  const userName =
    user.nome || user.cognome
      ? `${user.nome || ''} ${user.cognome || ''}`.trim()
      : user.email || 'Questo utente'

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background-secondary border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white text-xl">Elimina Utente</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Sei sicuro di voler eliminare <strong>{userName}</strong>?
            <br />
            <br />
            Questa azione eliminerà permanentemente l&apos;utente e tutti i suoi dati associati.
            L&apos;operazione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} className="bg-background border-border text-white">
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white">
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
