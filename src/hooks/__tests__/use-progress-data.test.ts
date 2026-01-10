import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useProgressData } from '../use-progress-data'
import type { Tables } from '@/types/supabase'

// Helper per creare un progress_log completo con valori di default
const createProgressLog = (
  overrides: Partial<Tables<'progress_logs'>>,
): Tables<'progress_logs'> => ({
  id: '1',
  athlete_id: 'athlete-1',
  date: '2025-02-01',
  weight_kg: 75,
  created_at: '2025-02-01T10:00:00Z',
  addome_basso_cm: null,
  adiposita_centrale: null,
  apertura_braccia_cm: null,
  area_superficie_corporea_m2: null,
  avambraccio_cm: null,
  biceps_cm: null,
  braccio_contratto_cm: null,
  braccio_corretto_cm: null,
  braccio_rilassato_cm: null,
  capacita_dispersione_calore: null,
  caviglia_cm: null,
  chest_cm: null,
  collo_cm: null,
  coscia_alta_cm: null,
  coscia_bassa_cm: null,
  coscia_corretta_cm: null,
  coscia_media_cm: null,
  diametro_bistiloideo_cm: null,
  diametro_femore_cm: null,
  diametro_omero_cm: null,
  dispendio_energetico_totale_kcal: null,
  ectomorfia: null,
  endomorfia: null,
  gamba_corretta_cm: null,
  ginocchio_cm: null,
  glutei_cm: null,
  hips_cm: null,
  imc: null,
  indice_adiposo_muscolare: null,
  indice_conicita: null,
  indice_cormico: null,
  indice_manouvrier: null,
  indice_muscolo_osseo: null,
  indice_vita_fianchi: null,
  livello_attivita: null,
  massa_grassa_kg: null,
  massa_grassa_percentuale: null,
  massa_magra_kg: null,
  massa_muscolare_kg: null,
  massa_muscolare_scheletrica_kg: null,
  massa_ossea_kg: null,
  massa_residuale_kg: null,
  max_bench_kg: null,
  max_deadlift_kg: null,
  max_squat_kg: null,
  mesomorfia: null,
  metabolismo_basale_kcal: null,
  mood_text: null,
  note: null,
  plica_addominale_mm: null,
  plica_bicipite_mm: null,
  plica_coscia_mm: null,
  plica_cresta_iliaca_mm: null,
  plica_gamba_mm: null,
  plica_sopraspinale_mm: null,
  plica_sottoscapolare_mm: null,
  plica_tricipite_mm: null,
  polpaccio_cm: null,
  polso_cm: null,
  rischio_cardiometabolico: null,
  spalle_cm: null,
  statura_allungata_cm: null,
  statura_seduto_cm: null,
  struttura_muscolo_scheletrica: null,
  thighs_cm: null,
  torace_inspirazione_cm: null,
  updated_at: null,
  vita_alta_cm: null,
  waist_cm: null,
  ...overrides,
})

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: vi.fn(() => ({
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}))

// Mock validation
vi.mock('@/lib/utils/validation', () => ({
  validateWeight: vi.fn((weight: number) => ({
    valid: weight >= 40 && weight <= 150,
    error: weight < 40 || weight > 150 ? 'Peso non valido' : undefined,
  })),
}))

describe('useProgressData', () => {
  it('should return null when progressLogs is null', () => {
    const { result } = renderHook(() => useProgressData(null))
    expect(result.current).toBeNull()
  })

  it('should return null when progressLogs is undefined', () => {
    const { result } = renderHook(() => useProgressData(undefined))
    expect(result.current).toBeNull()
  })

  it('should return null when progressLogs is empty', () => {
    const { result } = renderHook(() => useProgressData([]))
    expect(result.current).toBeNull()
  })

  it('should calculate progress data with single log', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-02-01',
        weight_kg: 75,
        created_at: '2025-02-01T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))

    expect(result.current).toEqual({
      type: 'weight',
      current: 75,
      previous: 75,
      unit: 'kg',
      trend: 'stable',
      period: 'questa settimana',
    })
  })

  it('should calculate progress data with two logs (up trend)', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-02-02',
        weight_kg: 76,
        created_at: '2025-02-02T10:00:00Z',
      }),
      createProgressLog({
        id: '2',
        date: '2025-02-01',
        weight_kg: 75,
        created_at: '2025-02-01T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))

    expect(result.current).toEqual({
      type: 'weight',
      current: 76,
      previous: 75,
      unit: 'kg',
      trend: 'up',
      period: 'questa settimana',
    })
  })

  it('should calculate progress data with two logs (down trend)', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-02-02',
        weight_kg: 74,
        created_at: '2025-02-02T10:00:00Z',
      }),
      createProgressLog({
        id: '2',
        date: '2025-02-01',
        weight_kg: 75,
        created_at: '2025-02-01T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))

    expect(result.current).toEqual({
      type: 'weight',
      current: 74,
      previous: 75,
      unit: 'kg',
      trend: 'down',
      period: 'questa settimana',
    })
  })

  it('should calculate progress data with two logs (stable trend)', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-02-02',
        weight_kg: 75.05,
        created_at: '2025-02-02T10:00:00Z',
      }),
      createProgressLog({
        id: '2',
        date: '2025-02-01',
        weight_kg: 75,
        created_at: '2025-02-01T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))

    expect(result.current).toEqual({
      type: 'weight',
      current: 75.05,
      previous: 75,
      unit: 'kg',
      trend: 'stable',
      period: 'questa settimana',
    })
  })

  it('should filter out invalid logs (null weight)', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-02-02',
        weight_kg: null,
        created_at: '2025-02-02T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))
    expect(result.current).toBeNull()
  })

  it('should filter out invalid logs (zero weight)', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-02-02',
        weight_kg: 0,
        created_at: '2025-02-02T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))
    expect(result.current).toBeNull()
  })

  it('should filter out invalid logs (negative weight)', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-02-02',
        weight_kg: -10,
        created_at: '2025-02-02T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))
    expect(result.current).toBeNull()
  })

  it('should sort logs by date (most recent first)', () => {
    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: '2025-01-01',
        weight_kg: 70,
        created_at: '2025-01-01T10:00:00Z',
      }),
      createProgressLog({
        id: '2',
        date: '2025-02-01',
        weight_kg: 75,
        created_at: '2025-02-01T10:00:00Z',
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))

    // Should use most recent (75) as current
    expect(result.current?.current).toBe(75)
    expect(result.current?.previous).toBe(70)
  })

  it('should calculate period correctly for same week', () => {
    const today = new Date('2025-02-02')
    const yesterday = new Date('2025-02-01')

    const progressLogs: Tables<'progress_logs'>[] = [
      createProgressLog({
        id: '1',
        date: today.toISOString().split('T')[0],
        weight_kg: 76,
        created_at: today.toISOString(),
      }),
      createProgressLog({
        id: '2',
        date: yesterday.toISOString().split('T')[0],
        weight_kg: 75,
        created_at: yesterday.toISOString(),
      }),
    ]

    const { result } = renderHook(() => useProgressData(progressLogs))
    expect(result.current?.period).toBe('questa settimana')
  })
})
