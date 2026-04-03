'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Database } from '@/lib/supabase/types'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

type SegmentRow = Database['public']['Tables']['marketing_segments']['Row']

const ACTION_TYPES = [
  { value: 'create_campaign_suggestion', label: 'Suggerimento campagna' },
  { value: 'log_event', label: 'Log evento' },
  { value: 'tag_leads', label: 'Tag lead' },
]

export default function NewAutomationPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { role, org_id, loading: authLoading } = useAuth()
  const [segments, setSegments] = useState<SegmentRow[]>([])
  const [name, setName] = useState('')
  const [segmentId, setSegmentId] = useState('')
  const [actionType, setActionType] = useState<string>('create_campaign_suggestion')
  const [suggestedName, setSuggestedName] = useState('')
  const [suggestedBudget, setSuggestedBudget] = useState('')
  const [eventType, setEventType] = useState('segment_audience')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) return
    let cancelled = false
    supabase
      .from('marketing_segments')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (!cancelled && data?.length) {
          setSegments(data as SegmentRow[])
          if (!segmentId) setSegmentId(data[0].id)
        }
      })
    return () => {
      cancelled = true
    }
  }, [role, authLoading, supabase, segmentId])

  const allowed = role != null && ['admin', 'marketing'].includes(role as string)
  if (authLoading || (role !== null && !allowed)) {
    if (!authLoading && role !== null && !allowed) {
      router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
    }
    return <StaffMarketingSegmentSkeleton />
  }

  const buildPayload = (): Record<string, unknown> => {
    if (actionType === 'create_campaign_suggestion') {
      return {
        suggested_name: suggestedName.trim() || undefined,
        suggested_budget: suggestedBudget.trim() ? Number(suggestedBudget) : undefined,
      }
    }
    if (actionType === 'log_event') {
      return { event_type: eventType.trim() || 'segment_audience' }
    }
    return {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Inserisci un nome.')
      return
    }
    if (!segmentId) {
      setError('Seleziona un segmento.')
      return
    }
    setSaving(true)
    setError(null)
    const orgId = org_id ?? undefined
    if (!orgId) {
      setError('Organizzazione non disponibile.')
      setSaving(false)
      return
    }
    type Insert = Database['public']['Tables']['marketing_automations']['Insert']
    const insert: Insert = {
      org_id: orgId,
      org_id_text: orgId,
      name: name.trim(),
      segment_id: segmentId,
      action_type: actionType as 'create_campaign_suggestion' | 'log_event' | 'tag_leads',
      action_payload: buildPayload() as Insert['action_payload'],
      is_active: true,
    }
    const { error: err } = await supabase.from('marketing_automations').insert(insert)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    router.push('/dashboard/marketing/automations')
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/automations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold min-[834px]:text-2xl">Nuova automazione</h1>
      </header>

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="text-base text-text-primary">Dati</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <div>
              <Label className="text-text-secondary">Nome *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Suggerimento inattivi"
                className="mt-1 border-border bg-background"
              />
            </div>
            <div>
              <Label className="text-text-secondary">Segmento *</Label>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
              >
                <option value="">–</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-text-secondary">Tipo azione *</Label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            {actionType === 'create_campaign_suggestion' && (
              <>
                <div>
                  <Label className="text-text-secondary">Nome suggerito (opzionale)</Label>
                  <Input
                    value={suggestedName}
                    onChange={(e) => setSuggestedName(e.target.value)}
                    placeholder="Es. Campagna inattivi 30d"
                    className="mt-1 border-border bg-background"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Budget suggerito (opzionale)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={suggestedBudget}
                    onChange={(e) => setSuggestedBudget(e.target.value)}
                    placeholder="0"
                    className="mt-1 border-border bg-background"
                  />
                </div>
              </>
            )}
            {actionType === 'log_event' && (
              <div>
                <Label className="text-text-secondary">Tipo evento</Label>
                <Input
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="segment_audience"
                  className="mt-1 border-border bg-background"
                />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  'Salvataggio...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/marketing/automations">Annulla</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
