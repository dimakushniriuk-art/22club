'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const WEIGHT_MAX_KG = 200
const ITEM_HEIGHT_PX = 48
const VIEWPORT_ROWS = 5
const VIEWPORT_HEIGHT_PX = ITEM_HEIGHT_PX * VIEWPORT_ROWS

/** Passi disponibili nel picker (ordine crescente). */
const STEP_OPTIONS_KG = [0.25, 0.5, 1, 2.5, 5, 10] as const

function buildWeightOptions(stepKg: number): number[] {
  const n = Math.floor(WEIGHT_MAX_KG / stepKg) + 1
  return Array.from({ length: n }, (_, i) => Number((i * stepKg).toFixed(4)))
}

function nearestIndexFromKg(kg: number, stepKg: number, weights: number[]): number {
  const clamped = Math.max(0, Math.min(WEIGHT_MAX_KG, Number.isFinite(kg) ? kg : 0))
  const idx = Math.round(clamped / stepKg)
  return Math.max(0, Math.min(weights.length - 1, idx))
}

function formatKgDisplay(kg: number): string {
  return kg.toLocaleString('it-IT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export type WorkoutWeightPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialKg: number
  onSave: (kg: number) => void
}

export function WorkoutWeightPickerDialog({
  open,
  onOpenChange,
  initialKg,
  onSave,
}: WorkoutWeightPickerDialogProps) {
  const [stepKg, setStepKg] = useState<number>(2.5)
  const weights = useMemo(() => buildWeightOptions(stepKg), [stepKg])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [centerKg, setCenterKg] = useState(0)
  const scrollSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipScrollEffectRef = useRef(false)
  const prevOpenRef = useRef(false)
  const prevInitialKgRef = useRef(initialKg)
  const prevStepKgRef = useRef(2.5)

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'auto') => {
    const el = scrollRef.current
    if (!el) return
    const top = index * ITEM_HEIGHT_PX
    el.scrollTo({ top, behavior })
  }, [])

  const syncKgFromScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const raw = el.scrollTop / ITEM_HEIGHT_PX
    const idx = Math.max(0, Math.min(weights.length - 1, Math.round(raw)))
    setCenterKg(weights[idx])
  }, [weights])

  /** All'apertura o se cambia initialKg con dialog aperto: partiamo dal peso iniziale. */
  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false
      return
    }
    const justOpened = !prevOpenRef.current
    const initialChanged = prevInitialKgRef.current !== initialKg
    prevOpenRef.current = true
    prevInitialKgRef.current = initialKg
    if (!justOpened && !initialChanged) return

    const idx = nearestIndexFromKg(initialKg, stepKg, weights)
    setCenterKg(weights[idx])
    skipScrollEffectRef.current = true
    requestAnimationFrame(() => {
      scrollToIndex(idx, 'auto')
      requestAnimationFrame(() => {
        skipScrollEffectRef.current = false
      })
    })
  }, [open, initialKg, stepKg, weights, scrollToIndex])

  /** Cambio passo: aggancia il peso corrente alla nuova griglia e riallinea lo scroll. */
  useEffect(() => {
    if (!open) {
      prevStepKgRef.current = stepKg
      return
    }
    if (prevStepKgRef.current === stepKg) return
    prevStepKgRef.current = stepKg

    const idx = nearestIndexFromKg(centerKg, stepKg, weights)
    const nextKg = weights[idx]
    setCenterKg(nextKg)
    skipScrollEffectRef.current = true
    requestAnimationFrame(() => {
      scrollToIndex(idx, 'auto')
      requestAnimationFrame(() => {
        skipScrollEffectRef.current = false
      })
    })
  }, [stepKg, open, weights, scrollToIndex, centerKg])

  const scheduleSnap = useCallback(() => {
    if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current)
    scrollSettleRef.current = setTimeout(() => {
      const el = scrollRef.current
      if (!el) return
      const raw = el.scrollTop / ITEM_HEIGHT_PX
      const idx = Math.max(0, Math.min(weights.length - 1, Math.round(raw)))
      scrollToIndex(idx, 'smooth')
      setCenterKg(weights[idx])
    }, 120)
  }, [scrollToIndex, weights])

  useEffect(() => {
    return () => {
      if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (skipScrollEffectRef.current) return
    syncKgFromScroll()
    scheduleSnap()
  }, [syncKgFromScroll, scheduleSnap])

  const handleSave = () => {
    onSave(centerKg)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-sm flex-col gap-4 overflow-hidden pb-5 pt-5 sm:gap-5">
        <DialogHeader className="space-y-2 pr-10 text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight text-text-primary">
            Peso
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-text-secondary">
            Imposta l&apos;incremento, poi scorri fino al valore desiderato (in evidenza al centro).
          </DialogDescription>
          <p
            className="rounded-xl border border-orange-400/25 bg-orange-500/[0.08] px-3 py-2.5 text-center text-sm tabular-nums"
            aria-live="polite"
          >
            <span className="text-text-tertiary">Selezionato</span>{' '}
            <span className="font-bold text-orange-400">
              {formatKgDisplay(centerKg)}
              <span className="ml-1 text-xs font-semibold text-orange-400/75">kg</span>
            </span>
          </p>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-center text-[11px] font-medium uppercase tracking-wider text-text-tertiary/90">
            Incremento
          </p>
          <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Passo incremento peso (kg)"
          >
            {STEP_OPTIONS_KG.map((s) => {
              const selected = stepKg === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStepKg(s)}
                  className={cn(
                    'inline-flex h-9 min-w-[3.25rem] shrink-0 items-center justify-center rounded-lg border px-2.5 text-xs transition-colors duration-150 sm:text-sm',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
                    selected
                      ? 'border-orange-400/45 bg-orange-500/[0.12] font-bold text-orange-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] focus-visible:ring-orange-400/50'
                      : 'border-white/10 bg-white/[0.04] font-medium text-text-tertiary/80 hover:border-white/18 hover:bg-white/[0.07] hover:text-text-secondary focus-visible:ring-white/25',
                  )}
                >
                  {s.toLocaleString('it-IT', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{' '}
                  <span className={cn('font-normal', selected && 'text-orange-400/85')}>kg</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-center text-[11px] font-medium uppercase tracking-wider text-text-tertiary/90">
            Scorri per il peso
          </p>
          <div className="relative mx-auto w-full max-w-[220px] select-none rounded-xl border border-white/10 bg-black/25 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <div
              className="pointer-events-none absolute inset-x-0 top-1 z-10 h-14 rounded-t-lg bg-gradient-to-b from-zinc-950 via-zinc-950/85 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-1 z-10 h-14 rounded-b-lg bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-2 top-1/2 z-10 h-12 -translate-y-1/2 rounded-xl border border-orange-400/45 bg-orange-500/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              aria-hidden
            />

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className={cn(
                'snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-lg border border-white/10 bg-black/40 scrollbar-hide',
              )}
              style={{ height: VIEWPORT_HEIGHT_PX }}
            >
              <div className="py-24">
                {weights.map((kg) => {
                  const isCenter = Math.abs(kg - centerKg) < 0.001
                  return (
                    <button
                      key={kg}
                      type="button"
                      onClick={() => {
                        const idx = weights.indexOf(kg)
                        if (idx < 0) return
                        scrollToIndex(idx, 'smooth')
                        setCenterKg(kg)
                      }}
                      className={cn(
                        'flex h-12 w-full shrink-0 snap-center items-center justify-center text-base transition-colors duration-150',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50',
                        isCenter ? 'font-bold text-orange-400' : 'font-medium text-text-tertiary/70',
                      )}
                    >
                      <span>{formatKgDisplay(kg)}</span>
                      <span
                        className={cn(
                          'ml-1 text-xs font-normal',
                          isCenter ? 'text-orange-400/75' : 'text-text-tertiary',
                        )}
                      >
                        kg
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-0 flex-col gap-2 sm:flex-row sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            className="w-full border-white/15 bg-white/5 sm:flex-1"
            onClick={handleCancel}
          >
            Annulla
          </Button>
          <Button type="button" className="w-full sm:flex-1" onClick={handleSave}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
