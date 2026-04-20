'use client'

import { useCallback, useEffect, useMemo, useState, lazy, Suspense, memo } from 'react'
import Link from 'next/link'
import { UserRoundPlus, Users, UserCheck, UserPlus } from 'lucide-react'
import { useNotify } from '@/lib/ui/notify'
import { InvitaClienteModal } from '@/components/dashboard/invita-cliente-modal'
import type { InvitoPendenteStaff } from '@/hooks/use-inviti-cliente'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import {
  StaffDashboardGuardSkeleton,
  StaffLazyChunkFallback,
} from '@/components/layout/route-loading-skeletons'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import { createLogger } from '@/lib/logger'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { ClientiGridView } from '@/components/dashboard/clienti/clienti-grid-view'
import {
  MassaggiatoreClientiToolbar,
  type MassaggiatoreClientiStatoFilter,
} from '@/components/dashboard/clienti/massaggiatore-clienti-toolbar'
import { MassaggiatoreClientiTableView } from '@/components/dashboard/clienti/massaggiatore-clienti-table-view'
import { useClientiSelection } from '@/hooks/use-clienti-selection'
import { buildClientiPdfBlob } from '@/lib/export-utils'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import type { Cliente, ClienteSort } from '@/types/cliente'

const ClientiBulkActions = lazy(() =>
  import('@/components/dashboard/clienti-bulk-actions').then((mod) => ({
    default: mod.ClientiBulkActions,
  })),
)

const logger = createLogger('app:dashboard:massaggiatore:clienti')

const STATS_CARD_CLASS =
  'flex min-h-[70px] flex-col items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20'

type UnifiedClienteRow = {
  atleta_id: string
  nome: string | null
  cognome: string | null
  email: string | null
  linkedActive: boolean
  pendingInvitoId: string | null
}

type ProfileRow = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  phone: string | null
  created_at: string | null
  data_iscrizione: string | null
  avatar_url: string | null
  documenti_scadenza: boolean | null
  ultimo_accesso: string | null
}

function unifiedToCliente(r: UnifiedClienteRow, p: ProfileRow | undefined): Cliente {
  const nome = r.nome ?? p?.nome ?? null
  const cognome = r.cognome ?? p?.cognome ?? null
  const email = r.email ?? p?.email ?? ''
  const dataIscrizione = p?.data_iscrizione || p?.created_at || ''
  const linked = r.linkedActive
  const pendingId = r.pendingInvitoId
  const invitatoInAttesa = !linked && Boolean(pendingId)

  return {
    id: r.atleta_id,
    first_name: nome ?? '',
    last_name: cognome ?? '',
    nome: nome ?? undefined,
    cognome: cognome ?? undefined,
    email: email || '—',
    phone: p?.phone ?? null,
    avatar_url: p?.avatar_url ?? null,
    data_iscrizione: dataIscrizione || '',
    stato: linked ? 'attivo' : 'inattivo',
    allenamenti_mese: 0,
    ultimo_accesso: p?.ultimo_accesso ?? null,
    scheda_attiva: null,
    documenti_scadenza: Boolean(p?.documenti_scadenza),
    note: null,
    tags: [],
    role: 'athlete',
    created_at: p?.created_at ?? '',
    updated_at: p?.created_at ?? '',
    invitatoInAttesa,
    staffInvitoId: pendingId,
    staffCollegato: linked,
    staffInvitoEmailPendente: linked && Boolean(pendingId),
  }
}

