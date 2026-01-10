// Mock data per i test
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockProfile = {
  id: 'test-user-id',
  org_id: 'test-org-id',
  full_name: 'Test User',
  email: 'test@example.com',
  role: 'staff' as const,
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
}

export const mockAthleteProfile = {
  id: 'test-athlete-id',
  org_id: 'test-org-id',
  full_name: 'Test Athlete',
  email: 'athlete@example.com',
  role: 'athlete' as const,
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
}

export const mockAppointments = [
  {
    id: '1',
    org_id: 'test-org-id',
    athlete_id: 'test-athlete-id',
    trainer_id: 'test-user-id',
    date: '2024-01-15',
    time_start: '09:00',
    time_end: '10:00',
    status: 'scheduled',
    type: 'allenamento',
    note: 'Allenamento upper body',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: '2',
    org_id: 'test-org-id',
    athlete_id: 'test-athlete-id',
    trainer_id: 'test-user-id',
    date: '2024-01-16',
    time_start: '14:00',
    time_end: '15:00',
    status: 'completed',
    type: 'consulenza',
    note: 'Valutazione obiettivi',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T15:00:00Z',
  },
]

export const mockDocuments = [
  {
    id: '1',
    org_id: 'test-org-id',
    athlete_id: 'test-athlete-id',
    staff_id: 'test-user-id',
    file_name: 'scheda_allenamento.pdf',
    file_url: 'https://example.com/files/scheda_allenamento.pdf',
    file_type: 'application/pdf',
    file_size: 1024000,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: '2',
    org_id: 'test-org-id',
    athlete_id: 'test-athlete-id',
    staff_id: 'test-user-id',
    file_name: 'valutazione_fisica.pdf',
    file_url: 'https://example.com/files/valutazione_fisica.pdf',
    file_type: 'application/pdf',
    file_size: 2048000,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
]

export const mockExercises = [
  {
    id: '1',
    org_id: 'test-org-id',
    name: 'Panca piana',
    category: 'Petto',
    description: 'Esercizio per il petto con bilanciere',
    image_url: 'https://example.com/images/panca_piana.jpg',
    difficulty: 'media' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: '2',
    org_id: 'test-org-id',
    name: 'Squat',
    category: 'Gambe',
    description: 'Esercizio per le gambe',
    image_url: 'https://example.com/images/squat.jpg',
    difficulty: 'alta' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
]

export const mockAnalyticsData = {
  trend: [
    { day: '2024-01-01', allenamenti: 12, documenti: 3, ore_totali: 8.5 },
    { day: '2024-01-02', allenamenti: 15, documenti: 5, ore_totali: 10.2 },
    { day: '2024-01-03', allenamenti: 8, documenti: 2, ore_totali: 6.1 },
    { day: '2024-01-04', allenamenti: 20, documenti: 7, ore_totali: 12.8 },
    { day: '2024-01-05', allenamenti: 18, documenti: 4, ore_totali: 11.5 },
  ],
  distribution: [
    { type: 'allenamento', count: 45, percentage: 60 },
    { type: 'consulenza', count: 20, percentage: 27 },
    { type: 'valutazione', count: 8, percentage: 11 },
    { type: 'recupero', count: 2, percentage: 2 },
  ],
  performance: [
    {
      athlete_id: '1',
      athlete_name: 'Mario Rossi',
      total_workouts: 12,
      avg_duration: 65,
      completion_rate: 95,
    },
    {
      athlete_id: '2',
      athlete_name: 'Giulia Bianchi',
      total_workouts: 8,
      avg_duration: 70,
      completion_rate: 88,
    },
    {
      athlete_id: '3',
      athlete_name: 'Luca Verdi',
      total_workouts: 15,
      avg_duration: 55,
      completion_rate: 92,
    },
  ],
  summary: {
    total_workouts: 100,
    total_documents: 50,
    total_hours: 200,
    active_athletes: 10,
  },
}

export const mockNotifications = [
  {
    id: '1',
    type: 'info' as const,
    title: 'Nuovo appuntamento',
    message: 'Hai un nuovo appuntamento domani alle 14:00',
    duration: 5000,
  },
  {
    id: '2',
    type: 'success' as const,
    title: 'Allenamento completato',
    message: 'Ottimo lavoro! Hai completato il tuo allenamento.',
    duration: 3000,
  },
  {
    id: '3',
    type: 'warning' as const,
    title: 'Documento scaduto',
    message: 'Il documento "Scheda Allenamento" è scaduto.',
    duration: 7000,
  },
]
