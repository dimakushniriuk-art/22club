import { z } from 'zod'

// Schema per validazione query params dashboard
export const DashboardQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
})

// Schema per validazione response appointments
export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  date: z.string(),
  time: z.string(),
  athlete_name: z.string().min(1),
  type: z.string().min(1),
})

export const AppointmentsResponseSchema = z.array(AppointmentSchema)

// Schema per KPI stats
export const KPIStatsSchema = z.object({
  active_clients: z.number().int().nonnegative(),
  scheduled_sessions: z.number().int().nonnegative(),
  expiring_documents: z.number().int().nonnegative(),
  monthly_revenue: z.number().nonnegative(),
})

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>
export type Appointment = z.infer<typeof AppointmentSchema>
export type KPIStats = z.infer<typeof KPIStatsSchema>
