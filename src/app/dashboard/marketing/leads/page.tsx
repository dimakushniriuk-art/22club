'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import {
  UserPlus,
  Search,
  ExternalLink,
  LayoutGrid,
  List,
  Sparkles,
  MessageCircle,
  Target,
  CheckCircle,
  XCircle,
  User,
  Inbox,
} from 'lucide-react'
import type { MarketingLeadRow } from '@/app/api/marketing/leads/route'
import { MetricCard } from '@/components'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState, Skeleton } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectItem } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import type { MetricCardStatus, MetricCardTone } from '@/components/shared/dashboard/metric-card'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  trial: 'Prova',
  converted: 'Convertito',
  lost: 'Perso',
}

const PIPELINE_STATUSES = ['new', 'contacted', 'trial', 'converted', 'lost'] as const

/** Fasi spostabili dalla lista pipeline (convertito solo dal dettaglio lead). */
const PIPELINE_MOVABLE_STATUSES = ['new', 'contacted', 'trial', 'lost'] as const

const KPI_STATUS_ICONS: Record<(typeof PIPELINE_STATUSES)[number], ReactNode> = {
  new: <Sparkles className="h-4 w-4" aria-hidden />,
  contacted: <MessageCircle className="h-4 w-4" aria-hidden />,
  trial: <Target className="h-4 w-4" aria-hidden />,
  converted: <CheckCircle className="h-4 w-4" aria-hidden />,
  lost: <XCircle className="h-4 w-4" aria-hidden />,
}

function statusToMetricTone(status: string): MetricCardTone {
  switch (status) {
    case 'new':
      return 'blue'
    case 'contacted':
      return 'neutral'
    case 'trial':
      return 'amber'
    case 'converted':
      return 'emerald'
    case 'lost':
      return 'danger'
    default:
      return 'neutral'
  }
}

function leadMetricStatusProps(
  status: string,
): { status: MetricCardStatus; statusText: string } | undefined {
  switch (status) {
    case 'new':
      return { status: 'info', statusText: STATUS_LABELS.new }
    case 'contacted':
      return { status: 'info', statusText: STATUS_LABELS.contacted }
    case 'trial':
      return { status: 'warning', statusText: STATUS_LABELS.trial }
    case 'converted':
      return { status: 'success', statusText: STATUS_LABELS.converted }
    case 'lost':
      return { status: 'error', statusText: STATUS_LABELS.lost }
    default:
      return undefined
  }
}

function canAccessMarketingLeads(role: string | null): role is 'marketing' | 'admin' {
  return role === 'marketing' || role === 'admin'
}

function statusBadgeVariant(
  status: string,
): 'primary' | 'success' | 'warning' | 'neutral' | 'error' | 'info' {
  switch (status) {
    case 'new':
      return 'info'
    case 'contacted':
      return 'neutral'
    case 'trial':
      return 'warning'
    case 'converted':
      return 'success'
    case 'lost':
      return 'error'
    default:
      return 'primary'
  }
}

