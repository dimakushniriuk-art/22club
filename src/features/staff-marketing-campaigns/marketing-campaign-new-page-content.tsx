'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Database } from '@/lib/supabase/types'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import { useMarketingCampaignMutations } from '@/hooks/use-marketing-campaigns'
import {
  MARKETING_CAMPAIGN_CHANNEL_LABELS,
  MARKETING_CAMPAIGN_STATUS_LABELS,
} from '@/lib/marketing/labels'

const CHANNELS = Object.entries(MARKETING_CAMPAIGN_CHANNEL_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const STATUSES = Object.entries(MARKETING_CAMPAIGN_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function MarketingCampaignNewPageContent() {
  const router = useRouter()
  const { org_id } = useAuth()
  const { showLoader } = useMarketingDashboardGuard()
  const { createCampaign } = useMarketingCampaignMutations()
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<string>('email')
  const [budget, setBudget] = useState<string>('')
  const [startAt, setStartAt] = useState<string>('')
  const [endAt, setEndAt] = useState<string>('')
  const [status, setStatus] = useState<string>('draft')
  const [error, setError] = useState<string | null>(null)

  if (showLoader) {
    return <StaffMarketingSegmentSkeleton />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Inserisci un nome per la campagna.')
      return
    }
    const orgId = org_id ?? undefined
    if (!orgId) {
      setError('Organizzazione non disponibile.')
      return
    }
    setError(null)
    type Insert = Database['public']['Tables']['marketing_campaigns']['Insert']
    const payload: Insert = {
      org_id: orgId,
      org_id_text: orgId,
      name: name.trim(),
      channel: channel || null,
      budget: budget === '' ? null : Number(budget),
      start_at: startAt || null,
      end_at: endAt || null,
      status: status as 'draft' | 'active' | 'paused' | 'ended',
    }
    try {
      await createCampaign.mutateAsync(payload)
      router.push('/dashboard/marketing/campaigns')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Salvataggio non riuscito')
    }
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold md:text-2xl">Nuova campagna</h1>
      </header>

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="text-base text-text-primary">Dati campagna</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="name" className="text-text-secondary">
                Nome *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Newsletter Q1"
                className="mt-1 border-border bg-background"
                required
              />
            </div>
            <div>
              <Label htmlFor="channel" className="text-text-secondary">
                Canale
              </Label>
              <select
                id="channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="budget" className="text-text-secondary">
                Budget (€)
              </Label>
              <Input
                id="budget"
                type="number"
                min={0}
                step={0.01}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className="mt-1 border-border bg-background"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="start_at" className="text-text-secondary">
                  Data inizio
                </Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="mt-1 border-border bg-background"
                />
              </div>
              <div>
                <Label htmlFor="end_at" className="text-text-secondary">
                  Data fine
                </Label>
                <Input
                  id="end_at"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="mt-1 border-border bg-background"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-text-secondary">
                Stato
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createCampaign.isPending}>
                {createCampaign.isPending ? (
                  'Salvataggio...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva campagna
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/marketing/campaigns">Annulla</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
