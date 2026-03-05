import { z } from 'zod'

export const clienteTagSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1).max(50),
  colore: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

export const clienteSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1).max(100),
  cognome: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Numero di telefono non valido')
    .nullable(), // Aggiunta validazione regex
  avatar_url: z
    .string()
    .url('URL non valido')
    .or(z.string().startsWith('/')) // Accetta anche path relativi
    .nullable(), // Rilassato: accetta URL o path relativi
  data_iscrizione: z.string().datetime(),
  stato: z.enum(['attivo', 'inattivo', 'sospeso']),
  allenamenti_mese: z.number().int().min(0),
  ultimo_accesso: z.string().datetime().nullable(),
  scheda_attiva: z.string().nullable(),
  documenti_scadenza: z.boolean(),
  note: z.string().nullable(),
  tags: z.array(clienteTagSchema),
  role: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const clienteFiltersSchema = z.object({
  search: z.string().default(''),
  stato: z.enum(['tutti', 'attivo', 'inattivo', 'sospeso']).default('tutti'),
  dataIscrizioneDa: z.string().datetime().nullable().default(null),
  dataIscrizioneA: z.string().datetime().nullable().default(null),
  allenamenti_min: z.number().int().min(0).nullable().default(null),
  solo_documenti_scadenza: z.boolean().default(false),
  tags: z.array(z.string().uuid()).default([]),
})

export const clienteSortSchema = z.object({
  field: z.enum(['nome', 'cognome', 'email', 'data_iscrizione', 'stato', 'allenamenti_mese']),
  direction: z.enum(['asc', 'desc']),
})

export const clientePaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(10).max(200).default(20),
})

export const createClienteSchema = z.object({
  nome: z.string().min(1, 'Nome obbligatorio').max(100),
  cognome: z.string().min(1, 'Cognome obbligatorio').max(100),
  email: z.string().email('Email non valida'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]+$/, 'Numero di telefono non valido')
    .nullable()
    .optional(),
  note: z.string().max(1000).nullable().optional(),
})

export const updateClienteSchema = createClienteSchema.partial().extend({
  id: z.string().uuid(),
  stato: z.enum(['attivo', 'inattivo', 'sospeso']).optional(),
})

export type ClienteValidation = z.infer<typeof clienteSchema>
export type ClienteFiltersValidation = z.infer<typeof clienteFiltersSchema>
export type CreateClienteValidation = z.infer<typeof createClienteSchema>
export type UpdateClienteValidation = z.infer<typeof updateClienteSchema>
