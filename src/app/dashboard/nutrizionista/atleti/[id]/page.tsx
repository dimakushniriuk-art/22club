'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  ArrowLeft,
  FileDown,
  Pencil,
  FileText,
  Download,
  Loader2,
  MoreVertical,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
  PLAN_VERSION_STATUS_ACTIVE,
  PLAN_VERSION_STATUS_DRAFT,
} from '@/lib/nutrition-tables'

const logger = createLogger('app:dashboard:nutrizionista:atleti:[id]')
const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

type ProfileRow = {
  id: string
  user_id?: string | null
  nome: string | null
  cognome: string | null
  email: string | null
  telefono: string | null
  phone: string | null
  data_nascita: string | null
  indirizzo: string | null
  indirizzo_residenza: string | null
  citta: string | null
  cap: string | null
  provincia: string | null
  nazione: string | null
  sesso: string | null
  codice_fiscale: string | null
  professione: string | null
}
type PlanGroupRow = { id: string; athlete_id: string }
type PlanVersionRow = {
  id: string
  plan_id?: string
  version_number?: number | null
  status: string
  start_date: string | null
  end_date: string | null
  calories_target?: number | null
  protein_target?: number | null
  carb_target?: number | null
  fat_target?: number | null
  pdf_file_path?: string | null
  /** Path in Storage (per PDF solo da storage) */
  storagePath?: string
  /** Nome file (per righe da Storage) */
  fileName?: string
  /** Per ordinamento righe da Storage */
  createdAt?: string | null
}
type ProgressRow = {
  id: string
  created_at: string | null
  date?: string | null
  weight_kg?: number | null
  massa_grassa_percentuale?: number | null
  waist_cm?: number | null
  hips_cm?: number | null
  source?: string | null
  notes?: string | null
}
type WeeklyAnalysisRow = Record<string, unknown>
type AdjustmentRow = {
  id: string
  created_at: string | null
  adjustment_reason?: string | null
  is_automatic?: boolean
}

