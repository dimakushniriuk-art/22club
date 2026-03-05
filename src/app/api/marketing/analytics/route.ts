import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:marketing:analytics')

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function startOfDay(iso: string): string {
  return iso.slice(0, 10)
}

function startOfWeek(iso: string): string {
  const d = new Date(iso)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

export type AnalyticsPayload = {
  kpi: {
    leadsTotal: number
    leadsNew7d: number
    conversionRate30d: number | null
    campaignsActive: number
    budgetActive: number
  }
  leadsFunnel30d: Record<string, number>
  trendLeads7d: { date: string; count: number }[]
  trendLeads30d: { week: string; count: number }[]
  atletiKpi: {
    workoutsCoached7d: number
    workoutsSolo7d: number
    workoutsCoached30d: number
    workoutsSolo30d: number
    atletiInattivi: number
  }
  campaigns: {
    id: string
    name: string
    budget: number | null
    start_at: string | null
    end_at: string | null
    eventsCount7d?: number
  }[]
  eventsTotal7d: number
}

/**
 * GET /api/marketing/analytics
 * Solo admin/marketing. Aggregati da: marketing_leads, marketing_campaigns, marketing_events, view marketing_athletes.
 * Nessun accesso a tabelle raw.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: role } = await supabase.rpc('get_current_user_role')
    if (role !== 'admin' && role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const iso7 = daysAgo(7)
    const iso30 = daysAgo(30)

    // --- Leads ---
    const [leadsAllRes, leads7d, leads30dRows, campaignsRows, eventsRows, athletesRows] = await Promise.all([
      supabase.from('marketing_leads').select('*', { count: 'exact', head: true }),
      supabase.from('marketing_leads').select('id').gte('created_at', iso7),
      supabase.from('marketing_leads').select('status').gte('created_at', iso30),
      supabase.from('marketing_campaigns').select('id, name, status, budget, start_at, end_at'),
      supabase.from('marketing_events').select('campaign_id, occurred_at').gte('occurred_at', iso7),
      supabase.rpc('marketing_list_athletes', { p_limit: 5000, p_offset: 0 }),
    ])

    const leadsTotal = leadsAllRes.count ?? 0
    const leadsNew7d = (leads7d.data?.length ?? 0) as number
    const leads30d = (leads30dRows.data ?? []) as { status: string }[]
    const total30d = leads30d.length
    const converted30d = leads30d.filter((r) => r.status === 'converted').length
    const conversionRate30d = total30d > 0 ? Math.round((converted30d / total30d) * 1000) / 10 : null

    const funnel: Record<string, number> = { new: 0, contacted: 0, trial: 0, converted: 0, lost: 0 }
    leads30d.forEach((r) => {
      if (r.status in funnel) funnel[r.status]++
    })
    const leadsFunnel30d = funnel

    // Trend 7d: need leads created_at in last 7 days
    const { data: trend7dRows } = await supabase
      .from('marketing_leads')
      .select('created_at')
      .gte('created_at', iso7)
    const byDay: Record<string, number> = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      byDay[startOfDay(d.toISOString())] = 0
    }
    ;(trend7dRows ?? []).forEach((r: { created_at: string }) => {
      const day = startOfDay(r.created_at)
      if (day in byDay) byDay[day]++
    })
    const trendLeads7d = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))

    // Trend 30d: by week (lun-dom)
    const { data: trend30dRows } = await supabase
      .from('marketing_leads')
      .select('created_at')
      .gte('created_at', iso30)
    const byWeek: Record<string, number> = {}
    ;(trend30dRows ?? []).forEach((r: { created_at: string }) => {
      const week = startOfWeek(r.created_at)
      byWeek[week] = (byWeek[week] ?? 0) + 1
    })
    const trendLeads30d = Object.entries(byWeek)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, count]) => ({ week, count }))

    // --- Campaigns ---
    const campaigns = (campaignsRows.data ?? []) as {
      id: string
      name: string
      status: string
      budget: number | null
      start_at: string | null
      end_at: string | null
    }[]
    const activeCampaigns = campaigns.filter((c) => c.status === 'active')
    const campaignsActive = activeCampaigns.length
    const budgetActive = activeCampaigns.reduce((s, c) => s + Number(c.budget ?? 0), 0)

    const events = (eventsRows.data ?? []) as { campaign_id: string | null; occurred_at: string }[]
    const eventsTotal7d = events.length
    const eventsByCampaign: Record<string, number> = {}
    activeCampaigns.forEach((c) => {
      eventsByCampaign[c.id] = 0
    })
    events.forEach((e) => {
      const cid = e.campaign_id
      if (cid && cid in eventsByCampaign) eventsByCampaign[cid]++
    })

    const campaignsWithEvents = activeCampaigns.map((c) => ({
      id: c.id,
      name: c.name,
      budget: c.budget,
      start_at: c.start_at,
      end_at: c.end_at,
      eventsCount7d: eventsByCampaign[c.id] ?? 0,
    }))

    // --- Atleti KPI (marketing_athletes) ---
    const athletes = (athletesRows.data ?? []) as {
      workouts_coached_7d: number | null
      workouts_solo_7d: number | null
      workouts_coached_30d: number | null
      workouts_solo_30d: number | null
      last_workout_at: string | null
    }[]
    const now = Date.now()
    const cutoff30 = now - 30 * 24 * 60 * 60 * 1000
    let workoutsCoached7d = 0
    let workoutsSolo7d = 0
    let workoutsCoached30d = 0
    let workoutsSolo30d = 0
    let atletiInattivi = 0
    athletes.forEach((a) => {
      workoutsCoached7d += Number(a.workouts_coached_7d ?? 0)
      workoutsSolo7d += Number(a.workouts_solo_7d ?? 0)
      workoutsCoached30d += Number(a.workouts_coached_30d ?? 0)
      workoutsSolo30d += Number(a.workouts_solo_30d ?? 0)
      const last = a.last_workout_at ? new Date(a.last_workout_at).getTime() : 0
      if (last === 0 || last < cutoff30) atletiInattivi++
    })

    const payload: AnalyticsPayload = {
      kpi: {
        leadsTotal,
        leadsNew7d,
        conversionRate30d,
        campaignsActive,
        budgetActive,
      },
      leadsFunnel30d,
      trendLeads7d,
      trendLeads30d,
      atletiKpi: {
        workoutsCoached7d,
        workoutsSolo7d,
        workoutsCoached30d,
        workoutsSolo30d,
        atletiInattivi,
      },
      campaigns: campaignsWithEvents,
      eventsTotal7d,
    }

    return NextResponse.json(payload)
  } catch (err) {
    logger.error('Errore API marketing analytics', err)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
