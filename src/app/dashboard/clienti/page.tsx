'use client'

import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense, memo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { LoadingState } from '@/components/dashboard/loading-state'
import { SkeletonClientiList } from '@/components/shared/ui/skeleton'
import { ErrorState } from '@/components/dashboard/error-state'
import { ModernKPICard } from '@/components/dashboard/modern-kpi-card'
import { ClientiPageHeader } from '@/components/dashboard/clienti/clienti-page-header'
import { ClientiToolbar } from '@/components/dashboard/clienti/clienti-toolbar'
import { ClientiTableView } from '@/components/dashboard/clienti/clienti-table-view'
import { ClientiGridView } from '@/components/dashboard/clienti/clienti-grid-view'
import { ClientiEmptyState } from '@/components/dashboard/clienti/clienti-empty-state'
import { useClienti } from '@/hooks/use-clienti'
import { useClientiPermissions } from '@/hooks/use-clienti-permissions'
import { useClientiFilters } from '@/hooks/use-clienti-filters'
import { useClientiPageGuard } from '@/hooks/use-clienti-page-guard'
import { useClientiSelection } from '@/hooks/use-clienti-selection'
import { useLessonCounters } from '@/hooks/use-lesson-counters'
import { useLessonStatsBulk } from '@/hooks/use-lesson-stats-bulk'
import { useInvitiClientePendentiStaff } from '@/hooks/use-inviti-cliente'
import { exportToCSV, exportToPDF, formatClientiForExport } from '@/lib/export-utils'
import { useNotify } from '@/lib/ui/notify'
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

const KPI_ICON_CLASS = 'h-5 w-5'

const ClientiStatsCards = memo(function ClientiStatsCards({
  displayStats,
  pendentiCount,
}: {
  displayStats: ClienteStats
  pendentiCount: number
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <ModernKPICard
        title="Clienti Totali"
        value={displayStats.totali}
        icon={<Users className={KPI_ICON_CLASS} />}
        color="teal"
        animationDelay="100ms"
      />
      <ModernKPICard
        title="Clienti Attivi"
        value={displayStats.attivi}
        icon={<UserCheck className={KPI_ICON_CLASS} />}
        color="green"
        animationDelay="200ms"
      />
      <ModernKPICard
        title="Nuovi Questo Mese"
        value={displayStats.nuovi_mese}
        icon={<UserPlus className={KPI_ICON_CLASS} />}
        color="cyan"
        animationDelay="300ms"
      />
      <ModernKPICard
        title="Clienti invitati"
        value={pendentiCount}
        icon={<UserRoundPlus className={KPI_ICON_CLASS} />}
        color="purple"
        animationDelay="400ms"
      />
    </div>
  )
})

