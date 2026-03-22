'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { ArrowLeft, Edit, Play, Pause, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = useSupabaseClient()
  const { role, loading: authLoading } = useAuth()
  const id = typeof params.id === 'string' ? params.id : null
  const [campaign, setCampaign] = useState<CampaignRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

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
    const campaignId = id
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()
      if (cancelled) return
      if (err || !data) {
        setError(err?.message ?? 'Campagna non trovata')
        setCampaign(null)
      } else {
        setCampaign(data as CampaignRow)
      }
      setLoading(false)
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [id, role, authLoading, router, supabase])

  const setStatus = async (newStatus: 'active' | 'paused' | 'ended') => {
    if (!campaign?.id) return
    setUpdating(true)
    const { error: err } = await supabase
      .from('marketing_campaigns')
      .update({ status: newStatus })
      .eq('id', campaign.id)
    setUpdating(false)
    if (!err) setCampaign((prev) => (prev ? { ...prev, status: newStatus } : null))
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

  if (error || !campaign) {
    return (
      <div className="space-y-6 bg-background p-4 min-[834px]:p-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error ?? 'Campagna non trovata'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex flex-col gap-4 min-[834px]:flex-row min-[834px]:items-center min-[834px]:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/marketing/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold min-[834px]:text-2xl">{campaign.name}</h1>
            <p className="text-sm text-text-secondary">
              {CHANNEL_LABELS[campaign.channel ?? ''] ?? campaign.channel ?? '–'} ·{' '}
              {STATUS_LABELS[campaign.status]}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/marketing/campaigns/${campaign.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Link>
        </Button>
      </header>

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="text-base text-text-primary">Dettaglio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm min-[834px]:grid-cols-2">
            <div>
              <span className="text-text-muted">Canale:</span>{' '}
              {CHANNEL_LABELS[campaign.channel ?? ''] ?? campaign.channel ?? '–'}
            </div>
            <div>
              <span className="text-text-muted">Budget:</span>{' '}
              {campaign.budget != null
                ? `€ ${Number(campaign.budget).toLocaleString('it-IT')}`
                : '–'}
            </div>
            <div>
              <span className="text-text-muted">Inizio:</span> {formatDate(campaign.start_at)}
            </div>
            <div>
              <span className="text-text-muted">Fine:</span> {formatDate(campaign.end_at)}
            </div>
            <div>
              <span className="text-text-muted">Stato:</span> {STATUS_LABELS[campaign.status]}
            </div>
            <div>
              <span className="text-text-muted">Aggiornato:</span> {formatDate(campaign.updated_at)}
            </div>
          </div>
        </CardContent>
      </Card>

      {campaign.status !== 'ended' && (
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">Azioni rapide</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {campaign.status !== 'active' && (
              <Button
                variant="default"
                size="sm"
                disabled={updating}
                onClick={() => setStatus('active')}
              >
                <Play className="mr-2 h-4 w-4" />
                Attiva
              </Button>
            )}
            {campaign.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => setStatus('paused')}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pausa
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={updating}
              onClick={() => setStatus('ended')}
            >
              <Square className="mr-2 h-4 w-4" />
              Termina
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