function sortClienti(list: Cliente[], sort: ClienteSort): Cliente[] {
  const dir = sort.direction === 'asc' ? 1 : -1
  const out = [...list]
  out.sort((a, b) => {
    let cmp = 0
    switch (sort.field) {
      case 'nome': {
        const na = `${a.nome ?? a.first_name ?? ''} ${a.cognome ?? a.last_name ?? ''}`.trim()
        const nb = `${b.nome ?? b.first_name ?? ''} ${b.cognome ?? b.last_name ?? ''}`.trim()
        cmp = na.localeCompare(nb, 'it', { sensitivity: 'base' })
        break
      }
      case 'cognome': {
        const ca = (a.cognome ?? a.last_name ?? '').localeCompare(
          b.cognome ?? b.last_name ?? '',
          'it',
          {
            sensitivity: 'base',
          },
        )
        cmp = ca
        break
      }
      case 'email':
        cmp = (a.email ?? '').localeCompare(b.email ?? '', 'it', { sensitivity: 'base' })
        break
      case 'data_iscrizione': {
        const ta = a.data_iscrizione ? new Date(a.data_iscrizione).getTime() : 0
        const tb = b.data_iscrizione ? new Date(b.data_iscrizione).getTime() : 0
        cmp = ta - tb
        break
      }
      case 'stato':
        cmp = a.stato.localeCompare(b.stato, 'it')
        break
      case 'allenamenti_mese':
        cmp = (a.allenamenti_mese ?? 0) - (b.allenamenti_mese ?? 0)
        break
      default:
        cmp = 0
    }
    return cmp * dir
  })
  return out
}

