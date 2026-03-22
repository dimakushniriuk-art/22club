'use client'

import { useState } from 'react'
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

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
  { value: 'web', label: 'Web' },
  { value: 'other', label: 'Altro' },
]

const STATUSES = [
  { value: 'draft', label: 'Bozza' },
  { value: 'active', label: 'Attiva' },
  { value: 'paused', label: 'In pausa' },
  { value: 'ended', label: 'Terminata' },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { role, org_id, loading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<string>('email')
  const [budget, setBudget] = useState<string>('')
  const [startAt, setStartAt] = useState<string>('')
  const [endAt, setEndAt] = useState<string>('')
  const [status, setStatus] = useState<string>('draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allowed = role != null && ['admin', 'marketing'].includes(role as string)
  if (authLoading || (role !== null && !allowed)) {
    if (!authLoading && role !== null && !allowed) {
      router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
    }
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
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
    setSaving(true)
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
    const { error: err } = await supabase.from('marketing_campaigns').insert(payload)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    router.push('/dashboard/marketing/campaigns')
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold min-[834px]:text-2xl">Nuova campagna</h1>
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
            <div className="grid gap-4 min-[834px]:grid-cols-2">
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
              <Button type="submit" disabled={saving}>
                {saving ? (
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
