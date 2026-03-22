'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notifySuccess, notifyError } from '@/lib/notifications'

type Result =
  | { success: true; user_id: string; profile_id: string; email: string }
  | { success: false; error: string }

export default function AdminCreaMarketingPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [form, setForm] = useState({
    email: '',
    password: '123456',
    nome: '',
    cognome: '',
    org_id: 'default-org',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nome: form.nome || undefined,
          cognome: form.cognome || undefined,
          org_id: form.org_id || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult({ success: false, error: (data.error as string) || 'Errore creazione utente' })
        notifyError('Errore', (data.error as string) || 'Errore creazione utente')
        return
      }
      setResult({
        success: true,
        user_id: data.user_id,
        profile_id: data.profile_id,
        email: form.email,
      })
      notifySuccess('Utente marketing creato', `Email: ${form.email}`)
      setForm((prev) => ({ ...prev, email: '', password: '123456', nome: '', cognome: '' }))
    } catch {
      setResult({ success: false, error: 'Errore di rete' })
      notifyError('Errore', 'Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/utenti"
          className="rounded-lg p-2 text-text-secondary hover:bg-muted hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Crea utente Marketing
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Crea un account con ruolo marketing (accesso solo KPI aggregati).
          </p>
        </div>
      </div>

      <Card className="bg-background-secondary/80 border-border max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg text-white">Nuovo utente marketing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="marketing@22club.it"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Minimo 6 caratteri"
                minLength={6}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cognome">Cognome</Label>
                <Input
                  id="cognome"
                  value={form.cognome}
                  onChange={(e) => setForm((p) => ({ ...p, cognome: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="org_id">Org ID</Label>
              <Input
                id="org_id"
                value={form.org_id}
                onChange={(e) => setForm((p) => ({ ...p, org_id: e.target.value }))}
                placeholder="default-org"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creazione...' : 'Crea utente'}
              </Button>
              <Link href="/dashboard/admin/utenti">
                <Button type="button" variant="outline">
                  Annulla
                </Button>
              </Link>
            </div>
          </form>

          {result?.success && (
            <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
              <p className="font-medium">Utente creato.</p>
              <p className="mt-1 text-text-secondary">
                Email: {result.email} — Usa la password inserita per il login.
              </p>
              <p className="mt-1 font-mono text-xs">user_id: {result.user_id}</p>
            </div>
          )}
          {result && !result.success && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {result.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
