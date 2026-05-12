'use client'

import React from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { WorkoutSession } from '@/types/workout'
import { displayWorkoutRepsCell } from '@/features/live-workout-session/lib/live-workout-session-helpers'
import { CIRCUIT_FULLSCREEN_PREPARE_SECONDS } from '@/features/live-workout-session/lib/live-workout-audio'
import { ModalAutoplayExerciseVideo } from '@/features/live-workout-session/ui/exercise-media'

type CircuitPreview = {
  exercises: Record<string, unknown>[]
  activeIndex: number
}

type CircuitPhase = 'idle' | 'prepare' | 'execution' | 'reps' | 'rest' | 'completed'

type CircuitFullscreenOverlayProps = {
  circuitFullscreenPreview: CircuitPreview | null
  setCircuitFullscreenPreview: React.Dispatch<React.SetStateAction<CircuitPreview | null>>
  getCircuitCycleStats: (
    items: Record<string, unknown>[],
  ) => { totalCycles: number; completedCycles: number }
  getCircuitExerciseIndexesForCycle: (items: Record<string, unknown>[], cycleNumber: number) => number[]
  circuitAutoPhase: CircuitPhase
  setCircuitAutoPhase: React.Dispatch<React.SetStateAction<CircuitPhase>>
  circuitAutoSeconds: number | null
  setCircuitAutoSeconds: React.Dispatch<React.SetStateAction<number | null>>
  circuitAutoRunning: boolean
  setCircuitAutoRunning: React.Dispatch<React.SetStateAction<boolean>>
  circuitCycleTargetRef: React.MutableRefObject<number>
  circuitCompletedCyclesRef: React.MutableRefObject<number>
  blocks: { startIndex: number; endIndex: number }[]
  currentBlockIndex: number
  workoutSession: WorkoutSession | null
  completeBlock: (blockIndex: number) => void
  smoothCircuitProgressPercent: number
  startCircuitAutoplay: () => void
  advanceCircuitAutoplay: () => void
  toggleCircuitAutoplayPause: () => void
  workoutsPane: unknown | null
}

