export type AdminDashboardStats = {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalOrganizations: number
  totalTrainers: number
  totalAthletes: number
}

export type AdminStatistics = {
  users: {
    total: number
    active: number
    thisMonth: number
    growth: number
    byRole: Record<string, number>
    byMonth: Array<{ month: string; count: number }>
  }
  payments: {
    totalRevenue: number
    thisMonth: number
    growth: number
    byMethod: Record<string, number>
    byMonth: Array<{ month: string; revenue: number }>
  }
  appointments: {
    total: number
    thisMonth: number
    byStatus: Record<string, number>
  }
  documents: {
    total: number
    byStatus: Record<string, number>
    expired: number
  }
  communications: {
    total: number
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalFailed: number
    deliveryRate: number
    openRate: number
  }
}

export type AdminRole = {
  id: string
  name: string
  description: string | null
  permissions: Record<string, boolean>
  created_at: string
  updated_at: string | null
  user_count?: number
}

export type AdminUserTrainer = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
}

export type AdminUser = {
  id: string
  user_id: string
  email: string | null
  nome: string | null
  cognome: string | null
  phone: string | null
  role: 'admin' | 'trainer' | 'athlete' | 'marketing' | 'nutrizionista' | 'massaggiatore'
  stato: 'attivo' | 'inattivo' | 'sospeso'
  org_id: string | null
  data_iscrizione: string | null
  created_at: string
  updated_at: string
  trainerAssegnato?: AdminUserTrainer | null
}
