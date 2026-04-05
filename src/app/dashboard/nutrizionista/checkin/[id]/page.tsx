'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { Button, Input, Label } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { createLogger } from '@/lib/logger'
import { useNotify } from '@/lib/ui/notify'
import type { Tables, TablesUpdate } from '@/types/supabase'

const logger = createLogger('app:dashboard:nutrizionista:checkin:[id]')

type CheckInRow = Tables<'nutrition_check_ins'>

export default function NutrizionistaCheckinDetailPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const { notify } = useNotify()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [row, setRow] = useState<CheckInRow | null>(null)
  const [athleteName, setAthleteName] = useState<string | null>(null)

  const [status, setStatus] = useState('scheduled')
  const [scheduledFor, setScheduledFor] = useState('')
  const [completedAt, setCompletedAt] = useState('')
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const isUuid =
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

  const loadRow = useCallback(async () => {
    if (!profileId || !id || !isUuid) {
      setLoading(false)
      setNotFound(true)
      return
    }
    setLoading(true)
    setNotFound(false)
    try {
      const { data, error } = await supabase
        .from('nutrition_check_ins')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) {
        setNotFound(true)
        setRow(null)
        return
      }
      const r = data as CheckInRow
      setRow(r)
      setStatus(r.status)
      setScheduledFor(r.scheduled_for ? r.scheduled_for.slice(0, 10) : '')
      setCompletedAt(
        r.completed_at ? new Date(r.completed_at).toISOString().slice(0, 16) : '',
      )
      setWeight(r.weight_kg != null ? String(r.weight_kg) : '')
      setBodyFat(r.body_fat_pct != null ? String(r.body_fat_pct) : '')
      setWaist(r.waist_cm != null ? String(r.waist_cm) : '')
      setHip(r.hip_cm != null ? String(r.hip_cm) : '')
      setNotes(r.notes ?? '')

      const { data: prof } = await supabase
        .from('profiles')
        .select('nome, cognome')
        .eq('id', r.athlete_id)
        .maybeSingle()
      const p = prof as { nome: string | null; cognome: string | null } | null
      setAthleteName(p ? [p.nome, p.cognome].filter(Boolean).join(' ') || null : null)
    } catch (e) {
      logger.error('Check-in detail', e)
      notify(
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Errore caricamento',
        'error',
      )
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [profileId, id, isUuid, supabase, notify])

  useEffect(() => {
    void loadRow()
  }, [loadRow])

  const handleSave = useCallback(async () => {
    if (!row || !profileId) return
    setSaving(true)
    try {
      const patch: TablesUpdate<'nutrition_check_ins'> = {
        status,
        scheduled_for: scheduledFor || null,
        completed_at: completedAt ? new Date(completedAt).toISOString() : null,
        weight_kg: weight ? Number(weight) : null,
        body_fat_pct: bodyFat ? Number(bodyFat) : null,
        waist_cm: waist ? Number(waist) : null,
        hip_cm: hip ? Number(hip) : null,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('nutrition_check_ins').update(patch).eq('id', row.id)
      if (error) throw error
      notify('Check-in aggiornato.', 'success')
      void loadRow()
    } catch (e) {
      logger.error('Check-in update', e)
      notify(
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Errore salvataggio',
        'error',
      )
    } finally {
      setSaving(false)
    }
  }, [
    row,
    profileId,
    status,
    scheduledFor,
    completedAt,
    weight,
    bodyFat,
    waist,
    hip,
    notes,
    supabase,
    notify,
    loadRow,
  ])

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  if (!id || !isUuid) {
    return (
      <StaffContentLayout title="Check-in" description="Dettaglio non valido." theme="teal">
        <p className="text-text-secondary text-sm text-center py-8">ID non valido.</p>
      </StaffContentLayout>
    )
  }

  if (loading) {
    return <StaffDashboardGuardSkeleton />
  }

  if (notFound || !row) {
    return (
      <StaffContentLayout
        title="Check-in"
        description="Non trovato o non accessibile."
        theme="teal"
        actions={
          <Link
            href="/dashboard/nutrizionista/checkin"
            className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Lista check-in
          </Link>
        }
      >
        <p className="text-text-secondary text-sm text-center py-8">
          Il check-in non esiste, non è ancora stato creato sul database, oppure non hai i permessi.
        </p>
      </StaffContentLayout>
    )
  }

  return (
    <StaffContentLayout
      title="Dettaglio check-in"
      description={athleteName ? `Cliente: ${athleteName}` : 'Cliente assegnato'}
      theme="teal"
      actions={
        <Link
          href="/dashboard/nutrizionista/checkin"
          className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Lista check-in
        </Link>
      }
    >
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-xl border border-border bg-background-secondary/50 p-4 space-y-4">
          <div className="space-y-2">
            <Label>Stato</Label>
            <select
              className="w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm min-h-[44px]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="scheduled">Programmato</option>
              <option value="completed">Completato</option>
              <option value="cancelled">Annullato</option>
              <option value="skipped">Saltato</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sched">Data prevista</Label>
            <Input
              id="sched"
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comp">Completato il</Label>
            <Input
              id="comp"
              type="datetime-local"
              value={completedAt}
              onChange={(e) => setCompletedAt(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="w">Peso (kg)</Label>
              <Input
                id="w"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bf">Massa grassa %</Label>
              <Input
                id="bf"
                inputMode="decimal"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa">Vita (cm)</Label>
              <Input
                id="wa"
                inputMode="decimal"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hi">Fianchi (cm)</Label>
              <Input
                id="hi"
                inputMode="decimal"
                value={hip}
                onChange={(e) => setHip(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="no">Note</Label>
            <textarea
              id="no"
              className="w-full min-h-[100px] rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            className="w-full min-h-[44px]"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? 'Salvataggio…' : 'Salva modifiche'}
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" className="min-h-[44px]" asChild>
            <Link href={`/dashboard/nutrizionista/atleti/${row.athlete_id}?tab=progressi`}>
              Scheda cliente · progressi
            </Link>
          </Button>
        </div>
      </div>
    </StaffContentLayout>
  )
}
