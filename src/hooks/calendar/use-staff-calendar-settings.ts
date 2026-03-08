'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { Json } from '@/lib/supabase/types'
import type {
  StaffCalendarSettings,
  StaffCalendarSettingsUpdate,
  CalendarViewType,
  WeekStartType,
  RecurrenceOption,
} from '@/types/staff-calendar-settings'

const logger = createLogger('hooks:calendar:use-staff-calendar-settings')

const DEFAULT_VIEW: CalendarViewType = 'month'
const DEFAULT_WEEK_START: WeekStartType = 'monday'
const DEFAULT_RECURRENCE_OPTIONS: RecurrenceOption[] = [
  'none',
  '2_weeks',
  '1_month',
  '6_months',
  '1_year',
  'until_lessons',
]

function mapRowToSettings(row: Record<string, unknown>): StaffCalendarSettings {
  const custom = row.custom_appointment_types as StaffCalendarSettings['custom_appointment_types'] | undefined
  return {
    id: row.id as string,
    staff_id: row.staff_id as string,
    org_id: row.org_id as string,
    default_durations: (row.default_durations as Record<string, number>) ?? {},
    enabled_appointment_types: (row.enabled_appointment_types as string[]) ?? [],
    custom_appointment_types: Array.isArray(custom) ? custom : [],
    type_colors: (row.type_colors as Record<string, string>) ?? {},
    default_calendar_view: (row.default_calendar_view as CalendarViewType) ?? DEFAULT_VIEW,
    default_week_start: (row.default_week_start as WeekStartType) ?? DEFAULT_WEEK_START,
    show_free_pass_calendar: (row.show_free_pass_calendar as boolean) ?? true,
    show_collaborators_calendars: (row.show_collaborators_calendars as boolean) ?? true,
    recurrence_options: (row.recurrence_options as RecurrenceOption[]) ?? DEFAULT_RECURRENCE_OPTIONS,
    work_hours: (row.work_hours as StaffCalendarSettings['work_hours']) ?? null,
    slot_duration_minutes: (row.slot_duration_minutes as number) ?? 15,
    max_free_pass_athletes_per_slot: (row.max_free_pass_athletes_per_slot as number) ?? 4,
    view_density: (row.view_density as StaffCalendarSettings['view_density']) ?? 'comfort',
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  }
}

export function useStaffCalendarSettings() {
  const [settings, setSettings] = useState<StaffCalendarSettings | null>(null)
  const [staffProfileId, setStaffProfileId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, org_id')
          .eq('user_id', user.id)
          .single()
        if (cancelled || !profile) {
          setLoading(false)
          return
        }
        const p = profile as { id: string; org_id: string | null }
        setStaffProfileId(p.id)
        setOrgId(p.org_id ?? null)
        const { data: row, error } = await supabase
          .from('staff_calendar_settings')
          .select('*')
          .eq('staff_id', p.id)
          .maybeSingle()
        if (cancelled) return
        if (error) {
          logger.error('Errore fetch staff_calendar_settings', error)
          setSettings(null)
          setLoading(false)
          return
        }
        setSettings(row ? mapRowToSettings(row as Record<string, unknown>) : null)
      } catch (err) {
        logger.error('useStaffCalendarSettings load', err)
        setSettings(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const mutate = useCallback(
    async (updates: StaffCalendarSettingsUpdate) => {
      if (!staffProfileId || !orgId) return
      setSaving(true)
      try {
        const payload = {
          ...updates,
          updated_at: new Date().toISOString(),
        }
        const row = {
          staff_id: staffProfileId,
          org_id: orgId,
          ...payload,
        }
        const rowForDb = {
          ...row,
          custom_appointment_types:
            row.custom_appointment_types !== undefined
              ? (row.custom_appointment_types as unknown as Json)
              : undefined,
        }
        const { data, error } = await supabase
          .from('staff_calendar_settings')
          .upsert(rowForDb, { onConflict: 'staff_id' })
          .select()
          .single()
        if (error) throw error
        setSettings(data ? mapRowToSettings(data as Record<string, unknown>) : null)
      } catch (err) {
        logger.error('useStaffCalendarSettings mutate', err)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [staffProfileId, orgId],
  )

  return { settings, loading, saving, mutate, staffProfileId, orgId }
}
