'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SegmentRules } from '@/lib/marketing/segment-rules'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { useMarketingDashboardGuard } from '@/hooks/use-marketing-dashboard-guard'
import { useMarketingSegment, useMarketingSegmentMutations } from '@/hooks/use-marketing-segments'

export function MarketingSegmentEditPageContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolved = useResolvedParams(params)
  const id = typeof resolved.id === 'string' ? resolved.id : null
  const { showLoader, canAccess } = useMarketingDashboardGuard()
  const { data: segment, loading, error: loadError } = useMarketingSegment(id, canAccess)
  const { updateSegment } = useMarketingSegmentMutations()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState<SegmentRules>({})
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!segment || initialized) return
    setName(segment.name)
    setDescription(segment.description ?? '')
    setRules((segment.rules as SegmentRules) ?? {})
    setInitialized(true)
  }, [segment, initialized])

  if (showLoader || loading) {
    return <StaffMarketingSegmentSkeleton />
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
    setError(null)
    try {
      await updateSegment.mutateAsync({
        segmentId: id,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
          rules: rules as never,
          updated_at: new Date().toISOString(),
        },
      })
      router.push(`/dashboard/marketing/segments/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Salvataggio non riuscito')
    }
  }

  if (loadError || !segment) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background px-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError ?? error ?? 'Non trovato'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary md:p-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/marketing/segments/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Modifica segmento</h1>
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
            <div className="grid gap-4 md:grid-cols-2">
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
          <Button type="submit" disabled={updateSegment.isPending}>
            {updateSegment.isPending ? (
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