const CLIENTI_LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

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
        const newUrl = params.toString() ? `/dashboard/clienti?${params.toString()}` : '/dashboard/clienti'
        router.replace(newUrl, { scroll: false })
        setTimeout(() => creaAtletaButtonRef.current?.focus(), 100)
      }
    },
    [router]
  )

  const handleStartChat = useCallback(
    (cliente: Cliente) => router.push(`/dashboard/chat?with=${cliente.id}`),
    [router]
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
  const { clienti, total, totalPages, loading, error, refetch, updateCliente, deleteCliente } = useClienti({
    filters,
    sort,
    page,
    pageSize: 250,
    realtime: false,
  })

  // Inviti in attesa per nutrizionista/massaggiatore (solo quando filtro Inattivi)
  const { pendenti, refetch: refetchPendenti } = useInvitiClientePendentiStaff(
    canInvitaCliente ? user?.id ?? null : null,
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
  const rimastiMap = useLessonCounters(athleteIds)
  const lessonStatsMap = useLessonStatsBulk(athleteIds)

  // Clienti con lessons_remaining e dati abbonamento (acquistati/eseguiti) per la griglia.
  // Rimasti: da lesson_counters se presente, altrimenti calcolato come Acquistati - Eseguiti.
  const clientiForGrid = useMemo(
    () =>
      displayClienti.map((c) => {
        const stats = lessonStatsMap.get(c.id)
        const fromCounter = rimastiMap.get(c.id)
        const computedRemaining =
          stats != null ? Math.max(0, stats.acquired - stats.used) : undefined
        return {
          ...c,
          lessons_remaining: fromCounter !== undefined ? fromCounter : computedRemaining,
          lessons_acquired: stats?.acquired,
          lessons_used: stats?.used,
        }
      }),
    [displayClienti, rimastiMap, lessonStatsMap],
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
      notify('Si è verificato un errore durante l\'eliminazione dei clienti selezionati. Riprova.', 'error', 'Errore eliminazione')
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
    [router]
  )

  const handleViewDocuments = useCallback(
    (cliente: Cliente) => router.push(`/dashboard/documenti?atleta=${cliente.id}`),
    [router]
  )

  const handleSendEmail = useCallback((cliente: Cliente) => {
    window.location.href = `mailto:${cliente.email}`
  }, [])

  const handleDisable = useCallback(
    async (cliente: Cliente) => {
      if (!confirm(`Disabilitare ${cliente.nome} ${cliente.cognome}? L\'atleta passerà in stato inattivo.`)) return
      try {
        await updateCliente(cliente.id, { stato: 'inattivo' })
        notify(`${cliente.nome} ${cliente.cognome} disabilitato`, 'success')
      } catch (err) {
        logger.error('Errore disabilitazione cliente', err, { clienteId: cliente.id })
        notify('Errore durante la disabilitazione. Riprova.', 'error', 'Errore')
      }
    },
    [updateCliente, notify]
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
    [updateCliente, notify]
  )

  const handleDelete = useCallback(
    async (cliente: Cliente) => {
      if (!confirm(`Sei sicuro di voler eliminare ${cliente.nome} ${cliente.cognome}?`)) return
      try {
        await deleteCliente(cliente.id)
        refetch()
      } catch (err) {
        logger.error('Errore eliminazione cliente', err, { clienteId: cliente.id })
        notify('Si è verificato un errore durante l\'eliminazione del cliente. Riprova.', 'error', 'Errore eliminazione')
      }
    },
    [deleteCliente, refetch, notify]
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
      <div className={CLIENTI_LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Loading state - DOPO tutti gli hooks (skeleton dedicato alla lista)
  if (loading && displayClienti.length === 0) {
    return (
      <div className="h-full bg-background p-6">
        <SkeletonClientiList cards={8} className="py-4" />
      </div>
    )
  }

  // Error state - DOPO tutti gli hooks
  if (error) {
    return (
      <div className="h-full bg-background p-6">
        <ErrorState
          title="Impossibile caricare l'elenco clienti"
          message={error}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-6 sm:space-y-10 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative min-w-0">
        <ClientiPageHeader
          canAddOrInvite={canAddOrInvite}
          canInvitaCliente={canInvitaCliente}
          onCreaAtleta={openCreaAtleta}
          onInvitaCliente={openInvitaCliente}
          creaAtletaButtonRef={creaAtletaButtonRef}
        />

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
          {displayClienti.length} {displayClienti.length === 1 ? 'cliente trovato' : 'clienti trovati'}
        </div>

        {/* Lista Clienti */}
        {loading && clienti.length === 0 ? (
          <div className="relative py-4">
            <SkeletonClientiList cards={8} />
          </div>
        ) : displayClienti.length === 0 && !loading ? (
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

        {/* Stats: dati filtrati (clienti in pagina), non totali globali */}
        <section className="shrink-0 mt-6" aria-label="Statistiche clienti">
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
          <Suspense fallback={<LoadingState message="Caricamento..." />}>
            <CreaAtletaModal
              open={showCreaAtleta}
              onOpenChange={handleCloseCreaAtleta}
              onSuccess={handleCreaAtletaSuccess}
            />
          </Suspense>
        )}

        {showModificaAtleta && atletaToEdit && (
          <Suspense fallback={<LoadingState message="Caricamento..." />}>
            <ModificaAtletaModal
              open={showModificaAtleta}
              onOpenChange={setShowModificaAtleta}
              athlete={atletaToEdit}
              onSuccess={handleModificaAtletaSuccess}
            />
          </Suspense>
        )}

        {showInvitaCliente && (
          <Suspense fallback={<LoadingState message="Caricamento..." />}>
            <InvitaClienteModal
              open={showInvitaCliente}
              onOpenChange={setShowInvitaCliente}
              onSuccess={handleInvitaClienteSuccess}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}
