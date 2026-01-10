import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTransformedAppointments } from '../use-transformed-appointments'
import type { Tables } from '@/types/supabase'

// Tipo esteso per appuntamenti che possono includere trainer_name e trainer_id
type AppointmentWithTrainerName = (Tables<'appointments'> | Record<string, unknown>) & {
  id: string
  starts_at: string
  ends_at: string
  type: string | null
  location: string | null
  cancelled_at: string | null
  trainer_name?: string | null
  trainer_id?: string | null
  staff_id: string
  athlete_id: string
  created_at: string | null
}

describe('useTransformedAppointments', () => {
  it('should return empty array when appointments is null', () => {
    const { result } = renderHook(() => useTransformedAppointments(null))
    expect(result.current).toEqual([])
  })

  it('should return empty array when appointments is undefined', () => {
    const { result } = renderHook(() => useTransformedAppointments(undefined))
    expect(result.current).toEqual([])
  })

  it('should return empty array when appointments is empty', () => {
    const { result } = renderHook(() => useTransformedAppointments([]))
    expect(result.current).toEqual([])
  })

  it('should transform appointment correctly', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const futureEndDate = new Date(futureDate.getTime() + 3600000) // +1 ora

    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        athlete_id: '123e4567-e89b-12d3-a456-426614174001',
        staff_id: '123e4567-e89b-12d3-a456-426614174002',
        trainer_id: '123e4567-e89b-12d3-a456-426614174003',
        starts_at: futureDate.toISOString(),
        ends_at: futureEndDate.toISOString(),
        type: 'personal_training',
        location: 'Palestra',
        cancelled_at: null,
        trainer_name: 'Mario Rossi',
        created_at: new Date().toISOString(),
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current).toHaveLength(1)
    expect(result.current[0]).toMatchObject({
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'Personal Training',
      ptName: 'Mario Rossi',
      location: 'Palestra',
      status: 'programmato',
      dateTime: futureDate.toISOString(),
    })
    expect(result.current[0].day).toBeDefined()
    expect(result.current[0].time).toBeDefined()
  })

  it('should format appointment type correctly', () => {
    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        athlete_id: '123e4567-e89b-12d3-a456-426614174001',
        staff_id: '123e4567-e89b-12d3-a456-426614174002',
        trainer_id: '123e4567-e89b-12d3-a456-426614174003',
        starts_at: '2025-02-02T10:00:00Z',
        ends_at: '2025-02-02T11:00:00Z',
        type: 'pt',
        location: null,
        cancelled_at: null,
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current[0].type).toBe('Personal Training')
  })

  it('should set status to "cancellato" when cancelled_at is set', () => {
    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        athlete_id: '123e4567-e89b-12d3-a456-426614174001',
        staff_id: '123e4567-e89b-12d3-a456-426614174002',
        trainer_id: '123e4567-e89b-12d3-a456-426614174003',
        starts_at: '2025-02-02T10:00:00Z',
        ends_at: '2025-02-02T11:00:00Z',
        type: 'personal_training',
        location: null,
        cancelled_at: '2025-02-01T10:00:00Z',
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current[0].status).toBe('cancellato')
  })

  it('should set status to "programmato" when starts_at is in future', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)

    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        athlete_id: '123e4567-e89b-12d3-a456-426614174001',
        staff_id: '123e4567-e89b-12d3-a456-426614174002',
        trainer_id: '123e4567-e89b-12d3-a456-426614174003',
        starts_at: futureDate.toISOString(),
        ends_at: new Date(futureDate.getTime() + 3600000).toISOString(),
        type: 'personal_training',
        location: null,
        cancelled_at: null,
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current[0].status).toBe('programmato')
  })

  it('should set status to "in_corso" when starts_at is in past', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)

    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        athlete_id: '123e4567-e89b-12d3-a456-426614174001',
        staff_id: '123e4567-e89b-12d3-a456-426614174002',
        trainer_id: '123e4567-e89b-12d3-a456-426614174003',
        starts_at: pastDate.toISOString(),
        ends_at: new Date(pastDate.getTime() + 3600000).toISOString(),
        type: 'personal_training',
        location: null,
        cancelled_at: null,
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current[0].status).toBe('in_corso')
  })

  it('should use default trainer name when trainer_name is null', () => {
    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        athlete_id: '123e4567-e89b-12d3-a456-426614174001',
        staff_id: '123e4567-e89b-12d3-a456-426614174002',
        trainer_id: '123e4567-e89b-12d3-a456-426614174003',
        starts_at: '2025-02-02T10:00:00Z',
        ends_at: '2025-02-02T11:00:00Z',
        type: 'personal_training',
        location: null,
        cancelled_at: null,
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current[0].ptName).toBe('Personal Trainer')
  })

  it('should filter out invalid appointments (missing id)', () => {
    const appointments: AppointmentWithTrainerName[] = [
      {
        id: null as unknown as string,
        athlete_id: 'athlete-1',
        staff_id: 'staff-1',
        trainer_id: 'trainer-1',
        starts_at: '2025-02-02T10:00:00Z',
        ends_at: '2025-02-02T11:00:00Z',
        type: 'personal_training',
        location: null,
        cancelled_at: null,
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current).toEqual([])
  })

  it('should filter out invalid appointments (missing starts_at)', () => {
    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '1',
        athlete_id: 'athlete-1',
        staff_id: 'staff-1',
        trainer_id: 'trainer-1',
        starts_at: null as unknown as string,
        ends_at: '2025-02-02T11:00:00Z',
        type: 'personal_training',
        location: null,
        cancelled_at: null,
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    expect(result.current).toEqual([])
  })

  it('should format time range correctly', () => {
    const appointments: AppointmentWithTrainerName[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        athlete_id: '123e4567-e89b-12d3-a456-426614174001',
        staff_id: '123e4567-e89b-12d3-a456-426614174002',
        trainer_id: '123e4567-e89b-12d3-a456-426614174003',
        starts_at: '2025-02-02T10:00:00Z',
        ends_at: '2025-02-02T11:30:00Z',
        type: 'personal_training',
        location: null,
        cancelled_at: null,
        trainer_name: null,
        created_at: '2025-02-01T10:00:00Z',
        org_id: null,
        notes: null,
        status: null,
        updated_at: null,
      },
    ]

    const { result } = renderHook(() => useTransformedAppointments(appointments))

    // Time should be in format "HH:MM-HH:MM"
    expect(result.current[0].time).toMatch(/^\d{2}:\d{2}-\d{2}:\d{2}$/)
  })
})
