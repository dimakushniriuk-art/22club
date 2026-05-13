'use client'

import Link from 'next/link'
import { ArrowLeft, Edit, Play, Pause, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import {
  useMarketingCampaign,
  useMarketingCampaignMutations,
} from '@/hooks/use-marketing-campaigns'
import {
  MARKETING_CAMPAIGN_CHANNEL_LABELS,
  MARKETING_CAMPAIGN_STATUS_LABELS,
} from '@/lib/marketing/labels'
import { formatMarketingDateTime } from '@/lib/marketing/format'

export function MarketingCampaignDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = useResolvedParams(params)
  const id = typeof resolved.id === 'string' ? resolved.id : null
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data: campaign, loading, error } = useMarketingCampaign(id, canAccess)
  const { updateCampaignStatus } = useMarketingCampaignMutations()

  const setStatus = async (newStatus: 'active' | 'paused' | 'ended') => {
    if (!campaign?.id) return
    await updateCampaignStatus.mutateAsync({ campaignId: campaign.id, status: newStatus })
  }

  if (showLoader || loading) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6 bg-background p-4 md:p-6">
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
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/marketing/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">{campaign.name}</h1>
            <p className="text-sm text-text-secondary">
              {MARKETING_CAMPAIGN_CHANNEL_LABELS[campaign.channel ?? ''] ?? campaign.channel ?? '–'}{' '}
              · {MARKETING_CAMPAIGN_STATUS_LABELS[campaign.status]}
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
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <span className="text-text-muted">Canale:</span>{' '}
              {MARKETING_CAMPAIGN_CHANNEL_LABELS[campaign.channel ?? ''] ?? campaign.channel ?? '–'}
            </div>
            <div>
              <span className="text-text-muted">Budget:</span>{' '}
              {campaign.budget != null
                ? `€ ${Number(campaign.budget).toLocaleString('it-IT')}`
                : '–'}
            </div>
            <div>
              <span className="text-text-muted">Inizio:</span>{' '}
              {formatMarketingDateTime(campaign.start_at)}
            </div>
            <div>
              <span className="text-text-muted">Fine:</span>{' '}
              {formatMarketingDateTime(campaign.end_at)}
            </div>
            <div>
              <span className="text-text-muted">Stato:</span>{' '}
              {MARKETING_CAMPAIGN_STATUS_LABELS[campaign.status]}
            </div>
            <div>
              <span className="text-text-muted">Aggiornato:</span>{' '}
              {formatMarketingDateTime(campaign.updated_at)}
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
                disabled={updateCampaignStatus.isPending}
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
                disabled={updateCampaignStatus.isPending}
                onClick={() => setStatus('paused')}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pausa
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={updateCampaignStatus.isPending}
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
