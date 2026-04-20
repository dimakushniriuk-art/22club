'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { useNotify } from '@/lib/ui/notify'
import { createClient } from '@/lib/supabase/client'
import { UserRoundPlus, Loader2 } from 'lucide-react'
import { colors } from '@/lib/design-tokens'
import { extractInvitoClienteIdFromRpcResult } from '@/lib/staff/invito-cliente-rpc-result'

interface InvitaClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  /** Testi e messaggi di successo adattati al ruolo (es. massaggiatore). */
  inviteContext?: 'default' | 'massaggiatore'
}

type ClienteTipo = 'palestra' | 'esterno'

interface FormData {
  nome: string
  cognome: string
  email: string
  telefono: string
}

export function InvitaClienteModal({
  open,
  onOpenChange,
  onSuccess,
  inviteContext = 'default',
}: InvitaClienteModalProps) {
  const isMassaggiatore = inviteContext === 'massaggiatore'
  const { notify } = useNotify()
  const [tipoCliente, setTipoCliente] = useState<ClienteTipo>('palestra')
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    setSubmitError(null)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.nome.trim()) newErrors.nome = 'Il nome è obbligatorio'
    if (!formData.cognome.trim()) newErrors.cognome = 'Il cognome è obbligatorio'
    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida'
    }
    if (tipoCliente === 'esterno' && !formData.telefono.trim()) {
      newErrors.telefono = 'Il numero di cellulare è obbligatorio per clienti esterni'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setSubmitError(null)

    try {
      const supabase = createClient()
      if (tipoCliente === 'palestra') {
        const { data: result, error } = await supabase.rpc('crea_invito_cliente', {
          p_nome: formData.nome.trim(),
          p_cognome: formData.cognome.trim(),
          p_email: formData.email.trim(),
        })
        if (error) {
          setSubmitError(error.message ?? "Errore durante l'invito")
          return
        }
        const res = result as { success?: boolean; error?: string } | null
        if (res?.success) {
          const invitoId = extractInvitoClienteIdFromRpcResult(result)
          if (invitoId) {
            try {
              const mailRes = await fetch('/api/staff/invito-cliente/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invito_id: invitoId }),
              })
              if (!mailRes.ok) {
                const j = (await mailRes.json().catch(() => ({}))) as { error?: string }
                notify(
                  j?.error ??
                    "Invito salvato in attesa, ma l'email non è partita. Usa «Reinvia invito» dalla lista clienti.",
                  'warning',
                  'Email',
                )
              } else {
                notify(
                  isMassaggiatore
                    ? "Invito in attesa: abbiamo inviato un'email al cliente con Accetta e Non accetto. Finché non risponde, resta in pending."
                    : 'Invito in attesa: email inviata al cliente con i link per accettare o rifiutare.',
                  'success',
                  'Invito inviato',
                )
              }
            } catch {
              notify(
                "Invito salvato in attesa, ma l'email non è partita. Usa «Reinvia invito» dalla lista clienti.",
                'warning',
                'Email',
              )
            }
          } else {
            notify(
              "Invito salvato in attesa, ma non è stato possibile inviare l'email automaticamente (id invito non disponibile).",
              'warning',
              'Invito',
            )
          }
          setFormData({ nome: '', cognome: '', email: '', telefono: '' })
          onOpenChange(false)
          onSuccess?.()
        } else {
          setSubmitError(res?.error ?? "Errore durante l'invito")
        }
      } else {
        const { data: result, error } = await supabase.rpc('crea_invito_cliente_esterno', {
          p_nome: formData.nome.trim(),
          p_cognome: formData.cognome.trim(),
          p_email: formData.email.trim(),
          p_telefono: formData.telefono.trim(),
        })
        if (error) {
          setSubmitError(error.message ?? "Errore durante l'invito")
          return
        }
        const res = result as { success?: boolean; error?: string } | null
        if (res?.success) {
          const invitoId = extractInvitoClienteIdFromRpcResult(result)
          if (invitoId) {
            try {
              const mailRes = await fetch('/api/staff/invito-cliente/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invito_id: invitoId }),
              })
              if (!mailRes.ok) {
                const j = (await mailRes.json().catch(() => ({}))) as { error?: string }
                notify(
                  j?.error ??
                    "Cliente registrato, ma l'email di invito non è partita. Usa «Reinvia invito» se compare in lista.",
                  'warning',
                  'Email',
                )
              } else {
                notify(
                  isMassaggiatore
                    ? 'Cliente esterno creato: email inviata con Accetta / Non accetto. Resta in pending fino alla risposta.'
                    : 'Cliente esterno aggiunto: email inviata con i link per accettare o rifiutare.',
                  'success',
                  'Cliente aggiunto',
                )
              }
            } catch {
              notify(
                "Cliente registrato, ma l'email non è partita. Controlla la lista inviti e reinvia.",
                'warning',
                'Email',
              )
            }
          } else {
            notify(
              isMassaggiatore
                ? "Cliente esterno registrato. Se serve l'email di invito, verifica dalla lista inviti in attesa."
                : 'Cliente esterno aggiunto. Visibile solo a te e al Marketing.',
              'success',
              'Cliente aggiunto',
            )
          }
          setFormData({ nome: '', cognome: '', email: '', telefono: '' })
          onOpenChange(false)
          onSuccess?.()
        } else {
          setSubmitError(res?.error ?? "Errore durante l'invito")
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore di rete'
      setSubmitError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && !loading) {
      setSubmitError(null)
      setErrors({})
      setFormData((prev) => ({ ...prev, telefono: '' }))
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="relative overflow-hidden max-w-md rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl p-0">
        <div className="relative z-10 p-6">
          <DialogHeader className="pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-text-primary">
                  Invita cliente
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-text-secondary text-sm">
                  {tipoCliente === 'palestra'
                    ? isMassaggiatore
                      ? 'Inserisci nome, cognome e email del cliente già in organizzazione. Riceverà un invito in Home; accettandolo, risulterà collegato a te come massaggiatore.'
                      : 'Inserisci nome, cognome e email del cliente già registrato nella tua organizzazione. Riceverà un invito nella sua Home.'
                    : isMassaggiatore
                      ? 'Cliente non ancora in palestra: servono email e cellulare. Verrà creato nel database e collegato a te.'
                      : 'Inserisci i dati del cliente esterno (non ancora in palestra). Richiedi anche il numero di cellulare.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-text-primary font-medium block">Tipo cliente</Label>
              <div className="flex rounded-xl border border-white/10 overflow-hidden bg-background-secondary/30">
                <button
                  type="button"
                  onClick={() => setTipoCliente('palestra')}
                  className={`flex-1 px-4 py-3 text-sm font-medium min-h-[44px] touch-manipulation transition-colors ${
                    tipoCliente === 'palestra'
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-text-secondary hover:bg-white/5'
                  }`}
                >
                  Cliente della palestra
                </button>
                <button
                  type="button"
                  onClick={() => setTipoCliente('esterno')}
                  className={`flex-1 px-4 py-3 text-sm font-medium min-h-[44px] touch-manipulation transition-colors ${
                    tipoCliente === 'esterno'
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'text-text-secondary hover:bg-white/5'
                  }`}
                >
                  Cliente esterno
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invita-nome" className="text-text-primary font-medium">
                Nome
              </Label>
              <Input
                id="invita-nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome"
                autoComplete="given-name"
                disabled={loading}
                className={`rounded-xl border-white/10 bg-background-secondary/50 focus-visible:border-teal-500/40 focus-visible:ring-teal-500/20 ${errors.nome ? 'border-red-500/50' : ''}`}
              />
              {errors.nome && <p className="text-xs text-red-400">{errors.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invita-cognome" className="text-text-primary font-medium">
                Cognome
              </Label>
              <Input
                id="invita-cognome"
                value={formData.cognome}
                onChange={(e) => handleChange('cognome', e.target.value)}
                placeholder="Cognome"
                autoComplete="family-name"
                disabled={loading}
                className={`rounded-xl border-white/10 bg-background-secondary/50 focus-visible:border-teal-500/40 focus-visible:ring-teal-500/20 ${errors.cognome ? 'border-red-500/50' : ''}`}
              />
              {errors.cognome && <p className="text-xs text-red-400">{errors.cognome}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invita-email" className="text-text-primary font-medium">
                Email
              </Label>
              <Input
                id="invita-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@esempio.it"
                autoComplete="email"
                disabled={loading}
                className={`rounded-xl border-white/10 bg-background-secondary/50 focus-visible:border-teal-500/40 focus-visible:ring-teal-500/20 ${errors.email ? 'border-red-500/50' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>
            {tipoCliente === 'esterno' && (
              <div className="space-y-2">
                <Label htmlFor="invita-telefono" className="text-text-primary font-medium">
                  Numero di cellulare
                </Label>
                <Input
                  id="invita-telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="+39 333 1234567"
                  autoComplete="tel"
                  disabled={loading}
                  className={`rounded-xl border-white/10 bg-background-secondary/50 focus-visible:border-teal-500/40 focus-visible:ring-teal-500/20 ${errors.telefono ? 'border-red-500/50' : ''}`}
                />
                {errors.telefono && <p className="text-xs text-red-400">{errors.telefono}</p>}
              </div>
            )}
            {submitError && (
              <div
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                role="alert"
              >
                {submitError}
              </div>
            )}
            <DialogFooter className="mt-6 pt-5 border-t border-white/5 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
                className="rounded-xl border-white/10 hover:border-teal-500/30 hover:bg-teal-500/10"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-h-[44px] px-5 rounded-xl text-white font-semibold shadow-lg border-0 hover:opacity-90 transition-all"
                style={{
                  background: `linear-gradient(to right, ${colors.athleteAccents.teal.bar}, ${colors.athleteAccents.cyan.bar})`,
                  boxShadow: `0 10px 15px -3px ${colors.athleteAccents.teal.bar}40`,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Invio...
                  </>
                ) : (
                  <>
                    <UserRoundPlus className="mr-2 h-5 w-5" aria-hidden />
                    Invita cliente
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
