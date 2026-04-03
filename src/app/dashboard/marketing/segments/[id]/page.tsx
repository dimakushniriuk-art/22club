'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { ArrowLeft, Edit, Users, ToggleLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { applySegmentRules, type SegmentRules } from '@/lib/marketing/segment-rules'
import type { Database } from '@/lib/supabase/types'
import type { MarketingAthleteRow } from '@/app/api/marketing/athletes/route'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

type SegmentRow = Database['public']['Tables']['marketing_segments']['Row']
type AthleteRow = MarketingAthleteRow

function formatDate(s: string | null): string {
  if (!s) return '–'
  return new Date(s).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SegmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = useSupabaseClient()
  const { role, loading: authLoading } = useAuth()
  const id = typeof params.id === 'string' ? params.id : null
  const [segment, setSegment] = useState<SegmentRow | null>(null)
  const [athletes, setAthletes] = useState<AthleteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disabling, setDisabling] = useState(false)

  useEffect(() => {
    if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
      if (!authLoading && role !== null && role !== 'marketing' && role !== 'admin') {
        router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
      }
      return
    }
    if (!id) {
      setLoading(false)
      setError('ID mancante')
      return
    }
    const segmentId = id
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [segResult, athRes] = await Promise.all([
          supabase.from('marketing_segments').select('*').eq('id', segmentId).single(),
          fetch('/api/marketing/athletes'),
        ])
        if (cancelled) return
        const { data: segData, error: segErr } = segResult
        if (segErr || !segData) {
          setError(segErr?.message ?? 'Segmento non trovato')
          setSegment(null)
          setAthletes([])
          setLoading(false)
          return
        }
        setSegment(segData as SegmentRow)
        const athJson = await athRes.json()
        if (cancelled) return
        if (athRes.ok && athJson.data) setAthletes((athJson.data ?? []) as AthleteRow[])
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
  }, [id, role, authLoading, router, supabase])

  const filteredAthletes = segment ? applySegmentRules(athletes, segment.rules as SegmentRules) : []

  const handleDisattiva = async () => {
    if (!segment?.id) return
    setDisabling(true)
    const { error: err } = await supabase
      .from('marketing_segments')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', segment.id)
    setDisabling(false)
    if (!err) setSegment((prev) => (prev ? { ...prev, is_active: false } : null))
  }

  if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (loading) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (error || !segment) {
    return (
      <div className="space-y-4 bg-background p-4 min-[834px]:p-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/segments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error ?? 'Segmento non trovato'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex flex-col gap-4 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/marketing/segments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold min-[834px]:text-2xl">{segment.name}</h1>
            {segment.description && (
              <p className="text-sm text-text-secondary">{segment.description}</p>
            )}
            <p className="mt-1 text-xs text-text-tertiary">
              {segment.is_active ? (
                <span className="text-emerald-400">Attivo</span>
              ) : (
                <span className="text-amber-400">Disattivo</span>
              )}{' '}
              · Aggiornato {formatDate(segment.updated_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/marketing/segments/${segment.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Link>
          </Button>
          {segment.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisattiva}
              disabled={disabling}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              <ToggleLeft className="mr-2 h-4 w-4" />
              Disattiva
            </Button>
          )}
        </div>
      </header>

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-cyan-400" />
            Atleti nel segmento ({filteredAthletes.length})
          </CardTitle>
          <p className="text-xs text-text-muted">
            Dati dalla vista marketing_athletes, filtrati dalle regole del segmento.
          </p>
        </CardHeader>
        <CardContent>
          {filteredAthletes.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-secondary">
              Nessun atleta corrisponde alle regole del segmento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-text-secondary">Nome</TableHead>
                    <TableHead className="text-text-secondary">Email</TableHead>
                    <TableHead className="text-text-secondary">Workout 7d</TableHead>
                    <TableHead className="text-text-secondary">Workout 30d</TableHead>
                    <TableHead className="text-text-secondary">Ultimo workout</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAthletes.map((row) => (
                    <TableRow key={row.athlete_id} className="border-border/50">
                      <TableCell className="font-medium">
                        {[row.first_name, row.last_name].filter(Boolean).join(' ') || '–'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-text-muted">
                        {row.email ?? '–'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {Number(row.workouts_coached_7d ?? 0)} coach /{' '}
                        {Number(row.workouts_solo_7d ?? 0)} solo
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {Number(row.workouts_coached_30d ?? 0)} coach /{' '}
                        {Number(row.workouts_solo_30d ?? 0)} solo
                      </TableCell>
                      <TableCell className="text-text-muted">
                        {formatDate(row.last_workout_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
