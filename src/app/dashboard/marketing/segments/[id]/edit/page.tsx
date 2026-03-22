'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SegmentRules } from '@/lib/marketing/segment-rules'
import type { Database } from '@/lib/supabase/types'

type SegmentRow = Database['public']['Tables']['marketing_segments']['Row']

export default function EditSegmentPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = useSupabaseClient()
  const { role, loading: authLoading } = useAuth()
  const id = typeof params.id === 'string' ? params.id : null
  const [segment, setSegment] = useState<SegmentRow | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState<SegmentRules>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    const segmentId = id
    let cancelled = false
    async function fetchSegment() {
      const { data, error: err } = await supabase
        .from('marketing_segments')
        .select('*')
        .eq('id', segmentId)
        .single()
      if (cancelled) return
      if (err || !data) {
        setError(err?.message ?? 'Non trovato')
        setLoading(false)
        return
      }
      const seg = data as SegmentRow
      setSegment(seg)
      setName(seg.name)
      setDescription(seg.description ?? '')
      setRules((seg.rules as SegmentRules) ?? {})
      setLoading(false)
    }
    fetchSegment()
    return () => {
      cancelled = true
    }
  }, [id, supabase])

  if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    if (!authLoading && role !== null && role !== 'marketing' && role !== 'admin') {
      router.replace((role as string) === 'admin' ? '/dashboard/admin' : '/dashboard')
    }
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const setRule = <K extends keyof SegmentRules>(key: K, value: SegmentRules[K]) => {
    setRules((prev) => {
      const next = { ...prev }
      const isEmpty =
        value === undefined || value === null || (typeof value === 'string' && value === '')
      if (isEmpty) {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !name.trim()) return
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('marketing_segments')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        rules: rules as unknown as SegmentRow['rules'],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    router.push(`/dashboard/marketing/segments/${id}`)
  }

  if (loading || !segment) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background">
        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
          </div>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/marketing/segments/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold min-[834px]:text-2xl">Modifica segmento</h1>
          <p className="text-sm text-text-secondary">{segment.name}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base">Dati segmento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border bg-background"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base">Regole</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 min-[834px]:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inactivity_days">Inattività (giorni minimi)</Label>
                <Input
                  id="inactivity_days"
                  type="number"
                  min={0}
                  value={rules.inactivity_days ?? ''}
                  onChange={(e) =>
                    setRule(
                      'inactivity_days',
                      e.target.value === '' ? undefined : Number(e.target.value),
                    )
                  }
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Ultimo workout</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={rules.last_workout_exists === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setRule(
                        'last_workout_exists',
                        rules.last_workout_exists === true ? undefined : true,
                      )
                    }
                  >
                    Deve esistere
                  </Button>
                  <Button
                    type="button"
                    variant={rules.last_workout_exists === false ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setRule(
                        'last_workout_exists',
                        rules.last_workout_exists === false ? undefined : false,
                      )
                    }
                  >
                    Non deve esistere
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_coached_7d">Min workout con trainer (7d)</Label>
                <Input
                  id="min_coached_7d"
                  type="number"
                  min={0}
                  value={rules.min_workouts_coached_7d ?? ''}
                  onChange={(e) =>
                    setRule(
                      'min_workouts_coached_7d',
                      e.target.value === '' ? undefined : Number(e.target.value),
                    )
                  }
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_solo_7d">Min workout da solo (7d)</Label>
                <Input
                  id="min_solo_7d"
                  type="number"
                  min={0}
                  value={rules.min_workouts_solo_7d ?? ''}
                  onChange={(e) =>
                    setRule(
                      'min_workouts_solo_7d',
                      e.target.value === '' ? undefined : Number(e.target.value),
                    )
                  }
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_coached_30d">Min workout con trainer (30d)</Label>
                <Input
                  id="min_coached_30d"
                  type="number"
                  min={0}
                  value={rules.min_workouts_coached_30d ?? ''}
                  onChange={(e) =>
                    setRule(
                      'min_workouts_coached_30d',
                      e.target.value === '' ? undefined : Number(e.target.value),
                    )
                  }
                  className="border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_solo_30d">Min workout da solo (30d)</Label>
                <Input
                  id="min_solo_30d"
                  type="number"
                  min={0}
                  value={rules.min_workouts_solo_30d ?? ''}
                  onChange={(e) =>
                    setRule(
                      'min_workouts_solo_30d',
                      e.target.value === '' ? undefined : Number(e.target.value),
                    )
                  }
                  className="border-border bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              'Salvataggio...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Salva
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/marketing/segments/${id}`}>Annulla</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
