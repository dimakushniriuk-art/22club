'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { Layers, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applySegmentRules, type SegmentRules } from '@/lib/marketing/segment-rules'
import type { Database } from '@/lib/supabase/types'
import type { MarketingAthleteRow } from '@/app/api/marketing/athletes/route'
import {
  StaffMarketingDataBlockSkeleton,
  StaffMarketingSegmentSkeleton,
} from '@/components/layout/route-loading-skeletons'

type SegmentRow = Database['public']['Tables']['marketing_segments']['Row']
type AthleteRow = MarketingAthleteRow

export default function MarketingSegmentsPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { role, loading: authLoading } = useAuth()
  const [segments, setSegments] = useState<SegmentRow[]>([])
  const [athletes, setAthletes] = useState<AthleteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
      if (!authLoading && role !== null && role !== 'marketing' && role !== 'admin') {
        router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
      }
      return
    }

    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      setError(null)
      try {
        const [segRes, athRes] = await Promise.all([
          supabase.from('marketing_segments').select('*').order('updated_at', { ascending: false }),
          fetch('/api/marketing/athletes'),
        ])
        if (cancelled) return
        if (segRes.error) {
          setError(segRes.error.message)
          return
        }
        setSegments((segRes.data ?? []) as SegmentRow[])
        const athJson = await athRes.json()
        if (athRes.ok && athJson.data) setAthletes((athJson.data ?? []) as AthleteRow[])
      } catch {
        if (!cancelled) setError('Errore di rete')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => {
      cancelled = true
    }
  }, [role, authLoading, router, supabase])

  const handleToggleActive = async (seg: SegmentRow) => {
    setTogglingId(seg.id)
    const { error: err } = await supabase
      .from('marketing_segments')
      .update({ is_active: !seg.is_active, updated_at: new Date().toISOString() })
      .eq('id', seg.id)
    setTogglingId(null)
    if (err) return
    setSegments((prev) =>
      prev.map((s) => (s.id === seg.id ? { ...s, is_active: !s.is_active } : s)),
    )
  }

  const estimatedCount = (rules: SegmentRules | null | undefined) =>
    applySegmentRules(athletes, rules ?? undefined).length

  if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return <StaffMarketingSegmentSkeleton />
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex flex-col gap-4 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold min-[834px]:text-2xl">
            <Layers className="h-6 w-6 text-cyan-400" />
            Segmenti
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Crea e gestisci segmenti di atleti (dati da vista marketing).
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/dashboard/marketing/segments/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo segmento
          </Link>
        </Button>
      </header>

      {loading ? (
        <StaffMarketingDataBlockSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : segments.length === 0 ? (
        <Card className="border-border bg-background-secondary/80">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="mb-3 h-12 w-12 text-text-muted" />
            <p className="text-center text-sm text-text-secondary">Nessun segmento. Creane uno.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/marketing/segments/new">Nuovo segmento</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">Elenco segmenti</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {segments.map((seg) => (
                <li
                  key={seg.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-background-tertiary/30 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{seg.name}</span>
                      {seg.is_active ? (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-400">
                          Attivo
                        </span>
                      ) : (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">
                          Disattivo
                        </span>
                      )}
                    </div>
                    {seg.description && (
                      <p className="mt-0.5 truncate text-xs text-text-muted">{seg.description}</p>
                    )}
                    <p className="mt-1 text-xs text-text-tertiary">
                      ~{estimatedCount(seg.rules as SegmentRules)} atleti · aggiornato{' '}
                      {new Date(seg.updated_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(seg)}
                      disabled={togglingId === seg.id}
                      className="rounded p-1 text-text-muted hover:bg-background-tertiary hover:text-text-primary disabled:opacity-50"
                      title={seg.is_active ? 'Disattiva' : 'Attiva'}
                    >
                      {seg.is_active ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/marketing/segments/${seg.id}`}>Dettaglio</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
