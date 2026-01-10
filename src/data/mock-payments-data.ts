import type { Payment } from '@/types/payment'

export const mockPayments: Payment[] = [
  {
    id: '1',
    athlete_id: 'athlete-1',
    athlete_name: 'Mario Rossi',
    amount: 120.0,
    method_text: 'Contanti',
    lessons_purchased: 10,
    created_by_staff_id: 'staff-1',
    created_by_staff_name: 'Sofia Bianchi',
    created_at: '2024-01-15T10:00:00Z',
    is_reversal: false,
    ref_payment_id: null,
  },
  {
    id: '2',
    athlete_id: 'athlete-1',
    athlete_name: 'Mario Rossi',
    amount: 80.0,
    method_text: 'Bonifico',
    lessons_purchased: 5,
    created_by_staff_id: 'staff-1',
    created_by_staff_name: 'Sofia Bianchi',
    created_at: '2024-01-20T14:30:00Z',
    is_reversal: false,
    ref_payment_id: null,
  },
  {
    id: '3',
    athlete_id: 'athlete-2',
    athlete_name: 'Giulia Bianchi',
    amount: 150.0,
    method_text: 'Carta di Credito',
    lessons_purchased: 15,
    created_by_staff_id: 'staff-1',
    created_by_staff_name: 'Sofia Bianchi',
    created_at: '2024-01-22T09:15:00Z',
    is_reversal: false,
    ref_payment_id: null,
  },
  {
    id: '4',
    athlete_id: 'athlete-1',
    athlete_name: 'Mario Rossi',
    amount: -80.0,
    method_text: 'Bonifico (Storno)',
    lessons_purchased: 0,
    created_by_staff_id: 'staff-1',
    created_by_staff_name: 'Sofia Bianchi',
    created_at: '2024-01-25T16:45:00Z',
    is_reversal: true,
    ref_payment_id: '2',
  },
]

export const PAYMENT_METHODS = [
  { value: '', label: 'Tutti i metodi' },
  { value: 'Contanti', label: 'Contanti' },
  { value: 'Bonifico', label: 'Bonifico' },
  { value: 'Carta di Credito', label: 'Carta di Credito' },
  { value: 'PayPal', label: 'PayPal' },
]

export const PAYMENT_FILTERS = [
  { value: '', label: 'Tutti i pagamenti' },
  { value: 'active', label: 'Solo attivi' },
  { value: 'reversals', label: 'Solo storni' },
]
