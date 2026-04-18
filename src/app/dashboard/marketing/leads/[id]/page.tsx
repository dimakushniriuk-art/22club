'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { ArrowLeft, CheckCircle, Search, UserCheck, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StaffMarketingSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { invalidateClientiQueries } from '@/lib/react-query/post-mutation-cache'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  trial: 'Prova',
  converted: 'Convertito',
  lost: 'Perso',
}

type LeadRow = {
  id: string
  org_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  source: string | null
  status: string
  converted_athlete_profile_id: string | null
  converted_at: string | null
  converted_by_profile_id: string | null
  created_at: string
  updated_at: string
}

type NoteRow = { id: string; note: string; author_id: string | null; created_at: string }
type AthleteOption = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
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

export default function LeadDetailPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const params = useParams()
  const { role, loading: authLoading } = useAuth()
  const id = typeof params.id === 'string' ? params.id : null
  const [lead, setLead] = useState<LeadRow | null>(null)
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [athletes, setAthletes] = useState<AthleteOption[]>([])
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('')
  const [converting, setConverting] = useState(false)
  const [convertingTrial, setConvertingTrial] = useState(false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const toast = useToast()

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
    async function fetchLead() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/marketing/leads/${id}`)
        if (cancelled) return
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          setError((j.error as string) ?? 'Errore caricamento')
          setLoading(false)
          return
        }
        const json = await res.json()
        const { lead: l, notes: n } = json.data ?? {}
        if (!cancelled) {
          setLead(l ?? null)
          setNotes(Array.isArray(n) ? n : [])
        }
      } catch {
        if (!cancelled) setError('Errore di rete')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchLead()
    return () => {
      cancelled = true
    }
  }, [id, role, authLoading, router])

  const searchAthletes = async () => {
    const q = searchEmail.trim()
    try {
      const res = await fetch(`/api/marketing/leads/athletes-search?q=${encodeURIComponent(q)}`)
      if (!res.ok) return
      const json = await res.json()
      const list = Array.isArray(json.data) ? json.data : []
      setAthletes(list)
      setSelectedAthleteId(list.length > 0 ? (list[0] as AthleteOption).id : '')
    } catch {
      setAthletes([])
    }
  }

  const handleConvert = async () => {
    if (!id || !selectedAthleteId) {
      setConvertError('Seleziona un atleta')
      return
    }
    setConverting(true)
    setConvertError(null)
    try {
      const res = await fetch(`/api/marketing/leads/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athlete_profile_id: selectedAthleteId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setConvertError((json.error as string) ?? 'Errore conversione')
        setConverting(false)
        return
      }
      if (json.data) setLead(json.data as LeadRow)
      void invalidateClientiQueries(queryClient)
    } catch {
      setConvertError('Errore di rete')
    } finally {
      setConverting(false)
    }
  }

  const handleConvertTrial = async () => {
    if (!id) return
    setConvertingTrial(true)
    setConvertError(null)
    try {
      const res = await fetch('/api/marketing/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id, sendInvite: true }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (json.error as string) ?? 'Errore conversione'
        setConvertError(msg)
        toast.addToast?.({ title: 'Errore', message: msg, variant: 'error' })
        setConvertingTrial(false)
        return
      }
      const profileId = (json as { profileId?: string }).profileId
      if (profileId) {
        setLead((prev) =>
          prev
            ? {
                ...prev,
                status: 'converted',
                converted_athlete_profile_id: profileId,
                converted_at: new Date().toISOString(),
              }
            : null,
        )
      }
      toast.addToast?.({
        title: 'Lead convertito',
        message: (json as { inviteSent?: boolean }).inviteSent
          ? 'Invito inviato per email. Atleta creato in trial.'
          : 'Atleta trial creato.',
        variant: 'success',
      })
      void invalidateClientiQueries(queryClient)
    } catch {
      setConvertError('Errore di rete')
      toast.addToast?.({ title: 'Errore', message: 'Errore di rete', variant: 'error' })
    } finally {
      setConvertingTrial(false)
    }
  }

  if (authLoading || (role !== null && role !== 'marketing' && role !== 'admin')) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (loading) {
    return <StaffMarketingSegmentSkeleton />
  }

  if (error || !lead) {
    return (
      <div className="space-y-6 bg-background p-4 min-[834px]:p-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error ?? 'Lead non trovato'}
        </div>
      </div>
    )
  }

  const isConverted = lead.status === 'converted'

  return (
    <div className="space-y-6 bg-background p-4 text-text-primary min-[834px]:p-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/marketing/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold min-[834px]:text-2xl">
            {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email}
          </h1>
          <p className="text-sm text-text-secondary">{lead.email}</p>
        </div>
      </header>

      <Card className="border-border bg-background-secondary/80">
        <CardHeader>
          <CardTitle className="text-base text-text-primary">Lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="text-text-muted">Stato:</span>{' '}
            <span className="rounded-full px-2 py-0.5 bg-primary/20 text-primary">
              {STATUS_LABELS[lead.status] ?? lead.status}
            </span>
          </div>
          <div>
            <span className="text-text-muted">Fonte:</span> {lead.source ?? '–'}
          </div>
          <div>
            <span className="text-text-muted">Telefono:</span> {lead.phone ?? '–'}
          </div>
          <div>
            <span className="text-text-muted">Creato:</span> {formatDate(lead.created_at)}
          </div>
          {isConverted && (
            <>
              <div>
                <span className="text-text-muted">Convertito il:</span>{' '}
                {formatDate(lead.converted_at)}
              </div>
              {lead.converted_athlete_profile_id && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/atleti/${lead.converted_athlete_profile_id}`}
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Vai al profilo atleta
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">Note</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="rounded border border-border/50 bg-background px-3 py-2 text-sm"
                >
                  <p className="text-text-primary">{n.note}</p>
                  <p className="text-text-muted text-xs mt-1">{formatDate(n.created_at)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!isConverted && (
        <Card className="border-border bg-background-secondary/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <CheckCircle className="h-4 w-4" />
              Converti in atleta
            </CardTitle>
            <p className="text-sm text-text-secondary">
              Crea un nuovo atleta in periodo di prova (invio email di invito) oppure collega a un
              profilo esistente.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {convertError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {convertError}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleConvertTrial}
                disabled={convertingTrial}
                className="inline-flex items-center gap-2"
              >
                {convertingTrial ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Conversione...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Converti in Atleta (Trial)
                  </>
                )}
              </Button>
            </div>
            <hr className="border-border" />
            <p className="text-sm text-text-muted">
              Oppure collega a un profilo atleta già esistente (cerca per email):
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-[200px] flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    placeholder="Cerca atleta per email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onBlur={searchAthletes}
                    onKeyDown={(e) => e.key === 'Enter' && searchAthletes()}
                    className="pl-9 border-border bg-background"
                  />
                </div>
                <Button type="button" variant="outline" onClick={searchAthletes}>
                  Cerca
                </Button>
              </div>
            </div>
            {athletes.length > 0 && (
              <div>
                <Label className="text-text-secondary">Seleziona atleta</Label>
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-text-primary"
                >
                  <option value="">–</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {[a.first_name, a.last_name].filter(Boolean).join(' ') || a.email || a.id}
                      {a.email ? ` (${a.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button onClick={handleConvert} disabled={converting || !selectedAthleteId}>
              {converting ? 'Conversione...' : 'Converti'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