export default function MarketingLeadsPage() {
  const router = useRouter()
  const { role, loading } = useAuth()
  const { addToast } = useToast()
  const [data, setData] = useState<MarketingLeadRow[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('tutti')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'lista' | 'pipeline'>('lista')
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null)

  /** Redirect immediato se il ruolo non può accedere (evita “skeleton infinito” percepito). */
  useLayoutEffect(() => {
    if (loading) return
    if (role !== null && !canAccessMarketingLeads(role)) {
      router.replace('/dashboard')
    }
  }, [loading, role, router])

  useEffect(() => {
    if (loading || (role !== null && !canAccessMarketingLeads(role))) {
      return
    }

    let cancelled = false
    async function fetchLeads() {
      setLoadingData(true)
      setError(null)
      try {
        const res = await fetch('/api/marketing/leads')
        if (!cancelled && res.status === 401) {
          router.replace('/login')
          return
        }
        if (!cancelled && res.status === 403) {
          router.replace('/dashboard')
          return
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          if (!cancelled) setError((body.error as string) || 'Errore caricamento lead')
          return
        }
        const json = await res.json()
        if (!cancelled) setData((json.data as MarketingLeadRow[]) ?? [])
      } catch {
        if (!cancelled) setError('Errore di rete')
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    fetchLeads()
    return () => {
      cancelled = true
    }
  }, [loading, role, router])

  const bySearch = useMemo(() => {
    if (!search.trim()) return data
    const s = search.toLowerCase()
    return data.filter(
      (row) =>
        row.email?.toLowerCase().includes(s) ||
        row.first_name?.toLowerCase().includes(s) ||
        row.last_name?.toLowerCase().includes(s),
    )
  }, [data, search])

  const listaRows = useMemo(() => {
    if (statusFilter === 'tutti') return bySearch
    return bySearch.filter((row) => row.status === statusFilter)
  }, [bySearch, statusFilter])

  const kpiByStatus = useMemo(() => {
    const m = {} as Record<(typeof PIPELINE_STATUSES)[number], number>
    for (const s of PIPELINE_STATUSES) {
      m[s] = bySearch.filter((r) => r.status === s).length
    }
    return m
  }, [bySearch])

  const handlePipelineStatusChange = useCallback(
    async (leadId: string, nextStatus: string, currentStatus: string) => {
      if (nextStatus === currentStatus) return
      if (currentStatus === 'converted') {
        addToast({
          title: 'Stato bloccato',
          message: 'Per lead convertiti usa il dettaglio per collegamenti e note.',
          variant: 'info',
        })
        return
      }
      if (nextStatus === 'converted') {
        addToast({
          title: 'Conversione',
          message: 'Apri il dettaglio lead per convertire in atleta.',
          variant: 'warning',
        })
        return
      }
      setUpdatingLeadId(leadId)
      try {
        const res = await fetch(`/api/marketing/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          addToast({
            title: 'Aggiornamento fallito',
            message: (json.error as string) || 'Errore API',
            variant: 'error',
          })
          return
        }
        const updated = json.data as MarketingLeadRow | undefined
        if (updated?.id) {
          setData((prev) => prev.map((r) => (r.id === leadId ? { ...r, ...updated } : r)))
        }
        addToast({
          title: 'Fase aggiornata',
          message: STATUS_LABELS[nextStatus] ?? nextStatus,
          variant: 'success',
        })
      } catch {
        addToast({ title: 'Errore', message: 'Errore di rete', variant: 'error' })
      } finally {
        setUpdatingLeadId(null)
      }
    },
    [addToast],
  )

  if (loading) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (role !== null && !canAccessMarketingLeads(role)) {
    return (
      <StaffContentLayout title="Leads" description="Pipeline e lista lead marketing." theme="teal">
        <Card className="max-w-lg border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">Accesso negato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-text-secondary">
            <p>
              I Lead marketing sono visibili solo agli account con ruolo{' '}
              <span className="text-text-primary font-medium">Marketing</span> o{' '}
              <span className="text-text-primary font-medium">Admin</span>. Stai per essere
              reindirizzato alla dashboard principale.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Vai alla dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </StaffContentLayout>
    )
  }

  if (!canAccessMarketingLeads(role)) {
    return <StaffMarketingSegmentSkeleton />
  }

  const kpiGrid = (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4"
      aria-busy={loadingData}
    >
      <MetricCard
        title="Lead totali"
        value={loadingData ? 0 : bySearch.length}
        icon={<UserPlus className="h-4 w-4" aria-hidden />}
        loading={loadingData}
        tone="teal"
        compact
      />
      {PIPELINE_STATUSES.map((s) => (
        <MetricCard
          key={s}
          title={STATUS_LABELS[s]}
          value={loadingData ? 0 : kpiByStatus[s]}
          icon={KPI_STATUS_ICONS[s]}
          loading={loadingData}
          tone={statusToMetricTone(s)}
          compact
        />
      ))}
    </div>
  )

  return (
    <StaffContentLayout
      title="Leads"
      description="Lista e pipeline per fase (stesso dato API). Converti in atleta dal dettaglio."
      theme="teal"
    >
      {!error ? kpiGrid : null}

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as 'lista' | 'pipeline')}
        className="w-full"
      >
        <TabsList variant="default" className="w-full md:w-auto justify-start">
          <TabsTrigger value="lista" variant="default" className="gap-2">
            <List className="h-4 w-4" aria-hidden />
            Lista
          </TabsTrigger>
          <TabsTrigger value="pipeline" variant="default" className="gap-2">
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background-secondary border-border"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-full sm:w-[180px] bg-background-secondary border-border"
            >
              <SelectItem value="tutti">Tutti gli stati</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {loadingData ? (
            <Card className="bg-background-secondary/80 border-border">
              <CardHeader>
                <Skeleton className="h-5 w-48 max-w-full rounded-md" />
              </CardHeader>
              <CardContent className="space-y-2" aria-busy>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-border border-red-500/30 bg-red-500/10">
              <CardContent className="pt-6 text-sm text-red-200">{error}</CardContent>
            </Card>
          ) : (
            <Card className="bg-background-secondary/80 border-border">
              <CardHeader>
                <CardTitle className="text-base text-text-primary">
                  Elenco lead ({listaRows.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listaRows.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="Nessun lead trovato"
                    description="Modifica la ricerca o il filtro per stato per vedere altri risultati."
                    surface="transparent"
                    density="compact"
                    align="center"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-text-secondary">Nome</TableHead>
                          <TableHead className="text-text-secondary">Email</TableHead>
                          <TableHead className="text-text-secondary">Fonte</TableHead>
                          <TableHead className="text-text-secondary">Stato</TableHead>
                          <TableHead className="text-text-secondary">Data</TableHead>
                          <TableHead className="text-text-secondary w-24"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {listaRows.map((row) => (
                          <TableRow key={row.id} className="border-border/50">
                            <TableCell>
                              {[row.first_name, row.last_name].filter(Boolean).join(' ') || '-'}
                            </TableCell>
                            <TableCell className="text-text-muted">{row.email}</TableCell>
                            <TableCell className="text-text-muted">{row.source ?? '-'}</TableCell>
                            <TableCell>
                              <Badge variant={statusBadgeVariant(row.status)} size="sm">
                                {STATUS_LABELS[row.status] ?? row.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-text-muted text-sm">
                              {row.created_at
                                ? new Date(row.created_at).toLocaleDateString('it-IT')
                                : '-'}
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/marketing/leads/${row.id}`}>Dettaglio</Link>
                              </Button>
                              {row.status === 'converted' && row.converted_athlete_profile_id && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link
                                    href={`/dashboard/atleti/${row.converted_athlete_profile_id}`}
                                    className="inline-flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Vai al profilo
                                  </Link>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Cerca nella pipeline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background-secondary border-border"
            />
          </div>

          {loadingData ? (
            <div
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:snap-none"
              role="region"
              aria-label="Caricamento pipeline"
              aria-busy
            >
              {PIPELINE_STATUSES.map((statusKey) => {
                const label = STATUS_LABELS[statusKey] ?? statusKey
                return (
                  <section
                    key={statusKey}
                    className="w-[min(100%,280px)] shrink-0 snap-start flex flex-col gap-2 rounded-xl border border-border bg-background-secondary/40 min-h-[200px] p-2"
                    aria-label={`Caricamento colonna ${label}`}
                  >
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-24 w-full shrink-0 rounded-lg" />
                    <Skeleton className="h-24 w-full shrink-0 rounded-lg" />
                  </section>
                )
              })}
            </div>
          ) : error ? (
            <Card className="border-border border-red-500/30 bg-red-500/10">
              <CardContent className="pt-6 text-sm text-red-200">{error}</CardContent>
            </Card>
          ) : (
            <div
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:snap-none"
              role="region"
              aria-label="Pipeline lead per fase"
            >
              {PIPELINE_STATUSES.map((statusKey) => {
                const col = bySearch.filter((r) => r.status === statusKey)
                const label = STATUS_LABELS[statusKey] ?? statusKey
                return (
                  <section
                    key={statusKey}
                    className="w-[min(100%,280px)] shrink-0 snap-start flex flex-col rounded-xl border border-border bg-background-secondary/40 min-h-[280px]"
                    aria-label={`Colonna ${label}`}
                  >
                    <div className="border-b border-border/60 px-3 py-2.5">
                      <h2 className="text-sm font-semibold text-text-primary">
                        {label} <span className="text-text-muted font-normal">({col.length})</span>
                      </h2>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-2 overflow-y-auto max-h-[70vh]">
                      {col.length === 0 ? (
                        <EmptyState
                          icon={Inbox}
                          title="Nessun lead in questa fase"
                          density="inline"
                          surface="transparent"
                          iconSize="small"
                          align="center"
                          className="py-2"
                        />
                      ) : (
                        col.map((row) => {
                          const name =
                            [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email
                          const isConverted = row.status === 'converted'
                          const busy = updatingLeadId === row.id
                          const statusProps = leadMetricStatusProps(row.status)
                          return (
                            <div key={row.id} className="space-y-2">
                              <MetricCard
                                variant="compact"
                                label={row.email || '—'}
                                value={name}
                                icon={<User className="h-4 w-4" aria-hidden />}
                                tone={statusToMetricTone(row.status)}
                                {...(statusProps ?? {})}
                              />
                              {row.source ? (
                                <p className="text-xs text-text-tertiary truncate px-0.5">
                                  {row.source}
                                </p>
                              ) : null}
                              <div className="flex flex-wrap gap-1.5">
                                <Button variant="outline" size="sm" className="h-8" asChild>
                                  <Link href={`/dashboard/marketing/leads/${row.id}`}>
                                    Dettaglio
                                  </Link>
                                </Button>
                                {isConverted && row.converted_athlete_profile_id ? (
                                  <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                                    <Link
                                      href={`/dashboard/atleti/${row.converted_athlete_profile_id}`}
                                      aria-label="Vai al profilo atleta"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                ) : null}
                              </div>
                              {!isConverted ? (
                                <Select
                                  size="sm"
                                  className="text-xs"
                                  value={row.status}
                                  disabled={busy}
                                  onValueChange={(v) =>
                                    void handlePipelineStatusChange(row.id, v, row.status)
                                  }
                                  aria-label={`Sposta fase per ${name}`}
                                >
                                  {PIPELINE_MOVABLE_STATUSES.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      {STATUS_LABELS[s]}
                                    </SelectItem>
                                  ))}
                                </Select>
                              ) : (
                                <p className="text-xs text-text-muted pt-0.5">
                                  Stato convertito: modifiche dal dettaglio.
                                </p>
                              )}
                              {busy ? (
                                <p className="text-xs text-text-tertiary">Aggiornamento…</p>
                              ) : null}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </StaffContentLayout>
  )
}
