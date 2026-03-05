'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Calendar, User, Eye, RotateCcw } from 'lucide-react'
import type { Payment } from '@/types/payment'

interface PaymentsTableProps {
  payments: Payment[]
  onPaymentClick: (payment: Payment) => void
  onReversePayment: (payment: Payment) => void
}

export function PaymentsTable({ payments, onPaymentClick, onReversePayment }: PaymentsTableProps) {
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

  if (payments.length === 0) {
    return (
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
      >
        <CardContent className="relative py-12 text-center">
          <div className="mb-4 text-6xl opacity-50">💳</div>
          <h3 className="text-text-primary mb-2 text-lg font-medium">Nessun pagamento trovato</h3>
          <p className="text-text-secondary text-sm">Prova a modificare i filtri di ricerca</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
    >
      <CardHeader className="relative">
        <CardTitle size="md">Pagamenti ({payments.length})</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Data</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Atleta</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Metodo</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Importo</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Lezioni</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Stato</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="hover:bg-background-tertiary cursor-pointer border-b border-border"
                  onClick={() => onPaymentClick(payment)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-text-tertiary h-4 w-4" />
                      <span className="text-text-primary text-sm">
                        {formatDate(payment.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="text-text-tertiary h-4 w-4" />
                      <span className="text-text-primary font-medium">{payment.athlete_name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-text-secondary text-sm">{payment.method_text}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-sm font-medium ${
                        payment.amount < 0 ? 'text-state-error' : 'text-text-primary'
                      }`}
                    >
                      {formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-text-secondary text-sm">{payment.lessons_purchased}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant={payment.is_reversal ? 'warning' : 'success'} size="sm">
                      {payment.is_reversal ? 'Storno' : 'Attivo'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPaymentClick(payment)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!payment.is_reversal && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onReversePayment(payment)
                          }}
                          className="text-state-error hover:bg-state-error/10"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
