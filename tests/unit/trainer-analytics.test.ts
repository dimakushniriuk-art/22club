import { describe, it, expect } from 'vitest'
import {
  mergeAthleteRosterForTrainers,
  countActiveAssignmentsAtStart,
  countNewAndLostAssignments,
  aggregateTrainerAnalytics,
  buildAthleteWorkoutCoachSplitRows,
  buildAthleteLessonBalanceRows,
  countFutureBookedTrainingByAthlete,
  buildHeuristicInsights,
  buildProgressDistributionBands,
  buildPeriodComparison,
  buildWeeklyRollupFromDaily,
  computePreviousPeriodBounds,
  type TrainerAssignmentRow,
  type TrainerPtAtletiRow,
  type TrainerAnalyticsAggregateInput,
  type TrainerKpiSummary,
} from '@/lib/trainer-analytics'

describe('mergeAthleteRosterForTrainers', () => {
  it('unisce assignments attivi e pt_atleti', () => {
    const trainers = ['T1']
    const assignments: TrainerAssignmentRow[] = [
      {
        trainer_id: 'T1',
        athlete_id: 'A1',
        status: 'active',
        activated_at: '2024-01-01',
        deactivated_at: null,
      },
      {
        trainer_id: 'T1',
        athlete_id: 'A2',
        status: 'inactive',
        activated_at: '2024-01-01',
        deactivated_at: '2024-06-01',
      },
    ]
    const pt: TrainerPtAtletiRow[] = [{ pt_id: 'T1', atleta_id: 'A3' }]
    const set = mergeAthleteRosterForTrainers(trainers, assignments, pt)
    expect([...set].sort()).toEqual(['a1', 'a3'])
  })
})

describe('countActiveAssignmentsAtStart', () => {
  it('conta solo attivati entro start e non disattivati prima di start', () => {
    const trainers = ['T1']
    const assignments: TrainerAssignmentRow[] = [
      {
        trainer_id: 'T1',
        athlete_id: 'A1',
        status: 'active',
        activated_at: '2020-01-01',
        deactivated_at: null,
      },
      {
        trainer_id: 'T1',
        athlete_id: 'A2',
        status: 'active',
        activated_at: '2020-01-01',
        deactivated_at: '2024-01-01',
      },
      {
        trainer_id: 'T1',
        athlete_id: 'A3',
        status: 'active',
        activated_at: '2024-02-01',
        deactivated_at: null,
      },
    ]
    const start = new Date('2024-01-15T00:00:00.000Z')
    expect(countActiveAssignmentsAtStart(trainers, assignments, start)).toBe(1)
  })
})

describe('countNewAndLostAssignments', () => {
  it('rileva nuovi e persi nel periodo', () => {
    const trainers = ['T1']
    const assignments: TrainerAssignmentRow[] = [
      {
        trainer_id: 'T1',
        athlete_id: 'A1',
        status: 'active',
        activated_at: '2024-06-10',
        deactivated_at: null,
      },
      {
        trainer_id: 'T1',
        athlete_id: 'A2',
        status: 'inactive',
        activated_at: '2020-01-01',
        deactivated_at: '2024-06-12',
      },
    ]
    const start = new Date('2024-06-01T00:00:00.000Z')
    const end = new Date('2024-06-30T23:59:59.999Z')
    expect(countNewAndLostAssignments(trainers, assignments, start, end)).toEqual({
      newClients: 1,
      lostClients: 1,
    })
  })
})

