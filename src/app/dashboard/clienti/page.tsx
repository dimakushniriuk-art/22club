'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:clienti:page')
import { Button } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { ClientiFiltriAvanzati } from '@/components/dashboard/clienti-filtri-avanzati'
import { ClientiBulkActions } from '@/components/dashboard/clienti-bulk-actions'
import { ModernKPICard } from '@/components/dashboard/modern-kpi-card'
import { CreaAtletaModal } from '@/components/dashboard/crea-atleta-modal'
import { ClientiToolbar } from '@/components/dashboard/clienti/clienti-toolbar'
import { ClientiTableView } from '@/components/dashboard/clienti/clienti-table-view'
import { ClientiGridView } from '@/components/dashboard/clienti/clienti-grid-view'
import { ClientiEmptyState } from '@/components/dashboard/clienti/clienti-empty-state'
import { useClienti } from '@/hooks/use-clienti'
import { useClientiFilters } from '@/hooks/use-clienti-filters'
import { useClientiSelection } from '@/hooks/use-clienti-selection'
import { exportToCSV, exportToPDF, formatClientiForExport } from '@/lib/export-utils'
import { UserPlus, Users, UserCheck, UserPlus as UserPlusIcon, AlertTriangle } from 'lucide-react'
import type { ClienteFilters, Cliente, ClienteStats } from '@/types/cliente'

