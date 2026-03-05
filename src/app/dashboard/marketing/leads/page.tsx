'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { UserPlus, Search, ExternalLink } from 'lucide-react'
import type { MarketingLeadRow } from '@/app/api/marketing/leads/route'
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
import { Select, SelectItem } from '@/components/ui/select'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  trial: 'Prova',
  converted: 'Convertito',
  lost: 'Perso',
}

export default function MarketingLeadsPage() {
  const router = useRouter()
  const { role, loading } = useAuth()
  const [data, setData] = useState<MarketingLeadRow[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('tutti')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (loading || (role !== null && role !== 'marketing' && role !== 'admin')) {
      if (!loading && role !== null && role !== 'marketing' && role !== 'admin') {
        router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
      }
      return
    }

    let cancelled = false
    async function fetchLeads() {
      setLoadingData(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'tutti') params.set('status', statusFilter)
        const res = await fetch(`/api/marketing/leads?${params}`)
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
    return () => { cancelled = true }
  }, [loading, role, router, statusFilter])

  const filtered = data.filter((row) => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      row.email?.toLowerCase().includes(s) ||
      row.first_name?.toLowerCase().includes(s) ||
      row.last_name?.toLowerCase().includes(s)
    )
  })

  if (loading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 min-[834px]:p-6 space-y-6 bg-background text-text-primary">
      <header>
        <h1 className="text-xl min-[834px]:text-2xl font-bold flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-cyan-400" />
          Leads
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Lista lead con stato e fonte. Filtra per periodo, fonte e stato.
        </p>
      </header>

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
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </Select>
      </div>

      {loadingData ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
          {error}
        </div>
      ) : (
        <Card className="bg-background-secondary/80 border-border">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">Elenco lead ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-text-secondary text-sm py-6 text-center">Nessun lead trovato.</p>
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
                    {filtered.map((row) => (
                      <TableRow key={row.id} className="border-border/50">
                        <TableCell>
                          {[row.first_name, row.last_name].filter(Boolean).join(' ') || '-'}
                        </TableCell>
                        <TableCell className="text-text-muted">{row.email}</TableCell>
                        <TableCell className="text-text-muted">{row.source ?? '-'}</TableCell>
                        <TableCell>
                          <span className="rounded-full px-2 py-0.5 text-xs bg-primary/20 text-primary">
                            {STATUS_LABELS[row.status] ?? row.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-text-muted text-sm">
                          {row.created_at ? new Date(row.created_at).toLocaleDateString('it-IT') : '-'}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/marketing/leads/${row.id}`}>Dettaglio</Link>
                          </Button>
                          {row.status === 'converted' && row.converted_athlete_profile_id && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/atleti/${row.converted_athlete_profile_id}`} className="inline-flex items-center gap-1">
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
    </div>
  )
}
