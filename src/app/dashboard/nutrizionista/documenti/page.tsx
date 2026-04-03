'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  Upload,
  Filter,
  ArrowRight,
  MoreVertical,
  AlertCircle,
  FolderOpen,
  FileCheck,
  Calendar,
} from 'lucide-react'
import type { Database } from '@/lib/supabase/types'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import {
  Button,
  Input,
  Label,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { extractFileName } from '@/lib/documents'
import { buildTabularExportPdfBlob, type ExportData } from '@/lib/export-utils'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'

const logger = createLogger('app:dashboard:nutrizionista:documenti')
const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'
const DEBOUNCE_MS = 300

const TAB_CATEGORIES: { id: string; label: string; categories: string[] }[] = [
  { id: 'all', label: 'Tutti', categories: [] },
  { id: 'dossier', label: 'Dossier', categories: ['dossier_onboarding', 'onboarding'] },
  { id: 'referti', label: 'Referti', categories: ['referto', 'referti', 'analisi', 'bloodwork'] },
  { id: 'certificati', label: 'Certificati', categories: ['certificato', 'certificates'] },
  {
    id: 'piani',
    label: 'Piani / Nutrizione',
    categories: ['nutrition_plan', 'piano_nutrizionale', 'diet_plan'],
  },
  { id: 'altro', label: 'Altro', categories: ['altro', 'liberatoria', 'contratto'] },
]

type DocRow = {
  nutritionist_id: string
  document_id: string
  org_id: string | null
  org_id_text: string | null
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  category: string | null
  status: string | null
  notes: string | null
  file_url: string | null
  expires_at: string | null
  uploaded_by_profile_id: string | null
  uploaded_by_name: string | null
  created_at: string | null
  updated_at: string | null
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debouncedValue
}

function KpiCard({
  label,
  value,
  active,
  onClick,
  icon: Icon,
}: {
  label: string
  value: number
  active?: boolean
  onClick?: () => void
  icon: React.ElementType
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 sm:p-5 text-left min-w-0 min-h-[44px] touch-manipulation transition-colors ${
        active
          ? 'border-teal-500/50 bg-teal-500/10 ring-1 ring-teal-500/30'
          : 'border-border bg-background-secondary/80 ring-1 ring-white/5 hover:bg-background-tertiary/50'
      }`}
    >
      <div className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </div>
      <p className="text-xl font-bold text-text-primary tabular-nums">{value}</p>
    </button>
  )
}

export default function NutrizionistaDocumentiPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const profileId = user?.id ?? null
  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<DocRow[]>([])
  const [assignedAthletes, setAssignedAthletes] = useState<
    { id: string; name: string; email: string | null }[]
  >([])
  const [tab, setTab] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterAthlete, setFilterAthlete] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterUploadedBy, setFilterUploadedBy] = useState<'all' | 'atleta' | 'staff' | 'io'>('all')
  const [filterExpired, setFilterExpired] = useState<'all' | 'con_scadenza' | 'scaduti'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'atleta' | 'category' | 'expires'>('recent')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadAthleteId, setUploadAthleteId] = useState('')
  const [uploadCategory, setUploadCategory] = useState('altro')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadExpires, setUploadExpires] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editNoteDocId, setEditNoteDocId] = useState<string | null>(null)
  const [editNoteValue, setEditNoteValue] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [myOrgId, setMyOrgId] = useState<string | null>(null)
  const [myOrgIdText, setMyOrgIdText] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchInput.trim().toLowerCase(), DEBOUNCE_MS)

  const loadData = useCallback(async () => {
    if (!profileId) {
      setRows([])
      setAssignedAthletes([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('org_id, org_id_text')
        .eq('id', profileId)
        .single()
      if (profileData) {
        setMyOrgId((profileData as { org_id?: string | null }).org_id ?? null)
        setMyOrgIdText((profileData as { org_id_text?: string | null }).org_id_text ?? null)
      }

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
        setRows([])
        setAssignedAthletes([])
        setLoading(false)
        return
      }

      const profilesAccum: {
        id: string
        nome: string | null
        cognome: string | null
        email: string | null
      }[] = []
      for (const idChunk of chunkForSupabaseIn(athleteIds)) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email')
          .in('id', idChunk)
        profilesAccum.push(...((profilesData ?? []) as (typeof profilesAccum)[number][]))
      }
      const profilesMap = new Map(
        profilesAccum.map((p) => [
          p.id,
          {
            name: [p.nome, p.cognome].filter(Boolean).join(' ') || p.id.slice(0, 8),
            email: p.email ?? null,
          },
        ]),
      )
      setAssignedAthletes(
        athleteIds.map((id) => ({
          id,
          name: profilesMap.get(id)?.name ?? id.slice(0, 8),
          email: profilesMap.get(id)?.email ?? null,
        })),
      )

      const viewRes = (supabase as { from: (t: string) => ReturnType<typeof supabase.from> })
        .from(NUTRITION_TABLES.viewDocuments)
        .select('*')
        .eq('nutritionist_id', profileId)
        .order('created_at', { ascending: false })
        .limit(500)
      const { data: viewData, error: viewErr } = await viewRes
      if (viewErr) {
        logger.error('View documenti fallback', viewErr)
        setRows([])
      } else {
        setRows((viewData ?? []) as DocRow[])
      }
    } catch (e) {
      logger.error('Errore caricamento documenti', e)
      setError(e instanceof Error ? e.message : 'Errore caricamento')
    } finally {
      setLoading(false)
    }
  }, [profileId, supabase])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const now = useMemo(() => new Date(), [])
  const sevenDaysAgo = useMemo(() => {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d.toISOString()
  }, [now])

  const filteredRows = useMemo(() => {
    const tabSpec = TAB_CATEGORIES.find((t) => t.id === tab)
    let list = rows
    if (tabSpec && tabSpec.categories.length > 0) {
      list = list.filter((r) => r.category && tabSpec.categories.includes(r.category))
    }
    if (debouncedSearch) {
      list = list.filter(
        (r) =>
          (r.athlete_name ?? '').toLowerCase().includes(debouncedSearch) ||
          (r.athlete_email ?? '').toLowerCase().includes(debouncedSearch) ||
          (r.category ?? '').toLowerCase().includes(debouncedSearch) ||
          (r.notes ?? '').toLowerCase().includes(debouncedSearch) ||
          (r.file_url && extractFileName(r.file_url).toLowerCase().includes(debouncedSearch)),
      )
    }
    if (filterAthlete !== 'all') list = list.filter((r) => r.athlete_id === filterAthlete)
    if (filterStatus !== 'all') list = list.filter((r) => r.status === filterStatus)
    if (filterUploadedBy === 'atleta')
      list = list.filter((r) => r.uploaded_by_profile_id === r.athlete_id)
    else if (filterUploadedBy === 'staff')
      list = list.filter((r) => r.uploaded_by_profile_id !== r.athlete_id)
    else if (filterUploadedBy === 'io')
      list = list.filter((r) => r.uploaded_by_profile_id === profileId)
    if (filterExpired === 'scaduti')
      list = list.filter((r) => r.expires_at && new Date(r.expires_at) < now)
    else if (filterExpired === 'con_scadenza') list = list.filter((r) => r.expires_at != null)
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'atleta') return (a.athlete_name ?? '').localeCompare(b.athlete_name ?? '')
      if (sortBy === 'category') return (a.category ?? '').localeCompare(b.category ?? '')
      if (sortBy === 'expires') {
        const ea = a.expires_at ? new Date(a.expires_at).getTime() : Infinity
        const eb = b.expires_at ? new Date(b.expires_at).getTime() : Infinity
        return ea - eb
      }
      const ca = a.created_at ?? ''
      const cb = b.created_at ?? ''
      return cb.localeCompare(ca)
    })
    return sorted
  }, [
    rows,
    tab,
    debouncedSearch,
    filterAthlete,
    filterStatus,
    filterUploadedBy,
    filterExpired,
    sortBy,
    profileId,
    now,
  ])

  const kpiCounts = useMemo(() => {
    const total = rows.length
    const last7 = rows.filter((r) => r.created_at && r.created_at >= sevenDaysAgo).length
    const onboarding = rows.filter((r) =>
      ['dossier_onboarding', 'onboarding'].includes(r.category ?? ''),
    ).length
    const referti = rows.filter((r) =>
      ['referto', 'referti', 'analisi', 'bloodwork'].includes(r.category ?? ''),
    ).length
    const scaduti = rows.filter((r) => r.expires_at && new Date(r.expires_at) < now).length
    const daRivedere = rows.filter(
      (r) => r.status === 'da_validare' || r.status === 'in-revisione',
    ).length
    return { total, last7, onboarding, referti, scaduti, daRivedere }
  }, [rows, sevenDaysAgo, now])

  const handleUpload = useCallback(async () => {
    if (!uploadFile || !uploadAthleteId || !profileId) return
    if (!myOrgId && !myOrgIdText) {
      setError('Org mancante: impossibile caricare.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const fileExt = uploadFile.name.split('.').pop() || 'bin'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `documents/${uploadAthleteId}/${fileName}`
      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile, { cacheControl: '3600', upsert: false })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
      type DocInsert = Database['public']['Tables']['documents']['Insert']
      const insertPayload: DocInsert = {
        athlete_id: uploadAthleteId,
        category: uploadCategory,
        file_url: urlData.publicUrl,
        uploaded_by_profile_id: profileId,
        org_id: myOrgId ?? myOrgIdText ?? '',
        org_id_text: myOrgIdText ?? myOrgId ?? null,
        status: 'valido',
        notes: uploadNotes || null,
        expires_at: uploadExpires || null,
      }
      const { error: insertErr } = await supabase.from('documents').insert(insertPayload)
      if (insertErr) throw insertErr
      setUploadOpen(false)
      setUploadAthleteId('')
      setUploadCategory('altro')
      setUploadNotes('')
      setUploadExpires('')
      setUploadFile(null)
      void loadData()
    } catch (e) {
      logger.error('Upload documento', e)
      setError(e instanceof Error ? e.message : 'Errore upload')
    } finally {
      setUploading(false)
    }
  }, [
    uploadFile,
    uploadAthleteId,
    profileId,
    myOrgId,
    myOrgIdText,
    uploadCategory,
    uploadNotes,
    uploadExpires,
    supabase,
    loadData,
  ])

  const handleSaveNote = useCallback(
    async (documentId: string) => {
      setSavingNote(true)
      try {
        const { error: err } = await supabase
          .from('documents')
          .update({ notes: editNoteValue })
          .eq('id', documentId)
        if (err) throw err
        setEditNoteDocId(null)
        setEditNoteValue('')
        void loadData()
      } catch (e) {
        logger.error('Update note', e)
      } finally {
        setSavingNote(false)
      }
    },
    [editNoteValue, supabase, loadData],
  )

  const handleExportPdf = useCallback(async () => {
    if (filteredRows.length === 0) return
    setPdfLoading(true)
    try {
      const data: ExportData = filteredRows.map((r) => ({
        atleta: r.athlete_name ?? '',
        email: r.athlete_email ?? '',
        categoria: r.category ?? '',
        stato: r.status ?? '',
        scadenza: r.expires_at ?? '',
        creato: r.created_at ?? '',
        filename: r.file_url ? extractFileName(r.file_url) : '',
      }))
      const blob = await buildTabularExportPdfBlob('Documenti nutrizione', data)
      openPdfWithBlob(blob, `documenti_nutrizione_${now.toISOString().slice(0, 10)}.pdf`)
    } catch (e) {
      logger.error('Export PDF documenti', e)
    } finally {
      setPdfLoading(false)
    }
  }, [filteredRows, now, setPdfLoading, openPdfWithBlob])

  const copyLink = useCallback((url: string) => {
    navigator.clipboard.writeText(url).catch(() => {})
  }, [])

  const uploadedByLabel = (r: DocRow) => {
    if (r.uploaded_by_name) return r.uploaded_by_name
    if (r.uploaded_by_profile_id === r.athlete_id) return 'Atleta'
    return 'Staff'
  }

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Documenti"
      description="Documenti e PDF degli atleti assegnati."
      icon={<FileText className="w-6 h-6" />}
      theme="teal"
      actions={
        <>
          <Button
            onClick={() => setUploadOpen(true)}
            className="gap-2 bg-teal-600 hover:bg-teal-500 text-white"
          >
            <Upload className="h-4 w-4" />
            Carica documento
          </Button>
          <Button
            variant="outline"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtri
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleExportPdf()}
            disabled={filteredRows.length === 0 || pdfLoading}
            aria-busy={pdfLoading}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Esporta PDF
          </Button>
        </>
      }
    >
      {error && (
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="underline shrink-0 min-h-[44px] touch-manipulation flex items-center"
          >
            Chiudi
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        {TAB_CATEGORIES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 min-h-[44px] touch-manipulation text-sm font-medium ${
              tab === t.id
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-background-secondary text-text-muted border border-border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-2 min-[500px]:grid-cols-5 gap-3">
        <KpiCard label="Totale documenti" value={kpiCounts.total} icon={FileText} />
        <KpiCard label="Ultimi 7 giorni" value={kpiCounts.last7} icon={Calendar} />
        <KpiCard label="Onboarding" value={kpiCounts.onboarding} icon={FolderOpen} />
        <KpiCard label="Referti" value={kpiCounts.referti} icon={FileCheck} />
        <KpiCard label="Scaduti" value={kpiCounts.scaduti} icon={AlertCircle} />
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Cerca atleta, email, categoria, note, filename…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-3 min-h-[44px]"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="min-h-[44px] rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
        >
          <option value="recent">Più recenti</option>
          <option value="atleta">Atleta (A–Z)</option>
          <option value="category">Categoria</option>
          <option value="expires">Scadenza (vicina)</option>
        </select>
      </div>

      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DrawerContent onClose={() => setFiltersOpen(false)}>
          <DrawerHeader>
            <span>Filtri</span>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div>
              <Label>Atleta</Label>
              <select
                value={filterAthlete}
                onChange={(e) => setFilterAthlete(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                {assignedAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="valido">Valido</option>
                <option value="scaduto">Scaduto</option>
                <option value="da_validare">Da validare</option>
                <option value="in-revisione">In revisione</option>
              </select>
            </div>
            <div>
              <Label>Caricato da</Label>
              <select
                value={filterUploadedBy}
                onChange={(e) => setFilterUploadedBy(e.target.value as typeof filterUploadedBy)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="atleta">Atleta</option>
                <option value="staff">Staff</option>
                <option value="io">Io</option>
              </select>
            </div>
            <div>
              <Label>Scadenza</Label>
              <select
                value={filterExpired}
                onChange={(e) => setFilterExpired(e.target.value as typeof filterExpired)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                <option value="all">Tutti</option>
                <option value="con_scadenza">Con scadenza</option>
                <option value="scaduti">Scaduti</option>
              </select>
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {loading ? (
        <div className={LOADING_CLASS}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-8 text-center text-text-secondary text-sm">
          {rows.length === 0
            ? 'Nessun documento. Carica un file per iniziare.'
            : 'Nessun risultato per i filtri selezionati.'}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-tertiary/50">
                  <th className="text-left p-3 font-medium">Atleta</th>
                  <th className="text-left p-3 font-medium">Documento</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Scadenza</th>
                  <th className="text-left p-3 font-medium">Caricato da</th>
                  <th className="text-left p-3 font-medium">Creato</th>
                  <th className="text-right p-3 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr
                    key={r.document_id}
                    className="border-b border-border/50 hover:bg-background-tertiary/30"
                  >
                    <td className="p-3">
                      <div className="font-medium text-text-primary">{r.athlete_name ?? '—'}</div>
                      {r.athlete_email && (
                        <div className="text-xs text-text-muted">{r.athlete_email}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-background-tertiary px-1.5 py-0.5 text-xs">
                        {r.category ?? '—'}
                      </span>
                      <div className="mt-0.5 text-text-secondary">
                        {r.file_url ? extractFileName(r.file_url) : '—'}
                      </div>
                      {r.notes && (
                        <div
                          className="text-xs text-text-muted truncate max-w-[180px]"
                          title={r.notes}
                        >
                          {r.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {r.status === 'valido' && (
                        <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs">
                          Valido
                        </span>
                      )}
                      {r.status === 'scaduto' && (
                        <span className="rounded-full bg-red-500/20 text-red-300 px-2 py-0.5 text-xs">
                          Scaduto
                        </span>
                      )}
                      {(r.status === 'da_validare' || r.status === 'in-revisione') && (
                        <span className="rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-xs">
                          {r.status}
                        </span>
                      )}
                      {r.status &&
                        !['valido', 'scaduto', 'da_validare', 'in-revisione'].includes(
                          r.status,
                        ) && (
                          <span className="rounded-full bg-background-tertiary px-2 py-0.5 text-xs">
                            {r.status}
                          </span>
                        )}
                      {!r.status && '—'}
                    </td>
                    <td className="p-3 text-text-secondary">
                      {r.expires_at ? new Date(r.expires_at).toLocaleDateString('it-IT') : '—'}
                    </td>
                    <td className="p-3 text-text-secondary">{uploadedByLabel(r)}</td>
                    <td className="p-3 text-text-muted">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            aria-label="Azioni"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {r.file_url && (
                            <>
                              <DropdownMenuItem asChild>
                                <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                                  Apri / Preview
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyLink(r.file_url!)}>
                                Copia link
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setEditNoteDocId(r.document_id)
                              setEditNoteValue(r.notes ?? '')
                            }}
                          >
                            Modifica note
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/nutrizionista/atleti/${r.athlete_id}`}>
                              Atleta <ArrowRight className="h-3.5 w-3.5 ml-1 inline" />
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Carica documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Atleta *</Label>
              <select
                value={uploadAthleteId}
                onChange={(e) => setUploadAthleteId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
                required
              >
                <option value="">—</option>
                {assignedAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              >
                {[
                  'certificato',
                  'liberatoria',
                  'contratto',
                  'dossier_onboarding',
                  'referto',
                  'piano_nutrizionale',
                  'altro',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>File *</Label>
              <Input
                type="file"
                className="mt-1"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <Label>Note</Label>
              <Input
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Opzionale"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Scadenza</Label>
              <Input
                type="date"
                value={uploadExpires}
                onChange={(e) => setUploadExpires(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile || !uploadAthleteId || uploading}>
              {uploading ? 'Caricamento…' : 'Carica'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editNoteDocId && (
        <Dialog open={!!editNoteDocId} onOpenChange={(open) => !open && setEditNoteDocId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifica note</DialogTitle>
            </DialogHeader>
            <textarea
              value={editNoteValue}
              onChange={(e) => setEditNoteValue(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
              placeholder="Note…"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditNoteDocId(null)}>
                Annulla
              </Button>
              <Button
                onClick={() => editNoteDocId && handleSaveNote(editNoteDocId)}
                disabled={savingNote}
              >
                {savingNote ? 'Salvataggio…' : 'Salva'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Documenti"
      />
    </StaffContentLayout>
  )
}
