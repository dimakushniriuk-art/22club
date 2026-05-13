'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
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
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { useBrowserFormDraft } from '@/hooks/use-browser-form-draft'
import { loadFormDraft, clearFormDraft } from '@/lib/browser-form-draft'
import { useToast } from '@/components/ui/toast'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import {
  useMarketingCampaign,
  useMarketingCampaignMutations,
} from '@/hooks/use-marketing-campaigns'
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

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

type CampaignEditDraftPayload = {
  name: string
  channel: string
  budget: string
  startAt: string
  endAt: string
  status: string
}

export function MarketingCampaignEditPageContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolved = useResolvedParams(params)
  const { user } = useAuth()
  const { addToast } = useToast()
  const id = typeof resolved.id === 'string' ? resolved.id : null
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data: campaign, loading, error: loadError } = useMarketingCampaign(id, canAccess)
  const { updateCampaign } = useMarketingCampaignMutations()
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<string>('email')
  const [budget, setBudget] = useState<string>('')
  const [startAt, setStartAt] = useState<string>('')
  const [endAt, setEndAt] = useState<string>('')
  const [status, setStatus] = useState<string>('draft')
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const campaignEditDraftPayload = useMemo(
    (): CampaignEditDraftPayload => ({
      name,
      channel,
      budget,
      startAt,
      endAt,
      status,
    }),
    [name, channel, budget, startAt, endAt, status],
  )

  const campaignDraftScope = user?.user_id && id ? `${user.user_id}:${id}` : null

  const campaignDraftMeaningful = useCallback((p: CampaignEditDraftPayload) => {
    return Boolean(p.name?.trim())
  }, [])

  const { clearDraft: clearCampaignEditDraft } = useBrowserFormDraft({
    feature: 'marketing-campaign-edit',
    scope: campaignDraftScope,
    value: campaignEditDraftPayload,
    isMeaningful: campaignDraftMeaningful,
    restoreEnabled: false,
  })

  const campaignDraftRestoreRef = useRef<string | null>(null)

  useEffect(() => {
    if (!campaign || initialized) return
    setName(campaign.name)
    setChannel(campaign.channel ?? 'email')
    setBudget(campaign.budget != null ? String(campaign.budget) : '')
    setStartAt(toDatetimeLocal(campaign.start_at))
    setEndAt(toDatetimeLocal(campaign.end_at))
    setStatus(campaign.status)
    setInitialized(true)
  }, [campaign, initialized])

  useEffect(() => {
    if (!campaign || !user?.user_id || !id || loading || !initialized) return
    const rk = `${user.user_id}:${id}`
    if (campaignDraftRestoreRef.current === rk) return
    campaignDraftRestoreRef.current = rk
    const env = loadFormDraft<CampaignEditDraftPayload>('marketing-campaign-edit', rk)
    if (!env?.payload?.name?.trim()) return
    const draftMs = new Date(env.savedAt).getTime()
    const serverMs = new Date(campaign.updated_at).getTime()
    if (!Number.isFinite(draftMs) || draftMs <= serverMs) {
      clearFormDraft('marketing-campaign-edit', rk)
      return
    }
    const p = env.payload
    setName(p.name)
    setChannel(p.channel || 'email')
    setBudget(p.budget)
    setStartAt(p.startAt)
    setEndAt(p.endAt)
    setStatus(p.status || 'draft')
    addToast({
      title: 'Bozza recuperata',
      message:
        'Ripristinati i campi salvati nel browser (più recenti dell’ultimo salvataggio sul server).',
      variant: 'success',
    })
  }, [campaign, loading, initialized, user?.user_id, id, addToast])

  if (showLoader || loading) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (loadError && !campaign) {
    return (
      <div className="space-y-6 bg-background p-4 md:p-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !name.trim()) {
      setError('Nome obbligatorio.')
      return
    }
    setError(null)
    type Update = Database['public']['Tables']['marketing_campaigns']['Update']
    const payload: Update = {
      name: name.trim(),
      channel: channel || null,
      budget: budget === '' ? null : Number(budget),
      start_at: startAt || null,
      end_at: endAt || null,
      status: status as 'draft' | 'active' | 'paused' | 'ended',
    }
    try {
      await updateCampaign.mutateAsync({ campaignId: id, payload })
      if (user?.user_id && id) clearCampaignEditDraft()
      router.push(`/dashboard/marketing/campaigns/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Salvataggio non riuscito')
    }
  }

  if (!campaign) {
    return null
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/marketing/campaigns/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold md:text-2xl">Modifica campagna</h1>
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
              <Button type="submit" disabled={updateCampaign.isPending}>
                {updateCampaign.isPending ? (
                  'Salvataggio...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/marketing/campaigns/${id}`}>Annulla</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
