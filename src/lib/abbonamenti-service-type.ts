/**
 * Tipo servizio per modulo abbonamenti: training | nutrition | massage.
 * Allineato a payments.service_type, credit_ledger.service_type, lesson_counters.lesson_type.
 */
export type ServiceType = 'training' | 'nutrition' | 'massage'

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'training', label: 'Allenamenti' },
  { value: 'nutrition', label: 'Nutrizione' },
  { value: 'massage', label: 'Massaggi' },
]

const VALID_SERVICE_PARAMS = ['training', 'nutrition', 'massage'] as const

export function parseServiceFromUrl(param: string | null): ServiceType | null {
  if (!param || !VALID_SERVICE_PARAMS.includes(param as (typeof VALID_SERVICE_PARAMS)[number]))
    return null
  return param as ServiceType
}

/**
 * Default service_type in base al ruolo: trainer/admin -> training, nutrizionista -> nutrition, massaggiatore -> massage.
 */
export function defaultServiceForRole(role: string | null): ServiceType {
  if (role === 'nutrizionista') return 'nutrition'
  if (role === 'massaggiatore') return 'massage'
  return 'training'
}
