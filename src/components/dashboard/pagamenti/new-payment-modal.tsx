'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import { Euro } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { Payment } from '@/types/payment'

interface NewPaymentModalProps {
  onClose: () => void
  onSave: (payment: Payment) => void
}

export function NewPaymentModal({ onClose, onSave }: NewPaymentModalProps) {
  const { addToast } = useToast()
  const [athleteId, setAthleteId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')
  const [lessons, setLessons] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!athleteId || !amount || !method || !lessons) {
      addToast({
        title: 'Errore validazione',
        message: 'Compila tutti i campi obbligatori',
        variant: 'error',
      })
      return
    }

    setLoading(true)

    // Simula salvataggio
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      athlete_id: athleteId,
      athlete_name: 'Mario Rossi', // Mock
      amount: parseFloat(amount),
      method_text: method,
      lessons_purchased: parseInt(lessons),
      created_by_staff_id: 'staff-1',
      created_by_staff_name: 'Sofia Bianchi',
      created_at: new Date().toISOString(),
      is_reversal: false,
      ref_payment_id: null,
    }

    onSave(newPayment)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle size="md">Nuovo Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">Atleta *</label>
            <SimpleSelect
              value={athleteId}
              onValueChange={setAthleteId}
              options={[
                { value: 'athlete-1', label: 'Mario Rossi' },
                { value: 'athlete-2', label: 'Giulia Bianchi' },
              ]}
              placeholder="Seleziona atleta"
            />
          </div>

          <Input
            label="Importo (€) *"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            leftIcon={<Euro className="h-4 w-4" />}
          />

          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              Metodo di Pagamento *
            </label>
            <SimpleSelect
              value={method}
              onValueChange={setMethod}
              options={[
                { value: 'Contanti', label: 'Contanti' },
                { value: 'Bonifico', label: 'Bonifico' },
                { value: 'Carta di Credito', label: 'Carta di Credito' },
                { value: 'PayPal', label: 'PayPal' },
              ]}
              placeholder="Seleziona metodo"
            />
          </div>

          <Input
            label="Numero Lezioni *"
            type="number"
            value={lessons}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLessons(e.target.value)}
          />

          <Input
            label="Note (opzionali)"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
            placeholder="Note aggiuntive..."
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Annulla
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 flex-1"
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
