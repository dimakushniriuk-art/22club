'use client'

import { Drawer, DrawerContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { RotateCcw } from 'lucide-react'
import type { Payment } from '@/types/payment'

interface PaymentDetailDrawerProps {
  payment: Payment | null
  open: boolean
  onClose: () => void
  onReverse: (payment: Payment) => void
}

export function PaymentDetailDrawer({
  payment,
  open,
  onClose,
  onReverse,
}: PaymentDetailDrawerProps) {
  if (!payment) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Drawer open={open} onOpenChange={onClose} side="right">
      <DrawerContent title="Dettaglio Pagamento" onClose={onClose}>
        <div className="space-y-6">
          {/* Info pagamento */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-text-primary text-lg font-semibold">Informazioni Pagamento</h3>
              <Badge variant={payment.is_reversal ? 'warning' : 'success'} size="md">
                {payment.is_reversal ? 'Storno' : 'Attivo'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Atleta:</span>
                <span className="text-text-primary font-medium">{payment.athlete_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Importo:</span>
                <span
                  className={`font-medium ${
                    payment.amount < 0 ? 'text-state-error' : 'text-text-primary'
                  }`}
                >
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Metodo:</span>
                <span className="text-text-primary font-medium">{payment.method_text}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Lezioni:</span>
                <span className="text-text-primary font-medium">{payment.lessons_purchased}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Data:</span>
                <span className="text-text-primary font-medium">
                  {formatDate(payment.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Registrato da:</span>
                <span className="text-text-primary font-medium">
                  {payment.created_by_staff_name}
                </span>
              </div>
            </div>
          </div>

          {/* Riferimento storno */}
          {payment.is_reversal && payment.ref_payment_id && (
            <div className="space-y-2">
              <h4 className="text-text-primary font-medium">Storno di:</h4>
              <p className="text-text-secondary text-sm">Pagamento ID: {payment.ref_payment_id}</p>
            </div>
          )}

          {/* Azioni */}
          <div className="space-y-3">
            {!payment.is_reversal && (
              <Button
                onClick={() => onReverse(payment)}
                className="border-state-error text-state-error hover:bg-state-error/10 w-full"
                variant="outline"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Storna Pagamento
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