export default function NutrizionistaAtletaProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string | undefined
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user, org_id: orgId } = useAuth()
  const supabase = useSupabaseClient()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [groups, setGroups] = useState<PlanGroupRow[]>([])
  const [versions, setVersions] = useState<PlanVersionRow[]>([])
  const [activeVersion, setActiveVersion] = useState<PlanVersionRow | null>(null)
  const [progressList, setProgressList] = useState<ProgressRow[]>([])
  const [weeklyAnalysisList, setWeeklyAnalysisList] = useState<WeeklyAnalysisRow[]>([])
  const [adjustmentsList, setAdjustmentsList] = useState<AdjustmentRow[]>([])
  const [savingAnagrafic, setSavingAnagrafic] = useState(false)
  const [anagraficError, setAnagraficError] = useState<string | null>(null)
  const [validityEditRow, setValidityEditRow] = useState<PlanVersionRow | null>(null)
  const [validityEditStart, setValidityEditStart] = useState('')
  const [validityEditEnd, setValidityEditEnd] = useState('')
  const [validityEditLoading, setValidityEditLoading] = useState(false)
  const [deletePlanRow, setDeletePlanRow] = useState<PlanVersionRow | null>(null)
  const [deletePlanLoading, setDeletePlanLoading] = useState(false)
  const [editingDateCell, setEditingDateCell] = useState<{
    versionId: string
    field: 'start' | 'end'
  } | null>(null)
  const [inlineDateSaving, setInlineDateSaving] = useState(false)
  const [progressPdfOpen, setProgressPdfOpen] = useState(false)
  const [progressPdfFile, setProgressPdfFile] = useState<File | null>(null)
  const [progressPdfExtracting, setProgressPdfExtracting] = useState(false)
  const [progressPdfExtracted, setProgressPdfExtracted] = useState<Record<string, string>>({})
  const [progressPdfExtractAttempted, setProgressPdfExtractAttempted] = useState(false)
  const [progressPdfDate, setProgressPdfDate] = useState(() =>
    new Date().toISOString().slice(0, 16),
  )
  const [progressPdfWeight, setProgressPdfWeight] = useState('')
  const [progressPdfBodyFat, setProgressPdfBodyFat] = useState('')
  const [progressPdfWaist, setProgressPdfWaist] = useState('')
  const [progressPdfHip, setProgressPdfHip] = useState('')
  const [progressPdfSaving, setProgressPdfSaving] = useState(false)
  const [anagraficEditMode, setAnagraficEditMode] = useState(false)
  const [anagraficForm, setAnagraficForm] = useState<{
    nome: string
    cognome: string
    email: string
    telefono: string
    data_nascita: string
    sesso: string
    codice_fiscale: string
    professione: string
    indirizzo: string
    citta: string
    cap: string
    provincia: string
    nazione: string
  }>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    data_nascita: '',
    sesso: '',
    codice_fiscale: '',
    professione: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    nazione: '',
  })

  const syncAnagraficFromProfile = useCallback((p: ProfileRow | null) => {
    if (!p) return
    setAnagraficForm({
      nome: p.nome ?? '',
      cognome: p.cognome ?? '',
      email: p.email ?? '',
      telefono: p.telefono ?? p.phone ?? '',
      data_nascita: p.data_nascita ? p.data_nascita.slice(0, 10) : '',
      sesso: p.sesso ?? '',
      codice_fiscale: p.codice_fiscale ?? '',
      professione: p.professione ?? '',
      indirizzo: p.indirizzo ?? p.indirizzo_residenza ?? '',
      citta: p.citta ?? '',
      cap: p.cap ?? '',
      provincia: p.provincia ?? '',
      nazione: p.nazione ?? '',
    })
  }, [])

  const loadData = useCallback(async () => {
    if (!id || !profileId) {
      setLoading(false)
      if (id && !profileId) setForbidden(true)
      return
    }
    setLoading(true)
    setForbidden(false)
    try {
      const { data: staffData, error: staffErr } = await supabase
        .from('staff_atleti')
        .select('atleta_id')
        .eq('staff_id', profileId)
        .eq('atleta_id', id)
        .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
        .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
        .maybeSingle()

      if (staffErr || !staffData) {
        setForbidden(true)
        setLoading(false)
        return
      }

      const [profileRes, groupsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'id, user_id, nome, cognome, email, telefono, phone, data_nascita, indirizzo, indirizzo_residenza, citta, cap, provincia, nazione, sesso, codice_fiscale, professione',
          )
          .eq('id', id)
          .single(),
        nutritionFrom(supabase, NUTRITION_TABLES.planGroups)
          .select('id, athlete_id')
          .eq('athlete_id', id),
      ])

      if (profileRes.error || !profileRes.data) {
        setForbidden(true)
        setLoading(false)
        return
      }
      const profileData = profileRes.data as ProfileRow
      setProfile(profileData)
      syncAnagraficFromProfile(profileData)

      const groupsData = (groupsRes.data ?? []) as PlanGroupRow[]
      setGroups(groupsData)
      const groupIds = groupsData.map((g) => g.id)

      const verList: PlanVersionRow[] = []
      if (groupIds.length > 0) {
        const verRes = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
          .select(
            'id, plan_id, version_number, status, start_date, end_date, calories_target, protein_target, carb_target, fat_target, pdf_file_path',
          )
          .in('plan_id', groupIds)
          .order('created_at', { ascending: false })
        const fromDb = (verRes.data ?? []) as PlanVersionRow[]
        verList.push(...fromDb)
      }
      const prefix = 'nutrition-plans'
      const dbPaths = new Set(
        (verList as PlanVersionRow[]).map((ver) => ver.pdf_file_path).filter(Boolean) as string[],
      )
      const { data: planFiles } = await supabase.storage.from('documents').list(`${prefix}/${id}`)
      const pdfs = (planFiles ?? []).filter(
        (f) =>
          (f as { name?: string }).name &&
          (f as { name: string }).name.toLowerCase().endsWith('.pdf'),
      )
      for (const f of pdfs) {
        const name = (f as { name: string }).name
        const path = `${prefix}/${id}/${name}`
        if (dbPaths.has(path)) continue
        const updated =
          (f as { updated_at?: string }).updated_at ?? (f as { created_at?: string }).created_at
        verList.push({
          id: `storage-${path}`,
          status: 'published',
          start_date: null,
          end_date: null,
          pdf_file_path: path,
          storagePath: path,
          fileName: name,
          version_number: null,
          createdAt: updated ?? null,
        })
      }
      verList.sort((a, b) => {
        const ad = a.start_date ?? a.createdAt ?? ''
        const bd = b.start_date ?? b.createdAt ?? ''
        return bd.localeCompare(ad)
      })
      setVersions(verList)
      const active =
        verList.find((v) => v.status === PLAN_VERSION_STATUS_ACTIVE || v.status === 'published') ??
        null
      setActiveVersion(active)

      const athleteUserId = (profileData as { user_id?: string | null }).user_id
      let progressData: ProgressRow[] = []
      if (athleteUserId) {
        const { data: plData } = await supabase
          .from('progress_logs')
          .select(
            'id, created_at, date, weight_kg, massa_grassa_percentuale, waist_cm, hips_cm, source',
          )
          .eq('athlete_id', athleteUserId)
          .order('created_at', { ascending: false })
          .limit(50)
        progressData = (plData ?? []).map((r) => ({
          id: r.id,
          created_at: r.created_at ?? null,
          date: r.date ?? null,
          weight_kg: r.weight_kg ?? null,
          massa_grassa_percentuale: r.massa_grassa_percentuale ?? null,
          waist_cm: r.waist_cm ?? null,
          hips_cm: r.hips_cm ?? null,
          source: r.source ?? null,
          notes: null,
        }))
      }
      if (progressData.length === 0) {
        const progRes = await nutritionFrom(supabase, NUTRITION_TABLES.progress)
          .select('id, created_at, weight_kg, notes')
          .eq('athlete_id', id)
          .order('created_at', { ascending: false })
          .limit(50)
        progressData = (progRes.data ?? []) as ProgressRow[]
      }
      const [weekRes, adjRes] = await Promise.all([
        nutritionFrom(supabase, NUTRITION_TABLES.weeklyAnalysis)
          .select('*')
          .eq('athlete_id', id)
          .order('created_at', { ascending: false })
          .limit(20),
        nutritionFrom(supabase, NUTRITION_TABLES.adjustments)
          .select('id, created_at, adjustment_reason, is_automatic')
          .eq('athlete_id', id)
          .order('created_at', { ascending: false })
          .limit(30),
      ])
      setProgressList(progressData)
      setWeeklyAnalysisList((weekRes.data ?? []) as WeeklyAnalysisRow[])
      setAdjustmentsList((adjRes.data ?? []) as AdjustmentRow[])
    } catch (e) {
      logger.error('Errore caricamento profilo atleta', e)
      setForbidden(true)
    } finally {
      setLoading(false)
    }
  }, [id, profileId, supabase, syncAnagraficFromProfile])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleSaveAnagrafic = useCallback(async () => {
    if (!id || !profile) return
    setSavingAnagrafic(true)
    setAnagraficError(null)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nome: anagraficForm.nome.trim() || null,
          cognome: anagraficForm.cognome.trim() || null,
          email: anagraficForm.email.trim() || (profile.email ?? undefined),
          telefono: anagraficForm.telefono.trim() || null,
          phone: anagraficForm.telefono.trim() || null,
          data_nascita: anagraficForm.data_nascita || null,
          sesso: anagraficForm.sesso.trim() || null,
          codice_fiscale: anagraficForm.codice_fiscale.trim() || null,
          professione: anagraficForm.professione.trim() || null,
          indirizzo: anagraficForm.indirizzo.trim() || null,
          indirizzo_residenza: anagraficForm.indirizzo.trim() || null,
          citta: anagraficForm.citta.trim() || null,
          cap: anagraficForm.cap.trim() || null,
          provincia: anagraficForm.provincia.trim() || null,
          nazione: anagraficForm.nazione.trim() || null,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) {
        setAnagraficError(error.message)
        return
      }
      setProfile(data as ProfileRow)
      syncAnagraficFromProfile(data as ProfileRow)
      setAnagraficEditMode(false)
    } catch (e) {
      logger.error('Errore salvataggio dati anagrafici', e)
      setAnagraficError('Errore durante il salvataggio.')
    } finally {
      setSavingAnagrafic(false)
    }
  }, [id, profile, anagraficForm, supabase, syncAnagraficFromProfile])

  const canEditValidity = useCallback(
    (v: PlanVersionRow) => !!v.id && !v.id.startsWith('storage-'),
    [],
  )
  const openValidityEdit = useCallback((v: PlanVersionRow) => {
    const today = new Date().toISOString().slice(0, 10)
    setValidityEditRow(v)
    setValidityEditStart(v.start_date ?? today)
    setValidityEditEnd(v.end_date ?? today)
  }, [])
  const handleValiditySave = useCallback(async () => {
    if (
      !validityEditRow ||
      !canEditValidity(validityEditRow) ||
      !validityEditStart ||
      !validityEditEnd
    )
      return
    setValidityEditLoading(true)
    try {
      const { error } = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
        .update({ start_date: validityEditStart, end_date: validityEditEnd })
        .eq('id', validityEditRow.id)
      if (error) throw error
      setValidityEditRow(null)
      void loadData()
    } catch (e) {
      logger.error('Aggiorna validità piano', e)
    } finally {
      setValidityEditLoading(false)
    }
  }, [validityEditRow, validityEditStart, validityEditEnd, supabase, loadData, canEditValidity])

  const handleInlineDateSave = useCallback(
    async (v: PlanVersionRow, field: 'start' | 'end', value: string) => {
      setInlineDateSaving(true)
      try {
        const today = new Date().toISOString().slice(0, 10)
        if (v.id.startsWith('storage-') && v.storagePath && id && orgId && profileId) {
          let groupId: string
          const existingGroupId = groups.length > 0 ? groups[0].id : null
          if (existingGroupId) {
            groupId = existingGroupId
          } else {
            const { data: newGroup, error: groupErr } = await nutritionFrom(
              supabase,
              NUTRITION_TABLES.planGroups,
            )
              .insert({
                athlete_id: id,
                nutrizionista_id: profileId,
                org_id: orgId,
                title: (v.fileName ?? 'Piano').replace(/\.pdf$/i, '') || 'Piano',
              } as Record<string, unknown>)
              .select('id')
              .single()
            if (groupErr || !newGroup)
              throw new Error(groupErr?.message ?? 'Creazione gruppo fallita')
            groupId = (newGroup as { id: string }).id
          }
          const { data: maxVer } = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
            .select('version_number')
            .eq('plan_id', groupId)
            .order('version_number', { ascending: false })
            .limit(1)
            .maybeSingle()
          const nextVer = ((maxVer as { version_number?: number } | null)?.version_number ?? 0) + 1
          const startDate = field === 'start' ? value || today : (v.start_date ?? today)
          const endDate = field === 'end' ? value || today : (v.end_date ?? today)
          const { error: verErr } = await nutritionFrom(
            supabase,
            NUTRITION_TABLES.planVersions,
          ).insert({
            plan_id: groupId,
            org_id: orgId,
            version_number: nextVer,
            status: 'published',
            start_date: startDate,
            end_date: endDate,
            pdf_file_path: v.storagePath,
            created_by: profileId,
          } as Record<string, unknown>)
          if (verErr) throw verErr
        } else {
          const payload =
            field === 'start' ? { start_date: value || null } : { end_date: value || null }
          const { error } = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
            .update(payload)
            .eq('id', v.id)
          if (error) throw error
        }
        setEditingDateCell(null)
        void loadData()
      } catch (e) {
        logger.error('Aggiorna data piano', e)
      } finally {
        setInlineDateSaving(false)
      }
    },
    [id, groups, orgId, profileId, supabase, loadData],
  )

  const handleDeletePlan = useCallback(async () => {
    const v = deletePlanRow
    if (!v) return
    setDeletePlanLoading(true)
    try {
      if (v.id.startsWith('storage-') && v.storagePath) {
        const { error } = await supabase.storage.from('documents').remove([v.storagePath])
        if (error) throw error
      } else {
        const pathToRemove =
          v.pdf_file_path &&
          (v.pdf_file_path.startsWith('nutrition-plans/') ||
            v.pdf_file_path.includes('/documents/'))
            ? v.pdf_file_path.includes('/documents/')
              ? v.pdf_file_path.split('/documents/')[1]
              : v.pdf_file_path
            : null
        const { error } = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
          .delete()
          .eq('id', v.id)
        if (error) throw error
        if (pathToRemove) await supabase.storage.from('documents').remove([pathToRemove])
      }
      setDeletePlanRow(null)
      void loadData()
    } catch (e) {
      logger.error('Elimina piano', e)
    } finally {
      setDeletePlanLoading(false)
    }
  }, [deletePlanRow, supabase, loadData])

  const athleteUserId = profile?.user_id ?? null
  const handleProgressPdfExtract = useCallback(async () => {
    if (!progressPdfFile || !id || !profileId) return
    setProgressPdfExtracting(true)
    setProgressPdfExtractAttempted(false)
    try {
      const fd = new FormData()
      fd.set('file', progressPdfFile)
      fd.set('athleteProfileId', id)
      const res = await fetch('/api/nutritionist/extract-progress-pdf', {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? 'Estrazione fallita')
      const ext = (json.extracted ?? {}) as Record<string, string>
      setProgressPdfExtracted(ext)
      setProgressPdfExtractAttempted(true)
      // Popola i campi del form con i valori estratti (chiavi API e alias)
      const peso = ext.peso_kg ?? ext.weight_kg ?? ''
      const bodyFat = ext.massa_grassa_percentuale ?? ext.body_fat ?? ''
      const vita = ext.vita_cm ?? ext.waist_cm ?? ''
      const fianchi = ext.fianchi_cm ?? ext.hips_cm ?? ''
      if (peso) setProgressPdfWeight(peso)
      if (bodyFat) setProgressPdfBodyFat(bodyFat)
      if (vita) setProgressPdfWaist(vita)
      if (fianchi) setProgressPdfHip(fianchi)
    } catch (e) {
      logger.error('Extract progress PDF', e)
      setProgressPdfExtractAttempted(true)
      setProgressPdfExtracted({})
    } finally {
      setProgressPdfExtracting(false)
    }
  }, [progressPdfFile, id, profileId])

  const handleProgressPdfSave = useCallback(async () => {
    if (!athleteUserId || !profileId) return
    setProgressPdfSaving(true)
    try {
      const dateVal = progressPdfDate
        ? new Date(progressPdfDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
      const { error } = await supabase.from('progress_logs').insert({
        athlete_id: athleteUserId,
        date: dateVal,
        weight_kg: progressPdfWeight ? Number(progressPdfWeight) : null,
        massa_grassa_percentuale: progressPdfBodyFat ? Number(progressPdfBodyFat) : null,
        waist_cm: progressPdfWaist ? Number(progressPdfWaist) : null,
        hips_cm: progressPdfHip ? Number(progressPdfHip) : null,
        created_by_profile_id: profileId,
        source: 'pdf_import',
      })
      if (error) throw error
      setProgressPdfOpen(false)
      setProgressPdfFile(null)
      setProgressPdfExtracted({})
      setProgressPdfDate(new Date().toISOString().slice(0, 16))
      setProgressPdfWeight('')
      setProgressPdfBodyFat('')
      setProgressPdfWaist('')
      setProgressPdfHip('')
      void loadData()
    } catch (e) {
      logger.error('Insert progress_logs', e)
    } finally {
      setProgressPdfSaving(false)
    }
  }, [
    athleteUserId,
    profileId,
    progressPdfDate,
    progressPdfWeight,
    progressPdfBodyFat,
    progressPdfWaist,
    progressPdfHip,
    supabase,
    loadData,
  ])

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!id) {
    router.replace('/dashboard/nutrizionista/atleti')
    return null
  }

  if (forbidden || (!loading && !profile)) {
    return (
      <div className="p-4 min-[834px]:p-6 space-y-6 bg-background text-text-primary">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-6 text-center text-amber-200 text-sm">
          Atleta non assegnato o non trovato. Accesso consentito solo agli atleti collegati.
          <div className="mt-3">
            <Link href="/dashboard/nutrizionista/atleti">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Torna alla lista atleti
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const displayName =
    [profile?.nome, profile?.cognome].filter(Boolean).join(' ') || `Atleta ${id?.slice(0, 8) ?? ''}`

  return (
    <StaffContentLayout
      title={displayName}
      description="Profilo nutrizionale"
      icon={<User className="w-6 h-6" />}
      theme="teal"
      actions={
        <Link
          href="/dashboard/nutrizionista/atleti"
          className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Atleti
        </Link>
      }
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList variant="underline" className="flex-wrap">
          <TabsTrigger value="overview" variant="underline">
            Overview
          </TabsTrigger>
          <TabsTrigger value="piani" variant="underline">
            Piani
          </TabsTrigger>
          <TabsTrigger value="struttura" variant="underline">
            Struttura piano
          </TabsTrigger>
          <TabsTrigger value="progressi" variant="underline">
            Progressi
          </TabsTrigger>
          <TabsTrigger value="analisi" variant="underline">
            Analisi settimanale
          </TabsTrigger>
          <TabsTrigger value="adattamenti" variant="underline">
            Adattamenti
          </TabsTrigger>
          <TabsTrigger value="documenti" variant="underline">
            Documenti
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Dati anagrafici: vista normale o modifica */}
          <div className="rounded-xl border border-border bg-background-secondary/50 p-3 sm:p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-text-primary">Dati anagrafici</h3>
              {anagraficEditMode ? (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      syncAnagraficFromProfile(profile)
                      setAnagraficEditMode(false)
                      setAnagraficError(null)
                    }}
                    className="min-h-[36px]"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={() => void handleSaveAnagrafic()}
                    disabled={savingAnagrafic}
                    className="min-h-[36px]"
                  >
                    {savingAnagrafic ? 'Salvataggio...' : 'Salva modifiche'}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnagraficEditMode(true)
                    setAnagraficError(null)
                  }}
                  className="min-h-[36px]"
                >
                  Modifica
                </Button>
              )}
            </div>
            {anagraficError && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                {anagraficError}
              </p>
            )}

            {anagraficEditMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-nome" className="text-text-muted">
                    Nome
                  </Label>
                  <Input
                    id="anagrafic-nome"
                    value={anagraficForm.nome}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, nome: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Nome"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-cognome" className="text-text-muted">
                    Cognome
                  </Label>
                  <Input
                    id="anagrafic-cognome"
                    value={anagraficForm.cognome}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, cognome: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Cognome"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="anagrafic-email" className="text-text-muted">
                    Email
                  </Label>
                  <Input
                    id="anagrafic-email"
                    type="email"
                    value={anagraficForm.email}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, email: e.target.value }))}
                    className="bg-background border-border break-all"
                    placeholder="email@esempio.it"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-telefono" className="text-text-muted">
                    Telefono
                  </Label>
                  <Input
                    id="anagrafic-telefono"
                    type="tel"
                    value={anagraficForm.telefono}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, telefono: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Telefono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-data_nascita" className="text-text-muted">
                    Data di nascita
                  </Label>
                  <Input
                    id="anagrafic-data_nascita"
                    type="date"
                    value={anagraficForm.data_nascita}
                    onChange={(e) =>
                      setAnagraficForm((f) => ({ ...f, data_nascita: e.target.value }))
                    }
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-sesso" className="text-text-muted">
                    Sesso
                  </Label>
                  <Input
                    id="anagrafic-sesso"
                    value={anagraficForm.sesso}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, sesso: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Es. M, F"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-codice_fiscale" className="text-text-muted">
                    Codice fiscale
                  </Label>
                  <Input
                    id="anagrafic-codice_fiscale"
                    value={anagraficForm.codice_fiscale}
                    onChange={(e) =>
                      setAnagraficForm((f) => ({
                        ...f,
                        codice_fiscale: e.target.value.toUpperCase(),
                      }))
                    }
                    className="bg-background border-border"
                    placeholder="Codice fiscale"
                    maxLength={16}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-professione" className="text-text-muted">
                    Professione
                  </Label>
                  <Input
                    id="anagrafic-professione"
                    value={anagraficForm.professione}
                    onChange={(e) =>
                      setAnagraficForm((f) => ({ ...f, professione: e.target.value }))
                    }
                    className="bg-background border-border"
                    placeholder="Professione"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="anagrafic-indirizzo" className="text-text-muted">
                    Indirizzo
                  </Label>
                  <Input
                    id="anagrafic-indirizzo"
                    value={anagraficForm.indirizzo}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, indirizzo: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Via, numero civico"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-citta" className="text-text-muted">
                    Città
                  </Label>
                  <Input
                    id="anagrafic-citta"
                    value={anagraficForm.citta}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, citta: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Città"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-cap" className="text-text-muted">
                    CAP
                  </Label>
                  <Input
                    id="anagrafic-cap"
                    value={anagraficForm.cap}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, cap: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="CAP"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-provincia" className="text-text-muted">
                    Provincia
                  </Label>
                  <Input
                    id="anagrafic-provincia"
                    value={anagraficForm.provincia}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, provincia: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Provincia"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anagrafic-nazione" className="text-text-muted">
                    Nazione
                  </Label>
                  <Input
                    id="anagrafic-nazione"
                    value={anagraficForm.nazione}
                    onChange={(e) => setAnagraficForm((f) => ({ ...f, nazione: e.target.value }))}
                    className="bg-background border-border"
                    placeholder="Nazione"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-text-muted block">Nome</span>
                  <p className="font-medium text-text-primary">{profile?.nome ?? '—'}</p>
                </div>
                <div>
                  <span className="text-text-muted block">Cognome</span>
                  <p className="font-medium text-text-primary">{profile?.cognome ?? '—'}</p>
                </div>
                <div>
                  <span className="text-text-muted block">Email</span>
                  <p className="font-medium text-text-primary break-all">{profile?.email ?? '—'}</p>
                </div>
                <div>
                  <span className="text-text-muted block">Telefono</span>
                  <p className="font-medium text-text-primary">
                    {profile?.telefono ?? profile?.phone ?? '—'}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted block">Data di nascita</span>
                  <p className="font-medium text-text-primary">
                    {profile?.data_nascita
                      ? new Date(profile.data_nascita).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted block">Sesso</span>
                  <p className="font-medium text-text-primary">{profile?.sesso ?? '—'}</p>
                </div>
                <div>
                  <span className="text-text-muted block">Codice fiscale</span>
                  <p className="font-medium text-text-primary">{profile?.codice_fiscale ?? '—'}</p>
                </div>
                <div>
                  <span className="text-text-muted block">Professione</span>
                  <p className="font-medium text-text-primary">{profile?.professione ?? '—'}</p>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="text-text-muted block">Indirizzo</span>
                  <p className="font-medium text-text-primary">
                    {[
                      profile?.indirizzo ?? profile?.indirizzo_residenza,
                      profile?.citta,
                      profile?.cap,
                      profile?.provincia,
                      profile?.nazione,
                    ]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Riepilogo nutrizionale */}
          <div className="rounded-xl border border-border bg-background-secondary/50 p-3 sm:p-4 space-y-4">
            <h3 className="font-semibold text-text-primary">Riepilogo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Piano attivo</span>
                <p className="font-medium text-text-primary">
                  {activeVersion ? `Versione ${activeVersion.version_number ?? '—'}` : 'Nessuno'}
                </p>
              </div>
              <div>
                <span className="text-text-muted">Macro target</span>
                <p className="font-medium text-text-primary">
                  {activeVersion
                    ? `Kcal ${activeVersion.calories_target ?? '—'} | P ${activeVersion.protein_target ?? '—'}g | C ${activeVersion.carb_target ?? '—'}g | F ${activeVersion.fat_target ?? '—'}g`
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-text-muted">Ultimo peso</span>
                <p className="font-medium text-text-primary">
                  {progressList[0]?.weight_kg != null ? `${progressList[0].weight_kg} kg` : '—'}
                </p>
              </div>
              <div>
                <span className="text-text-muted">Ultima analisi settimanale</span>
                <p className="font-medium text-text-primary">
                  {weeklyAnalysisList.length > 0
                    ? new Date(
                        (weeklyAnalysisList[0] as { created_at?: string }).created_at ?? '',
                      ).toLocaleDateString('it-IT')
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="piani" className="mt-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background-tertiary/50 border-b border-border">
                <tr className="text-left text-text-secondary">
                  <th className="p-3 sm:p-4 font-medium">Piano / File</th>
                  <th className="p-3 sm:p-4 font-medium">Versione</th>
                  <th className="p-3 sm:p-4 font-medium">Stato</th>
                  <th className="p-3 sm:p-4 font-medium">Inizio</th>
                  <th className="p-3 sm:p-4 font-medium">Fine</th>
                  <th className="p-3 sm:p-4 font-medium">Macro</th>
                  <th className="p-3 sm:p-4 font-medium w-10">PDF</th>
                  <th className="p-3 sm:p-4 font-medium w-24">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {versions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-text-muted">
                      Nessun piano. Crea un piano da &quot;Nuovo piano&quot; in dashboard o carica
                      un PDF dalla pagina Piani.
                    </td>
                  </tr>
                ) : (
                  versions.map((v) => {
                    const isActive =
                      v.status === PLAN_VERSION_STATUS_ACTIVE || v.status === 'published'
                    const storagePath =
                      v.storagePath ??
                      (v.pdf_file_path && v.pdf_file_path.startsWith('nutrition-plans/')
                        ? v.pdf_file_path
                        : v.pdf_file_path && v.pdf_file_path.includes('/documents/')
                          ? v.pdf_file_path.split('/documents/')[1]
                          : null)
                    const fileName = v.fileName ?? storagePath?.split('/').pop() ?? 'piano.pdf'
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-border/50 hover:bg-background-tertiary/30"
                      >
                        <td className="p-3 text-text-muted font-mono text-xs">
                          {v.fileName ?? (v.plan_id ? `${v.plan_id.slice(0, 8)}…` : '—')}
                        </td>
                        <td className="p-3 font-medium text-text-primary">
                          {v.storagePath && v.version_number == null
                            ? 'Documento'
                            : `v${v.version_number ?? '—'}`}
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : v.status === PLAN_VERSION_STATUS_DRAFT
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-background-elevated text-text-muted'
                            }`}
                          >
                            {isActive
                              ? v.storagePath
                                ? 'Documento'
                                : 'Attivo'
                              : v.status === PLAN_VERSION_STATUS_DRAFT
                                ? 'Bozza'
                                : v.status}
                          </span>
                        </td>
                        <td className="p-3 text-text-muted">
                          {(canEditValidity(v) || v.id.startsWith('storage-')) &&
                          editingDateCell?.versionId === v.id &&
                          editingDateCell?.field === 'start' ? (
                            <Input
                              type="date"
                              defaultValue={v.start_date ?? ''}
                              disabled={inlineDateSaving}
                              className="h-8 w-full min-w-[120px] text-sm"
                              onBlur={(e) => {
                                const val = e.target.value
                                if (val !== (v.start_date ?? ''))
                                  void handleInlineDateSave(v, 'start', val)
                                setEditingDateCell(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value
                                  if (val !== (v.start_date ?? ''))
                                    void handleInlineDateSave(v, 'start', val)
                                  setEditingDateCell(null)
                                }
                                if (e.key === 'Escape') setEditingDateCell(null)
                              }}
                              autoFocus
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                (canEditValidity(v) || v.id.startsWith('storage-')) &&
                                setEditingDateCell({ versionId: v.id, field: 'start' })
                              }
                              className={`text-left w-full min-w-[100px] py-0.5 rounded hover:bg-background-tertiary ${canEditValidity(v) || v.id.startsWith('storage-') ? 'cursor-pointer' : 'cursor-default'}`}
                              title={
                                canEditValidity(v) || v.id.startsWith('storage-')
                                  ? 'Clicca per modificare (scrivi la data o apri il calendario)'
                                  : undefined
                              }
                            >
                              {v.start_date
                                ? new Date(v.start_date).toLocaleDateString('it-IT')
                                : '—'}
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-text-muted">
                          {(canEditValidity(v) || v.id.startsWith('storage-')) &&
                          editingDateCell?.versionId === v.id &&
                          editingDateCell?.field === 'end' ? (
                            <Input
                              type="date"
                              defaultValue={v.end_date ?? ''}
                              disabled={inlineDateSaving}
                              className="h-8 w-full min-w-[120px] text-sm"
                              onBlur={(e) => {
                                const val = e.target.value
                                if (val !== (v.end_date ?? ''))
                                  void handleInlineDateSave(v, 'end', val)
                                setEditingDateCell(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value
                                  if (val !== (v.end_date ?? ''))
                                    void handleInlineDateSave(v, 'end', val)
                                  setEditingDateCell(null)
                                }
                                if (e.key === 'Escape') setEditingDateCell(null)
                              }}
                              autoFocus
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                (canEditValidity(v) || v.id.startsWith('storage-')) &&
                                setEditingDateCell({ versionId: v.id, field: 'end' })
                              }
                              className={`text-left w-full min-w-[100px] py-0.5 rounded hover:bg-background-tertiary ${canEditValidity(v) || v.id.startsWith('storage-') ? 'cursor-pointer' : 'cursor-default'}`}
                              title={
                                canEditValidity(v) || v.id.startsWith('storage-')
                                  ? 'Clicca per modificare (scrivi la data o apri il calendario)'
                                  : undefined
                              }
                            >
                              {v.end_date ? new Date(v.end_date).toLocaleDateString('it-IT') : '—'}
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-text-muted text-xs">
                          {v.calories_target != null ? `${v.calories_target} kcal` : '—'}
                          {(v.protein_target != null ||
                            v.carb_target != null ||
                            v.fat_target != null) && (
                            <span className="block text-text-tertiary">
                              P{v.protein_target ?? '—'} C{v.carb_target ?? '—'} F
                              {v.fat_target ?? '—'}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {storagePath ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex text-emerald-400 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded p-0.5"
                                  title="PDF"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={async () => {
                                    const { data, error } = await supabase.storage
                                      .from('documents')
                                      .createSignedUrl(storagePath, 3600)
                                    if (!error && data?.signedUrl)
                                      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Apri in nuova scheda
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    const { data, error } = await supabase.storage
                                      .from('documents')
                                      .createSignedUrl(storagePath, 3600)
                                    if (error || !data?.signedUrl) return
                                    try {
                                      const res = await fetch(data.signedUrl)
                                      const blob = await res.blob()
                                      const url = URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = fileName
                                      a.click()
                                      URL.revokeObjectURL(url)
                                    } catch {
                                      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
                                    }
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Scarica
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : v.pdf_file_path &&
                            (v.pdf_file_path.startsWith('http://') ||
                              v.pdf_file_path.startsWith('https://')) ? (
                            <a
                              href={v.pdf_file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex text-emerald-400 hover:text-emerald-300"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                aria-label="Azioni piano"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {storagePath && (
                                <>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      const { data, error } = await supabase.storage
                                        .from('documents')
                                        .createSignedUrl(storagePath, 3600)
                                      if (!error && data?.signedUrl)
                                        window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Visualizza PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      const { data, error } = await supabase.storage
                                        .from('documents')
                                        .createSignedUrl(storagePath, 3600)
                                      if (error || !data?.signedUrl) return
                                      try {
                                        const res = await fetch(data.signedUrl)
                                        const blob = await res.blob()
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = fileName
                                        a.click()
                                        URL.revokeObjectURL(url)
                                      } catch {
                                        window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
                                      }
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Scarica PDF
                                  </DropdownMenuItem>
                                </>
                              )}
                              {canEditValidity(v) && (
                                <DropdownMenuItem onClick={() => openValidityEdit(v)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Modifica date validità
                                </DropdownMenuItem>
                              )}
                              {!v.id.startsWith('storage-') && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/nutrizionista/piani?version=${v.id}`}
                                    className="flex items-center"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Apri in Piani
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-400 focus:text-red-400"
                                onClick={() => setDeletePlanRow(v)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-text-muted text-xs">
            Modifica date validità con l’icona matita. Apri il PDF o vai alla pagina Piani per altre
            azioni.
          </p>
        </TabsContent>

        <TabsContent value="struttura" className="mt-4">
          <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-6 text-center text-text-secondary text-sm">
            Struttura piano (giorni → pasti → alimenti). Seleziona una versione e visualizza
            gerarchia. Editor CRUD in sviluppo.
          </div>
        </TabsContent>

        <TabsContent value="progressi" className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-sm text-text-secondary">Storico misurazioni (progress_logs)</span>
            {athleteUserId && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setProgressPdfExtractAttempted(false)
                  setProgressPdfExtracted({})
                  setProgressPdfOpen(true)
                }}
              >
                <FileDown className="h-4 w-4" />
                Carica da PDF
              </Button>
            )}
          </div>
          <ul className="rounded-xl border border-border divide-y divide-border/50 overflow-hidden">
            {progressList.length === 0 ? (
              <li className="p-4 text-center text-text-muted text-sm">
                Nessun progresso registrato.
              </li>
            ) : (
              progressList.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 min-h-[44px] hover:bg-background-tertiary/30 touch-manipulation"
                >
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
                    <span className="font-medium text-text-primary">
                      {p.weight_kg != null ? `${p.weight_kg} kg` : '—'}
                    </span>
                    {p.massa_grassa_percentuale != null && (
                      <span className="text-text-secondary">BF {p.massa_grassa_percentuale}%</span>
                    )}
                    {p.waist_cm != null && (
                      <span className="text-text-secondary">Vita {p.waist_cm} cm</span>
                    )}
                    {p.hips_cm != null && (
                      <span className="text-text-secondary">Fianchi {p.hips_cm} cm</span>
                    )}
                    {p.notes && <span className="text-text-muted">{p.notes}</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.source === 'pdf_import' && (
                      <span className="rounded-full bg-teal-500/20 text-teal-400 px-2 py-0.5 text-xs">
                        PDF
                      </span>
                    )}
                    <span className="text-text-muted text-sm">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('it-IT') : '—'}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
          {!athleteUserId && (
            <p className="mt-2 text-amber-500/90 text-xs">
              Atleta senza account: i progressi non possono essere caricati da qui.
            </p>
          )}
        </TabsContent>

        <TabsContent value="analisi" className="mt-4">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-3 sm:p-4">
            {weeklyAnalysisList.length === 0 ? (
              <p className="text-center text-text-muted text-sm">Nessuna analisi settimanale.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {weeklyAnalysisList.map((w, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-text-muted">
                      {(w as { created_at?: string }).created_at
                        ? new Date((w as { created_at: string }).created_at).toLocaleDateString(
                            'it-IT',
                          )
                        : '—'}
                    </span>
                    <span className="text-text-primary">
                      Dati aggregati (calorie medie, macro vs target)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="adattamenti" className="mt-4">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background-tertiary/50 border-b border-border">
                <tr className="text-left text-text-secondary">
                  <th className="p-3 sm:p-4 font-medium">Data</th>
                  <th className="p-3 sm:p-4 font-medium">Tipo</th>
                  <th className="p-3 sm:p-4 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {adjustmentsList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-text-muted">
                      Nessun adattamento.
                    </td>
                  </tr>
                ) : (
                  adjustmentsList.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border/50 hover:bg-background-tertiary/30"
                    >
                      <td className="p-3 text-text-muted">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('it-IT') : '—'}
                      </td>
                      <td className="p-3">{a.is_automatic ? 'Automatico' : 'Manuale'}</td>
                      <td className="p-3">{a.adjustment_reason ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="documenti" className="mt-4">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-3 sm:p-4">
            <p className="text-text-muted text-sm mb-3">PDF piani e storico versioni.</p>
            <ul className="space-y-2 text-sm">
              {versions
                .filter((v) => v.pdf_file_path)
                .map((v) => (
                  <li key={v.id} className="flex items-center gap-2 min-h-[44px]">
                    <FileDown className="h-4 w-4 text-teal-400" />
                    <span>Versione {v.version_number ?? '—'}</span>
                    <span className="text-text-muted truncate max-w-[200px]">
                      {v.pdf_file_path}
                    </span>
                  </li>
                ))}
              {versions.filter((v) => v.pdf_file_path).length === 0 && (
                <li className="text-text-muted">Nessun PDF caricato.</li>
              )}
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!validityEditRow} onOpenChange={(open) => !open && setValidityEditRow(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Date validità</DialogTitle>
            <p className="text-sm text-text-muted">
              Imposta o modifica data inizio e scadenza del piano.
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="validity-start">Data inizio</Label>
              <Input
                id="validity-start"
                type="date"
                value={validityEditStart}
                onChange={(e) => setValidityEditStart(e.target.value)}
                disabled={validityEditLoading}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validity-end">Data scadenza</Label>
              <Input
                id="validity-end"
                type="date"
                value={validityEditEnd}
                onChange={(e) => setValidityEditEnd(e.target.value)}
                disabled={validityEditLoading}
                className="min-h-[44px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setValidityEditRow(null)}
              disabled={validityEditLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={() => void handleValiditySave()}
              disabled={validityEditLoading || !validityEditStart || !validityEditEnd}
              className="min-h-[44px] bg-teal-600 hover:bg-teal-500"
            >
              {validityEditLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {validityEditLoading ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletePlanRow} onOpenChange={(open) => !open && setDeletePlanRow(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Elimina piano</DialogTitle>
            <p className="text-sm text-text-muted">
              Il piano &quot;
              {deletePlanRow?.fileName ??
                (deletePlanRow?.version_number != null
                  ? `v${deletePlanRow.version_number}`
                  : 'documento')}
              &quot; verrà eliminato definitivamente. Questa azione non si può annullare.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletePlanRow(null)}
              disabled={deletePlanLoading}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeletePlan()}
              disabled={deletePlanLoading}
              className="min-h-[44px]"
            >
              {deletePlanLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              {deletePlanLoading ? 'Eliminazione...' : 'Elimina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={progressPdfOpen} onOpenChange={setProgressPdfOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Carica progressi da PDF</DialogTitle>
            <p className="text-sm text-text-muted">
              Carica un PDF per estrarre i valori oppure inserisci manualmente.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border bg-background-tertiary/50 p-3 space-y-2">
              <Label>File PDF (opzionale)</Label>
              <div className="flex flex-wrap gap-2 items-center">
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="max-w-[200px]"
                  onChange={(e) => setProgressPdfFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!progressPdfFile || progressPdfExtracting}
                  onClick={() => void handleProgressPdfExtract()}
                >
                  {progressPdfExtracting ? 'Estrazione…' : 'Estrai valori'}
                </Button>
              </div>
              {progressPdfExtractAttempted && (
                <div className="mt-2 text-sm">
                  {Object.keys(progressPdfExtracted).length > 0 ? (
                    <p className="text-emerald-400/90">
                      Valori estratti:{' '}
                      {[
                        progressPdfExtracted.peso_kg ?? progressPdfExtracted.weight_kg,
                        (progressPdfExtracted.massa_grassa_percentuale ??
                          progressPdfExtracted.body_fat) &&
                          `Massa grassa ${progressPdfExtracted.massa_grassa_percentuale ?? progressPdfExtracted.body_fat}%`,
                        (progressPdfExtracted.vita_cm ?? progressPdfExtracted.waist_cm) &&
                          `Vita ${progressPdfExtracted.vita_cm ?? progressPdfExtracted.waist_cm} cm`,
                        (progressPdfExtracted.fianchi_cm ?? progressPdfExtracted.hips_cm) &&
                          `Fianchi ${progressPdfExtracted.fianchi_cm ?? progressPdfExtracted.hips_cm} cm`,
                      ]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </p>
                  ) : (
                    <p className="text-amber-400/90">
                      Nessun valore riconosciuto nel PDF. Inserisci i dati manualmente nei campi
                      sotto.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label>Data misurazione</Label>
              <Input
                type="datetime-local"
                value={progressPdfDate}
                onChange={(e) => setProgressPdfDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="es. 72.5"
                value={progressPdfWeight}
                onChange={(e) => setProgressPdfWeight(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Body fat %</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="es. 18"
                value={progressPdfBodyFat}
                onChange={(e) => setProgressPdfBodyFat(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Vita (cm)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="es. 82"
                value={progressPdfWaist}
                onChange={(e) => setProgressPdfWaist(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Fianchi (cm)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="es. 98"
                value={progressPdfHip}
                onChange={(e) => setProgressPdfHip(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressPdfOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={() => void handleProgressPdfSave()}
              disabled={progressPdfSaving || !athleteUserId}
              className="min-h-[44px] bg-teal-600 hover:bg-teal-500"
            >
              {progressPdfSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {progressPdfSaving ? 'Salvataggio…' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffContentLayout>
  )
}
