'use client'

import Image from 'next/image'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { X, Plus, Trash2, AlertCircle, ChevronDown } from 'lucide-react'
import { Button, SimpleSelect } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Label } from '@/components/ui'
import {
  buildWorkoutRepsSelectOptions,
  workoutRepsFromSelectValue,
  workoutRepsToSelectValue,
} from '@/lib/constants/workout-reps-select'
import { cn } from '@/lib/utils'
import { isWorkoutExerciseConfigured } from '@/lib/validations/workout-target'
import type { SimpleSelectOption } from '@/components/ui/simple-select'
import type { Exercise, WorkoutDayExerciseData, WorkoutSetDetail } from '@/types/workout'

/** Preset recupero: 0…20 × 15 s (0…300 s). Input libero fino a 600 s. */
const REST_SEC_MAX = 600
const REST_PRESET_STEP_SEC = 15
const REST_PRESET_MAX_I = 20

function buildRestPresetOptions(currentSec?: number | null): SimpleSelectOption[] {
  const base: SimpleSelectOption[] = Array.from({ length: REST_PRESET_MAX_I + 1 }, (_, i) => {
    const sec = i * REST_PRESET_STEP_SEC
    return { value: String(sec), label: `${sec} s` }
  })
  const presetValues = new Set(base.map((o) => Number(o.value)))
  if (
    currentSec != null &&
    Number.isFinite(currentSec) &&
    currentSec >= 0 &&
    currentSec <= REST_SEC_MAX &&
    !presetValues.has(currentSec)
  ) {
    return [{ value: String(currentSec), label: `${currentSec} s` }, ...base]
  }
  return base
}

function clampRestSeconds(n: number): number {
  return Math.min(REST_SEC_MAX, Math.max(0, Math.round(n)))
}

/** Peso: preset 0…200 kg ogni 2,5; digitazione libera fino a 999 kg (step 0,5). */
const WEIGHT_KG_PRESET_STEP = 2.5
const WEIGHT_KG_PRESET_MAX = 200
const WEIGHT_KG_MANUAL_MAX = 999

function buildWeightPresetOptions(currentKg?: number | null): SimpleSelectOption[] {
  const nPresets = Math.floor(WEIGHT_KG_PRESET_MAX / WEIGHT_KG_PRESET_STEP) + 1
  const base: SimpleSelectOption[] = Array.from({ length: nPresets }, (_, i) => {
    const kg = (i * WEIGHT_KG_PRESET_STEP * 10) / 10
    return { value: String(kg), label: `${kg} kg` }
  })
  const inPreset = (kg: number) => base.some((o) => Math.abs(Number(o.value) - kg) < 1e-6)
  if (
    currentKg != null &&
    Number.isFinite(currentKg) &&
    currentKg >= 0 &&
    currentKg <= WEIGHT_KG_MANUAL_MAX &&
    !inPreset(currentKg)
  ) {
    return [{ value: String(currentKg), label: `${currentKg} kg` }, ...base]
  }
  return base
}

function clampWeightKg(n: number): number {
  const half = Math.round(n * 2) / 2
  return Math.min(WEIGHT_KG_MANUAL_MAX, Math.max(0, half))
}

const NUMBER_INPUT_NO_SPINNER =
  '[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

const EXEC_TIME_SEC_MAX = 3600

/** Stessi preset del recupero (0…300 s a step 15); digitazione fino a 3600 s. */
function buildExecutionPresetOptions(currentSec?: number | null): SimpleSelectOption[] {
  const base: SimpleSelectOption[] = Array.from({ length: REST_PRESET_MAX_I + 1 }, (_, i) => {
    const sec = i * REST_PRESET_STEP_SEC
    return { value: String(sec), label: `${sec} s` }
  })
  const presetValues = new Set(base.map((o) => Number(o.value)))
  if (
    currentSec != null &&
    Number.isFinite(currentSec) &&
    currentSec >= 0 &&
    currentSec <= EXEC_TIME_SEC_MAX &&
    !presetValues.has(currentSec)
  ) {
    return [{ value: String(currentSec), label: `${currentSec} s` }, ...base]
  }
  return base
}

