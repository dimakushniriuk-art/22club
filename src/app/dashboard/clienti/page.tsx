'use client'

import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense, memo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { ErrorState } from '@/components/dashboard/error-state'
import { ClientiToolbar } from '@/components/dashboard/clienti/clienti-toolbar'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { ClientiHeaderActions } from '@/components/dashboard/clienti/clienti-header-actions'
import { ClientiTableView } from '@/components/dashboard/clienti/clienti-table-view'
import { ClientiGridView } from '@/components/dashboard/clienti/clienti-grid-view'
import { ClientiEmptyState } from '@/components/dashboard/clienti/clienti-empty-state'
import { useClienti } from '@/hooks/use-clienti'
import { useClientiPermissions } from '@/hooks/use-clienti-permissions'
import { useClientiFilters } from '@/hooks/use-clienti-filters'
import { useClientiPageGuard } from '@/hooks/use-clienti-page-guard'
import { useClientiSelection } from '@/hooks/use-clienti-selection'
import { useLessonUsageByAthleteIds } from '@/hooks/use-lesson-usage-by-athlete-ids'
import { useInvitiClientePendentiStaff } from '@/hooks/use-inviti-cliente'
import { exportToCSV, exportToPDF, formatClientiForExport } from '@/lib/export-utils'
import { useNotify } from '@/lib/ui/notify'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { UserPlus, Users, UserCheck, UserRoundPlus } from 'lucide-react'
import type { ClienteFilters, Cliente, ClienteStats } from '@/types/cliente'

const logger = createLogger('app:dashboard:clienti:page')

// Lazy load dei componenti pesanti/modali
const ClientiFiltriAvanzati = lazy(() =>
  import('@/components/dashboard/clienti-filtri-avanzati').then((mod) => ({
    default: mod.ClientiFiltriAvanzati,
  })),
)
const ClientiBulkActions = lazy(() =>
  import('@/components/dashboard/clienti-bulk-actions').then((mod) => ({
    default: mod.ClientiBulkActions,
  })),
)
const CreaAtletaModal = lazy(() =>
  import('@/components/dashboard/crea-atleta-modal').then((mod) => ({
    default: mod.CreaAtletaModal,
  })),
)
const ModificaAtletaModal = lazy(() =>
  import('@/components/dashboard/modifica-atleta-modal').then((mod) => ({
    default: mod.ModificaAtletaModal,
  })),
)
const InvitaClienteModal = lazy(() =>
  import('@/components/dashboard/invita-cliente-modal').then((mod) => ({
    default: mod.InvitaClienteModal,
  })),
)

const STATS_CARD_CLASS =
  'flex min-h-[70px] flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20'

const STATS_CARDS: Array<{
  key: keyof ClienteStats | 'pendenti'
  title: string
  icon: typeof Users
  iconBoxClass: string
}> = [
  {
    key: 'totali',
    title: 'Clienti Totali',
    icon: Users,
    iconBoxClass: 'border-teal-500/30 bg-teal-500/20 text-teal-400',
  },
  {
    key: 'attivi',
    title: 'Clienti Attivi',
    icon: UserCheck,
    iconBoxClass: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
  },
  {
    key: 'nuovi_mese',
    title: 'Nuovi Questo Mese',
    icon: UserPlus,
    iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
  },
  {
    key: 'pendenti',
    title: 'Clienti invitati',
    icon: UserRoundPlus,
    iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
  },
]

const ClientiStatsCards = memo(function ClientiStatsCards({
  displayStats,
  pendentiCount,
}: {
  displayStats: ClienteStats
  pendentiCount: number
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-2">
      {STATS_CARDS.map(({ key, title, icon: Icon, iconBoxClass }) => {
        const value = key === 'pendenti' ? pendentiCount : displayStats[key]
        return (
          <div key={key} className={STATS_CARD_CLASS} aria-label={`${title}: ${value}`}>
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                iconBoxClass,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="mt-2 block text-sm font-semibold text-text-primary">{value}</span>
            <span className="text-[9px] text-text-secondary">{title}</span>
          </div>
        )
      })}
    </div>
  )
})