describe('aggregateTrainerAnalytics', () => {
  it('calcola revenue, ore, adherence e churn', () => {
    const startBoundary = new Date('2024-06-01T00:00:00.000Z')
    const endBoundary = new Date('2024-06-30T23:59:59.999Z')
    const input: TrainerAnalyticsAggregateInput = {
      startBoundary,
      endBoundary,
      trainerIds: ['T1'],
      assignments: [
        {
          trainer_id: 'T1',
          athlete_id: 'A1',
          status: 'active',
          activated_at: '2020-01-01',
          deactivated_at: null,
        },
        {
          trainer_id: 'T1',
          athlete_id: 'A2',
          status: 'active',
          activated_at: '2020-01-01',
          deactivated_at: null,
        },
      ],
      ptAtleti: [],
      payments: [
        {
          id: 'p1',
          amount: 100,
          athlete_id: 'A1',
          created_by_staff_id: 'T1',
          payment_date: '2024-06-15',
          created_at: null,
          payment_type: 'contanti',
        },
      ],
      workoutLogs: [
        {
          id: 'w1',
          data: '2024-06-10',
          durata_minuti: 60,
          stato: 'completato',
          atleta_id: 'A1',
          athlete_id: null,
          coached_by_profile_id: null,
        },
        {
          id: 'w2',
          data: '2024-06-11',
          durata_minuti: 60,
          stato: 'completato',
          atleta_id: 'A1',
          athlete_id: null,
          coached_by_profile_id: 'T1',
        },
      ],
      appointments: [
        {
          id: 'apt1',
          starts_at: '2024-06-11T10:00:00.000Z',
          status: 'completato',
          cancelled_at: null,
          athlete_id: 'x',
          type: 'allenamento',
          staff_id: 'T1',
          trainer_id: null,
        },
        {
          id: 'apt2',
          starts_at: '2024-06-12T10:00:00.000Z',
          status: 'annullato',
          cancelled_at: null,
          athlete_id: 'x',
          type: 'allenamento',
          staff_id: 'T1',
          trainer_id: null,
        },
      ],
      cancellations: [],
      progressLogs: [],
      athleteProfiles: [{ id: 'A1', user_id: 'u1', nome: 'Mario', cognome: 'Rossi' }],
      lessonUsageByAthlete: {
        a1: { totalPurchased: 10, totalUsed: 3, totalRemaining: 5 },
      },
      futureBookedByAthlete: { a1: 2 },
    }
    const r = aggregateTrainerAnalytics(input)
    expect(r.kpis.revenueTotal).toBe(100)
    expect(r.kpis.hoursWorked).toBe(2)
    expect(r.kpis.revenuePerHour).toBe(50)
    expect(r.kpis.adherencePct).toBe(50)
    expect(r.kpis.activeClients).toBe(2)
    expect(r.paymentMix.length).toBeGreaterThan(0)
    expect(r.athleteWorkoutSplits).toEqual([
      expect.objectContaining({
        athleteId: 'a1',
        displayName: 'Mario Rossi',
        withTrainer: 1,
        solo: 1,
      }),
    ])
    expect(r.athleteLessonBalances).toEqual([
      expect.objectContaining({
        athleteId: 'a1',
        totalPurchased: 10,
        totalUsed: 3,
        totalRemaining: 5,
        futureBookedCount: 2,
      }),
    ])
  })
})

describe('buildAthleteWorkoutCoachSplitRows', () => {
  it('conta solo log in range e roster; separa coach selezionato vs altro', () => {
    const profileById = new Map([
      ['a1', { id: 'a1', user_id: 'u1', nome: 'Luigi', cognome: 'Verdi' }],
    ])
    const rows = buildAthleteWorkoutCoachSplitRows({
      roster: new Set(['a1']),
      trainerIds: ['T1'],
      startDay: '2024-06-01',
      endDay: '2024-06-30',
      profileById,
      workoutLogs: [
        {
          id: '1',
          data: '2024-05-01',
          durata_minuti: 60,
          stato: 'completato',
          atleta_id: 'A1',
          athlete_id: null,
          coached_by_profile_id: 'T1',
        },
        {
          id: '2',
          data: '2024-06-05',
          durata_minuti: 60,
          stato: 'completato',
          atleta_id: 'A1',
          athlete_id: null,
          coached_by_profile_id: 'T1',
        },
        {
          id: '3',
          data: '2024-06-06',
          durata_minuti: 60,
          stato: 'completato',
          atleta_id: 'A1',
          athlete_id: null,
          coached_by_profile_id: null,
        },
        {
          id: '4',
          data: '2024-06-07',
          durata_minuti: 60,
          stato: 'saltato',
          atleta_id: 'A1',
          athlete_id: null,
          coached_by_profile_id: 'T1',
        },
      ],
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ withTrainer: 1, solo: 1, displayName: 'Luigi Verdi' })
  })
})

describe('countFutureBookedTrainingByAthlete', () => {
  it('conta solo allenamenti futuri nel bucket prenotati', () => {
    const nowMs = new Date('2024-06-15T12:00:00.000Z').getTime()
    const out = countFutureBookedTrainingByAthlete(
      [
        {
          athlete_id: 'A1',
          type: 'allenamento',
          status: 'confermato',
          cancelled_at: null,
          starts_at: '2024-07-01T10:00:00.000Z',
        },
        {
          athlete_id: 'A1',
          type: 'allenamento',
          status: 'completato',
          cancelled_at: null,
          starts_at: '2024-07-02T10:00:00.000Z',
        },
        {
          athlete_id: 'A2',
          type: 'massaggio',
          status: 'confermato',
          cancelled_at: null,
          starts_at: '2024-07-03T10:00:00.000Z',
        },
        {
          athlete_id: 'A1',
          type: 'allenamento',
          status: 'confermato',
          cancelled_at: null,
          starts_at: '2024-06-01T10:00:00.000Z',
        },
      ],
      nowMs,
    )
    expect(out).toEqual({ a1: 1 })
  })
})

