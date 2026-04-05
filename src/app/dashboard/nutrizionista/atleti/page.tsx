'use client'

import { useCallback, useEffect, useState, useMemo, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  ArrowRight,
  Mail,
  User,
  Filter,
  Search,
  X,
  MoreVertical,
  CalendarClock,
  ClipboardList,
  TrendingUp,
  Plus,
  Copy,
  BarChart2,
  UserRoundPlus,
  Pause,
  Play,
  Trash2,
  LayoutGrid,
  List,
} from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useNotify } from '@/lib/ui/notify'
import {
  Button,
  Input,
  Label,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { InvitaClienteModal } from '@/components/dashboard/invita-cliente-modal'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
const logger = createLogger('app:dashboard:nutrizionista:atleti')
const DEBOUNCE_MS = 300

type AthleteRow = {
  staff_id?: string
  athlete_id: string
  atleta_id?: string
  athlete_name: string | null
  athlete_email: string | null
  assignment_status?: string | null
  active_plan_version?: number | null
  review_date?: string | null
  last_checkin_date?: string | null
  last_progress_at?: string | null
}

type SortOption = 'updated' | 'scadenza' | 'progresso' | 'nome'
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'updated', label: 'Ultimo aggiornamento' },
  { value: 'scadenza', label: 'Scadenza piano (più vicina)' },
  { value: 'progresso', label: 'Ultimo progresso (recente)' },
  { value: 'nome', label: 'Nome (A-Z)' },
]

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
      className={`rounded-xl border p-5 text-left min-w-0 min-h-[44px] transition-colors touch-manipulation focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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

const AthleteRowActions = memo(function AthleteRowActions({
  row,
  onAddProgress,
  onCopyEmail,
  onPause,
  onActivate,
  onRemove,
}: {
  row: AthleteRow
  onAddProgress: (row: AthleteRow) => void
  onCopyEmail: (email: string) => void
  onPause?: (athleteId: string, staffId?: string) => void
  onActivate?: (athleteId: string, staffId?: string) => void
  onRemove?: (athleteId: string, name: string, staffId?: string) => void
}) {
  const aid = row.athlete_id ?? row.atleta_id ?? ''
  const isInvited = (row.assignment_status ?? '') === 'invited'
  const isActive = (row.assignment_status ?? 'active') === 'active'
  const name = row.athlete_name ?? 'Cliente'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation"
          aria-label="Azioni"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/nutrizionista/atleti/${aid}`}
            className="min-h-[44px] py-3 flex items-center touch-manipulation"
          >
            <User className="mr-2 h-4 w-4" />
            Apri profilo
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/nutrizionista/atleti/${aid}?tab=piani`}
            className="min-h-[44px] py-3 flex items-center touch-manipulation"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Piani e versioni
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAddProgress(row)}
          className="min-h-[44px] py-3 touch-manipulation"
        >
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi progresso
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/nutrizionista/analisi`}
            className="min-h-[44px] py-3 flex items-center touch-manipulation"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Analisi settimanale
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => row.athlete_email && onCopyEmail(row.athlete_email)}
          className="min-h-[44px] py-3 touch-manipulation"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copia email
        </DropdownMenuItem>
        {!isInvited && (onPause != null || onActivate != null || onRemove != null) && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider">
              Stato cliente
            </div>
            {isActive ? (
              <>
                <DropdownMenuItem
                  disabled
                  className="min-h-[44px] py-3 touch-manipulation opacity-70"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Cliente attivo
                </DropdownMenuItem>
                {onPause && (
                  <DropdownMenuItem
                    onClick={() => onPause(aid, row.staff_id)}
                    className="min-h-[44px] py-3 touch-manipulation"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Disattiva (metti in pausa)
                  </DropdownMenuItem>
                )}
              </>
            ) : (
              <>
                <DropdownMenuItem
                  disabled
                  className="min-h-[44px] py-3 touch-manipulation opacity-70"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Cliente in pausa
                </DropdownMenuItem>
                {onActivate && (
                  <DropdownMenuItem
                    onClick={() => onActivate(aid, row.staff_id)}
                    className="min-h-[44px] py-3 touch-manipulation"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Attiva cliente
                  </DropdownMenuItem>
                )}
              </>
            )}
            {onRemove && (
              <DropdownMenuItem
                onClick={() => onRemove(aid, name, row.staff_id)}
                className="min-h-[44px] py-3 touch-manipulation text-red-400 focus:text-red-300 focus:bg-red-500/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina dalla lista
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

export default function NutrizionistaAtletiPage() {
  const _router = useRouter()
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const { notify } = useNotify()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<AthleteRow[]>([])
  const [clientiInvitatCount, setClientiInvitatCount] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [kpiFilter, setKpiFilter] = useState<
    'all' | 'scadenza' | 'senza_piano' | 'progressi_mancanti' | 'clienti_invitati' | null
  >(null)
  const [pendingInvites, setPendingInvites] = useState<
    Array<{
      request_id: string
      athlete_id: string
      athlete_name: string | null
      athlete_email: string | null
      created_at: string
    }>
  >([])
  const [filterPiano, setFilterPiano] = useState<'all' | 'con' | 'senza'>('all')
  const [filterScadenza, setFilterScadenza] = useState<'all' | '7' | '30' | 'scaduto'>('all')
  const [filterProgressi, setFilterProgressi] = useState<'all' | 'recenti' | 'mancanti'>('all')
  const [showInvitaCliente, setShowInvitaCliente] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [progressModalAthlete, setProgressModalAthlete] = useState<AthleteRow | null>(null)
  const [progressWeight, setProgressWeight] = useState('')
  const [progressNotes, setProgressNotes] = useState('')
  const [progressSubmitting, setProgressSubmitting] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<{
    athleteId: string
    name: string
    staffId: string
  } | null>(null)
  const [statusSubmitting, setStatusSubmitting] = useState(false)

  const debouncedSearch = useDebounce(searchInput.trim().toLowerCase(), DEBOUNCE_MS)

  const loadData = useCallback(async () => {
    if (!profileId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [athletesRes, invitesRes, invitiClienteRes] = await Promise.all([
        nutritionFrom(supabase, NUTRITION_TABLES.viewAthletes).select('*'),
        supabase
          .from('staff_requests')
          .select('id, athlete_id, created_at')
          .eq('staff_id', profileId)
          .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
          .eq('status', 'pending'),
        supabase.rpc('get_inviti_cliente_pendenti_staff'),
      ])
      if (invitesRes.error) {
        logger.warn('staff_requests inviti nutrizionista', invitesRes.error)
      }
      if (invitiClienteRes.error) {
        logger.warn('get_inviti_cliente_pendenti_staff', invitiClienteRes.error)
      }
      if (invitesRes.error || invitiClienteRes.error) {
        notify(
          'Parte degli inviti non è stata caricata. Controlla la connessione e riprova.',
          'warning',
          'Inviti',
        )
      }
      const inviteRows = (invitesRes.error ? [] : (invitesRes.data ?? [])) as Array<{
        id: string
        athlete_id: string
        created_at: string
      }>
      const fromRequests: Array<{
        request_id: string
        athlete_id: string
        athlete_name: string | null
        athlete_email: string | null
        created_at: string
      }> = []
      if (inviteRows.length > 0) {
        const inviteProfileRows: Array<{
          id: string
          nome: string | null
          cognome: string | null
          email: string | null
        }> = []
        for (const idChunk of chunkForSupabaseIn(inviteRows.map((r) => r.athlete_id))) {
          const { data: inviteProfiles, error: inviteProfErr } = await supabase
            .from('profiles')
            .select('id, nome, cognome, email')
            .in('id', idChunk)
          if (inviteProfErr) {
            logger.warn('Profili inviti staff_requests', inviteProfErr)
            notify(
              'Impossibile caricare i dati anagrafici per alcuni inviti.',
              'warning',
              'Inviti',
            )
            break
          }
          inviteProfileRows.push(
            ...((inviteProfiles ?? []) as (typeof inviteProfileRows)[number][]),
          )
        }
        const profileMap = new Map(
          inviteProfileRows.map(
            (p: {
              id: string
              nome: string | null
              cognome: string | null
              email: string | null
            }) => [
              p.id,
              {
                name: [p.nome, p.cognome].filter(Boolean).join(' ') || null,
                email: p.email ?? null,
              },
            ],
          ),
        )
        inviteRows.forEach((r) => {
          const prof = profileMap.get(r.athlete_id)
          fromRequests.push({
            request_id: r.id,
            athlete_id: r.athlete_id,
            athlete_name: prof?.name ?? null,
            athlete_email: prof?.email ?? null,
            created_at: r.created_at,
          })
        })
      }
      const fromInvitiCliente = (invitiClienteRes.error
        ? []
        : (invitiClienteRes.data ?? [])) as Array<{
        invito_id: string
        atleta_id: string
        nome: string | null
        cognome: string | null
        email: string | null
        created_at: string | null
      }>
      const seenAthleteIds = new Set(fromRequests.map((r) => r.athlete_id))
      fromInvitiCliente.forEach((r) => {
        if (seenAthleteIds.has(r.atleta_id)) return
        seenAthleteIds.add(r.atleta_id)
        fromRequests.push({
          request_id: r.invito_id,
          athlete_id: r.atleta_id,
          athlete_name: [r.nome, r.cognome].filter(Boolean).join(' ') || null,
          athlete_email: r.email ?? null,
          created_at: r.created_at ?? new Date().toISOString(),
        })
      })
      setClientiInvitatCount(fromRequests.length)
      setPendingInvites(fromRequests)

      const { data, error: err } = athletesRes
      if (err) {
        logger.error('v_nutritionist_athletes fallback', err)
        const { data: staffData, error: staffErr } = await supabase
          .from('staff_atleti')
          .select('atleta_id')
          .eq('staff_id', profileId)
          .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
          .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
        if (staffErr || !staffData?.length) {
          setRows([])
          setLoading(false)
          return
        }
        const ids = staffData.map((r) => (r as { atleta_id: string }).atleta_id)
        const profiles: Array<{
          id: string
          nome: string | null
          cognome: string | null
          email: string | null
        }> = []
        for (const idChunk of chunkForSupabaseIn(ids)) {
          const { data: profilesData, error: profilesErr } = await supabase
            .from('profiles')
            .select('id, nome, cognome, email')
            .in('id', idChunk)
          if (profilesErr) {
            logger.error('Fallback clienti: profili', profilesErr)
            setRows([])
            setLoading(false)
            return
          }
          profiles.push(...((profilesData ?? []) as (typeof profiles)[number][]))
        }
        setRows(
          profiles.map((p) => ({
            staff_id: profileId,
            athlete_id: p.id,
            athlete_name: [p.nome, p.cognome].filter(Boolean).join(' ') || null,
            athlete_email: p.email ?? null,
            assignment_status: 'active' as const,
          })),
        )
      } else {
        const raw = (data ?? []) as AthleteRow[]
        const filtered = raw.filter((r) => r.staff_id === profileId)
        setRows(filtered)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento clienti')
    } finally {
      setLoading(false)
    }
  }, [profileId, supabase, notify])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => setToday(new Date())
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refresh()
      }
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility)
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility)
      }
    }
  }, [])

  const todayStr = today.toISOString().slice(0, 10)
  const in7 = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 7)
    return d.toISOString().slice(0, 10)
  }, [today])
  const in30 = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  }, [today])
  const days14Ago = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() - 14)
    return d.toISOString()
  }, [today])
  const days7Ago = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() - 7)
    return d.toISOString()
  }, [today])

  const kpiCounts = useMemo(() => {
    const atletiAttivi = rows.length
    const pianiInScadenza = rows.filter(
      (r) => r.review_date && r.review_date <= in7 && r.active_plan_version != null,
    ).length
    const senzaPiano = rows.filter((r) => r.active_plan_version == null).length
    const progressiMancanti = rows.filter(
      (r) => !r.last_progress_at || new Date(r.last_progress_at).toISOString() < days14Ago,
    ).length
    return {
      atletiAttivi,
      pianiInScadenza,
      senzaPiano,
      progressiMancanti,
      clientiInvitat: clientiInvitatCount,
    }
  }, [rows, in7, days14Ago, clientiInvitatCount])

  const filteredAndSorted = useMemo(() => {
    let list = rows

    if (debouncedSearch) {
      list = list.filter(
        (r) =>
          (r.athlete_name ?? '').toLowerCase().includes(debouncedSearch) ||
          (r.athlete_email ?? '').toLowerCase().includes(debouncedSearch),
      )
    }

    if (kpiFilter === 'scadenza') {
      list = list.filter(
        (r) => r.review_date && r.review_date <= in7 && r.active_plan_version != null,
      )
    } else if (kpiFilter === 'senza_piano') {
      list = list.filter((r) => r.active_plan_version == null)
    } else if (kpiFilter === 'progressi_mancanti') {
      list = list.filter(
        (r) => !r.last_progress_at || new Date(r.last_progress_at).toISOString() < days14Ago,
      )
    }

    if (filterPiano === 'con') list = list.filter((r) => r.active_plan_version != null)
    if (filterPiano === 'senza') list = list.filter((r) => r.active_plan_version == null)

    if (filterScadenza === '7') {
      list = list.filter((r) => r.review_date && r.review_date >= todayStr && r.review_date <= in7)
    } else if (filterScadenza === '30') {
      list = list.filter((r) => r.review_date && r.review_date >= todayStr && r.review_date <= in30)
    } else if (filterScadenza === 'scaduto') {
      list = list.filter((r) => r.review_date && r.review_date < todayStr)
    }

    if (filterProgressi === 'recenti') {
      list = list.filter(
        (r) => r.last_progress_at && new Date(r.last_progress_at).toISOString() >= days7Ago,
      )
    } else if (filterProgressi === 'mancanti') {
      list = list.filter(
        (r) => !r.last_progress_at || new Date(r.last_progress_at).toISOString() < days14Ago,
      )
    }

    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'nome') {
        return (a.athlete_name ?? '').localeCompare(b.athlete_name ?? '')
      }
      if (sortBy === 'scadenza') {
        const da = a.review_date ?? '9999-99-99'
        const db = b.review_date ?? '9999-99-99'
        return da.localeCompare(db)
      }
      if (sortBy === 'progresso') {
        const pa = a.last_progress_at ?? ''
        const pb = b.last_progress_at ?? ''
        return pb.localeCompare(pa)
      }
      const ua = a.last_progress_at ?? a.review_date ?? ''
      const ub = b.last_progress_at ?? b.review_date ?? ''
      return ub.localeCompare(ua)
    })
    return sorted
  }, [
    rows,
    debouncedSearch,
    kpiFilter,
    filterPiano,
    filterScadenza,
    filterProgressi,
    sortBy,
    in7,
    in30,
    todayStr,
    days14Ago,
    days7Ago,
  ])

  const pendingInvitesFiltered = useMemo(() => {
    if (kpiFilter !== 'clienti_invitati') return []
    if (!debouncedSearch) return pendingInvites
    return pendingInvites.filter(
      (r) =>
        (r.athlete_name ?? '').toLowerCase().includes(debouncedSearch) ||
        (r.athlete_email ?? '').toLowerCase().includes(debouncedSearch),
    )
  }, [kpiFilter, pendingInvites, debouncedSearch])

  const displayRows = useMemo((): AthleteRow[] => {
    if (kpiFilter === 'clienti_invitati') {
      return pendingInvitesFiltered.map((r) => ({
        athlete_id: r.athlete_id,
        athlete_name: r.athlete_name,
        athlete_email: r.athlete_email,
        assignment_status: 'invited' as const,
      }))
    }
    return filteredAndSorted
  }, [kpiFilter, pendingInvitesFiltered, filteredAndSorted])

  const hasActiveFilters =
    kpiFilter ||
    filterPiano !== 'all' ||
    filterScadenza !== 'all' ||
    filterProgressi !== 'all' ||
    debouncedSearch

  const clearFilters = useCallback(() => {
    setKpiFilter(null)
    setFilterPiano('all')
    setFilterScadenza('all')
    setFilterProgressi('all')
    setSearchInput('')
  }, [])

  const handleCopyEmail = useCallback((email: string) => {
    navigator.clipboard.writeText(email).catch(() => {})
  }, [])

  const handlePause = useCallback(
    async (athleteId: string, staffId?: string) => {
      const staffIdToUse = staffId ?? profileId
      if (!staffIdToUse) return
      setStatusSubmitting(true)
      try {
        const { error } = await supabase
          .from('staff_atleti')
          .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
          .eq('staff_id', staffIdToUse)
          .eq('atleta_id', athleteId)
          .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
        if (error) throw error
        await loadData()
      } catch (e) {
        logger.error('Errore metti in pausa', e)
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === 'object' && e != null && 'message' in e
              ? String((e as { message: unknown }).message)
              : 'Impossibile mettere in pausa il cliente.'
        notify(msg, 'error', 'Errore')
      } finally {
        setStatusSubmitting(false)
      }
    },
    [profileId, supabase, loadData, notify],
  )

  const handleActivate = useCallback(
    async (athleteId: string, staffId?: string) => {
      const staffIdToUse = staffId ?? profileId
      if (!staffIdToUse) return
      setStatusSubmitting(true)
      try {
        const { error } = await supabase
          .from('staff_atleti')
          .update({ status: STAFF_ASSIGNMENT_STATUS_ACTIVE, deactivated_at: null })
          .eq('staff_id', staffIdToUse)
          .eq('atleta_id', athleteId)
          .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
        if (error) throw error
        await loadData()
      } catch (e) {
        logger.error('Errore attiva cliente', e)
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === 'object' && e != null && 'message' in e
              ? String((e as { message: unknown }).message)
              : 'Impossibile riattivare il cliente.'
        notify(msg, 'error', 'Errore')
      } finally {
        setStatusSubmitting(false)
      }
    },
    [profileId, supabase, loadData, notify],
  )

  const handleRemove = useCallback(
    (athleteId: string, name: string, staffId?: string) => {
      setRemoveConfirm({ athleteId, name, staffId: staffId ?? profileId ?? '' })
    },
    [profileId],
  )

  const confirmRemove = useCallback(async () => {
    if (!removeConfirm) return
    const staffIdToUse = removeConfirm.staffId || profileId
    if (!staffIdToUse) return
    setStatusSubmitting(true)
    try {
      const { data: deleted, error } = await supabase
        .from('staff_atleti')
        .delete()
        .eq('staff_id', staffIdToUse)
        .eq('atleta_id', removeConfirm.athleteId)
        .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
        .select('id')
      if (error) throw error
      if (!deleted || deleted.length === 0) {
        notify(
          "Nessuna assegnazione trovata da rimuovere. Riprova o contatta l'assistenza.",
          'error',
          'Errore eliminazione',
        )
        return
      }
      setRemoveConfirm(null)
      await loadData()
    } catch (e) {
      logger.error('Errore elimina dalla lista', e)
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e != null && 'message' in e
            ? String((e as { message: unknown }).message)
            : 'Impossibile rimuovere il cliente dalla lista.'
      notify(msg, 'error', 'Errore eliminazione')
    } finally {
      setStatusSubmitting(false)
    }
  }, [removeConfirm, profileId, supabase, loadData, notify])

  const handleAddProgressSubmit = useCallback(async () => {
    if (!progressModalAthlete || !profileId) return
    const aid = progressModalAthlete.athlete_id ?? progressModalAthlete.atleta_id
    if (!aid) return
    setProgressSubmitting(true)
    try {
      const { error: err } = await nutritionFrom(supabase, NUTRITION_TABLES.progress).insert({
        athlete_id: aid,
        weight_kg: progressWeight ? Number(progressWeight) : null,
        notes: progressNotes || null,
      } as Record<string, unknown>)
      if (err) throw err
      setProgressModalAthlete(null)
      setProgressWeight('')
      setProgressNotes('')
      void loadData()
    } catch (e) {
      logger.error('Insert nutrition_progress', e)
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e != null && 'message' in e
            ? String((e as { message: unknown }).message)
            : 'Impossibile salvare il progresso.'
      notify(msg, 'error', 'Errore')
    } finally {
      setProgressSubmitting(false)
    }
  }, [progressModalAthlete, profileId, progressWeight, progressNotes, supabase, loadData, notify])

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout
      title="Clienti"
      description="Clienti assegnati: piani, progressi e analisi."
      theme="teal"
      className="overflow-y-auto min-h-0"
      actions={
        <>
          <Button
            variant="default"
            size="sm"
            className="bg-teal-600 hover:bg-teal-500 text-white min-h-[44px] touch-manipulation"
            onClick={() => setShowInvitaCliente(true)}
          >
            <UserRoundPlus className="mr-1.5 h-4 w-4" />
            Invita Cliente
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden min-h-[44px] touch-manipulation"
            onClick={() => setFiltersOpen(true)}
            aria-label="Filtri"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </>
      }
    >
      {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between gap-2 flex-wrap">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] touch-manipulation"
              onClick={() => void loadData()}
            >
              Riprova
            </Button>
          </div>
        )}

        {/* KPI Bar */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <KpiCard
              label="Clienti attivi"
              value={kpiCounts.atletiAttivi}
              active={kpiFilter === null && !hasActiveFilters}
              onClick={() => setKpiFilter(null)}
              icon={Users}
            />
            <KpiCard
              label="Clienti invitati"
              value={kpiCounts.clientiInvitat}
              active={kpiFilter === 'clienti_invitati'}
              onClick={() => setKpiFilter('clienti_invitati')}
              icon={UserRoundPlus}
            />
            <KpiCard
              label="Piani in scadenza (7 gg)"
              value={kpiCounts.pianiInScadenza}
              active={kpiFilter === 'scadenza'}
              onClick={() => setKpiFilter('scadenza')}
              icon={CalendarClock}
            />
            <KpiCard
              label="Senza piano attivo"
              value={kpiCounts.senzaPiano}
              active={kpiFilter === 'senza_piano'}
              onClick={() => setKpiFilter('senza_piano')}
              icon={ClipboardList}
            />
            <KpiCard
              label="Progressi mancanti (14 gg)"
              value={kpiCounts.progressiMancanti}
              active={kpiFilter === 'progressi_mancanti'}
              onClick={() => setKpiFilter('progressi_mancanti')}
              icon={TrendingUp}
            />
          </div>
        )}

        {/* Search + Sort + Filters (desktop) */}
        <div className="flex flex-col sm:flex-row gap-x-4 gap-y-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Cerca cliente per nome o email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-full min-h-[44px] touch-manipulation"
              aria-label="Cerca cliente"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="clienti-sort" className="sr-only">
              Ordina per
            </label>
            <select
              id="clienti-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="min-h-[44px] rounded-lg bg-background-secondary border border-border text-sm text-text-primary px-4 min-w-[180px] touch-manipulation"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background-secondary/50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2.5 min-h-[44px] touch-manipulation transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-text-secondary hover:bg-white/5'
                }`}
                aria-label="Vista a griglia"
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2.5 min-h-[44px] touch-manipulation transition-colors ${
                  viewMode === 'table'
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'text-text-secondary hover:bg-white/5'
                }`}
                aria-label="Vista a lista"
                aria-pressed={viewMode === 'table'}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex min-h-[44px] touch-manipulation"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="mr-1.5 h-4 w-4" />
              Filtri
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] touch-manipulation"
                onClick={clearFilters}
              >
                <X className="mr-1 h-4 w-4" />
                Rimuovi filtri
              </Button>
            )}
          </div>
        </div>

        {/* Filters Drawer */}
        <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} side="right" size="md">
          <DrawerContent
            className="bg-background border-l border-border"
            onClose={() => setFiltersOpen(false)}
          >
            <DrawerHeader className="border-b border-border p-5 flex items-center justify-between">
              <span className="font-semibold">Filtri</span>
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] touch-manipulation"
                onClick={() => setFiltersOpen(false)}
                aria-label="Chiudi"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerHeader>
            <DrawerBody className="p-5 space-y-6">
              <div>
                <Label className="text-text-secondary text-xs uppercase tracking-wider">
                  Piano
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['all', 'con', 'senza'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFilterPiano(v)}
                      className={`rounded-full px-4 py-3 text-sm min-h-[44px] touch-manipulation ${
                        filterPiano === v
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'bg-background-secondary text-text-muted border border-border'
                      }`}
                    >
                      {v === 'all' ? 'Tutti' : v === 'con' ? 'Con piano' : 'Senza piano'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-text-secondary text-xs uppercase tracking-wider">
                  Scadenza piano
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['all', '7', '30', 'scaduto'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFilterScadenza(v)}
                      className={`rounded-full px-4 py-3 text-sm min-h-[44px] touch-manipulation ${
                        filterScadenza === v
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'bg-background-secondary text-text-muted border border-border'
                      }`}
                    >
                      {v === 'all'
                        ? 'Tutti'
                        : v === '7'
                          ? 'Scade entro 7 gg'
                          : v === '30'
                            ? 'Scade entro 30 gg'
                            : 'Scaduto'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-text-secondary text-xs uppercase tracking-wider">
                  Progressi
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['all', 'recenti', 'mancanti'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFilterProgressi(v)}
                      className={`rounded-full px-4 py-3 text-sm min-h-[44px] touch-manipulation ${
                        filterProgressi === v
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                          : 'bg-background-secondary text-text-muted border border-border'
                      }`}
                    >
                      {v === 'all'
                        ? 'Tutti'
                        : v === 'recenti'
                          ? 'Ultimi 7 gg'
                          : 'Nessuno da 14+ gg'}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full min-h-[44px] touch-manipulation"
                onClick={clearFilters}
              >
                Azzera filtri
              </Button>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Content */}
        {loading ? null : rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 px-5 py-10 text-center flex flex-col items-center gap-4">
            <Users className="h-12 w-12 text-text-muted shrink-0" aria-hidden />
            <p className="text-text-primary font-medium">Nessun cliente assegnato</p>
            <p className="text-text-secondary text-sm max-w-[65ch]">
              Le assegnazioni vengono gestite da Admin o Trainer. Chiedi l’assegnazione dei clienti
              all’organizzazione.
            </p>
            <Link href="/dashboard/nutrizionista">
              <Button variant="outline" size="sm" className="min-h-[44px] touch-manipulation mt-2">
                Torna alla Dashboard
              </Button>
            </Link>
          </div>
        ) : displayRows.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-secondary/50 px-5 py-10 text-center flex flex-col items-center gap-4">
            <Search className="h-12 w-12 text-text-muted shrink-0" aria-hidden />
            <p className="text-text-primary font-medium">Nessun risultato</p>
            <p className="text-text-secondary text-sm max-w-[65ch]">
              {kpiFilter === 'clienti_invitati'
                ? 'Nessun invito in attesa corrisponde alla ricerca.'
                : 'Nessun cliente corrisponde ai filtri selezionati. Prova a rimuovere alcuni filtri o a cambiare la ricerca.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] touch-manipulation"
              onClick={clearFilters}
            >
              Rimuovi filtri
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayRows.map((r) => {
                  const aid = r.athlete_id ?? r.atleta_id ?? ''
                  const isInvited = (r.assignment_status ?? '') === 'invited'
                  const reviewDate = r.review_date
                  const isScaduto = reviewDate && reviewDate < todayStr
                  const scadeIn7 = reviewDate && reviewDate >= todayStr && reviewDate <= in7
                  const progressLabel = r.last_progress_at
                    ? `${Math.floor((Date.now() - new Date(r.last_progress_at).getTime()) / (24 * 60 * 60 * 1000))} giorni fa`
                    : 'Mai'
                  return (
                    <div
                      key={aid}
                      className="rounded-xl border border-border bg-background-secondary/80 p-5 flex flex-col gap-4 min-h-[7.5rem] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-white/5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-medium text-sm shrink-0">
                            {(r.athlete_name ?? '?').slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary truncate">
                              {r.athlete_name ?? aid.slice(0, 8)}
                            </p>
                            <p className="text-text-muted text-xs truncate">
                              {r.athlete_email ?? '—'}
                            </p>
                          </div>
                        </div>
                        {!isInvited && (
                          <AthleteRowActions
                            row={r}
                            onAddProgress={setProgressModalAthlete}
                            onCopyEmail={handleCopyEmail}
                            onPause={handlePause}
                            onActivate={handleActivate}
                            onRemove={handleRemove}
                          />
                        )}
                        {isInvited && (
                          <span className="rounded-full px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 shrink-0">
                            In attesa
                          </span>
                        )}
                      </div>
                      {!isInvited && (
                        <>
                          <div className="flex flex-wrap gap-2 text-xs tabular-nums">
                            {r.active_plan_version != null && (
                              <span className="rounded-full px-2 py-0.5 bg-teal-500/20 text-teal-400">
                                v{r.active_plan_version} • attivo
                              </span>
                            )}
                            {reviewDate && (
                              <span
                                className={
                                  isScaduto
                                    ? 'text-red-400'
                                    : scadeIn7
                                      ? 'text-amber-400'
                                      : 'text-text-muted'
                                }
                              >
                                {isScaduto ? 'Scaduto' : scadeIn7 ? 'Scade tra poco' : 'Scadenza: '}
                                {new Date(reviewDate).toLocaleDateString('it-IT', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                            )}
                            <span className="text-text-muted">Progresso: {progressLabel}</span>
                          </div>
                          <div className="flex gap-2 mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 min-h-[44px] touch-manipulation"
                              asChild
                            >
                              <Link href={`/dashboard/nutrizionista/atleti/${aid}`}>Apri</Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="min-h-[44px] touch-manipulation"
                              onClick={() => setProgressModalAthlete(r)}
                            >
                              <Plus className="h-4 w-4" />
                              Progresso
                            </Button>
                          </div>
                        </>
                      )}
                      {isInvited && (
                        <p className="text-text-muted text-sm">
                          In attesa di accettazione dell&apos;invito
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-xl border border-border overflow-hidden bg-background-secondary/30 ring-1 ring-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-background-tertiary/50 border-b border-border sticky top-0 z-10">
                        <tr className="text-left text-text-secondary">
                          <th className="p-4 font-medium">Cliente</th>
                          <th className="p-4 font-medium">Contatti</th>
                          <th className="p-4 font-medium">Stato</th>
                          <th className="p-4 font-medium">Piano</th>
                          <th className="p-4 font-medium">Scadenza</th>
                          <th className="p-4 font-medium">Ultimo progresso</th>
                          <th className="p-4 font-medium w-24">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayRows.map((r) => {
                          const aid = r.athlete_id ?? r.atleta_id ?? ''
                          const isInvited = (r.assignment_status ?? '') === 'invited'
                          const reviewDate = r.review_date
                          const isScaduto = reviewDate && reviewDate < todayStr
                          const scadeIn7 = reviewDate && reviewDate >= todayStr && reviewDate <= in7
                          return (
                            <tr
                              key={aid}
                              className="border-b border-border/50 hover:bg-background-tertiary/30 min-h-[44px]"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-9 w-9 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-medium text-sm shrink-0">
                                    {(r.athlete_name ?? '?').slice(0, 1).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-text-primary">
                                    {r.athlete_name ?? (
                                      <span className="font-mono text-xs text-text-muted">
                                        {aid.slice(0, 8)}…
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <a
                                  href={`mailto:${r.athlete_email ?? ''}`}
                                  className="text-teal-400 hover:text-teal-300 hover:underline inline-flex items-center gap-1 break-all focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 rounded"
                                >
                                  <Mail className="h-3.5 w-3.5 shrink-0" />
                                  {r.athlete_email ?? '—'}
                                </a>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs ${
                                    isInvited
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : (r.assignment_status ?? 'active') === 'active'
                                        ? 'bg-teal-500/20 text-teal-400'
                                        : 'bg-amber-500/20 text-amber-400'
                                  }`}
                                >
                                  {isInvited
                                    ? 'In attesa'
                                    : (r.assignment_status ?? 'active') === 'active'
                                      ? 'Attivo'
                                      : 'In pausa'}
                                </span>
                              </td>
                              <td className="p-4 text-text-muted">
                                {r.active_plan_version != null ? (
                                  <span className="rounded-full px-2 py-0.5 text-xs bg-teal-500/20 text-teal-400">
                                    v{r.active_plan_version} • attivo
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="p-4 tabular-nums">
                                {reviewDate ? (
                                  <span
                                    className={
                                      isScaduto
                                        ? 'text-red-400'
                                        : scadeIn7
                                          ? 'text-amber-400'
                                          : 'text-text-muted'
                                    }
                                  >
                                    {new Date(reviewDate).toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="p-4 text-text-muted tabular-nums">
                                {r.last_progress_at
                                  ? new Date(r.last_progress_at).toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '—'}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  {!isInvited && (
                                    <Link
                                      href={`/dashboard/nutrizionista/atleti/${aid}`}
                                      className="text-teal-400 hover:text-teal-300 text-sm font-medium inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 rounded"
                                    >
                                      Apri
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                  )}
                                  {isInvited ? (
                                    <span className="text-text-muted text-sm">
                                      In attesa accettazione
                                    </span>
                                  ) : (
                                    <AthleteRowActions
                                      row={r}
                                      onAddProgress={setProgressModalAthlete}
                                      onCopyEmail={handleCopyEmail}
                                      onPause={handlePause}
                                      onActivate={handleActivate}
                                      onRemove={handleRemove}
                                    />
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {displayRows.map((r) => {
                    const aid = r.athlete_id ?? r.atleta_id ?? ''
                    const isInvited = (r.assignment_status ?? '') === 'invited'
                    const reviewDate = r.review_date
                    const isScaduto = reviewDate && reviewDate < todayStr
                    const scadeIn7 = reviewDate && reviewDate >= todayStr && reviewDate <= in7
                    const progressLabel = r.last_progress_at
                      ? `${Math.floor((Date.now() - new Date(r.last_progress_at).getTime()) / (24 * 60 * 60 * 1000))} giorni fa`
                      : 'Mai'
                    return (
                      <div
                        key={aid}
                        className="rounded-xl border border-border bg-background-secondary/80 p-5 flex flex-col gap-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-white/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-medium text-sm shrink-0">
                              {(r.athlete_name ?? '?').slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-text-primary truncate">
                                {r.athlete_name ?? aid.slice(0, 8)}
                              </p>
                              <p className="text-text-muted text-xs truncate">
                                {r.athlete_email ?? '—'}
                              </p>
                            </div>
                          </div>
                          {!isInvited && (
                            <AthleteRowActions
                              row={r}
                              onAddProgress={setProgressModalAthlete}
                              onCopyEmail={handleCopyEmail}
                              onPause={handlePause}
                              onActivate={handleActivate}
                              onRemove={handleRemove}
                            />
                          )}
                          {isInvited && (
                            <span className="rounded-full px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 shrink-0">
                              In attesa
                            </span>
                          )}
                        </div>
                        {!isInvited && (
                          <>
                            <div className="flex flex-wrap gap-2 text-xs tabular-nums">
                              {r.active_plan_version != null && (
                                <span className="rounded-full px-2 py-0.5 bg-teal-500/20 text-teal-400">
                                  v{r.active_plan_version} • attivo
                                </span>
                              )}
                              {reviewDate && (
                                <span
                                  className={
                                    isScaduto
                                      ? 'text-red-400'
                                      : scadeIn7
                                        ? 'text-amber-400'
                                        : 'text-text-muted'
                                  }
                                >
                                  {isScaduto
                                    ? 'Scaduto'
                                    : scadeIn7
                                      ? 'Scade tra poco'
                                      : 'Scadenza: '}
                                  {new Date(reviewDate).toLocaleDateString('it-IT', {
                                    day: '2-digit',
                                    month: 'short',
                                  })}
                                </span>
                              )}
                              <span className="text-text-muted">Progresso: {progressLabel}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 min-h-[44px] touch-manipulation"
                                asChild
                              >
                                <Link href={`/dashboard/nutrizionista/atleti/${aid}`}>Apri</Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="min-h-[44px] touch-manipulation"
                                onClick={() => setProgressModalAthlete(r)}
                              >
                                <Plus className="h-4 w-4" />
                                Progresso
                              </Button>
                            </div>
                          </>
                        )}
                        {isInvited && (
                          <p className="text-text-muted text-sm">
                            In attesa di accettazione dell’invito
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

      {/* Quick Add Progress Modal */}
      <Dialog
        open={!!progressModalAthlete}
        onOpenChange={(open) => !open && setProgressModalAthlete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi progresso</DialogTitle>
          </DialogHeader>
          {progressModalAthlete && (
            <p className="text-text-secondary text-sm">
              Atleta:{' '}
              {progressModalAthlete.athlete_name ?? progressModalAthlete.athlete_id?.slice(0, 8)}
            </p>
          )}
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="progress-weight">Peso (kg)</Label>
              <Input
                id="progress-weight"
                type="number"
                step="0.1"
                min="0"
                placeholder="opzionale"
                value={progressWeight}
                onChange={(e) => setProgressWeight(e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="progress-notes">Note</Label>
              <Input
                id="progress-notes"
                type="text"
                placeholder="opzionale"
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                className="mt-1 min-h-[44px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressModalAthlete(null)}>
              Annulla
            </Button>
            <Button onClick={() => void handleAddProgressSubmit()} disabled={progressSubmitting}>
              {progressSubmitting ? 'Salvataggio…' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeConfirm} onOpenChange={(open) => !open && setRemoveConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Elimina dalla lista</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary text-sm py-2">
            Rimuovere <strong>{removeConfirm?.name}</strong> dalla tua lista clienti? Non potrà più
            vedere piani e progressi condivisi. L&apos;azione è reversibile solo con una nuova
            richiesta di collegamento.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveConfirm(null)}
              className="min-h-[44px] touch-manipulation"
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmRemove()}
              disabled={statusSubmitting}
              className="min-h-[44px] touch-manipulation"
            >
              {statusSubmitting ? 'Eliminazione…' : 'Elimina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showInvitaCliente && (
        <InvitaClienteModal
          open={showInvitaCliente}
          onOpenChange={setShowInvitaCliente}
          onSuccess={() => {
            setShowInvitaCliente(false)
            void loadData()
          }}
        />
      )}
    </StaffContentLayout>
  )
}
