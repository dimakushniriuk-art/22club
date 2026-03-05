'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import {
  Users,
  UserCheck,
  User,
  AlertCircle,
  Search,
  Dumbbell,
  Calendar,
} from 'lucide-react'
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
import type { MarketingAthleteRow } from '@/app/api/marketing/athletes/route'

const INACTIVE_DAYS = 30

function formatDate(s: string | null): string {
  if (!s) return '–'
  return new Date(s).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function isInactive(lastWorkoutAt: string | null): boolean {
  if (!lastWorkoutAt) return true
  const days = (Date.now() - new Date(lastWorkoutAt).getTime()) / (24 * 60 * 60 * 1000)
  return days >= INACTIVE_DAYS
}

export default function MarketingAthletesPage() {
  const router = useRouter()
  const { role, loading: authLoading } = useAuth()
  const [data, setData] = useState<MarketingAthleteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState<'7' | '30'>('30')

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
      try {
        const res = await fetch('/api/marketing/athletes')
        if (cancelled) return
        const json = await res.json()
        if (!res.ok) {
          setError(json.error ?? 'Errore caricamento')
          setData([])
          return
        }
        setData((json.data ?? []) as MarketingAthleteRow[])
      } catch {
        if (!cancelled) setError('Errore di rete')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [role, authLoading, router])

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const s = search.toLowerCase().trim()
    return data.filter((row) => {
      const first = (row.first_name ?? '').toLowerCase()
      const last = (row.last_name ?? '').toLowerCase()
      const email = (row.email ?? '').toLowerCase()
      return first.includes(s) || last.includes(s) || email.includes(s)
    })
  }, [data, search])

  const kpis = useMemo(() => {
    const total = data.length
    const coached30 = data.reduce((acc, r) => acc + Number(r.workouts_coached_30d ?? 0), 0)
    const solo30 = data.reduce((acc, r) => acc + Number(r.workouts_solo_30d ?? 0), 0)
    const inactive = data.filter((r) => isInactive(r.last_workout_at)).length
    return { total, coached30, solo30, inactive }
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
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold min-[834px]:text-2xl">
          <Users className="h-6 w-6 text-cyan-400" />
          Atleti
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Elenco atleti e KPI da vista marketing. Dati solo da <code className="rounded bg-background-tertiary px-1 text-xs">marketing_athletes</code>.
        </p>
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
          <div className="grid grid-cols-2 gap-4 min-[834px]:grid-cols-4">
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <Users className="h-4 w-4" />
                  Totale atleti
                </div>
                <p className="text-2xl font-bold text-cyan-400">{kpis.total}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <UserCheck className="h-4 w-4" />
                  Workout con trainer (30d)
                </div>
                <p className="text-2xl font-bold text-teal-400">{kpis.coached30}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <User className="h-4 w-4" />
                  Workout da solo (30d)
                </div>
                <p className="text-2xl font-bold text-text-primary">{kpis.solo30}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-background-secondary/80">
              <CardContent className="p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
                  <AlertCircle className="h-4 w-4" />
                  Inattivi (&gt;30gg)
                </div>
                <p className="text-2xl font-bold text-amber-400">{kpis.inactive}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
            <div className="relative flex-1 min-[834px]:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border bg-background-secondary pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={periodFilter === '7' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodFilter('7')}
                className="border-border"
              >
                7 giorni
              </Button>
              <Button
                variant={periodFilter === '30' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodFilter('30')}
                className="border-border"
              >
                30 giorni
              </Button>
            </div>
          </div>

          <Card className="border-border bg-background-secondary/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-text-primary">
                <Dumbbell className="h-4 w-4 text-cyan-400" />
                Elenco atleti ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-12 w-12 text-text-muted" />
                  <p className="text-sm text-text-secondary">
                    {data.length === 0
                      ? 'Nessun atleta nella vista marketing.'
                      : 'Nessun risultato per la ricerca.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-text-secondary">Nome</TableHead>
                        <TableHead className="text-text-secondary">Email</TableHead>
                        <TableHead className="text-text-secondary">
                          Workout {periodFilter}d (coach / solo)
                        </TableHead>
                        <TableHead className="text-text-secondary">Workout 30d</TableHead>
                        <TableHead className="text-text-secondary">Ultimo workout</TableHead>
                        <TableHead className="text-text-secondary">Stato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((row) => {
                        const coached7 = Number(row.workouts_coached_7d ?? 0)
                        const solo7 = Number(row.workouts_solo_7d ?? 0)
                        const coached30 = Number(row.workouts_coached_30d ?? 0)
                        const solo30 = Number(row.workouts_solo_30d ?? 0)
                        const inactive = isInactive(row.last_workout_at)
                        const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || '–'
                        return (
                          <TableRow key={row.athlete_id} className="border-border/50 hover:bg-background-tertiary/30">
                            <TableCell className="font-medium">{name}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-text-muted" title={row.email ?? undefined}>
                              {row.email ?? '–'}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {periodFilter === '7'
                                ? `${coached7} coach / ${solo7} solo`
                                : `${coached30} coach / ${solo30} solo`}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {coached30} coach / {solo30} solo
                            </TableCell>
                            <TableCell className="text-text-muted">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(row.last_workout_at)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  inactive
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                                }`}
                              >
                                {inactive ? 'INATTIVO' : 'ATTIVO'}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
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
