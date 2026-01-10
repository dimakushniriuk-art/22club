'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:assign-workout-modal')
import { useClienti } from '@/hooks/use-clienti'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Dumbbell, User, Calendar, FileText, X, Loader2 } from 'lucide-react'

interface AssignWorkoutFormData {
  athlete_id: string
  name: string
  description?: string
  start_date: string
  end_date: string
}

interface AssignWorkoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AssignWorkoutModal({ open, onOpenChange, onSuccess }: AssignWorkoutModalProps) {
  const [formData, setFormData] = useState<AssignWorkoutFormData>({
    athlete_id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  })
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { clienti } = useClienti()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validazione
      if (!formData.athlete_id || !formData.name || !formData.start_date || !formData.end_date) {
        setError('Compila tutti i campi obbligatori')
        return
      }

      // Verifica che start_date < end_date
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        setError('La data di fine deve essere successiva alla data di inizio')
        return
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Utente non autenticato')
        return
      }

      // Get PT profile to use as created_by (user_id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        setError('Profilo trainer non trovato')
        return
      }

      type ProfileRow = {
        user_id: string
      }
      const typedProfile = profile as ProfileRow

      if (!typedProfile.user_id) {
        setError('Profilo trainer non trovato')
        return
      }

      // Insert workout plan
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from('workout_plans') as any).insert([
        {
          athlete_id: formData.athlete_id,
          name: formData.name,
          description: formData.description || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: true,
          created_by: typedProfile.user_id,
        },
      ])

      if (insertError) {
        throw insertError
      }

      // Invalida query allenamenti per refresh automatico (workout_plans influisce su allenamenti)
      queryClient.invalidateQueries({ queryKey: queryKeys.allenamenti.all })

      toast.addToast({
        title: 'Scheda assegnata',
        message: 'La scheda è stata assegnata correttamente',
        variant: 'success',
      })
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setFormData({
        athlete_id: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
      })
    } catch (error) {
      logger.error('Error assigning workout', error, { athleteId: formData.athlete_id })
      const errorMsg =
        error instanceof Error ? error.message : "Errore nell'assegnazione della scheda"
      setError(errorMsg)
      toast.addToast({
        title: 'Errore assegnazione scheda',
        message: errorMsg,
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setError(null)
      setFormData({
        athlete_id: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background-secondary border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-400" />
            Assegna Scheda Allenamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Select Atleta */}
          <div className="space-y-2">
            <Label htmlFor="athlete" className="text-text-primary">
              <User className="inline h-4 w-4 mr-2" />
              Atleta *
            </Label>
            <select
              id="athlete"
              value={formData.athlete_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, athlete_id: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Seleziona atleta...</option>
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.cognome}
                </option>
              ))}
            </select>
          </div>

          {/* Workout Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-text-primary">
              Nome Scheda *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="es. Preparazione Estiva"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-text-primary">
              <FileText className="inline h-4 w-4 mr-2" />
              Descrizione (opzionale)
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descrizione della scheda..."
              rows={3}
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-text-primary">
                <Calendar className="inline h-4 w-4 mr-2" />
                Data Inizio *
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-text-primary">
                Data Fine *
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-blue-500/50 text-white hover:bg-blue-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assegnazione...
                </>
              ) : (
                <>
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Assegna Scheda
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