export function CircuitFullscreenOverlay({
  circuitFullscreenPreview,
  setCircuitFullscreenPreview,
  getCircuitCycleStats,
  getCircuitExerciseIndexesForCycle,
  circuitAutoPhase,
  setCircuitAutoPhase,
  circuitAutoSeconds,
  setCircuitAutoSeconds,
  circuitAutoRunning,
  setCircuitAutoRunning,
  circuitCycleTargetRef,
  circuitCompletedCyclesRef,
  blocks,
  currentBlockIndex,
  workoutSession,
  completeBlock,
  smoothCircuitProgressPercent,
  startCircuitAutoplay,
  advanceCircuitAutoplay,
  toggleCircuitAutoplayPause,
  workoutsPane,
}: CircuitFullscreenOverlayProps) {
  return circuitFullscreenPreview
    ? (() => {
        const totalExercises = circuitFullscreenPreview.exercises.length
        const circuitStats = getCircuitCycleStats(circuitFullscreenPreview.exercises)
        const currentCycleNumber = Math.min(
          Math.max(1, circuitStats.totalCycles),
          Math.max(1, circuitStats.completedCycles + 1),
        )
        const cycleIndexesView = getCircuitExerciseIndexesForCycle(
          circuitFullscreenPreview.exercises,
          currentCycleNumber,
        )
        const hasCycleIndexesView = cycleIndexesView.length > 0
        const safeIndex =
          totalExercises > 0 ? Math.min(Math.max(circuitFullscreenPreview.activeIndex, 0), totalExercises - 1) : 0
        const safeCyclePosition = hasCycleIndexesView ? Math.max(0, cycleIndexesView.indexOf(safeIndex)) : -1
        const activeItem = circuitFullscreenPreview.exercises[safeIndex]
        const activeExercise = ((activeItem?.exercise as Record<string, unknown> | undefined) ??
          {}) as Record<string, unknown>
        const activeName = (activeExercise.name as string | undefined) ?? 'Esercizio'
        const activeVideoUrl = (activeExercise.video_url as string | undefined | null)?.trim() || undefined
        const activeThumbUrl = (activeExercise.thumb_url as string | undefined | null)?.trim() || undefined
        const activeSets = ((activeItem?.sets as Record<string, unknown>[] | undefined) ??
          []) as Record<string, unknown>[]
        const activeSetIndex =
          activeSets.length > 0
            ? activeSets.findIndex((set) => Number(set?.set_number ?? 0) === currentCycleNumber)
            : -1
        const activeSet = activeSets.length > 0 ? (activeSetIndex >= 0 ? activeSets[activeSetIndex] : activeSets[0]) : null

        const valueWeight = (() => {
          const fromSet = activeSet?.weight_kg as number | null | undefined
          if (fromSet != null && Number.isFinite(fromSet)) return fromSet
          const fromTarget = activeExercise.target_weight as number | null | undefined
          if (fromTarget != null && Number.isFinite(fromTarget)) return fromTarget
          return 0
        })()
        const valueReps = displayWorkoutRepsCell(
          (activeSet?.reps as number | null | undefined) ?? null,
          (activeExercise.target_reps as number | null | undefined) ?? null,
        )
        const valueExecutionRaw = (activeSet?.execution_time_sec ??
          activeItem?.execution_time_sec ??
          activeExercise?.execution_time_sec ??
          null) as number | string | null | undefined
        const valueExecution =
          valueExecutionRaw == null
            ? null
            : Number.isFinite(Number(valueExecutionRaw))
              ? Number(valueExecutionRaw)
              : null
        const valueRestRaw = (activeSet?.rest_timer_sec ??
          activeItem?.rest_timer_sec ??
          activeExercise?.rest_timer_sec ??
          null) as number | string | null | undefined
        const valueRest =
          valueRestRaw == null
            ? null
            : Number.isFinite(Number(valueRestRaw))
              ? Number(valueRestRaw)
              : null
        const circuitPrepareSecondsLeft =
          circuitAutoPhase === 'prepare' ? (circuitAutoSeconds ?? CIRCUIT_FULLSCREEN_PREPARE_SECONDS) : null
        const circuitPrepareTierTextClass =
          circuitAutoPhase === 'prepare'
            ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
              ? 'text-red-500'
              : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                ? 'text-yellow-400'
                : 'text-green-500'
            : ''
        const circuitPrepareTierBarClass =
          circuitAutoPhase === 'prepare'
            ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
              ? 'bg-red-500'
              : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                ? 'bg-yellow-400'
                : 'bg-green-500'
            : ''
        const circuitPrepareOverlayTitle =
          circuitAutoPhase === 'prepare'
            ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
              ? 'Preparati!'
              : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                ? 'Pronti!'
                : 'Via!'
            : ''
        const circuitTimerLabel =
          circuitAutoPhase === 'prepare'
            ? circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 3
              ? 'Preparati'
              : circuitPrepareSecondsLeft != null && circuitPrepareSecondsLeft > 1
                ? 'Pronti!'
                : 'Via!'
            : circuitAutoPhase === 'execution'
              ? 'Esecuzione'
              : circuitAutoPhase === 'reps'
                ? 'Ripetizioni'
                : circuitAutoPhase === 'rest'
                  ? 'Recupero'
                  : circuitAutoPhase === 'completed'
                    ? 'Circuito completato'
                    : 'Pronti...'
        const circuitTimerColorClass =
          circuitAutoPhase === 'prepare'
            ? circuitPrepareTierTextClass
            : circuitAutoPhase === 'execution'
              ? 'text-orange-400'
              : circuitAutoPhase === 'reps'
                ? 'text-violet-300'
                : circuitAutoPhase === 'rest'
                  ? 'text-cyan-300'
                  : circuitAutoPhase === 'completed'
                    ? 'text-green-400'
                    : 'text-cyan-300'
        const circuitTimerMainValue =
          circuitAutoSeconds !== null
            ? circuitAutoSeconds
            : circuitAutoPhase === 'reps'
              ? valueReps
              : circuitAutoPhase === 'execution' && valueExecution != null && valueExecution > 0
                ? valueExecution
                : circuitAutoPhase === 'prepare'
                  ? CIRCUIT_FULLSCREEN_PREPARE_SECONDS
                  : 5
        const circuitTimerSubtitle =
          circuitAutoPhase === 'idle'
            ? null
            : circuitAutoPhase === 'prepare'
              ? 'Partenza automatica esecuzione'
              : circuitAutoPhase === 'execution'
                ? `Esecuzione ${valueExecution != null && valueExecution > 0 ? valueExecution : '-'} sec`
                : circuitAutoPhase === 'reps'
                  ? `Completa ${valueReps} e premi FATTO`
                  : circuitAutoPhase === 'rest'
                    ? `Recupero ${valueRest != null && valueRest > 0 ? valueRest : 60} sec`
                    : circuitAutoPhase === 'completed'
                      ? 'Recupero terminato'
                      : `Recupero ${valueRest != null && valueRest > 0 ? valueRest : 60} dopo esecuzione`
        const circuitProgressColorClass =
          circuitAutoPhase === 'prepare'
            ? circuitPrepareTierBarClass
            : circuitAutoPhase === 'execution'
              ? 'bg-orange-500'
              : circuitAutoPhase === 'reps'
                ? 'bg-violet-500'
                : circuitAutoPhase === 'rest'
                  ? 'bg-cyan-400'
                  : circuitAutoPhase === 'completed'
                    ? 'bg-green-500'
                    : 'bg-zinc-500'
        const circuitTotalCycles = Math.max(1, circuitStats.totalCycles)
        const canNavigateManually = !circuitAutoRunning && circuitAutoPhase !== 'prepare'
        const canStartCircuit =
          !circuitAutoRunning && (circuitAutoPhase === 'idle' || circuitAutoPhase === 'completed')
        const pauseLabel = circuitAutoRunning ? 'Pausa' : 'Riprendi'
        const pauseDisabled =
          circuitAutoPhase === 'idle' || circuitAutoPhase === 'completed' || circuitAutoPhase === 'reps'
        const cycleTargetReached = circuitStats.completedCycles >= circuitStats.totalCycles
        const block = blocks[currentBlockIndex]
        const blockExercises = block
          ? (workoutSession?.exercises ?? []).slice(block.startIndex, block.endIndex + 1)
          : []
        const isBlockCompleted = block
          ? blockExercises.every((ex) => (ex as { is_completed?: boolean }).is_completed === true)
          : false

        return (
          <div
            className={cn(
              workoutsPane ? 'absolute inset-0 z-[320]' : 'fixed inset-x-0 bottom-0 z-[320]',
              'isolate overflow-hidden bg-black',
            )}
            style={workoutsPane ? undefined : { top: 'var(--home-athlete-brand-top, 0px)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Vista circuito fullscreen"
          >
            <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4 px-3 py-4 sm:px-5 sm:py-6">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-white/20 text-xs text-white hover:bg-white/10"
                  disabled={safeCyclePosition <= 0 || !canNavigateManually}
                  onClick={() =>
                    setCircuitFullscreenPreview((prev) =>
                      prev
                        ? {
                            ...prev,
                            activeIndex:
                              hasCycleIndexesView && safeCyclePosition > 0
                                ? cycleIndexesView[safeCyclePosition - 1]
                                : Math.max(0, prev.activeIndex - 1),
                          }
                        : prev,
                    )
                  }
                >
                  Precedente
                </Button>
                <div className="flex items-center justify-center rounded-xl border border-white/20 bg-zinc-900 text-xs font-semibold text-white">
                  {hasCycleIndexesView ? safeCyclePosition + 1 : safeIndex + 1} /{' '}
                  {hasCycleIndexesView ? cycleIndexesView.length : Math.max(totalExercises, 1)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-white/20 text-xs text-white hover:bg-white/10"
                  disabled={
                    (hasCycleIndexesView
                      ? safeCyclePosition >= cycleIndexesView.length - 1
                      : safeIndex >= totalExercises - 1) || !canNavigateManually
                  }
                  onClick={() =>
                    setCircuitFullscreenPreview((prev) =>
                      prev
                        ? {
                            ...prev,
                            activeIndex:
                              hasCycleIndexesView && safeCyclePosition >= 0
                                ? cycleIndexesView[Math.min(cycleIndexesView.length - 1, safeCyclePosition + 1)]
                                : Math.min(prev.exercises.length - 1, prev.activeIndex + 1),
                          }
                        : prev,
                    )
                  }
                >
                  Successivo
                </Button>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black">
                {activeVideoUrl ? (
                  <ModalAutoplayExerciseVideo videoSrc={activeVideoUrl} posterSrc={activeThumbUrl} />
                ) : activeThumbUrl ? (
                  <Image
                    src={activeThumbUrl}
                    alt={activeName}
                    className="h-full w-full object-contain"
                    fill
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-zinc-300">
                    Nessun media disponibile per questo esercizio
                  </div>
                )}
                {circuitAutoPhase === 'prepare' ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/40"
                    aria-hidden
                  >
                    <div
                      className={`text-center text-7xl font-black leading-none sm:text-8xl ${circuitPrepareTierTextClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                    >
                      {circuitPrepareOverlayTitle}
                    </div>
                    <div
                      className={`text-7xl font-black leading-none tabular-nums sm:text-8xl ${circuitPrepareTierTextClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                    >
                      {circuitAutoSeconds ?? CIRCUIT_FULLSCREEN_PREPARE_SECONDS}
                    </div>
                  </div>
                ) : circuitAutoPhase === 'rest' ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/40"
                    aria-hidden
                  >
                    <div
                      className={`text-center text-7xl font-black leading-none sm:text-8xl ${circuitTimerColorClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                    >
                      RECUPERO
                    </div>
                    <div
                      className={`text-7xl font-black leading-none tabular-nums sm:text-8xl ${circuitTimerColorClass} drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                    >
                      {circuitAutoSeconds ?? (valueRest != null && valueRest > 0 ? valueRest : 60)}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/15 bg-zinc-950/90 p-3">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  Impostazioni esercizio corrente
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg border border-white/10 bg-black p-2">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-400">Peso</div>
                    <div className="mt-1 text-sm font-bold text-white">{valueWeight}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black p-2">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-400">Ripetizioni</div>
                    <div className="mt-1 text-sm font-bold text-white">{valueReps}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black p-2">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-400">Esecuzione</div>
                    <div className="mt-1 text-sm font-bold text-white">
                      {valueExecution != null && valueExecution > 0 ? valueExecution : '-'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black p-2">
                    <div className="text-[10px] uppercase tracking-wide text-zinc-400">Recupero</div>
                    <div className="mt-1 text-sm font-bold text-white">
                      {valueRest != null && valueRest > 0 ? valueRest : '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 p-5 shadow-2xl shadow-black/60">
                <div
                  className={`flex items-center justify-center text-center ${
                    circuitAutoPhase === 'idle' ? 'min-h-[220px]' : 'min-h-[180px]'
                  }`}
                >
                  <div className="w-full max-w-xl space-y-3">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      {circuitTimerLabel}
                    </div>
                    {circuitAutoPhase === 'idle' ? (
                      <div className="flex flex-col items-center gap-4 pt-1">
                        <Button
                          type="button"
                          disabled={!canStartCircuit}
                          onClick={startCircuitAutoplay}
                          className="mx-auto h-[5.25rem] w-full max-w-md rounded-2xl bg-cyan-500 px-8 text-2xl font-black uppercase tracking-wider text-white shadow-[0_0_40px_-8px_rgba(34,211,238,0.45)] transition-transform hover:bg-cyan-400 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 sm:h-24 sm:max-w-lg sm:text-3xl"
                        >
                          Start
                        </Button>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                          Poi parte il countdown di preparazione ({CIRCUIT_FULLSCREEN_PREPARE_SECONDS} sec)
                        </p>
                      </div>
                    ) : circuitAutoPhase === 'reps' ? (
                      <div className="space-y-3">
                        <div className="text-4xl font-black leading-none text-violet-300 sm:text-5xl">
                          {valueReps}
                        </div>
                        <Button
                          type="button"
                          className="h-24 w-full rounded-2xl bg-violet-500 text-3xl font-black uppercase tracking-wide text-white hover:bg-violet-400 sm:h-28 sm:text-4xl"
                          onClick={advanceCircuitAutoplay}
                        >
                          Fatto
                        </Button>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                          Completa le ripetizioni e conferma per continuare
                        </p>
                      </div>
                    ) : (
                      <>
                        {circuitAutoPhase !== 'prepare' && circuitAutoPhase !== 'rest' ? (
                          <div
                            className={
                              circuitAutoPhase === 'completed'
                                ? `px-2 text-3xl font-black leading-tight sm:text-5xl ${circuitTimerColorClass}`
                                : `text-7xl font-black leading-none sm:text-8xl ${circuitTimerColorClass}`
                            }
                          >
                            {circuitAutoPhase === 'completed' ? 'Congratulazione!' : circuitTimerMainValue}
                          </div>
                        ) : null}
                        {circuitAutoPhase !== 'completed' ? (
                          <div className="mx-auto mt-2 w-full max-w-lg">
                            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                              <span>Progresso</span>
                              <span>{Math.round(smoothCircuitProgressPercent)}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                              <div
                                className={`h-full rounded-full ${circuitProgressColorClass}`}
                                style={{ width: `${smoothCircuitProgressPercent}%` }}
                              />
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                    {circuitTimerSubtitle ? (
                      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        {circuitTimerSubtitle}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-zinc-950/95 px-4 py-3 text-center">
                <div className="text-3xl font-black leading-none text-cyan-300 sm:text-4xl">
                  {circuitStats.completedCycles} <span className="text-zinc-500">/</span> {circuitTotalCycles}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  {circuitStats.completedCycles === 1 ? 'Ciclo completato' : 'Cicli completati'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/15 bg-zinc-950/95 p-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-white/20 text-sm font-semibold text-white hover:bg-white/10"
                  disabled={pauseDisabled}
                  onClick={toggleCircuitAutoplayPause}
                >
                  {pauseLabel}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 rounded-xl text-sm font-semibold"
                  onClick={() => {
                    setCircuitAutoPhase('idle')
                    setCircuitAutoSeconds(null)
                    setCircuitAutoRunning(false)
                    circuitCompletedCyclesRef.current = 0
                    circuitCycleTargetRef.current = 1
                    setCircuitFullscreenPreview(null)
                  }}
                >
                  Esci
                </Button>
              </div>
            </div>
            {cycleTargetReached ? (
              <div
                className="absolute inset-0 z-[400] flex items-center justify-center bg-black/75 p-4 sm:p-6"
                aria-live="polite"
              >
                <div className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl shadow-black/60">
                  <p className="mb-4 text-center text-sm font-medium text-zinc-300">
                    Tutti i cicli del circuito sono stati completati.
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!isBlockCompleted) {
                        completeBlock(currentBlockIndex)
                      }
                      setCircuitAutoPhase('idle')
                      setCircuitAutoSeconds(null)
                      setCircuitAutoRunning(false)
                      circuitCompletedCyclesRef.current = 0
                      circuitCycleTargetRef.current = 1
                      setCircuitFullscreenPreview(null)
                    }}
                    variant={isBlockCompleted ? 'success' : 'default'}
                    className={
                      isBlockCompleted
                        ? 'h-11 w-full rounded-xl bg-green-500 text-sm font-semibold text-white hover:bg-emerald-500'
                        : 'h-11 w-full rounded-xl bg-cyan-500 text-sm font-semibold text-white hover:bg-cyan-400'
                    }
                  >
                    <Check className="mr-2 h-4 w-4 shrink-0" />
                    {isBlockCompleted ? 'Esercizio completato' : 'Completa esercizio'}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )
      })()
    : null
}
