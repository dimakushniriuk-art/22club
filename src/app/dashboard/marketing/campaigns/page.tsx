'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { Megaphone, Plus, Search, Euro, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Database } from '@/lib/supabase/types'

type CampaignRow = Database['public']['Tables']['marketing_campaigns']['Row']

const STATUS_LABELS: Record<string, string> = {
  draft: 'Bozza',
  active: 'Attiva',
  paused: 'In pausa',
  ended: 'Terminata',
}

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  social: 'Social',
  web: 'Web',
  other: 'Altro',
}

function formatDate(s: string | null): string {
  if (!s) return '–'
  return new Date(s).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function MarketingCampaignsPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { role, loading: authLoading } = useAuth()
  const [data, setData] = useState<CampaignRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [channelFilter, setChannelFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
      if (!authLoading && role !== null && role !== 'marketing' && role !== 'admin') {
        router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
      }
      return
    }
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      const { data: rows, error: err } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('updated_at', { ascending: false })
      if (cancelled) return
      if (err) {
        setError(err.message)
        setData([])
      } else {
        setData((rows ?? []) as CampaignRow[])
      }
      setLoading(false)
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [role, authLoading, router, supabase])

  const filtered = useMemo(() => {
    let list = data
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter)
    if (channelFilter !== 'all') list = list.filter((c) => (c.channel ?? '') === channelFilter)
    if (search.trim()) {
      const s = search.toLowerCase().trim()
      list = list.filter((c) => (c.name ?? '').toLowerCase().includes(s))
    }
    return list
  }, [data, statusFilter, channelFilter, search])

  const kpis = useMemo(() => {
    const total = data.length
    const active = data.filter((c) => c.status === 'active').length
    const budgetActive = data
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + Number(c.budget ?? 0), 0)
    return { total, active, budgetActive }
  }, [data])

  if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex flex-col gap-4 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold min-[834px]:text-2xl">
            <Megaphone className="h-6 w-6 text-cyan-400" />
            Campagne
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Crea e gestisci campagne (canale, budget, date).
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/dashboard/marketing/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuova campagna
          </Link>
        </Button>
      </header>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 min-[834px]:grid-cols-3">
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Target className="h-4 w-4" />
                  Totale campagne
                </div>
                <p className="text-2xl font-bold text-cyan-400">{kpis.total}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Megaphone className="h-4 w-4" />
                  Attive
                </div>
                <p className="text-2xl font-bold text-emerald-400">{kpis.active}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80 min-[834px]:col-span-1">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Euro className="h-4 w-4" />
                  Budget (attive)
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  € {kpis.budgetActive.toLocaleString('it-IT')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 min-[834px]:flex-row min-[834px]:items-center">
            <div className="relative flex-1 min-[834px]:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Cerca per nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border bg-background-secondary pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-text-primary"
              >
                <option value="all">Tutti gli stati</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm text-text-primary"
              >
                <option value="all">Tutti i canali</option>
                {Object.entries(CHANNEL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card className="border-border bg-background-secondary/80">
            <CardHeader>
              <CardTitle className="text-base text-text-primary">
                Elenco ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Megaphone className="mb-3 h-12 w-12 text-text-muted" />
                  <p className="text-center text-sm text-text-secondary">
                    {data.length === 0
                      ? 'Nessuna campagna. Creane una.'
                      : 'Nessun risultato per i filtri.'}
                  </p>
                  {data.length === 0 && (
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/marketing/campaigns/new">Nuova campagna</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-text-secondary">Nome</TableHead>
                        <TableHead className="text-text-secondary">Canale</TableHead>
                        <TableHead className="text-text-secondary">Budget</TableHead>
                        <TableHead className="text-text-secondary">Periodo</TableHead>
                        <TableHead className="text-text-secondary">Stato</TableHead>
                        <TableHead className="text-text-secondary">Aggiornato</TableHead>
                        <TableHead className="text-text-secondary w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((row) => (
                        <TableRow
                          key={row.id}
                          className="border-border/50 hover:bg-background-tertiary/30"
                        >
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell className="text-text-muted">
                            {CHANNEL_LABELS[row.channel ?? ''] ?? row.channel ?? '–'}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {row.budget != null
                              ? `€ ${Number(row.budget).toLocaleString('it-IT')}`
                              : '–'}
                          </TableCell>
                          <TableCell className="text-text-muted text-sm">
                            {formatDate(row.start_at)} → {formatDate(row.end_at)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                row.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : row.status === 'draft'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : row.status === 'paused'
                                      ? 'bg-orange-500/20 text-orange-400'
                                      : 'bg-text-muted/20 text-text-muted'
                              }`}
                            >
                              {STATUS_LABELS[row.status] ?? row.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-text-muted text-sm">
                            {formatDate(row.updated_at)}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/marketing/campaigns/${row.id}`}>
                                Dettaglio
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
