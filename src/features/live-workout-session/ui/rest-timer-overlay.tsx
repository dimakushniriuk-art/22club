'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type RestTimerOverlayProps = {
  restTimersOverlayOpen: boolean
  currentExercise: Record<string, unknown> | null
  workoutsPane: unknown | null
  dismissRestTimersOverlay: () => void
  circuitGroup: Record<string, unknown>[]
  inlineExecutionTimerSeconds: number | null
  inlineExecutionTimerRunning: boolean
  inlineExecutionPreRollRemaining: number | null
  inlineTimerSeconds: number | null
  inlineTimerRunning: boolean
  toggleInlineExecutionTimer: () => void
  toggleInlineTimer: () => void
}

export function RestTimerOverlay({
  restTimersOverlayOpen,
  currentExercise,
  workoutsPane,
  dismissRestTimersOverlay,
  circuitGroup,
  inlineExecutionTimerSeconds,
  inlineExecutionTimerRunning,
  inlineExecutionPreRollRemaining,
  inlineTimerSeconds,
  inlineTimerRunning,
  toggleInlineExecutionTimer,
  toggleInlineTimer,
}: RestTimerOverlayProps) {
  return restTimersOverlayOpen && currentExercise ? (
    <div
      className={cn(
        workoutsPane ? 'absolute inset-0 z-[100]' : 'fixed inset-0 z-[100]',
        'flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]',
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Timer recupero e esecuzione"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-black/75 p-3 pt-12 shadow-2xl shadow-black/40">
        <button
          type="button"
          onClick={dismissRestTimersOverlay}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          aria-label="Chiudi e annulla timer"
          title="Chiudi e annulla"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="flex flex-row items-center justify-center gap-5 sm:gap-8">
          {/* Timer Esecuzione - Mostrato se l'esercizio (o un esercizio del circuito) ha execution_time_sec > 0 */}
          {/* TIMER ESECUZIONE PRIMA (sinistra) */}
          {(() => {
            let executionTime: number | null = null
            // Per circuito: usa il primo execution_time_sec > 0 tra gli esercizi del circuito
            if (circuitGroup.length > 0) {
              for (const item of circuitGroup) {
                const itemSets = (item.sets as Record<string, unknown>[]) || []
                const setIdx = itemSets.findIndex((s) => !(s as { completed?: boolean }).completed)
                const activeSet = setIdx >= 0 ? itemSets[setIdx] : itemSets[itemSets.length - 1]
                const t =
                  ((activeSet?.execution_time_sec ??
                    (item as Record<string, unknown>).execution_time_sec ??
                    null) as number | null) ?? null
                if (t != null && t > 0) {
                  executionTime = t
                  break
                }
              }
            }
            if (executionTime === null) {
              const sets = (currentExercise?.sets as Record<string, unknown>[]) || []
              const currentSetIndex = sets.findIndex((s) => !(s as { completed?: boolean }).completed)
              const activeSet =
                currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
              executionTime =
                ((activeSet?.execution_time_sec ??
                  currentExercise?.execution_time_sec ??
                  null) as number | null) ?? null
            }
            if (executionTime === null || executionTime <= 0) {
              return null
            }

            const initialSeconds = executionTime
            const currentSeconds =
              inlineExecutionTimerSeconds !== null ? inlineExecutionTimerSeconds : initialSeconds
            // Calcola il progresso basato sul tempo rimanente (inverso)
            // Quando currentSeconds = 0, progress = 0% (cerchio vuoto/completato)
            const progress =
              inlineExecutionPreRollRemaining !== null
                ? 100
                : currentSeconds === 0
                  ? 0
                  : (currentSeconds / initialSeconds) * 100
            const circumference = 2 * Math.PI * 80
            const strokeDashoffset = circumference - (progress / 100) * circumference

            const formatTime = (totalSeconds: number) => {
              return totalSeconds.toString()
            }

            return (
              <div key="timer-esecuzione-inline" className="flex flex-col items-center justify-center gap-3">
                {/* Cerchio animato esecuzione - Colore arancione/quasi rosso */}
                <div
                  className="relative h-36 w-36 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                  onClick={toggleInlineExecutionTimer}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleInlineExecutionTimer()
                    }
                  }}
                  aria-label={
                    inlineExecutionTimerSeconds === null
                      ? 'Avvia timer esecuzione'
                      : currentSeconds === 0
                        ? 'Timer esecuzione completato'
                        : inlineExecutionPreRollRemaining !== null
                          ? "Annulla conto alla rovescia prima dell'esecuzione"
                          : inlineExecutionTimerRunning
                            ? 'Resetta timer esecuzione'
                            : 'Avvia timer esecuzione'
                  }
                >
                  <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="none"
                      className="text-background-tertiary/20"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className={`transition-all duration-1000 ease-linear ${
                        inlineExecutionTimerSeconds === null
                          ? 'text-orange-600/40'
                          : currentSeconds === 0
                            ? 'text-green-500'
                            : inlineExecutionPreRollRemaining !== null
                              ? 'text-orange-500'
                              : inlineExecutionTimerRunning
                                ? 'text-orange-600'
                                : 'text-orange-600/60'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-1.5 pb-1 pointer-events-none">
                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                      {inlineExecutionTimerSeconds === null ? (
                        <>
                          <div className="text-4xl font-bold text-white leading-none tabular-nums">
                            {formatTime(initialSeconds)}
                          </div>
                          <div className="text-[10px] text-orange-600/70 font-medium uppercase tracking-wider">
                            ESECUZIONE
                          </div>
                        </>
                      ) : currentSeconds === 0 ? (
                        <>
                          <div className="text-4xl font-bold text-green-500 leading-none tabular-nums">
                            0
                          </div>
                          <div className="text-[10px] text-green-500/70 font-medium uppercase tracking-wider">
                            Completato
                          </div>
                        </>
                      ) : inlineExecutionPreRollRemaining !== null ? (
                        <>
                          <div className="text-4xl font-bold text-white leading-none tabular-nums">
                            {formatTime(inlineExecutionPreRollRemaining)}
                          </div>
                          <div className="text-[10px] text-orange-500/80 font-medium uppercase tracking-wider leading-tight">
                            {'Pronti\u2026'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-white leading-none tabular-nums">
                            {formatTime(currentSeconds)}
                          </div>
                          <div className="text-[10px] text-orange-600/70 font-medium uppercase tracking-wider">
                            SEC.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Timer Recupero - DOPO (destra) - SOLO UNO */}
          {(() => {
            // Controlla se currentExercise esiste
            if (!currentExercise) {
              return null
            }

            const sets = (currentExercise.sets as Record<string, unknown>[]) || []
            const currentSetIndex = sets.findIndex((s) => !(s as { completed?: boolean }).completed)
            const activeSet = currentSetIndex >= 0 ? sets[currentSetIndex] : sets[sets.length - 1]
            const timerValue =
              ((activeSet?.rest_timer_sec ?? currentExercise.rest_timer_sec ?? null) as
                | number
                | null) ?? 0
            const initialSeconds = timerValue > 0 ? timerValue : 60
            const currentSeconds = inlineTimerSeconds !== null ? inlineTimerSeconds : initialSeconds
            const progress = (currentSeconds / initialSeconds) * 100
            const circumference = 2 * Math.PI * 80
            const strokeDashoffset = circumference - (progress / 100) * circumference

            const formatTime = (totalSeconds: number) => {
              return totalSeconds.toString()
            }

            const showRecoveryWaiting =
              inlineTimerSeconds === null &&
              inlineExecutionTimerSeconds !== null &&
              inlineExecutionTimerSeconds > 0 &&
              (inlineExecutionTimerRunning || inlineExecutionPreRollRemaining !== null)

            if (
              !restTimersOverlayOpen &&
              timerValue <= 0 &&
              inlineTimerSeconds === null &&
              inlineExecutionTimerSeconds === null
            ) {
              return null
            }

            return (
              <div key="timer-recupero-unico" className="flex flex-col items-center justify-center gap-3">
                {/* Cerchio animato recupero */}
                <div
                  className={`relative h-36 w-36 transition-transform duration-200 ${
                    showRecoveryWaiting
                      ? 'cursor-default opacity-80'
                      : 'cursor-pointer hover:scale-105 active:scale-95'
                  }`}
                  onClick={showRecoveryWaiting ? undefined : toggleInlineTimer}
                  role={showRecoveryWaiting ? undefined : 'button'}
                  tabIndex={showRecoveryWaiting ? undefined : 0}
                  onKeyDown={(e) => {
                    if (showRecoveryWaiting) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleInlineTimer()
                    }
                  }}
                  aria-label={
                    showRecoveryWaiting
                      ? 'Recupero dopo esecuzione'
                      : inlineTimerRunning
                        ? 'Pausa timer recupero'
                        : 'Avvia timer recupero'
                  }
                >
                  <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="none"
                      className="text-background-tertiary/20"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="14"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className={`transition-all duration-1000 ease-linear ${
                        showRecoveryWaiting
                          ? 'text-cyan-400/30'
                          : inlineTimerSeconds === null
                            ? 'text-cyan-400/40'
                            : currentSeconds === 0
                              ? 'text-green-500'
                              : inlineTimerRunning
                                ? 'text-cyan-400'
                                : 'text-cyan-400/60'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-1.5 pb-1 pointer-events-none">
                    <div className="flex flex-col items-center justify-center gap-1 text-center">
                      {showRecoveryWaiting ? (
                        <>
                          <div className="text-4xl font-bold text-cyan-300 leading-none tabular-nums">
                            {formatTime(initialSeconds)}
                          </div>
                          <div className="text-[10px] text-cyan-300/70 font-medium uppercase tracking-wider leading-tight">
                            Dopo esecuzione
                          </div>
                        </>
                      ) : inlineTimerSeconds === null ? (
                        <>
                          <div className="text-4xl font-bold text-white leading-none tabular-nums">
                            {formatTime(initialSeconds)}
                          </div>
                          <div className="text-[10px] text-cyan-400/70 font-medium uppercase tracking-wider">
                            RECUPERO
                          </div>
                        </>
                      ) : currentSeconds === 0 ? (
                        <>
                          <div className="text-4xl font-bold text-green-500 leading-none tabular-nums">
                            0
                          </div>
                          <div className="text-[10px] text-green-500/70 font-medium uppercase tracking-wider">
                            Completato
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-white leading-none tabular-nums">
                            {formatTime(currentSeconds)}
                          </div>
                          <div className="text-[10px] text-cyan-400/70 font-medium uppercase tracking-wider">
                            SEC.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  ) : null
}