describe('buildAthleteLessonBalanceRows', () => {
  it('unisce usage e prenotazioni future per chi ha almeno un valore non zero', () => {
    const profileById = new Map([
      ['a1', { id: 'a1', user_id: 'u1', nome: 'A', cognome: 'Uno' }],
      ['a2', { id: 'a2', user_id: 'u2', nome: 'B', cognome: 'Due' }],
    ])
    const rows = buildAthleteLessonBalanceRows({
      rosterArr: ['a1', 'a2'],
      profileById,
      lessonUsage: { a1: { totalPurchased: 0, totalUsed: 0, totalRemaining: 0 } },
      futureBooked: { a1: 1, a2: 0 },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      athleteId: 'a1',
      futureBookedCount: 1,
      totalPurchased: 0,
      totalUsed: 0,
      totalRemaining: 0,
    })
  })
})

describe('buildProgressDistributionBands', () => {
  it('suddivide le percentuali in fasce', () => {
    const bands = buildProgressDistributionBands([-10, -2, 2, 7, 12])
    expect(bands.find((b) => b.band === '< −5%')?.count).toBe(1)
    expect(bands.reduce((s, b) => s + b.count, 0)).toBe(5)
  })
})

describe('computePreviousPeriodBounds', () => {
  it('fine periodo precedente è prima dell’inizio del periodo corrente', () => {
    const start = new Date('2024-06-01T00:00:00.000Z')
    const end = new Date('2024-06-07T23:59:59.999Z')
    const prev = computePreviousPeriodBounds(start, end)
    expect(prev.end.getTime()).toBeLessThan(start.getTime())
    expect(prev.start.getTime()).toBeLessThanOrEqual(prev.end.getTime())
  })
})

describe('buildPeriodComparison', () => {
  it('calcola delta tra KPI', () => {
    const cur = {
      revenueTotal: 200,
      revenuePerHour: 50,
      churnRatePct: 5,
      adherencePct: 80,
    } as TrainerKpiSummary
    const prev = {
      revenueTotal: 100,
      revenuePerHour: 40,
      churnRatePct: 8,
      adherencePct: 70,
    } as TrainerKpiSummary
    const c = buildPeriodComparison(cur, prev, '2024-05-01', '2024-05-07')
    expect(c.revenueDeltaPct).toBe(100)
    expect(c.churnDeltaPctPoints).toBe(-3)
    expect(c.adherenceDeltaPctPoints).toBe(10)
  })
})

describe('buildWeeklyRollupFromDaily', () => {
  it('somma 7 giorni in un punto', () => {
    const daily = Array.from({ length: 10 }, (_, i) => ({
      day: `2024-06-${String(i + 1).padStart(2, '0')}`,
      revenue: 10,
      hours: 1,
      allenamenti: 2,
      prenotati: 1,
      eseguiti: 1,
      annullati: 0,
      cancellati: 0,
      noShow: 0,
      clientsNew: i === 0 ? 1 : 0,
      clientsLost: i === 3 ? 1 : 0,
    }))
    const w = buildWeeklyRollupFromDaily(daily)
    expect(w).toHaveLength(2)
    expect(w[0].revenue).toBe(70)
    expect(w[0].allenamenti).toBe(14)
    expect(w[0].clientsNew).toBe(1)
    expect(w[0].clientsLost).toBe(1)
  })
})

describe('buildHeuristicInsights', () => {
  it('restituisce almeno una riga', () => {
    const insights = buildHeuristicInsights({
      kpis: {
        revenueTotal: 0,
        hoursWorked: 0,
        revenuePerHour: 0,
        revenuePerActiveClient: 0,
        activeClients: 0,
        clientsNewInPeriod: 0,
        clientsLostInPeriod: 0,
        churnRatePct: 0,
        activeClientsAtStart: 1,
        adherencePct: 90,
        noShowCount: 0,
        scheduledWorkoutAppointments: 0,
        appointmentEseguiti: 0,
        appointmentPrenotati: 0,
        appointmentAnnullati: 0,
        appointmentCancellati: 0,
        avgWorkoutsPerWeek: 0,
        progressWeightAvgPct: null,
        compositeScore: 0,
        revenueGrowthHalfPct: 0,
      },
      paymentMix: [],
      alerts: [],
    })
    expect(insights.length).toBeGreaterThan(0)
  })
})
