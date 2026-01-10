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
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:crea-atleta-modal')
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import { UserPlus, Loader2 } from 'lucide-react'

interface CreaAtletaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  nome: string
  cognome: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  stato: 'attivo' | 'inattivo' | 'sospeso'
  data_iscrizione: string
  note: string
}

export function CreaAtletaModal({ open, onOpenChange, onSuccess }: CreaAtletaModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cognome: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    stato: 'attivo',
    data_iscrizione: new Date().toISOString().split('T')[0],
    note: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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

    if (!formData.password) {
      newErrors.password = 'La password è obbligatoria'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La password deve essere di almeno 6 caratteri'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono'
    }

    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Numero di telefono non valido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/athletes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          cognome: formData.cognome.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          password: formData.password,
          stato: formData.stato,
          data_iscrizione: formData.data_iscrizione || null,
          note: formData.note.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Traduci messaggi di errore comuni
        let errorMessage = data.error || "Errore durante la creazione dell'atleta"
        const isConflictError =
          response.status === 409 ||
          errorMessage.includes('already registered') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('già registrata')

        if (isConflictError) {
          errorMessage = 'Questa email è già registrata nel sistema'
        }

        throw new Error(errorMessage)
      }

      // Successo
      onOpenChange(false)

      // Reset form
      setFormData({
        nome: '',
        cognome: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        stato: 'attivo',
        data_iscrizione: new Date().toISOString().split('T')[0],
        note: '',
      })
      setErrors({})
      setSubmitError(null)

      // Callback successo
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      logger.error('Errore creazione atleta', error, { email: formData.email, nome: formData.nome })
      setSubmitError(
        error instanceof Error ? error.message : "Errore durante la creazione dell'atleta",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      // Reset form quando si chiude
      setTimeout(() => {
        setFormData({
          nome: '',
          cognome: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          stato: 'attivo',
          data_iscrizione: new Date().toISOString().split('T')[0],
          note: '',
        })
        setErrors({})
        setSubmitError(null)
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background-secondary border-teal-500/30">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-teal-400" />
            Crea Nuovo Atleta
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Aggiungi manualmente un nuovo atleta al sistema. I dati di accesso saranno disponibili
            per l&apos;atleta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
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
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-red-400 text-xs">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Cognome *</label>
              <Input
                value={formData.cognome}
                onChange={(e) => handleChange('cognome', e.target.value)}
                placeholder="Rossi"
                required
                className={errors.cognome ? 'border-red-500' : ''}
              />
              {errors.cognome && <p className="text-red-400 text-xs">{errors.cognome}</p>}
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
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Telefono</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+39 123 456 7890"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
            </div>
          </div>

          {/* Password e Conferma Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Minimo 6 caratteri"
                required
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Conferma Password *</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Ripeti la password"
                required
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
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
              />
            </div>

            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Data Iscrizione</label>
              <Input
                type="date"
                value={formData.data_iscrizione}
                onChange={(e) => handleChange('data_iscrizione', e.target.value)}
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
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 resize-none"
            />
          </div>

          <DialogFooter>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crea Atleta
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
