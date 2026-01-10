'use client'

import { useState, useEffect } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:modifica-atleta-modal')
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
import { SimpleSelect } from '@/components/ui/simple-select'
import { Edit2, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { Cliente } from '@/types/cliente'

interface ModificaAtletaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  athlete: Cliente | null
}

interface FormData {
  nome: string
  cognome: string
  email: string
  phone: string
  stato: 'attivo' | 'inattivo' | 'sospeso'
  data_iscrizione: string
  note: string
}

export function ModificaAtletaModal({
  open,
  onOpenChange,
  onSuccess,
  athlete,
}: ModificaAtletaModalProps) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cognome: '',
    email: '',
    phone: '',
    stato: 'attivo',
    data_iscrizione: new Date().toISOString().split('T')[0],
    note: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Popola il form quando l'atleta cambia o il modal si apre
  useEffect(() => {
    if (athlete && open) {
      setFormData({
        nome: athlete.nome || '',
        cognome: athlete.cognome || '',
        email: athlete.email || '',
        phone: athlete.phone || '',
        stato: (athlete.stato as 'attivo' | 'inattivo' | 'sospeso') || 'attivo',
        data_iscrizione: athlete.data_iscrizione
          ? new Date(athlete.data_iscrizione).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        note: athlete.note || '',
      })
      setErrors({})
      setSubmitError(null)
    }
  }, [athlete, open])

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Rimuovi errore quando l'utente modifica il campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    setSubmitError(null)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Il nome è obbligatorio'
    }

    if (!formData.cognome.trim()) {
      newErrors.cognome = 'Il cognome è obbligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida'
    }

    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!athlete?.id) {
      setSubmitError('Atleta non trovato')
      return
    }

    if (!validate()) {
      return
    }

    setLoading(true)
    setSubmitError(null)

    try {
      const response = await fetch(`/api/athletes/${athlete.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          cognome: formData.cognome.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          stato: formData.stato,
          data_iscrizione: formData.data_iscrizione || null,
          note: formData.note.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Errore durante l'aggiornamento dell'atleta")
      }

      // Successo
      addToast({
        title: 'Aggiornato',
        message: `Profilo di ${formData.nome} ${formData.cognome} aggiornato con successo`,
        variant: 'success',
      })

      onOpenChange(false)

      // Callback successo
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      logger.error('Errore aggiornamento atleta', error, { athleteId: athlete?.id })
      const message =
        error instanceof Error ? error.message : "Errore durante l'aggiornamento dell'atleta"
      setSubmitError(message)
      addToast({
        title: 'Errore aggiornamento',
        message,
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  if (!athlete) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 shadow-lg shadow-teal-500/10 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <DialogHeader className="relative">
          <DialogTitle className="text-text-primary text-2xl font-bold flex items-center gap-2.5">
            <div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
              <Edit2 className="h-5 w-5" />
            </div>
            Modifica Atleta
          </DialogTitle>
          <DialogDescription className="text-text-secondary mt-1.5">
            Modifica le informazioni dell&apos;atleta {athlete.nome} {athlete.cognome}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6 relative">
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm font-medium">
              {submitError}
            </div>
          )}

          {/* Nome e Cognome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Nome *</label>
              <Input
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Mario"
                required
                className={`bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50 ${errors.nome ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
              />
              {errors.nome && (
                <p className="text-red-400 text-xs font-medium mt-1">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Cognome *</label>
              <Input
                value={formData.cognome}
                onChange={(e) => handleChange('cognome', e.target.value)}
                placeholder="Rossi"
                required
                className={`bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50 ${errors.cognome ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
              />
              {errors.cognome && (
                <p className="text-red-400 text-xs font-medium mt-1">{errors.cognome}</p>
              )}
            </div>
          </div>

          {/* Email e Telefono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="mario.rossi@example.com"
                required
                className={`bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50 ${errors.email ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs font-medium mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Telefono</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+39 123 456 7890"
                className={`bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50 ${errors.phone ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs font-medium mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Stato e Data Iscrizione */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Stato</label>
              <SimpleSelect
                value={formData.stato}
                onValueChange={(value) =>
                  handleChange('stato', value as 'attivo' | 'inattivo' | 'sospeso')
                }
                options={[
                  { value: 'attivo', label: 'Attivo' },
                  { value: 'inattivo', label: 'Inattivo' },
                  { value: 'sospeso', label: 'Sospeso' },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Data Iscrizione</label>
              <Input
                type="date"
                value={formData.data_iscrizione}
                onChange={(e) => handleChange('data_iscrizione', e.target.value)}
                className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-text-primary text-sm font-medium">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Note aggiuntive sull'atleta..."
              rows={3}
              className="w-full px-4 py-2.5 bg-background-secondary/50 border border-teal-500/30 rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 resize-none transition-all duration-200"
            />
          </div>

          <DialogFooter className="w-full pt-4 border-t border-teal-500/10 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200 min-w-[120px]"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 min-w-[160px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Salva Modifiche
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
