'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { Button, Input, Label } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useNutrizionistaCheckinDetail } from '@/hooks/use-nutrizionista-checkin-detail'
import { createLogger } from '@/lib/logger'
import { useNotify } from '@/lib/ui/notify'
import type { TablesUpdate } from '@/types/supabase'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { queryKeys } from '@/lib/query-keys'
import { useQueryClient } from '@tanstack/react-query'

const logger = createLogger('app:dashboard:nutrizionista:checkin:[id]')

export function NutrizionistaCheckinDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = useResolvedParams(params)
  const id = typeof resolved.id === 'string' ? resolved.id : undefined
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { notify } = useNotify()
  const profileId = user?.id ?? null

  const isUuid =
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

  const {
    data: detail,
    loading,
    error: detailError,
    reload,
  } = useNutrizionistaCheckinDetail(isUuid ? id : null)

  const row = detail?.row ?? null
  const athleteName = detail?.athleteName ?? null
  const notFound = !loading && isUuid && detail === null

  const [status, setStatus] = useState('scheduled')
  const [scheduledFor, setScheduledFor] = useState('')
  const [completedAt, setCompletedAt] = useState('')
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!row) return
    setStatus(row.status)
    setScheduledFor(row.scheduled_for ? row.scheduled_for.slice(0, 10) : '')
    setCompletedAt(row.completed_at ? new Date(row.completed_at).toISOString().slice(0, 16) : '')
    setWeight(row.weight_kg != null ? String(row.weight_kg) : '')
    setBodyFat(row.body_fat_pct != null ? String(row.body_fat_pct) : '')
    setWaist(row.waist_cm != null ? String(row.waist_cm) : '')
    setHip(row.hip_cm != null ? String(row.hip_cm) : '')
    setNotes(row.notes ?? '')
  }, [row])

  useEffect(() => {
    if (detailError) {
      notify(detailError, 'error')
    }
  }, [detailError, notify])

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
      await reload()
      if (profileId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.nutrition.checkinsList(profileId),
        })
      }
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
    reload,
    queryClient,
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
