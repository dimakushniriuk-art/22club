'use client'

import { ChevronLeft, ChevronRight, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type LiveWorkoutFooterProps = {
  inPane: boolean
  currentBlockIndex: number
  blocksLength: number
  canCompleteWorkout: boolean
  completingWorkout: boolean
  onPreviousExercise: () => void
  onNextExercise: () => void
  onFinishWorkout: () => void
}

export function LiveWorkoutFooter({
  inPane,
  currentBlockIndex,
  blocksLength,
  canCompleteWorkout,
  completingWorkout,
  onPreviousExercise,
  onNextExercise,
  onFinishWorkout,
}: LiveWorkoutFooterProps) {
  return (
    <div
      className={cn(
        'z-20 flex w-full min-w-0 flex-col bg-background px-3 pt-2 sm:px-4 md:px-6',
        inPane ? 'absolute inset-x-0 bottom-0' : 'fixed inset-x-0 bottom-0',
      )}
    >
      <header
        className="relative w-full min-w-0 overflow-hidden rounded-t-2xl border-t border-white/10 bg-black/95 backdrop-blur-md p-4 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)] md:p-5"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, rgb(34 211 238) 50%, transparent 100%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <Button
            onClick={onPreviousExercise}
            disabled={currentBlockIndex === 0}
            variant="outline"
            className="h-9 min-h-[44px] touch-manipulation rounded-xl border border-white/10 text-[10px] text-text-primary hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft className="mr-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Precedente
          </Button>
          <div className="flex min-w-0 flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary">Esercizio</span>
            <span className="text-sm font-bold text-text-primary">
              {currentBlockIndex + 1} / {blocksLength}
            </span>
          </div>
          <Button
            onClick={onNextExercise}
            disabled={currentBlockIndex === blocksLength - 1}
            variant="outline"
            className="h-9 min-h-[44px] touch-manipulation rounded-xl border border-white/10 text-[10px] text-text-primary hover:bg-white/5 disabled:opacity-30"
          >
            Successivo
            <ChevronRight className="ml-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          </Button>
        </div>
        {canCompleteWorkout ? (
          <div className="relative z-10 mt-3 w-full min-w-0">
            <Button
              onClick={onFinishWorkout}
              disabled={completingWorkout}
              className="h-10 w-full min-h-11 text-xs rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all duration-200 hover:scale-[1.02]"
            >
              <PartyPopper className="mr-1.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Completa allenamento
            </Button>
          </div>
        ) : null}
      </header>
    </div>
  )
}
