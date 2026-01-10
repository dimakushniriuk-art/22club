'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { UserCheck, User, Loader2 } from 'lucide-react'

interface TrainerSessionModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (withTrainer: boolean) => Promise<void>
  loading?: boolean
}

export function TrainerSessionModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: TrainerSessionModalProps) {
  const handleConfirm = async (withTrainer: boolean) => {
    await onConfirm(withTrainer)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="relative max-w-md overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 shadow-lg shadow-teal-500/10 backdrop-blur-xl">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-text-primary text-2xl font-bold text-center text-white">
            Completamento Allenamento
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-center mt-2 text-sm">
            Come hai completato questo allenamento?
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 flex flex-col gap-4 mt-6">
          <Button
            onClick={() => handleConfirm(true)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 py-6 text-lg hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <UserCheck className="h-5 w-5 mr-2" />
                Con Personal Trainer
              </>
            )}
          </Button>

          <Button
            onClick={() => handleConfirm(false)}
            disabled={loading}
            variant="outline"
            className="w-full border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200 py-6 text-lg font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <User className="h-5 w-5 mr-2" />
                Da Solo
              </>
            )}
          </Button>
        </div>

        <DialogFooter className="relative z-10 w-full mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full border-border/30 text-text-secondary hover:bg-background-tertiary/50 hover:border-border/50 hover:text-text-primary transition-all duration-200"
          >
            Annulla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
