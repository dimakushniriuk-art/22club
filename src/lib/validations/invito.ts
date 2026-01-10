import { z } from 'zod'

export const createInvitoSchema = z.object({
  nome_atleta: z.string().trim().min(1, 'Nome obbligatorio').max(100, 'Nome troppo lungo'),
  email: z.string().email('Email non valida').optional().or(z.literal('')), // Semplificato: usa validazione Zod nativa
  giorni_validita: z
    .number()
    .int()
    .min(1, 'Minimo 1 giorno')
    .max(365, 'Massimo 365 giorni') // Aumentato da 90 a 365 giorni
    .default(7),
})

export const invitoSchema = z.object({
  id: z.string().uuid(),
  codice: z.string().length(8),
  nome_atleta: z.string(),
  email: z.string().email().nullable(),
  stato: z.enum(['inviato', 'registrato', 'scaduto']),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().nullable(),
  used_at: z.string().datetime().nullable(),
  created_by: z.string().uuid(),
})

export const invitoFiltersSchema = z.object({
  search: z.string().default(''),
  stato: z.enum(['tutti', 'inviato', 'registrato', 'scaduto']).default('tutti'),
  data_da: z.string().datetime().nullable().default(null),
  data_a: z.string().datetime().nullable().default(null),
})

export type CreateInvitoValidation = z.infer<typeof createInvitoSchema>
export type InvitoValidation = z.infer<typeof invitoSchema>
export type InvitoFiltersValidation = z.infer<typeof invitoFiltersSchema>