export default function ClientiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [showFiltriAvanzati, setShowFiltriAvanzati] = useState(false)
  const [showCreaAtleta, setShowCreaAtleta] = useState(false)

  // Apri il modal automaticamente se c'è il query param 'new'
  useEffect(() => {
    const newParam = searchParams.get('new')
    if (newParam === 'true') {
      setShowCreaAtleta(true)
    }
  }, [searchParams])

  // Gestisci la chiusura del modal e rimuovi il query param
  const handleCloseCreaAtleta = (open: boolean) => {
    setShowCreaAtleta(open)
    if (!open) {
      // Quando il modal viene chiuso, rimuovi il query param
      const params = new URLSearchParams(searchParams.toString())
      params.delete('new')
      const newUrl = params.toString()
        ? `/dashboard/clienti?${params.toString()}`
        : '/dashboard/clienti'
      router.replace(newUrl, { scroll: false })
    }
  }

  // Hook per gestione filtri
  const {
    searchTerm,
    statoFilter,
    page,
    sort,
    // Nota: advancedFilters potrebbe essere usato in futuro per filtri avanzati
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    advancedFilters,
    filters,
    updateSearchTerm,
    updateStatoFilter,
    updatePage,
    handleSort,
    setAdvancedFilters,
    resetFilters,
  } = useClientiFilters()

  // Hook per fetch clienti
  // FIX: Aumentato pageSize da 20 a 250 per visualizzare più atleti per pagina
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { clienti, stats, total, totalPages, loading, error, refetch, deleteCliente } = useClienti({
    filters,
    sort,
    page,
    pageSize: 250,
    realtime: false,
  })

  // Hook per gestione selezione - DEVE essere chiamato SEMPRE prima di qualsiasi return early
  const { selectedIds, selectedClienti, handleSelectAll, handleSelectOne, clearSelection } =
    useClientiSelection(clienti)

  // FIX: Calcola stats basandosi sui clienti visualizzati nella pagina (filtrati), non sui totali globali
  // Questo permette alle stat cards di riflettere esattamente quello che viene mostrato nella pagina
  const displayStats = useMemo<ClienteStats>(() => {
    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    ).toISOString()

    return {
      totali: clienti.length,
      attivi: clienti.filter((c) => c.stato === 'attivo').length,
      inattivi: clienti.filter((c) => c.stato === 'inattivo' || c.stato === 'sospeso').length,
      nuovi_mese: clienti.filter((c) => {
        const dateValue = c.data_iscrizione || c.created_at
        if (!dateValue) return false
        try {
          const date = new Date(dateValue)
          return date >= new Date(firstDayOfMonth)
        } catch {
          return false
        }
      }).length,
      documenti_scadenza: clienti.filter((c) => c.documenti_scadenza === true).length,
    }
  }, [clienti])

  // Handler azioni bulk
  const handleBulkEmail = () => {
    const emails = selectedClienti.map((c) => c.email).join(',')
    window.location.href = `mailto:${emails}`
    clearSelection()
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedIds.size} clienti?`)) return

    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteCliente(id)))
      clearSelection()
      refetch()
    } catch (err) {
      logger.error('Errore eliminazione bulk', err, { count: selectedIds.size })
      alert("Errore durante l'eliminazione dei clienti")
    }
  }

  // Handler export
  const handleExportCSV = () => {
    const data = formatClientiForExport(clienti)
    exportToCSV(data, `clienti-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleExportPDF = () => {
    const data = formatClientiForExport(clienti)
    exportToPDF(data, `clienti-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Handler azioni dropdown
  const handleEdit = (cliente: Cliente) => {
    router.push(`/dashboard/atleti/${cliente.id}/edit`)
  }

  const handleViewHistory = (cliente: Cliente) => {
    router.push(`/dashboard/atleti/${cliente.id}/storico`)
  }

  const handleViewDocuments = (cliente: Cliente) => {
    router.push(`/dashboard/documenti?atleta=${cliente.id}`)
  }

  const handleSendEmail = (cliente: Cliente) => {
    window.location.href = `mailto:${cliente.email}`
  }

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`Sei sicuro di voler eliminare ${cliente.nome} ${cliente.cognome}?`)) return

    try {
      await deleteCliente(cliente.id)
      refetch()
    } catch (err) {
      logger.error('Errore eliminazione cliente', err, { clienteId: cliente.id })
      alert("Errore durante l'eliminazione del cliente")
    }
  }

  // Loading state - DOPO tutti gli hooks
  if (loading && clienti.length === 0) {
    return (
      <div className="h-full bg-background p-6">
        <LoadingState message="Caricamento clienti..." />
      </div>
    )
  }

  // Error state - DOPO tutti gli hooks
  if (error) {
    return (
      <div className="h-full bg-background p-6">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        {/* Header Section */}
        <header className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Clienti
              </h1>
              <p className="text-text-secondary text-sm sm:text-base">
                Gestisci i tuoi atleti e i loro progressi
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreaAtleta(true)}
                size="sm"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Aggiungi Atleta
              </Button>
              <Link href="/dashboard/invita-atleta">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500/30 hover:bg-teal-500/10"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invita Atleta
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Toolbar con filtri e ricerca */}
        <ClientiToolbar
          searchTerm={searchTerm}
          statoFilter={statoFilter}
          viewMode={viewMode}
          onSearchChange={updateSearchTerm}
          onStatoFilterChange={updateStatoFilter}
          onViewModeChange={setViewMode}
          onShowFiltriAvanzati={() => setShowFiltriAvanzati(true)}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          hasClienti={clienti.length > 0}
        />

        {/* Announce per screen reader */}
        <div role="status" aria-live="polite" className="sr-only">
          {clienti.length} {clienti.length === 1 ? 'cliente trovato' : 'clienti trovati'}
        </div>

        {/* Lista Clienti */}
        {loading && clienti.length === 0 ? (
          <div className="relative py-16 text-center">
            <LoadingState message="Caricamento clienti..." />
          </div>
        ) : clienti.length === 0 && !loading ? (
          // FIX: Usa total (totale filtrato) invece di stats.totali (totale globale) per riflettere i filtri attivi
          <ClientiEmptyState
            searchTerm={searchTerm}
            statoFilter={statoFilter}
            totali={total}
            onResetFilters={() => {
              resetFilters()
              refetch()
            }}
          />
        ) : viewMode === 'table' ? (
          <ClientiTableView
            clienti={clienti}
            selectedIds={selectedIds}
            sort={sort}
            total={total}
            page={page}
            totalPages={totalPages}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onSort={handleSort}
            onPageChange={updatePage}
            onEdit={handleEdit}
            onViewHistory={handleViewHistory}
            onViewDocuments={handleViewDocuments}
            onSendEmail={handleSendEmail}
            onDelete={handleDelete}
          />
        ) : (
          <ClientiGridView 
            clienti={clienti} 
            total={total} 
            page={page}
            totalPages={totalPages}
            onPageChange={updatePage}
          />
        )}

        {/* Stats Cards Section - Design System Grid */}
        {/* FIX: Le stats mostrano i dati relativi ai clienti visualizzati nella pagina (filtrati), non i totali globali */}
        <section className="flex-shrink-0 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <ModernKPICard
              title="Clienti Totali"
              value={displayStats.totali}
              icon={<Users className="h-5 w-5" />}
              color="blue"
              animationDelay="100ms"
            />
            <ModernKPICard
              title="Clienti Attivi"
              value={displayStats.attivi}
              icon={<UserCheck className="h-5 w-5" />}
              color="green"
              animationDelay="200ms"
            />
            <ModernKPICard
              title="Nuovi Questo Mese"
              value={displayStats.nuovi_mese}
              icon={<UserPlusIcon className="h-5 w-5" />}
              color="purple"
              animationDelay="300ms"
            />
            <ModernKPICard
              title="Documenti in Scadenza"
              value={displayStats.documenti_scadenza}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="orange"
              animationDelay="400ms"
            />
          </div>
        </section>

        {/* Modali e Azioni Bulk */}
        <ClientiFiltriAvanzati
          open={showFiltriAvanzati}
          onOpenChange={setShowFiltriAvanzati}
          filters={filters as ClienteFilters}
          onApply={(newFilters) => setAdvancedFilters(newFilters)}
        />

        <ClientiBulkActions
          selectedCount={selectedIds.size}
          onSendEmail={handleBulkEmail}
          onDelete={handleBulkDelete}
          onClear={clearSelection}
        />

        <CreaAtletaModal
          open={showCreaAtleta}
          onOpenChange={handleCloseCreaAtleta}
          onSuccess={() => {
            refetch()
          }}
        />
      </div>
    </div>
  )
}