function clampExecutionSeconds(n: number): number {
  return Math.min(EXEC_TIME_SEC_MAX, Math.max(0, Math.round(n)))
}

function PresetComboField({
  value,
  onChange,
  className,
  label,
  options,
  matchSelected,
  clamp,
  inputMin,
  inputMax,
  inputStep,
  placeholder,
  ariaLabel,
}: {
  value: number | undefined | null
  onChange: (n: number | undefined) => void
  className?: string
  label?: string
  options: SimpleSelectOption[]
  matchSelected: (option: SimpleSelectOption, v: number | undefined | null) => boolean
  clamp: (n: number) => number
  inputMin: number
  inputMax: number
  inputStep: number | string
  placeholder: string
  ariaLabel: string
}) {
  const listboxId = useId()
  const inputStr = value != null && Number.isFinite(value) ? String(value) : ''

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedOptionRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  const selectedOption =
    value != null && Number.isFinite(value)
      ? (options.find((o) => matchSelected(o, value)) ?? null)
      : null

  const updateDropdownPosition = useCallback(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
    } else {
      setDropdownPosition(null)
    }
  }, [isOpen, updateDropdownPosition])

  useEffect(() => {
    if (!isOpen) return

    updateDropdownPosition()
    let rafId: number | null = null
    let running = true
    const loop = () => {
      if (!running) return
      updateDropdownPosition()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    const onScroll = () => updateDropdownPosition()
    const onResize = () => updateDropdownPosition()
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      running = false
      if (rafId != null) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', onResize)
    }
  }, [isOpen, updateDropdownPosition])

  useEffect(() => {
    if (!isOpen || !selectedOptionRef.current || !scrollContainerRef.current) return

    const t = window.setTimeout(() => {
      const container = scrollContainerRef.current
      const el = selectedOptionRef.current
      if (!container || !el) return
      const ch = container.clientHeight
      const target = el.offsetTop - ch / 2 + el.offsetHeight / 2
      container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
    }, 50)

    return () => window.clearTimeout(t)
  }, [isOpen, selectedOption])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node
      if (containerRef.current?.contains(t) || dropdownRef.current?.contains(t)) {
        return
      }
      setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  const field = (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex h-11 w-full items-stretch rounded-md border bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow] duration-150',
          isOpen
            ? 'border-primary ring-2 ring-primary/25'
            : 'border-white/10 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25',
        )}
      >
        <input
          type="number"
          inputMode="numeric"
          value={inputStr}
          onChange={(e) => {
            const v = e.target.value
            if (v === '') {
              onChange(undefined)
              return
            }
            const n = Number(v)
            if (Number.isFinite(n)) {
              onChange(clamp(n))
            }
          }}
          min={inputMin}
          max={inputMax}
          step={inputStep}
          placeholder={placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent px-3.5 text-sm text-text-primary outline-none ring-0 placeholder:text-text-tertiary',
            NUMBER_INPUT_NO_SPINNER,
          )}
        />
        <button
          type="button"
          className="flex shrink-0 items-center justify-center border-l border-white/10 px-2.5 text-text-tertiary transition-colors hover:bg-white/[0.04] hover:text-text-secondary"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          onClick={() => setIsOpen((o) => !o)}
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>
      </div>

      {typeof window !== 'undefined' &&
        isOpen &&
        dropdownPosition &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" aria-hidden onClick={() => setIsOpen(false)} />
            <div
              ref={dropdownRef}
              className="fixed z-[9999] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
              id={listboxId}
              role="listbox"
            >
              <div ref={scrollContainerRef} className="max-h-60 overflow-auto py-1.5">
                {options.map((option) => {
                  const isSelected = selectedOption?.value === option.value
                  return (
                    <button
                      key={option.value}
                      ref={isSelected ? selectedOptionRef : null}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        'flex min-h-[44px] w-full cursor-pointer items-center px-4 py-2.5 text-left text-base outline-none transition-colors duration-150',
                        isSelected
                          ? 'bg-primary/25 text-primary font-medium'
                          : 'text-text-primary hover:bg-primary/15 focus:bg-primary/20',
                      )}
                      onClick={() => {
                        onChange(clamp(Number(option.value)))
                        setIsOpen(false)
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  )

  if (label) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-text-secondary text-xs font-medium">{label}</span>
        {field}
      </div>
    )
  }

  return field
}

function RestSecondsField({
  value,
  onChange,
  className,
  label,
}: {
  value: number | undefined | null
  onChange: (sec: number | undefined) => void
  className?: string
  label?: string
}) {
  const options = useMemo(() => buildRestPresetOptions(value ?? undefined), [value])
  return (
    <PresetComboField
      value={value}
      onChange={onChange}
      className={className}
      label={label}
      options={options}
      matchSelected={(o, v) => v != null && Number.isFinite(v) && o.value === String(v)}
      clamp={clampRestSeconds}
      inputMin={0}
      inputMax={REST_SEC_MAX}
      inputStep={1}
      placeholder="Sec"
      ariaLabel="Preset recupero (secondi)"
    />
  )
}

function ExecutionSecondsField({
  value,
  onChange,
  className,
  label,
}: {
  value: number | undefined | null
  onChange: (sec: number | undefined) => void
  className?: string
  label?: string
}) {
  const options = useMemo(() => buildExecutionPresetOptions(value ?? undefined), [value])
  return (
    <PresetComboField
      value={value}
      onChange={onChange}
      className={className}
      label={label}
      options={options}
      matchSelected={(o, v) => v != null && Number.isFinite(v) && o.value === String(v)}
      clamp={clampExecutionSeconds}
      inputMin={0}
      inputMax={EXEC_TIME_SEC_MAX}
      inputStep={1}
      placeholder="Sec"
      ariaLabel="Preset tempo esecuzione (secondi)"
    />
  )
}

function WeightKgField({
  value,
  onChange,
  className,
  label,
}: {
  value: number | undefined | null
  onChange: (kg: number | undefined) => void
  className?: string
  label?: string
}) {
  const options = useMemo(() => buildWeightPresetOptions(value ?? undefined), [value])
  return (
    <PresetComboField
      value={value}
      onChange={onChange}
      className={className}
      label={label}
      options={options}
      matchSelected={(o, v) =>
        v != null && Number.isFinite(v) && Math.abs(Number(o.value) - v) < 1e-6
      }
      clamp={clampWeightKg}
      inputMin={0}
      inputMax={WEIGHT_KG_MANUAL_MAX}
      inputStep={0.5}
      placeholder="kg"
      ariaLabel="Preset peso (kg)"
    />
  )
}

function isValidHttpUrl(u: unknown): u is string {
  return (
    typeof u === 'string' &&
    u.trim() !== '' &&
    (u.startsWith('http://') || u.startsWith('https://'))
  )
}

export interface WorkoutExerciseTargetPanelProps {
  exercise: WorkoutDayExerciseData
  catalogExercise: Exercise | undefined
  dayIndex: number
  itemIndex: number
  onUpdate: (patch: Partial<WorkoutDayExerciseData>) => void
  validation?: { errors: string[]; warnings: string[] }
  /** Per scroll nel passo Target (lista giorni) */
  anchorId?: string
  rootClassName?: string
  showRemoveButton?: boolean
  onRemove?: () => void
  /** Nel modale: video sopra, tabella a larghezza piena (no affiancamento stretto) */
  stackedMediaLayout?: boolean
}

export function WorkoutExerciseTargetPanel({
  exercise,
  catalogExercise,
  dayIndex,
  itemIndex,
  onUpdate,
  validation,
  anchorId,
  rootClassName,
  showRemoveButton = true,
  onRemove,
  stackedMediaLayout = false,
}: WorkoutExerciseTargetPanelProps) {
  const hasVideoUrl = isValidHttpUrl(catalogExercise?.video_url)
  const posterUrl = catalogExercise?.thumb_url || catalogExercise?.image_url || null
  const showExerciseMedia = hasVideoUrl || isValidHttpUrl(posterUrl)
  const targetConfigured = isWorkoutExerciseConfigured(exercise)
  const noteFieldId = `exercise-note-${dayIndex}-${itemIndex}`

  const mainRepsOptions = useMemo(
    () => buildWorkoutRepsSelectOptions(exercise.target_reps),
    [exercise.target_reps],
  )

  return (
    <div
      id={anchorId}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 bg-[#141414] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200',
        anchorId && 'scroll-mt-24',
        rootClassName,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <h4 className="text-text-primary font-semibold text-base">
            {catalogExercise?.name || 'Esercizio'}
          </h4>
          <Badge
            variant="outline"
            size="sm"
            className={
              targetConfigured
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shrink-0'
                : 'border-amber-500/40 bg-amber-500/15 text-amber-300 shrink-0'
            }
          >
            {targetConfigured ? 'Configurato' : 'Da configurare'}
          </Badge>
        </div>
        {showRemoveButton && onRemove ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <div
        className={cn(
          'flex flex-col gap-4 items-stretch',
          stackedMediaLayout ? '' : 'lg:flex-row lg:items-start',
        )}
      >
        {showExerciseMedia && (
          <div
            className={cn(
              'relative mx-auto aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]',
              stackedMediaLayout ? 'max-w-2xl sm:max-w-3xl' : 'max-w-md lg:mx-0 lg:w-64 xl:w-72',
            )}
          >
            {hasVideoUrl && catalogExercise?.video_url ? (
              <video
                src={catalogExercise.video_url}
                poster={isValidHttpUrl(posterUrl) ? posterUrl : undefined}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                preload="metadata"
                controls
              />
            ) : isValidHttpUrl(posterUrl) ? (
              <Image
                src={posterUrl}
                alt={catalogExercise?.name ?? 'Esercizio'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 256px, 288px"
                unoptimized
              />
            ) : null}
          </div>
        )}
        <div className="min-w-0 w-full flex-1">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] mb-4 overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left bg-white/[0.02]">
                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                      Serie
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                      Ripetizioni
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                      Peso (kg)
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                      Tempo esecuzione (sec)
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left border-l border-white/10 bg-white/[0.02]">
                    <span className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                      Recupero (sec)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex justify-center sm:justify-start">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm"
                        aria-label="Serie 1"
                      >
                        1
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-l border-white/10">
                    <SimpleSelect
                      value={workoutRepsToSelectValue(exercise.target_reps)}
                      onValueChange={(v) =>
                        onUpdate({
                          target_reps: workoutRepsFromSelectValue(v),
                        })
                      }
                      options={mainRepsOptions}
                      placeholder="Ripetizioni"
                      className="w-full min-w-[8rem]"
                    />
                  </td>
                  <td className="px-4 py-4 border-l border-white/10">
                    <WeightKgField
                      value={exercise.target_weight}
                      onChange={(kg) => onUpdate({ target_weight: kg ?? 0 })}
                      className="w-full"
                    />
                  </td>
                  <td className="px-4 py-4 border-l border-white/10">
                    <ExecutionSecondsField
                      value={exercise.execution_time_sec}
                      onChange={(sec) => onUpdate({ execution_time_sec: sec ?? 0 })}
                      className="w-full"
                    />
                  </td>
                  <td className="px-4 py-4 border-l border-white/10">
                    <RestSecondsField
                      value={exercise.rest_timer_sec}
                      onChange={(sec) => onUpdate({ rest_timer_sec: sec })}
                      className="w-full"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="relative mt-4 mb-4">
            <Label
              htmlFor={noteFieldId}
              className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2 block"
            >
              Note Esercizio (opzionale)
            </Label>
            <Textarea
              id={noteFieldId}
              value={exercise.note || ''}
              onChange={(e) =>
                onUpdate({
                  note: e.target.value || undefined,
                })
              }
              placeholder="Inserisci note specifiche per questo esercizio (es. tecnica, respirazione, posizione, ecc.)"
              className="w-full min-h-[80px] resize-y bg-white/[0.04] border border-white/10 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:ring-primary/20"
              rows={3}
            />
            {exercise.note ? (
              <p className="text-text-tertiary text-xs mt-1">{exercise.note.length} caratteri</p>
            ) : null}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSets = exercise.sets_detail || []
                const newSet: WorkoutSetDetail = {
                  id: `set-${Date.now()}-${Math.random()}`,
                  set_number: currentSets.length + 2,
                  reps: exercise.target_reps || 10,
                  weight_kg: exercise.target_weight || undefined,
                  execution_time_sec: exercise.execution_time_sec || undefined,
                  rest_timer_sec: exercise.rest_timer_sec || undefined,
                }
                onUpdate({
                  sets_detail: [...currentSets, newSet],
                  target_sets: currentSets.length + 2,
                })
              }}
              className="border-primary/25 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi serie
            </Button>
            {exercise.sets_detail && exercise.sets_detail.length > 0 ? (
              <span className="text-text-tertiary text-xs">
                {exercise.sets_detail.length}{' '}
                {exercise.sets_detail.length === 1 ? 'serie configurata' : 'serie configurate'}
              </span>
            ) : null}
          </div>

          {exercise.sets_detail && exercise.sets_detail.length > 0 ? (
            <div className="space-y-3 mt-4 pt-5 border-t border-white/10">
              <h5 className="text-text-secondary text-sm font-semibold mb-4 flex items-center gap-2">
                <span>Serie configurate</span>
                <Badge variant="outline" size="sm" className="border-0 bg-primary/10 text-primary">
                  {exercise.sets_detail.length}
                </Badge>
              </h5>
              <div className="space-y-2.5">
                {exercise.sets_detail.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-white/10 bg-white/[0.04] hover:border-white/20 transition-all duration-200"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {set.set_number}
                    </div>
                    <div className="relative flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-text-secondary text-xs font-medium">Ripetizioni</span>
                        <SimpleSelect
                          value={workoutRepsToSelectValue(set.reps)}
                          onValueChange={(v) => {
                            const updatedSets = [...exercise.sets_detail!]
                            updatedSets[setIndex] = {
                              ...updatedSets[setIndex],
                              reps: workoutRepsFromSelectValue(v),
                            }
                            onUpdate({
                              sets_detail: updatedSets,
                            })
                          }}
                          options={buildWorkoutRepsSelectOptions(set.reps)}
                          placeholder="Ripetizioni"
                          className="w-full"
                        />
                      </div>
                      <WeightKgField
                        label="Peso (kg)"
                        value={set.weight_kg}
                        onChange={(kg) => {
                          const updatedSets = [...exercise.sets_detail!]
                          updatedSets[setIndex] = {
                            ...updatedSets[setIndex],
                            weight_kg: kg,
                          }
                          onUpdate({
                            sets_detail: updatedSets,
                          })
                        }}
                      />
                      <ExecutionSecondsField
                        label="Tempo esecuzione (sec)"
                        value={set.execution_time_sec}
                        onChange={(sec) => {
                          const updatedSets = [...exercise.sets_detail!]
                          updatedSets[setIndex] = {
                            ...updatedSets[setIndex],
                            execution_time_sec: sec,
                          }
                          onUpdate({
                            sets_detail: updatedSets,
                          })
                        }}
                      />
                      <RestSecondsField
                        label="Recupero (sec)"
                        value={set.rest_timer_sec}
                        onChange={(sec) => {
                          const updatedSets = [...exercise.sets_detail!]
                          updatedSets[setIndex] = {
                            ...updatedSets[setIndex],
                            rest_timer_sec: sec,
                          }
                          onUpdate({
                            sets_detail: updatedSets,
                          })
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedSets = exercise.sets_detail!.filter(
                          (_, idx) => idx !== setIndex,
                        )
                        const renumberedSets = updatedSets.map((s, idx) => ({
                          ...s,
                          set_number: idx + 2,
                        }))
                        onUpdate({
                          sets_detail: renumberedSets,
                          target_sets: renumberedSets.length + 1 || exercise.target_sets || 1,
                        })
                      }}
                      className="relative text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {validation && (validation.errors.length > 0 || validation.warnings.length > 0) ? (
            <div className="mt-3 space-y-1">
              {validation.errors.length > 0 ? (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {validation.errors.map((error, idx) => (
                      <p key={idx} className="text-red-400 text-xs">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
              {validation.warnings.length > 0 ? (
                <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {validation.warnings.map((warning, idx) => (
                      <p key={idx} className="text-yellow-400 text-xs">
                        {warning}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
