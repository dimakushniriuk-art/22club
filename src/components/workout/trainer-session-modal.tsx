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
      <DialogContent className="relative max-w-md w-[calc(100vw-2rem)] min-[834px]:w-full overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl p-4 min-[834px]:p-6">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/20" />

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-text-primary text-xl min-[834px]:text-2xl font-bold text-center text-white">
            Completamento Allenamento
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-center mt-2 text-xs min-[834px]:text-sm">
            Come hai completato questo allenamento?
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 flex flex-col gap-3 min-[834px]:gap-4 mt-4 min-[834px]:mt-6">
          <Button
            onClick={() => handleConfirm(true)}
            disabled={loading}
            className="w-full min-h-[44px] py-4 min-[834px]:py-6 text-base min-[834px]:text-lg border border-cyan-400/80 hover:border-cyan-300/90 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-200 active:scale-[0.98] active:bg-cyan-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 mr-2 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 mr-2" />
                Eseguito con Trainer
              </>
            )}
          </Button>

          <Button
            onClick={() => handleConfirm(false)}
            disabled={loading}
            variant="outline"
            className="w-full min-h-[44px] py-4 min-[834px]:py-6 text-base min-[834px]:text-lg font-medium border border-white/10 text-text-primary hover:bg-white/5 hover:border-white/20 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 mr-2 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <User className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 mr-2" />
                Eseguito da Solo
              </>
            )}
          </Button>
        </div>

        <DialogFooter className="relative z-10 w-full mt-4 min-[834px]:mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full min-h-[44px] border border-white/10 text-text-secondary hover:bg-white/5 hover:border-white/20 hover:text-text-primary transition-all duration-200"
          >
            Annulla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
