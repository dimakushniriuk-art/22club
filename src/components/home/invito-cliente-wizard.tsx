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
import { Avatar } from '@/components/ui'
import { useNotify } from '@/lib/ui/notify'
import { createClient } from '@/lib/supabase/client'
import { Loader2, UserCheck, UserX, Mail, UserMinus } from 'lucide-react'
import { colors } from '@/lib/design-tokens'
import type { InvitoClienteConStaff } from '@/hooks/use-inviti-cliente'

function roleLabel(role: string | null): string {
  if (!role) return 'Professionista'
  const r = role.toLowerCase()
  if (r === 'nutrizionista') return 'nutrizionista'
  if (r === 'massaggiatore') return 'massaggiatore'
  return role
}

interface InvitoClienteWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invito: InvitoClienteConStaff | null
  onSuccess?: () => void
  /** Dopo aver disdetto il collegamento attuale, per aggiornare l'elenco inviti (stesso invito con atleta_ha_altro_attivo aggiornato) */
  onRefetchInviti?: () => void
}

export function InvitoClienteWizard({ open, onOpenChange, invito, onSuccess, onRefetchInviti }: InvitoClienteWizardProps) {
  const { notify } = useNotify()
  const [loading, setLoading] = useState<'conferma' | 'disdetta' | 'disdici_collegamento' | null>(null)

  const staffName =
    [invito?.staff_nome, invito?.staff_cognome].filter(Boolean).join(' ') ||
    (invito?.staff_role ? `Un ${roleLabel(invito.staff_role)}` : 'Un professionista')
  const role = roleLabel(invito?.staff_role ?? null)

  const handleConferma = async () => {
    if (!invito) return
    setLoading('conferma')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('accetta_invito_cliente', { p_invito_id: invito.id })
      if (error) {
        notify(error.message ?? 'Errore durante la conferma', 'error', 'Errore')
        return
      }
      const res = data as { success?: boolean; error?: string } | null
      if (res?.success) {
        notify('Hai accettato l\'invito. Ora compare nella lista clienti e in Chat.', 'success', 'Invito accettato')
        onOpenChange(false)
        onSuccess?.()
      } else {
        notify(res?.error ?? 'Errore durante la conferma', 'error', 'Errore')
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Errore di rete', 'error', 'Errore')
    } finally {
      setLoading(null)
    }
  }

  const handleDisdetta = async () => {
    if (!invito) return
    setLoading('disdetta')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('rifiuta_invito_cliente', { p_invito_id: invito.id })
      if (error) {
        notify(error.message ?? 'Errore durante la disdetta', 'error', 'Errore')
        return
      }
      const res = data as { success?: boolean; error?: string } | null
      if (res?.success) {
        notify('Invito rifiutato.', 'success', 'Disdetta')
        onOpenChange(false)
        onSuccess?.()
      } else {
        notify(res?.error ?? 'Errore durante la disdetta', 'error', 'Errore')
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Errore di rete', 'error', 'Errore')
    } finally {
      setLoading(null)
    }
  }

  const staffType = invito?.staff_role?.toLowerCase() === 'massaggiatore' ? 'massaggiatore' : 'nutrizionista'
  const handleDisdiciCollegamento = async () => {
    if (!invito) return
    setLoading('disdici_collegamento')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('disdici_collegamento_staff_atleta', { p_staff_type: staffType })
      if (error) {
        notify(error.message ?? 'Errore durante la disdetta del collegamento', 'error', 'Errore')
        return
      }
      const res = data as { success?: boolean; error?: string } | null
      if (res?.success) {
        notify('Collegamento attuale disdetto. Puoi ora confermare il nuovo invito.', 'success', 'Collegamento disdetto')
        onRefetchInviti?.()
      } else {
        notify(res?.error ?? 'Errore durante la disdetta del collegamento', 'error', 'Errore')
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Errore di rete', 'error', 'Errore')
    } finally {
      setLoading(null)
    }
  }

  if (!invito) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="relative overflow-hidden max-w-md rounded-2xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-xl shadow-teal-500/10 p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="relative z-10 p-6">
          <DialogHeader className="pb-4 border-b border-teal-500/20 mb-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: colors.athleteAccents.teal.bg,
                  border: `1px solid ${colors.athleteAccents.teal.border}`,
                }}
              >
                <Mail className="h-5 w-5" style={{ color: colors.athleteAccents.teal.bar }} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-text-primary">
                  Nuovo invito
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-text-secondary text-sm">
                  Sei stato invitato a far parte dei clienti. Conferma per comparire nella sua lista e in Chat, oppure rifiuta.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5 py-4">
            <Avatar
              src={invito.staff_avatar_url ?? undefined}
              alt={staffName}
              fallbackText={staffName.slice(0, 2).toUpperCase() || '?'}
              size="lg"
              className="ring-2 ring-teal-500/40 shadow-lg"
            />
            <div className="text-center space-y-0.5">
              <p className="font-semibold text-lg text-text-primary">{staffName}</p>
              <p className="text-sm text-text-secondary capitalize">{role}</p>
            </div>
            <p className="text-center text-sm text-text-secondary max-w-[280px] leading-relaxed">
              Sei stato invitato da <strong className="text-text-primary">{staffName}</strong> ({role}) a far parte dei suoi clienti.
            </p>
          </div>

          {invito.atleta_ha_altro_attivo && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 mb-4">
              <p className="text-sm text-amber-200/90 mb-3">
                Hai già un {role} attivo nella lista. Per accettare questo invito disdici il collegamento attuale.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDisdiciCollegamento}
                disabled={loading !== null}
                className="w-full border-amber-500/40 text-amber-200 hover:bg-amber-500/20 hover:text-amber-100"
              >
                {loading === 'disdici_collegamento' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <UserMinus className="mr-2 h-4 w-4" aria-hidden />
                )}
                Disdici collegamento attuale
              </Button>
            </div>
          )}

          <DialogFooter className="mt-6 pt-5 border-t border-white/5 gap-3 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={handleDisdetta}
              disabled={loading !== null}
              type="button"
              className="rounded-xl border-white/10 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 w-full sm:w-auto order-2 sm:order-1"
            >
              {loading === 'disdetta' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <UserX className="mr-2 h-4 w-4" aria-hidden />
              )}
              Disdetta
            </Button>
            <Button
              type="button"
              onClick={handleConferma}
              disabled={loading !== null}
              className="min-h-[44px] px-5 rounded-xl text-white font-semibold shadow-lg border-0 hover:opacity-90 transition-all w-full sm:w-auto order-1 sm:order-2"
              style={{
                background: `linear-gradient(to right, ${colors.athleteAccents.teal.bar}, ${colors.athleteAccents.cyan.bar})`,
                boxShadow: `0 10px 15px -3px ${colors.athleteAccents.teal.bar}40`,
              }}
            >
              {loading === 'conferma' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Invio...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-5 w-5" aria-hidden />
                  Conferma invito
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