const _CLIENTI_LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

export default function ClientiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { notify } = useNotify()
  const { user, role } = useAuth()
  const { showLoader: showGuardLoader } = useClientiPageGuard()
  const permissions = useClientiPermissions(role)
  const { canAddOrInvite, canInvitaCliente, canManageClienti, canShowStartChat } = permissions

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [showFiltriAvanzati, setShowFiltriAvanzati] = useState(false)
  const [showCreaAtleta, setShowCreaAtleta] = useState(false)
  const [showModificaAtleta, setShowModificaAtleta] = useState(false)
  const [atletaToEdit, setAtletaToEdit] = useState<Cliente | null>(null)
  const [showInvitaCliente, setShowInvitaCliente] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams
  const creaAtletaButtonRef = useRef<HTMLButtonElement | null>(null)

  const openCreaAtleta = useCallback(() => setShowCreaAtleta(true), [])
  const openInvitaCliente = useCallback(() => setShowInvitaCliente(true), [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 851px)')
    const handler = () => {
      setIsMobile(mq.matches)
      if (mq.matches) setViewMode((m) => (m === 'table' ? 'grid' : m))
    }
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const newParam = searchParams.get('new')
  useEffect(() => {
    if (newParam === 'true' && canAddOrInvite) setShowCreaAtleta(true)
  }, [newParam, canAddOrInvite])

  const handleCloseCreaAtleta = useCallback(
    (open: boolean) => {
      setShowCreaAtleta(open)
      if (!open) {
        const params = new URLSearchParams(searchParamsRef.current.toString())
        params.delete('new')
        const newUrl = params.toString()
          ? `/dashboard/clienti?${params.toString()}`
          : '/dashboard/clienti'
        router.replace(newUrl, { scroll: false })
        setTimeout(() => creaAtletaButtonRef.current?.focus(), 100)
      }
    },
    [router],
  )

  const handleStartChat = useCallback(
    (cliente: Cliente) => router.push(`/dashboard/chat?with=${cliente.id}`),
    [router],
  )

  // Hook per gestione filtri
  const {
    searchTerm,
    statoFilter,
    page,
    sort,
    filters,
    updateSearchTerm,
    updateStatoFilter,
    updatePage,
    handleSort,
    setAdvancedFilters,
    resetFilters,
  } = useClientiFilters()

  // Hook per fetch clienti (pageSize 250 per visualizzare più atleti per pagina)
  const { clienti, total, totalPages, loading, error, refetch, updateCliente, deleteCliente } =
    useClienti({
      filters,
      sort,
      page,
      pageSize: 250,
      realtime: false,
    })

  // Inviti in attesa per nutrizionista/massaggiatore (solo quando filtro Inattivi)
  const { pendenti, refetch: refetchPendenti } = useInvitiClientePendentiStaff(
    canInvitaCliente ? (user?.id ?? null) : null,
  )

  // Sincronizza pt_atleti da athlete_trainer_assignments (atleti registrati via invito prima del fix)
  useEffect(() => {
    const roleStr = (role ?? '') as string
    const isStaff = roleStr && roleStr !== 'athlete' && roleStr !== 'atleta'
    if (!isStaff) return
    fetch('/api/clienti/sync-pt-atleti', { method: 'POST' })
      .then((r) => {
        if (!r.ok) return
        return r.json().then((body: { synced?: number }) => {
          if (body?.synced && body.synced > 0) void refetch()
        })
      })
      .catch(() => {})
  }, [role, refetch])

  // Con filtro Inattivi, mostra anche atleti invitati ma non ancora accettati (bloccati, non interagibili)
  const pendentiAsClienti = useMemo((): Cliente[] => {
    if (!canInvitaCliente || statoFilter !== 'inattivo') return []
    return pendenti.map((p) => ({
      id: p.atleta_id,
      first_name: p.nome ?? '',
      last_name: p.cognome ?? '',
      nome: p.nome ?? undefined,
      cognome: p.cognome ?? undefined,
      email: p.email ?? '',
      phone: null,
      avatar_url: null,
      data_iscrizione: p.created_at ?? '',
      stato: 'inattivo' as const,
      allenamenti_mese: 0,
      ultimo_accesso: null,
      scheda_attiva: null,
      documenti_scadenza: false,
      note: null,
      tags: [],
      role: 'athlete',
      created_at: p.created_at ?? '',
      updated_at: p.created_at ?? '',
      invitatoInAttesa: true,
    }))
  }, [canInvitaCliente, statoFilter, pendenti])

  const displayClienti = useMemo(() => {
    if (canInvitaCliente && statoFilter === 'inattivo') return [...clienti, ...pendentiAsClienti]
    return clienti
  }, [canInvitaCliente, statoFilter, clienti, pendentiAsClienti])

  const selectableClienti = useMemo(
    () => displayClienti.filter((c) => !c.invitatoInAttesa),
    [displayClienti],
  )

  // Hook per gestione selezione - solo clienti realmente gestibili (esclusi invitati in attesa)
  const { selectedIds, selectedClienti, handleSelectAll, handleSelectOne, clearSelection } =
    useClientiSelection(selectableClienti)

  const athleteIds = useMemo(() => selectableClienti.map((c) => c.id), [selectableClienti])
  const lessonUsageMap = useLessonUsageByAthleteIds(athleteIds, 'training')

  // Stesso modello abbonamenti / profilo atleta (training).
  const clientiForGrid = useMemo(
    () =>
      displayClienti.map((c) => {
        const u = lessonUsageMap.get(c.id)
        return {
          ...c,
          lessons_remaining: u?.totalRemaining,
          lessons_acquired: u?.totalPurchased,
          lessons_used: u?.totalUsed,
        }
      }),
    [displayClienti, lessonUsageMap],
  )

  const displayStats = useMemo<ClienteStats>(() => {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const base = selectableClienti
    return {
      totali: base.length,
      attivi: base.filter((c) => c.stato === 'attivo').length,
      inattivi: base.filter((c) => c.stato === 'inattivo' || c.stato === 'sospeso').length,
      nuovi_mese: base.filter((c) => {
        const dateValue = c.data_iscrizione || c.created_at
        if (!dateValue) return false
        try {
          return new Date(dateValue) >= firstDayOfMonth
        } catch {
          return false
        }
      }).length,
      documenti_scadenza: base.filter((c) => c.documenti_scadenza === true).length,
    }
  }, [selectableClienti])

  const handleBulkEmail = useCallback(() => {
    const emails = selectedClienti.map((c) => c.email).join(',')
    window.location.href = `mailto:${emails}`
    clearSelection()
  }, [selectedClienti, clearSelection])

  const handleBulkDelete = useCallback(async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} clienti?`)) return
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteCliente(id)))
      clearSelection()
      refetch()
    } catch (err) {
      logger.error('Errore eliminazione bulk', err, { count: selectedIds.size })
      notify(
        "Si è verificato un errore durante l'eliminazione dei clienti selezionati. Riprova.",
        'error',
        'Errore eliminazione',
      )
    }
  }, [selectedIds, deleteCliente, clearSelection, refetch, notify])

  const handleExportCSV = useCallback(() => {
    setIsExporting(true)
    const data = formatClientiForExport(clienti)
    exportToCSV(data, `clienti-${new Date().toISOString().split('T')[0]}.csv`)
    setTimeout(() => setIsExporting(false), 1500)
  }, [clienti])

  const handleExportPDF = useCallback(() => {
    setIsExporting(true)
    const data = formatClientiForExport(clienti)
    exportToPDF(data, `clienti-${new Date().toISOString().split('T')[0]}.pdf`)
    setTimeout(() => setIsExporting(false), 1500)
  }, [clienti])

  const handleEdit = useCallback((cliente: Cliente) => {
    setAtletaToEdit(cliente)
    setShowModificaAtleta(true)
  }, [])

  const handleViewHistory = useCallback(
    (cliente: Cliente) => router.push(`/dashboard/atleti/${cliente.id}/storico`),
    [router],
  )

  const handleViewDocuments = useCallback(
    (cliente: Cliente) => router.push(`/dashboard/documenti?atleta=${cliente.id}`),
    [router],
  )

  const handleSendEmail = useCallback((cliente: Cliente) => {
    window.location.href = `mailto:${cliente.email}`
  }, [])

  const handleDisable = useCallback(
    async (cliente: Cliente) => {
      if (
        !confirm(
          `Disabilitare ${cliente.nome} ${cliente.cognome}? L\'atleta passerà in stato inattivo.`,
        )
      )
        return
      try {
        await updateCliente(cliente.id, { stato: 'inattivo' })
        notify(`${cliente.nome} ${cliente.cognome} disabilitato`, 'success')
      } catch (err) {
        logger.error('Errore disabilitazione cliente', err, { clienteId: cliente.id })
        notify('Errore durante la disabilitazione. Riprova.', 'error', 'Errore')
      }
    },
    [updateCliente, notify],
  )

  const handleEnable = useCallback(
    async (cliente: Cliente) => {
      try {
        await updateCliente(cliente.id, { stato: 'attivo' })
        notify(`${cliente.nome} ${cliente.cognome} riattivato`, 'success')
      } catch (err) {
        logger.error('Errore riattivazione cliente', err, { clienteId: cliente.id })
        notify('Errore durante la riattivazione. Riprova.', 'error', 'Errore')
      }
    },
    [updateCliente, notify],
  )

  const handleDelete = useCallback(
    async (cliente: Cliente) => {
      if (!confirm(`Sei sicuro di voler eliminare ${cliente.nome} ${cliente.cognome}?`)) return
      try {
        await deleteCliente(cliente.id)
        refetch()
      } catch (err) {
        logger.error('Errore eliminazione cliente', err, { clienteId: cliente.id })
        notify(
          "Si è verificato un errore durante l'eliminazione del cliente. Riprova.",
          'error',
          'Errore eliminazione',
        )
      }
    },
    [deleteCliente, refetch, notify],
  )

  const handleResetFilters = useCallback(() => {
    resetFilters()
    refetch()
  }, [resetFilters, refetch])

  const handleCreaAtletaSuccess = useCallback(() => refetch(), [refetch])
  const handleModificaAtletaSuccess = useCallback(() => {
    refetch()
    setAtletaToEdit(null)
  }, [refetch])
  const handleInvitaClienteSuccess = useCallback(() => {
    refetch()
    refetchPendenti()
  }, [refetch, refetchPendenti])

  const openFiltriAvanzati = useCallback(() => setShowFiltriAvanzati(true), [])

  if (showGuardLoader) {
    return (
      <StaffContentLayout
        title="Clienti"
        description="Gestisci i tuoi atleti e monitora i progressi"
        theme="teal"
      >
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </StaffContentLayout>
    )
  }

  if (loading && displayClienti.length === 0) {
    return (
      <StaffContentLayout
        title="Clienti"
        description="Gestisci i tuoi atleti e monitora i progressi"
        theme="teal"
      >
        {null}
      </StaffContentLayout>
    )
  }

  if (error) {
    return (
      <StaffContentLayout
        title="Clienti"
        description="Gestisci i tuoi atleti e monitora i progressi"
        theme="teal"
      >
        <ErrorState
          title="Impossibile caricare l'elenco clienti"
          message={error}
          onRetry={refetch}
        />
      </StaffContentLayout>
    )
  }

  return (
    <StaffContentLayout
      title="Clienti"
      description="Gestisci i tuoi atleti e monitora i progressi"
      theme="teal"
      actions={
        <ClientiHeaderActions
          canAddOrInvite={canAddOrInvite}
          canInvitaCliente={canInvitaCliente}
          onCreaAtleta={openCreaAtleta}
          onInvitaCliente={openInvitaCliente}
          creaAtletaButtonRef={creaAtletaButtonRef}
        />
      }
    >
      {/* Toolbar con filtri e ricerca */}
      <ClientiToolbar
        searchTerm={searchTerm}
        statoFilter={statoFilter}
        viewMode={viewMode}
        onSearchChange={updateSearchTerm}
        onStatoFilterChange={updateStatoFilter}
        onViewModeChange={setViewMode}
        onShowFiltriAvanzati={openFiltriAvanzati}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        hasClienti={displayClienti.length > 0}
        isMobile={isMobile}
        isExporting={isExporting}
      />

      {/* Announce per screen reader */}
      <div role="status" aria-live="polite" className="sr-only">
        {displayClienti.length}{' '}
        {displayClienti.length === 1 ? 'cliente trovato' : 'clienti trovati'}
      </div>

      {/* Lista Clienti */}
      {loading && clienti.length === 0 ? null : displayClienti.length === 0 && !loading ? (
        // FIX: Usa total (totale filtrato) invece di stats.totali (totale globale) per riflettere i filtri attivi
        <ClientiEmptyState
          searchTerm={searchTerm}
          statoFilter={statoFilter}
          totali={total}
          onResetFilters={handleResetFilters}
        />
      ) : viewMode === 'table' ? (
        <ClientiTableView
          clienti={displayClienti}
          selectedIds={selectedIds}
          sort={sort}
          total={total}
          page={page}
          totalPages={totalPages}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onSort={handleSort}
          onPageChange={updatePage}
          onEdit={canManageClienti ? handleEdit : undefined}
          onViewHistory={canManageClienti ? handleViewHistory : undefined}
          onViewDocuments={canManageClienti ? handleViewDocuments : undefined}
          onSendEmail={handleSendEmail}
          onStartChat={canShowStartChat ? handleStartChat : undefined}
          onDelete={canManageClienti ? handleDelete : undefined}
          onDisable={canManageClienti ? handleDisable : undefined}
          onEnable={canManageClienti ? handleEnable : undefined}
        />
      ) : (
        <ClientiGridView
          clienti={clientiForGrid}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={updatePage}
          onEdit={canManageClienti ? handleEdit : undefined}
          onViewHistory={canManageClienti ? handleViewHistory : undefined}
          onViewDocuments={canManageClienti ? handleViewDocuments : undefined}
          onSendEmail={handleSendEmail}
          onStartChat={canShowStartChat ? handleStartChat : undefined}
          onDelete={canManageClienti ? handleDelete : undefined}
          onDisable={canManageClienti ? handleDisable : undefined}
          onEnable={canManageClienti ? handleEnable : undefined}
        />
      )}

      {/* Stats: dati filtrati — spacing DS */}
      <section className="shrink-0" aria-label="Statistiche clienti">
        <ClientiStatsCards displayStats={displayStats} pendentiCount={pendenti.length} />
      </section>

      {/* Modali e Azioni Bulk - Lazy loaded */}
      <Suspense fallback={null}>
        <ClientiFiltriAvanzati
          open={showFiltriAvanzati}
          onOpenChange={setShowFiltriAvanzati}
          filters={filters as ClienteFilters}
          onApply={(newFilters) => setAdvancedFilters(newFilters)}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ClientiBulkActions
          selectedCount={selectedIds.size}
          onSendEmail={handleBulkEmail}
          onDelete={canManageClienti ? handleBulkDelete : undefined}
          onClear={clearSelection}
        />
      </Suspense>

      {showCreaAtleta && (
        <Suspense fallback={null}>
          <CreaAtletaModal
            open={showCreaAtleta}
            onOpenChange={handleCloseCreaAtleta}
            onSuccess={handleCreaAtletaSuccess}
          />
        </Suspense>
      )}

      {showModificaAtleta && atletaToEdit && (
        <Suspense fallback={null}>
          <ModificaAtletaModal
            open={showModificaAtleta}
            onOpenChange={setShowModificaAtleta}
            athlete={atletaToEdit}
            onSuccess={handleModificaAtletaSuccess}
          />
        </Suspense>
      )}

      {showInvitaCliente && (
        <Suspense fallback={null}>
          <InvitaClienteModal
            open={showInvitaCliente}
            onOpenChange={setShowInvitaCliente}
            onSuccess={handleInvitaClienteSuccess}
          />
        </Suspense>
      )}
    </StaffContentLayout>
  )
}
