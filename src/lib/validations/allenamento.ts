import { z } from 'zod'

export const allenamentoSchema = z.object({
  id: z.string().uuid(),
  atleta_id: z.string().uuid(),
  atleta_nome: z.string(),
  scheda_id: z.string().uuid().nullable(),
  scheda_nome: z.string(),
  data: z.string().datetime(),
  durata_minuti: z.number().int().min(0).max(480), // Aumentato da 300 a 480 minuti (8 ore)
  stato: z.enum(['completato', 'in_corso', 'programmato', 'saltato']),
  esercizi_completati: z.number().int().min(0),
  esercizi_totali: z.number().int().min(1),
  volume_totale: z.number().min(0),
  note: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const allenamentoFiltersSchema = z.object({
  search: z.string().default(''),
  stato: z.enum(['tutti', 'completato', 'in_corso', 'programmato', 'saltato']).default('tutti'),
  atleta_id: z.string().uuid().nullable().default(null),
  data_da: z.string().datetime().nullable().default(null),
  data_a: z.string().datetime().nullable().default(null),
  periodo: z.enum(['tutti', 'oggi', 'settimana', 'mese']).default('tutti'),
})

export const createAllenamentoSchema = z.object({
  atleta_id: z.string().uuid('Atleta obbligatorio'),
  scheda_id: z.string().uuid().optional(),
  data: z.string().datetime('Data obbligatoria'),
  durata_minuti: z
    .number()
    .int()
    .min(5, 'Durata minima 5 minuti')
    .max(480, 'Durata massima 480 minuti'), // Aumentato da 300 a 480 minuti (8 ore)
  note: z.string().max(1000).optional(), // Aumentato da 500 a 1000 caratteri
})

export const updateAllenamentoSchema = createAllenamentoSchema.partial().extend({
  id: z.string().uuid(),
  stato: z.enum(['completato', 'in_corso', 'programmato', 'saltato']).optional(),
  esercizi_completati: z.number().int().min(0).optional(),
  volume_totale: z.number().min(0).optional(),
})

export type AllenamentoValidation = z.infer<typeof allenamentoSchema>
export type AllenamentoFiltersValidation = z.infer<typeof allenamentoFiltersSchema>
export type CreateAllenamentoValidation = z.infer<typeof createAllenamentoSchema>
export type UpdateAllenamentoValidation = z.infer<typeof updateAllenamentoSchema>
