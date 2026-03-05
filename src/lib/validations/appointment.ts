import { z } from 'zod'

/**
 * Schema Zod semplificato per validazione appuntamenti
 * Solo campi essenziali, senza complessità aggiuntive
 */

export const createAppointmentSchema = z
  .object({
    athlete_id: z.string().uuid('ID atleta non valido'),
    staff_id: z.string().uuid('ID staff non valido'), // NOT NULL nel database
    type: z.enum(
      [
        'allenamento',
        'prova',
        'valutazione',
        'prima_visita',
        'riunione',
        'massaggio',
        'nutrizionista',
      ],
      {
        message: 'Tipo appuntamento non valido',
      },
    ),
    starts_at: z.string().datetime('Data inizio non valida'),
    ends_at: z.string().datetime('Data fine non valida'),
    status: z
      .enum(['attivo', 'completato', 'annullato', 'in_corso', 'cancelled'])
      .optional()
      .default('attivo'), // Aggiunto 'cancelled'
    notes: z.string().max(1000, 'Note troppo lunghe').optional().nullable(), // Aumentato da 500 a 1000
    location: z.string().max(255, 'Luogo troppo lungo').optional().nullable(), // Aumentato da 200 a 255 (standard VARCHAR)
    org_id: z.string().optional().default('default-org'),
  })
  .refine((data) => new Date(data.ends_at) > new Date(data.starts_at), {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['ends_at'],
  })

export const updateAppointmentSchema = z
  .object({
    id: z.string().uuid('ID appuntamento non valido'),
    athlete_id: z.string().uuid('ID atleta non valido').optional(),
    staff_id: z.string().uuid('ID staff non valido').optional(),
    type: z
      .enum([
        'allenamento',
        'prova',
        'valutazione',
        'prima_visita',
        'riunione',
        'massaggio',
        'nutrizionista',
      ])
      .optional(),
    starts_at: z.string().datetime('Data inizio non valida').optional(),
    ends_at: z.string().datetime('Data fine non valida').optional(),
    status: z.enum(['attivo', 'completato', 'annullato', 'in_corso', 'cancelled']).optional(), // Aggiunto 'cancelled'
    notes: z.string().max(1000, 'Note troppo lunghe').optional().nullable(), // Aumentato da 500 a 1000
    location: z.string().max(255, 'Luogo troppo lungo').optional().nullable(), // Aumentato da 200 a 255
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return new Date(data.ends_at) > new Date(data.starts_at)
      }
      return true
    },
    {
      message: 'La data di fine deve essere successiva alla data di inizio',
      path: ['ends_at'],
    },
  )

// Tipi TypeScript derivati dagli schemi
export type CreateAppointmentData = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentData = z.infer<typeof updateAppointmentSchema>
