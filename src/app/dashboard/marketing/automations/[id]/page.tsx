'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { Zap, ArrowLeft, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/supabase/types'

type AutomationRow = Database['public']['Tables']['marketing_automations']['Row']
type SegmentRow = Database['public']['Tables']['marketing_segments']['Row']

const ACTION_LABELS: Record<string, string> = {
  create_campaign_suggestion: 'Suggerimento campagna',
  log_event: 'Log evento',
  tag_leads: 'Tag lead',
}

function formatDate(s: string | null): string {
  if (!s) return '–'
  return new Date(s).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AutomationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { role, loading: authLoading } = useAuth()
  const id = typeof params.id === 'string' ? params.id : null
  const [automation, setAutomation] = useState<AutomationRow | null>(null)
  const [segment, setSegment] = useState<SegmentRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<{ athletes_count: number } | null>(null)

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
    let cancelled = false
    async function fetchOne() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/marketing/automations/${id}`)
        if (cancelled) return
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          setError((j.error as string) ?? 'Non trovato')
          setLoading(false)
          return
        }
        const json = await res.json()
        setAutomation(json.data?.automation ?? null)
        setSegment(json.data?.segment ?? null)
      } catch {
        if (!cancelled) setError('Errore di rete')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOne()
    return () => { cancelled = true }
  }, [id, role, authLoading, router])

  const handleRun = async () => {
    if (!id) return
    setRunning(true)
    setRunResult(null)
    try {
      const res = await fetch(`/api/marketing/automations/${id}/run`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.data) {
        setRunResult({ athletes_count: json.data.athletes_count })
        setAutomation((prev) =>
          prev ? { ...prev, last_run_at: json.data.last_run_at ?? prev.last_run_at } : null,
        )
      }
    } finally {
      setRunning(false)
    }
  }

  if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !automation) {
    return (
      <div className="space-y-6 bg-background p-4 min-[834px]:p-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/automations"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error ?? 'Automazione non trovata'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex flex-col gap-4 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/marketing/automations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold min-[834px]:text-2xl">
              <Zap className="h-6 w-6 text-cyan-400" />
              {automation.name}
            </h1>
            <p className="text-sm text-text-secondary">
              {ACTION_LABELS[automation.action_type] ?? automation.action_type} · Segmento: {segment?.name ?? automation.segment_id}
            </p>
          </div>
        </div>
        <Button onClick={handleRun} disabled={running}>
          <Play className="mr-2 h-4 w-4" />
          {running ? 'Esecuzione...' : 'Esegui ora'}
        </Button>
      </header>

      {runResult != null && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Esecuzione completata. Atleti nel segmento: {runResult.athletes_count}. last_run_at aggiornato.
        </div>
      )}

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="text-base text-text-primary">Dettaglio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-text-muted">Stato:</span> {automation.is_active ? 'Attiva' : 'Disattiva'}</div>
          <div><span className="text-text-muted">Segmento:</span> {segment?.name ?? automation.segment_id}</div>
          <div><span className="text-text-muted">Azione:</span> {ACTION_LABELS[automation.action_type] ?? automation.action_type}</div>
          <div><span className="text-text-muted">Ultima esecuzione:</span> {formatDate(automation.last_run_at)}</div>
          <div><span className="text-text-muted">Payload:</span> <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs">{JSON.stringify(automation.action_payload, null, 2)}</pre></div>
        </CardContent>
      </Card>
    </div>
  )
}