const MassaggiatoreClientiStats = memo(function MassaggiatoreClientiStats({
  collegati,
  invitoSospeso,
  totali,
  nuoviMese,
}: {
  collegati: number
  invitoSospeso: number
  totali: number
  nuoviMese: number
}) {
  const cards: Array<{
    value: number
    title: string
    iconBoxClass: string
    Icon: typeof Users
  }> = [
    {
      value: totali,
      title: 'In elenco',
      iconBoxClass: 'border-teal-500/30 bg-teal-500/20 text-teal-400',
      Icon: Users,
    },
    {
      value: collegati,
      title: 'Collegati',
      iconBoxClass: 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
      Icon: UserCheck,
    },
    {
      value: invitoSospeso,
      title: 'Invito in sospeso',
      iconBoxClass: 'border-purple-500/30 bg-purple-500/20 text-purple-400',
      Icon: UserPlus,
    },
    {
      value: nuoviMese,
      title: 'Nuovi questo mese',
      iconBoxClass: 'border-cyan-500/30 bg-cyan-500/20 text-cyan-400',
      Icon: UserPlus,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {cards.map(({ value, title, iconBoxClass, Icon }) => (
        <div key={title} className={STATS_CARD_CLASS} aria-label={`${title}: ${value}`}>
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
      ))}
    </div>
  )
})

export default function MassaggiatoreClientiPage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')
  const { user } = useAuth()
  const { notify } = useNotify()
  const supabase = useSupabaseClient()
  const [unified, setUnified] = useState<UnifiedClienteRow[]>([])
  const [profileById, setProfileById] = useState<Map<string, ProfileRow>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statoFilter, setStatoFilter] = useState<MassaggiatoreClientiStatoFilter>('tutti')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [sort, setSort] = useState<ClienteSort>({ field: 'nome', direction: 'asc' })
  const [showInvitaCliente, setShowInvitaCliente] = useState(false)
  const [resendingInvitoId, setResendingInvitoId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Cliente | null>(null)
  const [removeSubmitting, setRemoveSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfGenLoading,
    setLoading: setPdfGenLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()

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

  const load = useCallback(async () => {
    const profileId = user?.id ?? null
    if (!profileId) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const [linksRes, pendentiRpc] = await Promise.all([
        supabase
          .from('staff_atleti')
          .select('atleta_id')
          .eq('staff_id', profileId)
          .eq('staff_type', 'massaggiatore')
          .eq('status', 'active'),
        supabase.rpc('get_inviti_cliente_pendenti_staff'),
      ])

      if (linksRes.error) {
        setError(linksRes.error.message)
        setUnified([])
        setProfileById(new Map())
        return
      }

      let pendenti: InvitoPendenteStaff[] = []
      if (pendentiRpc.error) {
        logger.warn('get_inviti_cliente_pendenti_staff', pendentiRpc.error)
      } else {
        pendenti = (pendentiRpc.data ?? []) as InvitoPendenteStaff[]
      }

      const linkedIds = [
        ...new Set(
          (linksRes.data ?? [])
            .map((r: { atleta_id: string | null }) => r.atleta_id)
            .filter(Boolean),
        ),
      ] as string[]

      const pendingAthleteIds = [
        ...new Set(pendenti.map((p) => p.atleta_id).filter((id): id is string => Boolean(id))),
      ]
      const allIds = [...new Set([...linkedIds, ...pendingAthleteIds])]

      const nextProfileMap = new Map<string, ProfileRow>()
      for (const idChunk of chunkForSupabaseIn(allIds)) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select(
            'id, nome, cognome, email, phone, created_at, data_iscrizione, avatar_url, documenti_scadenza, ultimo_accesso',
          )
          .in('id', idChunk)
        if (pErr) {
          setError(pErr.message)
          setUnified([])
          setProfileById(new Map())
          return
        }
        for (const row of profiles ?? []) {
          nextProfileMap.set(row.id, row as ProfileRow)
        }
      }

      const byAtleta = new Map<string, UnifiedClienteRow>()
      for (const aid of linkedIds) {
        const p = nextProfileMap.get(aid)
        byAtleta.set(aid, {
          atleta_id: aid,
          nome: p?.nome ?? null,
          cognome: p?.cognome ?? null,
          email: p?.email ?? null,
          linkedActive: true,
          pendingInvitoId: null,
        })
      }

      for (const inv of pendenti) {
        if (!inv.atleta_id || !inv.invito_id) continue
        const existing = byAtleta.get(inv.atleta_id)
        if (existing) {
          existing.pendingInvitoId = inv.invito_id
          if (!existing.email && inv.email) existing.email = inv.email
          if (!existing.nome && inv.nome) existing.nome = inv.nome
          if (!existing.cognome && inv.cognome) existing.cognome = inv.cognome
        } else {
          byAtleta.set(inv.atleta_id, {
            atleta_id: inv.atleta_id,
            nome: inv.nome,
            cognome: inv.cognome,
            email: inv.email,
            linkedActive: false,
            pendingInvitoId: inv.invito_id,
          })
        }
      }

      const list = [...byAtleta.values()].sort((a, b) =>
        `${a.nome ?? ''} ${a.cognome ?? ''}`.localeCompare(
          `${b.nome ?? ''} ${b.cognome ?? ''}`,
          'it',
          { sensitivity: 'base' },
        ),
      )
      setUnified(list)
      setProfileById(nextProfileMap)
    } catch (e) {
      logger.error('Clienti massaggiatore', e)
      setError(e instanceof Error ? e.message : 'Errore nel caricamento')
      setUnified([])
      setProfileById(new Map())
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    void load()
  }, [load])

  const allClienti = useMemo(
    () => unified.map((r) => unifiedToCliente(r, profileById.get(r.atleta_id))),
    [unified, profileById],
  )

  const statsHeader = useMemo(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const nuoviMese = allClienti.filter((c) => {
      const d = c.data_iscrizione || c.created_at
      if (!d) return false
      try {
        return new Date(d) >= firstDay
      } catch {
        return false
      }
    }).length
    const collegati = allClienti.filter((c) => c.staffCollegato).length
    const invitoSospeso = allClienti.filter((c) => Boolean(c.staffInvitoId)).length
    return { collegati, invitoSospeso, totali: allClienti.length, nuoviMese }
  }, [allClienti])

  const filteredClienti = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return allClienti.filter((c) => {
      if (statoFilter === 'collegati' && !c.staffCollegato) return false
      if (statoFilter === 'in_attesa' && !c.staffInvitoId) return false
      if (!q) return true
      const name = `${c.nome ?? ''} ${c.cognome ?? ''}`.toLowerCase()
      const mail = (c.email ?? '').toLowerCase()
      return name.includes(q) || mail.includes(q)
    })
  }, [allClienti, searchTerm, statoFilter])

  const displayClienti = useMemo(() => sortClienti(filteredClienti, sort), [filteredClienti, sort])

  const { selectedIds, selectedClienti, handleSelectAll, handleSelectOne, clearSelection } =
    useClientiSelection(displayClienti)

  const handleSort = useCallback((field: ClienteSort['field']) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' },
    )
  }, [])

  const handleResendInvitoEmail = useCallback(
    async (invitoId: string) => {
      setResendingInvitoId(invitoId)
      try {
        const res = await fetch('/api/staff/invito-cliente/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invito_id: invitoId }),
        })
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        if (!res.ok) {
          notify(j?.error ?? 'Invio non riuscito', 'error', 'Email invito')
        } else {
          notify('Email di invito reinviata al cliente.', 'success', 'Email invito')
          void load()
        }
      } catch (e) {
        logger.error('Reinvio email invito', e)
        notify('Errore di rete durante il reinvio', 'error', 'Email invito')
      } finally {
        setResendingInvitoId(null)
      }
    },
    [notify, load],
  )

  const handleResendStaffInvite = useCallback(
    (cliente: Cliente) => {
      const id = cliente.staffInvitoId
      if (!id) {
        notify(
          'Nessun invito in sospeso da reinviare. Usa «Invita cliente» per un nuovo collegamento.',
          'info',
          'Invito',
        )
        return
      }
      if (resendingInvitoId === id) return
      void handleResendInvitoEmail(id)
    },
    [handleResendInvitoEmail, notify, resendingInvitoId],
  )

  const confirmRemoveCliente = useCallback(async () => {
    const staffId = user?.id ?? null
    if (!removeTarget || !staffId || !removeTarget.staffCollegato) return
    setRemoveSubmitting(true)
    try {
      const { data: deleted, error } = await supabase
        .from('staff_atleti')
        .delete()
        .eq('staff_id', staffId)
        .eq('atleta_id', removeTarget.id)
        .eq('staff_type', 'massaggiatore')
        .select('id')
      if (error) throw error
      if (!deleted || deleted.length === 0) {
        notify('Nessuna assegnazione rimossa.', 'warning', 'Lista clienti')
        return
      }
      notify('Cliente rimosso dalla tua lista.', 'success', 'Lista clienti')
      setRemoveTarget(null)
      await load()
    } catch (e) {
      notify(
        e instanceof Error ? e.message : 'Errore durante la rimozione',
        'error',
        'Lista clienti',
      )
    } finally {
      setRemoveSubmitting(false)
    }
  }, [removeTarget, user?.id, supabase, notify, load])

  const handleSendEmail = useCallback((cliente: Cliente) => {
    if (!cliente.email) return
    window.location.href = `mailto:${cliente.email}`
  }, [])

  const handleStartChat = useCallback((cliente: Cliente) => {
    window.location.href = `/dashboard/massaggiatore/chat?with=${encodeURIComponent(cliente.id)}`
  }, [])

  const handleBulkEmail = useCallback(() => {
    const emails = selectedClienti
      .map((c) => c.email)
      .filter((e) => Boolean(e) && e.includes('@'))
      .join(',')
    if (!emails) return
    window.location.href = `mailto:${emails}`
    clearSelection()
  }, [selectedClienti, clearSelection])

  const handleExportPdf = useCallback(async () => {
    if (displayClienti.length === 0) return
    setPdfGenLoading(true)
    try {
      const blob = await buildClientiPdfBlob(displayClienti)
      openPdfWithBlob(blob, `clienti-massaggiatore-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      logger.error('Export PDF clienti massaggiatore', err)
      notify('Impossibile generare il PDF. Riprova.', 'error', 'Errore')
    } finally {
      setPdfGenLoading(false)
    }
  }, [displayClienti, openPdfWithBlob, setPdfGenLoading, notify])

  const resetFilters = useCallback(() => {
    setSearchTerm('')
    setStatoFilter('tutti')
  }, [])

  const total = displayClienti.length
  const page = 1
  const totalPages = 1

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout
      title="I miei clienti"
      description="Persone assegnate al tuo profilo come massaggiatore — stessa esperienza della lista clienti trainer, adattata al tuo ruolo."
      theme="teal"
      actions={
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="min-h-[44px] touch-manipulation"
          onClick={() => setShowInvitaCliente(true)}
        >
          <UserRoundPlus className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
          Invita cliente
        </Button>
      }
    >
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-200 sm:px-4 sm:py-3">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] shrink-0 touch-manipulation"
            onClick={() => void load()}
          >
            Riprova
          </Button>
        </div>
      ) : null}

      <MassaggiatoreClientiToolbar
        searchTerm={searchTerm}
        statoFilter={statoFilter}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onStatoFilterChange={setStatoFilter}
        onViewModeChange={setViewMode}
        onExportPdf={() => void handleExportPdf()}
        hasClienti={displayClienti.length > 0}
        isMobile={isMobile}
        isExporting={pdfGenLoading}
      />

      <div role="status" aria-live="polite" className="sr-only">
        {total} {total === 1 ? 'cliente' : 'clienti'} in elenco con i filtri attuali
      </div>

      <p className="text-xs text-text-muted max-w-3xl">
        Compaiono i clienti con collegamento attivo (anche senza email di invito, es. assegnazione
        da admin) e quelli con invito in sospeso. Le azioni di modifica account e allenamenti
        restano lato trainer/admin; qui gestisci inviti, chat, profilo e rimozione dalla tua lista.
      </p>

      {loading && allClienti.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-black/20 p-8 text-center text-text-secondary">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Caricamento clienti…
        </div>
      ) : displayClienti.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/20 p-6 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            {allClienti.length > 0 ? 'Nessun risultato' : 'Nessun cliente in elenco'}
          </h3>
          <p className="max-w-md text-sm text-text-secondary">
            {allClienti.length > 0
              ? 'Modifica ricerca o filtri per vedere altri contatti.'
              : 'Invita un cliente o attendi un’assegnazione da un amministratore.'}
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {(allClienti.length > 0 || searchTerm || statoFilter !== 'tutti') && (
              <Button variant="outline" size="sm" type="button" onClick={resetFilters}>
                Rimuovi filtri
              </Button>
            )}
            {allClienti.length === 0 ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={() => setShowInvitaCliente(true)}
                >
                  <UserRoundPlus className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
                  Invita cliente
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/massaggiatore" prefetch>
                    Torna alla dashboard
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <MassaggiatoreClientiTableView
          clienti={displayClienti}
          selectedIds={selectedIds}
          sort={sort}
          total={total}
          page={page}
          totalPages={totalPages}
          allRowsSelectable
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onSort={handleSort}
          onPageChange={() => {}}
          onSendEmail={handleSendEmail}
          onStartChat={handleStartChat}
          onResendStaffInvite={handleResendStaffInvite}
          onRemoveFromStaffList={(c) => {
            if (c.staffCollegato) setRemoveTarget(c)
          }}
        />
      ) : (
        <ClientiGridView
          clienti={displayClienti}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={() => {}}
          listHeading="Lista clienti"
          clienteCardVariant="massaggiatore"
          onSendEmail={handleSendEmail}
          onStartChat={handleStartChat}
          onResendStaffInvite={handleResendStaffInvite}
          onRemoveFromStaffList={(c) => {
            if (c.staffCollegato) setRemoveTarget(c)
          }}
        />
      )}

      <section className="shrink-0" aria-label="Statistiche clienti massaggiatore">
        <MassaggiatoreClientiStats
          collegati={statsHeader.collegati}
          invitoSospeso={statsHeader.invitoSospeso}
          totali={statsHeader.totali}
          nuoviMese={statsHeader.nuoviMese}
        />
      </section>

      <Suspense
        fallback={
          <StaffLazyChunkFallback className="w-full max-w-md" label="Caricamento azioni…" />
        }
      >
        <ClientiBulkActions
          selectedCount={selectedIds.size}
          onSendEmail={handleBulkEmail}
          onClear={clearSelection}
        />
      </Suspense>

      <InvitaClienteModal
        open={showInvitaCliente}
        onOpenChange={setShowInvitaCliente}
        inviteContext="massaggiatore"
        onSuccess={() => {
          void load()
        }}
      />

      <ConfirmDialog
        open={removeTarget != null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
        title="Rimuovi dalla lista"
        description={
          removeTarget
            ? `${[removeTarget.nome, removeTarget.cognome].filter(Boolean).join(' ').trim() || removeTarget.email || 'Cliente'} non comparirà più tra i tuoi clienti massaggiatore. Il suo account non viene eliminato.`
            : ''
        }
        variant="destructive"
        confirmText="Rimuovi"
        onConfirm={() => void confirmRemoveCliente()}
        loading={removeSubmitting}
      />

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — I miei clienti"
      />
    </StaffContentLayout>
  )
}
