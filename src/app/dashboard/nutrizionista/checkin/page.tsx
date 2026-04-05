'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { createLogger } from '@/lib/logger'
import {
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { athleteIdForNutritionColumn } from '@/lib/nutrition-athlete-id'
import { useNotify } from '@/lib/ui/notify'
import type { Tables, TablesInsert } from '@/types/supabase'

const logger = createLogger('app:dashboard:nutrizionista:checkin')

type CheckInRow = Tables<'nutrition_check_ins'>
type AthleteOpt = { id: string; name: string; org_id: string }

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Programmato',
  completed: 'Completato',
  cancelled: 'Annullato',
  skipped: 'Saltato',
}

export default function NutrizionistaCheckinPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const { notify } = useNotify()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [rows, setRows] = useState<CheckInRow[]>([])
  const [athletes, setAthletes] = useState<AthleteOpt[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formAthleteId, setFormAthleteId] = useState('')
  const [formScheduled, setFormScheduled] = useState(() => new Date().toISOString().slice(0, 10))
  const [formNotes, setFormNotes] = useState('')

  const loadData = useCallback(async () => {
    if (!profileId) {
      setRows([])
      setAthletes([])
      setLoading(false)
      return
    }
    setLoading(true)
    setListError(null)
    try {
      const { data: staffData, error: staffErr } = await supabase
        .from('staff_atleti')
        .select('atleta_id')
        .eq('staff_id', profileId)
        .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
        .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
      if (staffErr) throw staffErr
      const athleteIds = (staffData ?? [])
        .map((r) => (r as { atleta_id: string }).atleta_id)
        .filter(Boolean)
      if (athleteIds.length === 0) {
        setAthletes([])
        setRows([])
        setLoading(false)
        return
      }

      const profilesAccum: { id: string; nome: string | null; cognome: string | null; org_id: string | null }[] =
        []
      for (const idChunk of chunkForSupabaseIn(athleteIds)) {
        const { data: prof, error: pErr } = await supabase
          .from('profiles')
          .select('id, nome, cognome, org_id')
          .in('id', idChunk)
        if (pErr) throw pErr
        profilesAccum.push(...((prof ?? []) as (typeof profilesAccum)[number][]))
      }
      const opts: AthleteOpt[] = profilesAccum
        .filter((p) => p.org_id)
        .map((p) => ({
          id: p.id,
          org_id: p.org_id as string,
          name: [p.nome, p.cognome].filter(Boolean).join(' ') || p.id.slice(0, 8),
        }))
      setAthletes(opts)

      const { data: checkRows, error: cErr } = await supabase
        .from('nutrition_check_ins')
        .select('*')
        .eq('staff_profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(300)
      if (cErr) throw cErr
      setRows((checkRows ?? []) as CheckInRow[])
    } catch (e) {
      logger.error('Check-in list', e)
      const msg =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: string }).message)
          : 'Errore caricamento'
      setListError(
        /relation|does not exist|404/i.test(msg)
          ? 'Tabella check-in non presente: applica la migrazione SQL su Supabase (nutrition_check_ins), poi ricarica.'
          : msg,
      )
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [profileId, supabase])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleCreate = useCallback(async () => {
    if (!profileId || !formAthleteId) {
      notify('Seleziona un cliente.', 'warning')
      return
    }
    const a = athletes.find((x) => x.id === formAthleteId)
    if (!a) {
      notify('Cliente non valido.', 'warning')
      return
    }
    setSaving(true)
    try {
      const insert: TablesInsert<'nutrition_check_ins'> = {
        org_id: a.org_id,
        athlete_id: athleteIdForNutritionColumn(a.id),
        staff_profile_id: profileId,
        scheduled_for: formScheduled || null,
        status: 'scheduled',
        notes: formNotes.trim() || null,
      }
      const { error } = await supabase.from('nutrition_check_ins').insert(insert)
      if (error) throw error
      notify('Check-in creato.', 'success')
      setDialogOpen(false)
      setFormNotes('')
      setFormScheduled(new Date().toISOString().slice(0, 10))
      setFormAthleteId('')
      void loadData()
    } catch (e) {
      logger.error('Check-in insert', e)
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
    profileId,
    formAthleteId,
    formScheduled,
    formNotes,
    athletes,
    supabase,
    loadData,
    notify,
  ])

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  const nameById = new Map(athletes.map((x) => [x.id, x.name]))

  return (
    <StaffContentLayout
      title="Check-in"
      description="Sessioni di controllo e note per i clienti assegnati."
      theme="teal"
      actions={
        <Button
          type="button"
          size="sm"
          variant="primary"
          className="gap-2 min-h-[44px]"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuovo check-in
        </Button>
      }
    >
      <div className="space-y-4">
        {listError ? (
          <div
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
            role="alert"
          >
            {listError}
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-background-secondary/50 overflow-hidden">
          {loading ? (
            <p className="p-6 text-center text-text-muted text-sm">Caricamento…</p>
          ) : rows.length === 0 ? (
            <div className="p-6 space-y-3 text-center text-text-secondary text-sm">
              <p>Nessun check-in registrato.</p>
              <Button type="button" size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                Crea il primo check-in
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-background-tertiary/40">
                  <tr>
                    <th className="text-left p-3 font-medium text-text-secondary">Data / creazione</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Cliente</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Programmato</th>
                    <th className="text-left p-3 font-medium text-text-secondary">Stato</th>
                    <th className="text-right p-3 font-medium text-text-secondary"> </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-background-tertiary/20">
                      <td className="p-3 text-text-secondary whitespace-nowrap">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="p-3 text-text-primary">
                        {nameById.get(r.athlete_id) ?? r.athlete_id.slice(0, 8)}
                      </td>
                      <td className="p-3 text-text-secondary">
                        {r.scheduled_for
                          ? new Date(r.scheduled_for).toLocaleDateString('it-IT')
                          : '—'}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs">
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/nutrizionista/checkin/${r.id}`}>Apri</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-text-muted text-xs text-center">
          Migrazione DB:{' '}
          <code className="text-text-secondary">supabase/migrations/20260405120000_nutrition_check_ins.sql</code>
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuovo check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="checkin-athlete">Cliente</Label>
              <select
                id="checkin-athlete"
                className="w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm min-h-[44px]"
                value={formAthleteId}
                onChange={(e) => setFormAthleteId(e.target.value)}
              >
                <option value="">— Seleziona —</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkin-date">Data prevista</Label>
              <Input
                id="checkin-date"
                type="date"
                value={formScheduled}
                onChange={(e) => setFormScheduled(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkin-notes">Note</Label>
              <textarea
                id="checkin-notes"
                className="w-full min-h-[88px] rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Obiettivi, aderenza, promemoria…"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button type="button" variant="primary" disabled={saving} onClick={() => void handleCreate()}>
              {saving ? 'Salvataggio…' : 'Crea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffContentLayout>
  )
}
