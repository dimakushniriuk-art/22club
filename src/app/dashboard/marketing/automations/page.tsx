'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { Zap, Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/supabase/types'
import {
  StaffMarketingDataBlockSkeleton,
  StaffMarketingSegmentSkeleton,
} from '@/components/layout/route-loading-skeletons'

type AutomationRow = Database['public']['Tables']['marketing_automations']['Row']
type SegmentRow = Database['public']['Tables']['marketing_segments']['Row']

const ACTION_LABELS: Record<string, string> = {
  create_campaign_suggestion: 'Suggerimento campagna',
  log_event: 'Log evento',
  tag_leads: 'Tag lead',
}

function formatDate(s: string | null): string {
  if (!s) return '–'
  return new Date(s).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MarketingAutomationsPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { role, loading: authLoading } = useAuth()
  const [automations, setAutomations] = useState<AutomationRow[]>([])
  const [segments, setSegments] = useState<SegmentRow[]>([])
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
        const [autoRes, segRes] = await Promise.all([
          supabase
            .from('marketing_automations')
            .select('*')
            .order('updated_at', { ascending: false }),
          supabase.from('marketing_segments').select('id, name'),
        ])
        if (cancelled) return
        if (autoRes.error) {
          setError(autoRes.error.message)
          return
        }
        setAutomations((autoRes.data ?? []) as AutomationRow[])
        setSegments((segRes.data ?? []) as SegmentRow[])
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

  const handleToggleActive = async (row: AutomationRow) => {
    setTogglingId(row.id)
    const { error: err } = await supabase
      .from('marketing_automations')
      .update({ is_active: !row.is_active })
      .eq('id', row.id)
    setTogglingId(null)
    if (err) return
    setAutomations((prev) =>
      prev.map((a) => (a.id === row.id ? { ...a, is_active: !a.is_active } : a)),
    )
  }

  const segmentName = (segmentId: string) =>
    segments.find((s) => s.id === segmentId)?.name ?? segmentId

  if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return <StaffMarketingSegmentSkeleton />
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex flex-col gap-4 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold min-[834px]:text-2xl">
            <Zap className="h-6 w-6 text-cyan-400" />
            Automazioni
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Azioni su segmenti: suggerimenti campagne, log eventi.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/dashboard/marketing/automations/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuova
          </Link>
        </Button>
      </header>

      {loading ? (
        <StaffMarketingDataBlockSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : (
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">
              Elenco ({automations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {automations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Zap className="mb-3 h-12 w-12 text-text-muted" />
                <p className="text-center text-sm text-text-secondary">
                  Nessuna automazione. Creane una.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/marketing/automations/new">Nuova automazione</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {automations.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-sm text-text-muted">
                        Segmento: {segmentName(row.segment_id)} ·{' '}
                        {ACTION_LABELS[row.action_type] ?? row.action_type}
                      </p>
                      <p className="text-xs text-text-muted">
                        Ultima esecuzione: {formatDate(row.last_run_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(row)}
                        disabled={togglingId === row.id}
                      >
                        {row.is_active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        {row.is_active ? 'Attiva' : 'Disattiva'}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/marketing/automations/${row.id}`}>Dettaglio</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
