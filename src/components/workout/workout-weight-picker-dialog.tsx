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

const WEIGHT_STEP_KG = 2.5
const WEIGHT_MAX_KG = 200
const ITEM_HEIGHT_PX = 48
const VIEWPORT_ROWS = 5
const VIEWPORT_HEIGHT_PX = ITEM_HEIGHT_PX * VIEWPORT_ROWS

function buildWeightOptions(): number[] {
  const n = Math.floor(WEIGHT_MAX_KG / WEIGHT_STEP_KG) + 1
  return Array.from({ length: n }, (_, i) => Math.round(i * WEIGHT_STEP_KG * 10) / 10)
}

function nearestIndexFromKg(kg: number, weights: number[]): number {
  const clamped = Math.max(0, Math.min(WEIGHT_MAX_KG, Number.isFinite(kg) ? kg : 0))
  const idx = Math.round(clamped / WEIGHT_STEP_KG)
  return Math.max(0, Math.min(weights.length - 1, idx))
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
  const weights = useMemo(() => buildWeightOptions(), [])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [centerKg, setCenterKg] = useState(() => weights[nearestIndexFromKg(initialKg, weights)])
  const scrollSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipScrollEffectRef = useRef(false)

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

  useEffect(() => {
    if (!open) return
    const idx = nearestIndexFromKg(initialKg, weights)
    setCenterKg(weights[idx])
    skipScrollEffectRef.current = true
    requestAnimationFrame(() => {
      scrollToIndex(idx, 'auto')
      requestAnimationFrame(() => {
        skipScrollEffectRef.current = false
      })
    })
  }, [open, initialKg, weights, scrollToIndex])

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
      <DialogContent className="max-w-sm overflow-hidden pb-4 pt-5">
        <DialogHeader className="pr-10">
          <DialogTitle>Peso</DialogTitle>
          <DialogDescription>
            Scorri per scegliere il peso (passo {WEIGHT_STEP_KG} kg). Il valore evidenziato al centro
            è quello selezionato.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mx-auto w-full max-w-[220px] select-none">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-zinc-900 via-zinc-900/80 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-1 top-1/2 z-10 h-12 -translate-y-1/2 rounded-xl border border-orange-400/45 bg-orange-500/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
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
                      isCenter
                        ? 'font-bold text-orange-400'
                        : 'font-medium text-text-tertiary/70',
                    )}
                  >
                    <span>{kg.toFixed(1)}</span>
                    <span className="ml-1 text-xs font-normal text-text-tertiary">kg</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:justify-stretch">
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
