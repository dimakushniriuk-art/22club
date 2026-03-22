'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FilePlus,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Users,
  AlertCircle,
  CheckCircle,
  Copy,
  RotateCcw,
  Calendar,
  Coffee,
  UtensilsCrossed,
  Soup,
  Cookie,
  Apple,
  Beef,
  ChevronUp,
  ChevronDown,
  X,
  Plus,
} from 'lucide-react'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import {
  Button,
  Input,
  Label,
  Stepper,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
  PLAN_VERSION_STATUS_ACTIVE,
} from '@/lib/nutrition-tables'

const logger = createLogger('app:dashboard:nutrizionista:piani:nuovo')
const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

const STEPS = [
  { id: '1', label: 'Target calorie' },
  { id: '2', label: 'Macro' },
  { id: '3', label: 'Pasti' },
  { id: '4', label: 'Durata' },
  { id: '5', label: 'Struttura' },
  { id: '6', label: 'Conferma' },
]

const MEAL_TYPES = ['Colazione', 'Pranzo', 'Cena', 'Spuntino', 'Spuntino 2', 'Spuntino 3']

type MealItemDraft = { name: string; quantity: number; unit: 'g' | 'pz' }

const MEAL_ICONS: Record<string, React.ReactNode> = {
  Colazione: <Coffee className="h-4 w-4" />,
  Pranzo: <UtensilsCrossed className="h-4 w-4" />,
  Cena: <Soup className="h-4 w-4" />,
  Spuntino: <Cookie className="h-4 w-4" />,
  'Spuntino 2': <Apple className="h-4 w-4" />,
  'Spuntino 3': <Beef className="h-4 w-4" />,
}

const PRESET_TEMPLATES = [
  {
    name: 'Definizione standard',
    calories: 1800,
    protein: 140,
    carbs: 180,
    fat: 50,
    meals: 4,
    description: 'Perdita peso moderata, alto proteico',
  },
  {
    name: 'Mantenimento',
    calories: 2200,
    protein: 130,
    carbs: 250,
    fat: 70,
    meals: 4,
    description: 'Equilibrio standard',
  },
  {
    name: 'Massa muscolare',
    calories: 2800,
    protein: 170,
    carbs: 350,
    fat: 80,
    meals: 5,
    description: 'Surplus calorico controllato',
  },
  {
    name: 'Low carb',
    calories: 1900,
    protein: 150,
    carbs: 150,
    fat: 85,
    meals: 4,
    description: 'Ridotti carboidrati',
  },
]

type AthleteOption = { id: string; name: string; lastPlan?: Record<string, unknown> | null }

export default function NutrizionistaPianoNuovoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const atletaFromUrl = searchParams?.get('atleta') ?? null
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user, org_id: orgId } = useAuth()
  const supabase = useSupabaseClient()
  const profileId = user?.id ?? null

  const [athletes, setAthletes] = useState<AthleteOption[]>([])
  const [athletesLoading, setAthletesLoading] = useState(true)
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(() => atletaFromUrl)
  const [athleteSearch, setAthleteSearch] = useState('')

  const [step, setStep] = useState(() => (atletaFromUrl ? 1 : 0))

  const [caloriesTarget, setCaloriesTarget] = useState<string>('2000')
  const [proteinTarget, setProteinTarget] = useState<string>('120')
  const [carbTarget, setCarbTarget] = useState<string>('250')
  const [fatTarget, setFatTarget] = useState<string>('65')
  const [selectedMealsOrder, setSelectedMealsOrder] = useState<string[]>(() => [])
  const [numDays, setNumDays] = useState<number>(7)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraftSaved, setIsDraftSaved] = useState(false)
  const [showMacroConfirmDialog, setShowMacroConfirmDialog] = useState(false)
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null)
  const [dayMealItems, setDayMealItems] = useState<Record<string, MealItemDraft[]>>({})
  const [addProductsDayIndex, setAddProductsDayIndex] = useState<number | null>(null)
  const [dialogDraftInputs, setDialogDraftInputs] = useState<
    Record<string, { name: string; quantity: string; unit: 'g' | 'pz' }>
  >({})

  const caloriesFromMacros = useMemo(() => {
    const p = Number(proteinTarget) || 0
    const c = Number(carbTarget) || 0
    const f = Number(fatTarget) || 0
    return p * 4 + c * 4 + f * 9
  }, [proteinTarget, carbTarget, fatTarget])

  const macroDeviation = useMemo(() => {
    const target = Number(caloriesTarget) || 0
    if (target === 0 || caloriesFromMacros === 0) return null
    const diff = Math.abs(caloriesFromMacros - target)
    const percentDiff = (diff / target) * 100
    return {
      diff,
      percentDiff,
      isAligned: percentDiff <= 5,
      isWarning: percentDiff > 5 && percentDiff <= 10,
      isError: percentDiff > 10,
    }
  }, [caloriesTarget, caloriesFromMacros])

  const dateRange = useMemo(() => {
    const start = new Date()
    const end = new Date(start)
    end.setDate(end.getDate() + numDays - 1)
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      duration: numDays,
    }
  }, [numDays])

  const activeMeals = selectedMealsOrder
  const numMeals = activeMeals.length

  const shoppingList = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; unit: 'g' | 'pz' }>()
    for (let d = 0; d < numDays; d++) {
      for (let m = 0; m < activeMeals.length; m++) {
        const key = `${d}-${m}`
        const items = dayMealItems[key] ?? []
        for (const it of items) {
          const norm = `${it.name.trim().toLowerCase()}|${it.unit}`
          const existing = map.get(norm)
          if (existing) {
            existing.quantity += it.quantity
          } else {
            map.set(norm, { name: it.name.trim(), quantity: it.quantity, unit: it.unit })
          }
        }
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [dayMealItems, numDays, activeMeals.length])

  useEffect(() => {
    if (!profileId) {
      setAthletes([])
      setAthletesLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setAthletesLoading(true)
      try {
        const { data: staffRows, error: staffErr } = await supabase
          .from('staff_atleti')
          .select('atleta_id')
          .eq('staff_id', profileId)
          .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
          .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
        if (staffErr || cancelled) return
        const ids = (staffRows ?? [])
          .map((r) => (r as { atleta_id: string }).atleta_id)
          .filter(Boolean)
        if (ids.length === 0) {
          setAthletes([])
          return
        }
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .in('id', ids)
        if (cancelled) return

        const list: AthleteOption[] = await Promise.all(
          (profiles ?? []).map(
            async (p: { id: string; nome: string | null; cognome: string | null }) => {
              const name = [p.nome, p.cognome].filter(Boolean).join(' ').trim() || p.id.slice(0, 8)

              const { data: group } = await nutritionFrom(supabase, NUTRITION_TABLES.planGroups)
                .select('id')
                .eq('athlete_id', p.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

              let lastPlan: Record<string, unknown> | null = null
              if (group && (group as { id?: string }).id) {
                const { data: version } = await nutritionFrom(
                  supabase,
                  NUTRITION_TABLES.planVersions,
                )
                  .select('*')
                  .eq('plan_id', (group as { id: string }).id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle()
                lastPlan = (version as Record<string, unknown>) ?? null
              }

              return { id: p.id, name, lastPlan }
            },
          ),
        )
        setAthletes(list)
      } finally {
        if (!cancelled) setAthletesLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [profileId, supabase])

  useEffect(() => {
    const savedDraft = sessionStorage.getItem('nutritionPlanDraft')
    if (!savedDraft) return
    try {
      const draft = JSON.parse(savedDraft) as Record<string, unknown> & {
        timestamp?: number
        step?: number
      }
      if ((draft.timestamp ?? 0) < Date.now() - 3600000) return
      setCaloriesTarget((draft.caloriesTarget as string) || '2000')
      setProteinTarget((draft.proteinTarget as string) || '120')
      setCarbTarget((draft.carbTarget as string) || '250')
      setFatTarget((draft.fatTarget as string) || '65')
      if (Array.isArray(draft.selectedMealsOrder) && draft.selectedMealsOrder.length <= 6) {
        setSelectedMealsOrder(draft.selectedMealsOrder as string[])
      }
      if (draft.dayMealItems && typeof draft.dayMealItems === 'object') {
        setDayMealItems(draft.dayMealItems as Record<string, MealItemDraft[]>)
      }
      setNumDays((draft.numDays as number) ?? 7)
      if (draft.selectedAthleteId) setSelectedAthleteId(draft.selectedAthleteId as string)
      const savedStep =
        typeof draft.step === 'number' && draft.step >= 1 && draft.step <= 6 ? draft.step : 1
      setStep(savedStep)
      setIsDraftSaved(true)
    } catch {
      // ignore parse errors
    }
  }, [atletaFromUrl])

  const saveDraft = useCallback(() => {
    sessionStorage.setItem(
      'nutritionPlanDraft',
      JSON.stringify({
        caloriesTarget,
        proteinTarget,
        carbTarget,
        fatTarget,
        selectedMealsOrder,
        numDays,
        dayMealItems,
        selectedAthleteId,
        step: step >= 1 && step <= 6 ? step : 1,
        timestamp: Date.now(),
      }),
    )
    setIsDraftSaved(true)
    setTimeout(() => setIsDraftSaved(false), 2000)
  }, [
    caloriesTarget,
    proteinTarget,
    carbTarget,
    fatTarget,
    selectedMealsOrder,
    numDays,
    dayMealItems,
    selectedAthleteId,
    step,
  ])

  const alignMacrosToCalories = useCallback(() => {
    const target = Number(caloriesTarget) || 2000
    const p = Number(proteinTarget) || 120
    const c = Number(carbTarget) || 250
    const f = Number(fatTarget) || 65
    const total = p * 4 + c * 4 + f * 9
    if (total === 0) {
      setProteinTarget(Math.round((target * 0.3) / 4).toString())
      setCarbTarget(Math.round((target * 0.4) / 4).toString())
      setFatTarget(Math.round((target * 0.3) / 9).toString())
    } else {
      const ratio = target / total
      setProteinTarget(Math.round(p * ratio).toString())
      setCarbTarget(Math.round(c * ratio).toString())
      setFatTarget(Math.round(f * ratio).toString())
    }
  }, [caloriesTarget, proteinTarget, carbTarget, fatTarget])

  const loadTemplate = useCallback((template: (typeof PRESET_TEMPLATES)[0]) => {
    setSelectedTemplateName(template.name)
    setCaloriesTarget(template.calories.toString())
    setProteinTarget(template.protein.toString())
    setCarbTarget(template.carbs.toString())
    setFatTarget(template.fat.toString())
    setSelectedMealsOrder(MEAL_TYPES.slice(0, template.meals))
  }, [])

  const duplicateLastPlan = useCallback(
    (athleteId: string) => {
      const athlete = athletes.find((a) => a.id === athleteId)
      const plan = athlete?.lastPlan as
        | {
            calories_target?: number
            protein_target?: number
            carb_target?: number
            fat_target?: number
          }
        | undefined
      if (!plan) return
      setCaloriesTarget(String(plan.calories_target ?? 2000))
      setProteinTarget(String(plan.protein_target ?? 120))
      setCarbTarget(String(plan.carb_target ?? 250))
      setFatTarget(String(plan.fat_target ?? 65))
    },
    [athletes],
  )

  const canProceedStep1 = caloriesTarget !== '' && Number(caloriesTarget) > 0
  const canProceedStep2 =
    proteinTarget !== '' &&
    carbTarget !== '' &&
    fatTarget !== '' &&
    Number(proteinTarget) >= 0 &&
    Number(carbTarget) >= 0 &&
    Number(fatTarget) >= 0

  const executeCreate = useCallback(async () => {
    if (!selectedAthleteId || !profileId) return
    if (!orgId) {
      setError('Profilo senza organizzazione. Impossibile creare il piano.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { data: groupRow, error: groupErr } = await nutritionFrom(
        supabase,
        NUTRITION_TABLES.planGroups,
      )
        .insert({ athlete_id: selectedAthleteId, org_id: orgId, nutrizionista_id: profileId })
        .select('id')
        .single()

      if (groupErr || !groupRow) {
        logger.error('Insert plan group', groupErr)
        throw new Error(
          (groupErr as { message?: string })?.message ?? 'Errore creazione gruppo piano',
        )
      }
      const groupId = (groupRow as { id: string }).id

      const { data: versionRow, error: versionErr } = await nutritionFrom(
        supabase,
        NUTRITION_TABLES.planVersions,
      )
        .insert({
          plan_id: groupId,
          version_number: 1,
          status: PLAN_VERSION_STATUS_ACTIVE,
          calories_target: Number(caloriesTarget) || 2000,
          protein_target: Number(proteinTarget) || 120,
          carb_target: Number(carbTarget) || 250,
          fat_target: Number(fatTarget) || 65,
          start_date: dateRange.start,
          end_date: dateRange.end,
          created_by: profileId,
        })
        .select('id')
        .single()

      if (versionErr || !versionRow) {
        logger.error('Insert plan version', versionErr)
        throw new Error(
          (versionErr as { message?: string })?.message ?? 'Errore creazione versione',
        )
      }
      const versionId = (versionRow as { id: string }).id

      for (let d = 0; d < numDays; d++) {
        const { data: dayRow, error: dayErr } = await nutritionFrom(
          supabase,
          NUTRITION_TABLES.planDays,
        )
          .insert({
            plan_version_id: versionId,
            day_number: d + 1,
          } as Record<string, unknown>)
          .select('id')
          .single()

        if (dayErr || !dayRow) {
          logger.error('Insert plan day', dayErr)
          break
        }
        const dayId = (dayRow as { id: string }).id
        for (let m = 0; m < activeMeals.length; m++) {
          const { data: mealRow, error: mealErr } = await nutritionFrom(
            supabase,
            NUTRITION_TABLES.planMeals,
          )
            .insert({
              plan_day_id: dayId,
              meal_type: activeMeals[m],
              meal_order: m + 1,
            } as Record<string, unknown>)
            .select('id')
            .single()
          if (mealErr || !mealRow) break
          const mealId = (mealRow as { id: string }).id
          const items = dayMealItems[`${d}-${m}`] ?? []
          for (const it of items) {
            await nutritionFrom(supabase, NUTRITION_TABLES.planItems).insert({
              plan_meal_id: mealId,
              name: it.name,
              quantity: it.quantity,
              unit: it.unit,
            } as Record<string, unknown>)
          }
        }
      }

      sessionStorage.removeItem('nutritionPlanDraft')
      router.push(`/dashboard/nutrizionista/atleti/${selectedAthleteId}?tab=piani`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore creazione piano')
    } finally {
      setSubmitting(false)
    }
  }, [
    selectedAthleteId,
    profileId,
    orgId,
    supabase,
    caloriesTarget,
    proteinTarget,
    carbTarget,
    fatTarget,
    activeMeals,
    numDays,
    dateRange,
    dayMealItems,
    router,
  ])

  const handleCreate = useCallback(async () => {
    if (!selectedAthleteId || !profileId) {
      setError('Seleziona un atleta per creare il piano.')
      return
    }
    const { data: staffRow } = await supabase
      .from('staff_atleti')
      .select('atleta_id')
      .eq('staff_id', profileId)
      .eq('atleta_id', selectedAthleteId)
      .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
      .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
      .maybeSingle()
    if (!staffRow) {
      setError('Atleta non assegnato.')
      return
    }

    if (macroDeviation?.isError) {
      setShowMacroConfirmDialog(true)
      return
    }

    await executeCreate()
  }, [selectedAthleteId, profileId, supabase, macroDeviation?.isError, executeCreate])

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const filteredAthletes = athletes.filter((a) =>
    a.name.toLowerCase().includes(athleteSearch.toLowerCase()),
  )
  const selectedAthleteName = selectedAthleteId
    ? athletes.find((a) => a.id === selectedAthleteId)?.name
    : null

  if (step === 0) {
    return (
      <StaffContentLayout
        title="Nuovo piano nutrizionale"
        description="Seleziona l'atleta per cui vuoi creare il piano"
        icon={<FilePlus className="w-6 h-6" />}
        theme="teal"
        actions={
          <Link
            href="/dashboard/nutrizionista"
            className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        }
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6">
            <h3 className="font-semibold text-lg mb-4">Chi è l&apos;atleta?</h3>

            {athletesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : athletes.length === 0 ? (
              <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  Nessun atleta collegato. Vai alla{' '}
                  <Link
                    href="/dashboard/nutrizionista/atleti"
                    className="text-emerald-400 hover:underline font-medium"
                  >
                    Lista atleti
                  </Link>{' '}
                  per gestire le assegnazioni.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Cerca atleta per nome..."
                    value={athleteSearch}
                    onChange={(e) => setAthleteSearch(e.target.value)}
                    className="min-h-[44px] pl-10"
                  />
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredAthletes.map((athlete) => (
                    <button
                      key={athlete.id}
                      type="button"
                      onClick={() => {
                        setSelectedAthleteId(athlete.id)
                        setStep(1)
                      }}
                      className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-background-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{athlete.name}</div>
                          {athlete.lastPlan && (
                            <div className="text-xs text-text-muted mt-1">
                              Ultimo piano:
                              {
                                (athlete.lastPlan as { calories_target?: number }).calories_target
                              }{' '}
                              kcal
                            </div>
                          )}
                        </div>
                        {athlete.lastPlan && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateLastPlan(athlete.id)
                              setSelectedAthleteId(athlete.id)
                              setStep(1)
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Duplica
                          </Button>
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredAthletes.length === 0 && (
                    <p className="text-center text-text-muted py-4">
                      Nessun atleta trovato con &quot;{athleteSearch}&quot;
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </StaffContentLayout>
    )
  }

  const stepperSteps = STEPS.map((s, i) => ({
    id: s.id,
    label: s.label,
    completed: step > i + 1,
    active: step === i + 1,
  }))

  return (
    <StaffContentLayout
      title={`Nuovo piano per ${selectedAthleteName || 'atleta'}`}
      description={`Step ${step} di 6 — ${STEPS[step - 1]?.label ?? ''}`}
      icon={<FilePlus className="w-6 h-6" />}
      theme="teal"
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          {isDraftSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Bozza salvata
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={saveDraft}
            className="text-text-muted hover:text-text-primary"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Salva bozza
          </Button>
          <Link
            href={
              selectedAthleteId
                ? `/dashboard/nutrizionista/atleti/${selectedAthleteId}`
                : '/dashboard/nutrizionista'
            }
            className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Profilo atleta
          </Link>
        </div>
      }
    >
      <Stepper steps={stepperSteps} variant="minimal" className="mb-6" />

      {error && (
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 text-sm flex items-start gap-2 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6">
            <h3 className="font-semibold text-lg mb-4">Target calorico</h3>

            <div className="mb-6">
              <Label className="mb-2 block">Template rapidi</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => loadTemplate(template)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      selectedTemplateName === template.name
                        ? 'border-teal-500/50 bg-teal-500/10 ring-1 ring-teal-500/30'
                        : 'border-border hover:border-primary/50 hover:bg-background-secondary'
                    }`}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-text-muted mt-1">{template.description}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {template.calories} kcal | P:{template.protein} C:{template.carbs} F:
                      {template.fat}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-md">
              <Label htmlFor="calories" className="text-base">
                Calorie giornaliere target
              </Label>
              <Input
                id="calories"
                type="number"
                min={800}
                max={5000}
                step={50}
                value={caloriesTarget}
                onChange={(e) => {
                  setSelectedTemplateName(null)
                  setCaloriesTarget(e.target.value)
                }}
                className="mt-1.5 min-h-[44px] text-lg"
              />
              <p className="text-xs text-text-muted mt-2">
                Valore consigliato: minimo 1200 kcal per donne, 1500 kcal per uomini
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="button"
                className="min-h-[44px] px-6"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Avanti <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6">
            <h3 className="font-semibold text-lg mb-4">Macronutrienti (grammi/giorno)</h3>

            <div className="mb-6 p-4 rounded-lg bg-background-secondary border border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-sm text-text-muted">Target calorie:</span>
                  <span className="ml-2 font-semibold">{caloriesTarget} kcal</span>
                </div>
                <div>
                  <span className="text-sm text-text-muted">Calorie da macro:</span>
                  <span
                    className={`ml-2 font-semibold ${
                      macroDeviation?.isAligned
                        ? 'text-emerald-400'
                        : macroDeviation?.isWarning
                          ? 'text-amber-400'
                          : macroDeviation?.isError
                            ? 'text-red-400'
                            : ''
                    }`}
                  >
                    {caloriesFromMacros} kcal
                  </span>
                </div>
                {macroDeviation && !macroDeviation.isAligned && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={alignMacrosToCalories}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Allinea macro al target
                  </Button>
                )}
              </div>
              {macroDeviation?.isWarning && (
                <p className="text-xs text-amber-400 mt-2">
                  Le calorie da macro sono leggermente diverse dal target (deviazione{' '}
                  {macroDeviation.percentDiff.toFixed(1)}%)
                </p>
              )}
              {macroDeviation?.isError && (
                <p className="text-xs text-red-400 mt-2">
                  Le calorie da macro sono molto diverse dal target (deviazione{' '}
                  {macroDeviation.percentDiff.toFixed(1)}%)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="protein" className="text-base">
                  Proteine (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  min={0}
                  max={400}
                  step={5}
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  className="mt-1.5 min-h-[44px]"
                />
                <p className="text-xs text-text-muted mt-1">Min: 1.6g/kg per dimagrimento</p>
              </div>
              <div>
                <Label htmlFor="carb" className="text-base">
                  Carboidrati (g)
                </Label>
                <Input
                  id="carb"
                  type="number"
                  min={0}
                  max={600}
                  step={5}
                  value={carbTarget}
                  onChange={(e) => setCarbTarget(e.target.value)}
                  className="mt-1.5 min-h-[44px]"
                />
              </div>
              <div>
                <Label htmlFor="fat" className="text-base">
                  Grassi (g)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  min={0}
                  max={200}
                  step={5}
                  value={fatTarget}
                  onChange={(e) => setFatTarget(e.target.value)}
                  className="mt-1.5 min-h-[44px]"
                />
                <p className="text-xs text-text-muted mt-1">Min: 0.8g/kg per funzione ormonale</p>
              </div>
            </div>

            <div className="flex justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px]"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Indietro
              </Button>
              <Button
                type="button"
                className="min-h-[44px] px-6"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
              >
                Avanti <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6">
            <h3 className="font-semibold text-lg mb-4">Distribuzione pasti</h3>
            <p className="text-sm text-text-muted mb-6">
              Scegli i pasti e mettili nell’ordine desiderato (min 3, max 6). Clicca su un pasto
              disponibile per aggiungerlo, usa le frecce per riordinare.
            </p>

            <div className="mb-6">
              <Label className="text-base mb-2 block">I tuoi pasti (in ordine)</Label>
              {selectedMealsOrder.length === 0 ? (
                <p className="text-sm text-text-muted py-3">
                  Nessun pasto selezionato. Aggiungi almeno 3 pasti dall’elenco sotto.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedMealsOrder.map((meal, idx) => (
                    <div
                      key={`${meal}-${idx}`}
                      className="flex items-center gap-1 p-3 rounded-lg bg-background-secondary border border-border"
                    >
                      {MEAL_ICONS[meal] ?? <Coffee className="h-4 w-4 text-text-muted" />}
                      <span className="text-sm">{meal}</span>
                      <div className="flex items-center ml-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (idx > 0) {
                              const next = [...selectedMealsOrder]
                              const t = next[idx - 1]
                              next[idx - 1] = next[idx]
                              next[idx] = t
                              setSelectedMealsOrder(next)
                            }
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Sposta su"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (idx < selectedMealsOrder.length - 1) {
                              const next = [...selectedMealsOrder]
                              const t = next[idx + 1]
                              next[idx + 1] = next[idx]
                              next[idx] = t
                              setSelectedMealsOrder(next)
                            }
                          }}
                          disabled={idx === selectedMealsOrder.length - 1}
                          className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Sposta giù"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedMealsOrder.length > 3) {
                              setSelectedMealsOrder(selectedMealsOrder.filter((_, i) => i !== idx))
                            }
                          }}
                          disabled={selectedMealsOrder.length <= 3}
                          className="p-1 rounded hover:bg-red-500/20 text-red-400 disabled:opacity-30 disabled:pointer-events-none"
                          aria-label="Rimuovi"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedMealsOrder.length < 6 && (
              <div className="mb-6">
                <Label className="text-base mb-2 block">Aggiungi pasto</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {MEAL_TYPES.filter((m) => !selectedMealsOrder.includes(m)).map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMealsOrder([...selectedMealsOrder, meal])}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-background-secondary transition-colors text-left"
                    >
                      {MEAL_ICONS[meal] ?? <Coffee className="h-4 w-4 text-text-muted" />}
                      <span className="text-sm">{meal}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px]"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Indietro
              </Button>
              <Button
                type="button"
                className="min-h-[44px] px-6"
                onClick={() => setStep(4)}
                disabled={selectedMealsOrder.length < 3}
              >
                Avanti <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
            {selectedMealsOrder.length > 0 && selectedMealsOrder.length < 3 && (
              <p className="text-sm text-amber-500 mt-2">
                Seleziona almeno 3 pasti per continuare.
              </p>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6">
            <h3 className="font-semibold text-lg mb-4">Durata del piano</h3>

            <div className="max-w-md">
              <Label htmlFor="days" className="text-base">
                Numero giorni
              </Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={28}
                value={numDays}
                onChange={(e) => setNumDays(Math.min(28, Math.max(1, Number(e.target.value) || 7)))}
                className="mt-1.5 min-h-[44px]"
              />
            </div>

            <div className="mt-6 p-4 rounded-lg bg-background-secondary border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-text-muted" />
                <span className="font-medium">Date del piano:</span>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-text-muted">Inizio:</span>
                  <p className="font-mono text-sm">{dateRange.start}</p>
                </div>
                <div>
                  <span className="text-xs text-text-muted">Fine:</span>
                  <p className="font-mono text-sm">{dateRange.end}</p>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Durata: {dateRange.duration} giorno{dateRange.duration !== 1 ? 'ni' : ''}
              </p>
            </div>

            <div className="flex justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px]"
                onClick={() => setStep(3)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Indietro
              </Button>
              <Button type="button" className="min-h-[44px] px-6" onClick={() => setStep(5)}>
                Avanti <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6">
            <h3 className="font-semibold text-lg mb-2">Struttura del piano</h3>
            <p className="text-text-muted text-sm mb-6">
              Verranno creati i giorni e i pasti. Gli alimenti potrai aggiungerli successivamente
              dalla sezione &quot;Struttura piano&quot; nel profilo atleta.
            </p>

            <div className="bg-background-secondary rounded-lg p-4 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Giorni totali:</span>
                <span className="font-semibold">{numDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">Pasti per giorno:</span>
                <span className="font-semibold">{numMeals}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-text-muted">Totale pasti da creare:</span>
                <span className="font-semibold text-lg text-primary">{numDays * numMeals}</span>
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-base mb-2 block">Anteprima struttura ({numDays} giorni)</Label>
              <div className="space-y-3">
                {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => {
                  const dayIndex = day - 1
                  const itemCount = activeMeals.reduce(
                    (acc, _, mIdx) => acc + (dayMealItems[`${dayIndex}-${mIdx}`]?.length ?? 0),
                    0,
                  )
                  return (
                    <div
                      key={day}
                      className="rounded-lg border border-border p-3 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm mb-2">Giorno {day}</div>
                        <div className="flex flex-wrap gap-2">
                          {activeMeals.map((meal) => (
                            <span
                              key={meal}
                              className="text-xs px-2 py-1 rounded-full bg-background-secondary border border-border"
                            >
                              {meal}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 min-h-[40px]"
                        onClick={() => setAddProductsDayIndex(dayIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Aggiungi prodotti
                        {itemCount > 0 && (
                          <span className="ml-1.5 text-primary font-medium">({itemCount})</span>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dialog Aggiungi prodotti per giorno */}
            <Dialog
              open={addProductsDayIndex !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setAddProductsDayIndex(null)
                  setDialogDraftInputs({})
                }
              }}
            >
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Prodotti – Giorno {addProductsDayIndex !== null ? addProductsDayIndex + 1 : ''}
                  </DialogTitle>
                  <DialogDescription>
                    Aggiungi gli alimenti per ogni pasto indicando grammi (g) o pezzi (pz).
                  </DialogDescription>
                </DialogHeader>
                {addProductsDayIndex !== null && (
                  <div className="space-y-6 py-2">
                    {activeMeals.map((meal, mealIdx) => {
                      const key = `${addProductsDayIndex}-${mealIdx}`
                      const items = dayMealItems[key] ?? []
                      return (
                        <div
                          key={key}
                          className="rounded-lg border border-border p-4 bg-background-secondary/30"
                        >
                          <div className="font-medium text-sm mb-3 flex items-center gap-2">
                            {MEAL_ICONS[meal] ?? <Coffee className="h-4 w-4 text-text-muted" />}
                            {meal}
                          </div>
                          <ul className="space-y-2 mb-3">
                            {items.map((it, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="font-medium">{it.name}</span>
                                <span className="text-text-muted">
                                  {it.quantity} {it.unit}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDayMealItems((prev) => {
                                      const list = [...(prev[key] ?? [])]
                                      list.splice(idx, 1)
                                      return { ...prev, [key]: list }
                                    })
                                  }}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-400"
                                  aria-label="Rimuovi"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-2 items-end">
                            <div className="flex-1 min-w-[120px]">
                              <Label className="text-xs text-text-muted">Alimento</Label>
                              <Input
                                placeholder="es. Pasta"
                                className="mt-0.5 min-h-[40px]"
                                value={dialogDraftInputs[key]?.name ?? ''}
                                onChange={(e) =>
                                  setDialogDraftInputs((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...(prev[key] ?? { name: '', quantity: '', unit: 'g' }),
                                      name: e.target.value,
                                    },
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const d = dialogDraftInputs[key]
                                    const name = d?.name?.trim()
                                    const qty = Number(d?.quantity) || 0
                                    const unit = (d?.unit === 'pz' ? 'pz' : 'g') as 'g' | 'pz'
                                    if (name && qty > 0) {
                                      setDayMealItems((prev) => ({
                                        ...prev,
                                        [key]: [
                                          ...(prev[key] ?? []),
                                          { name, quantity: qty, unit },
                                        ],
                                      }))
                                      setDialogDraftInputs((prev) => ({
                                        ...prev,
                                        [key]: { name: '', quantity: '', unit: 'g' },
                                      }))
                                    }
                                  }
                                }}
                              />
                            </div>
                            <div className="w-20">
                              <Label className="text-xs text-text-muted">Qtà</Label>
                              <Input
                                type="number"
                                min={1}
                                placeholder="80"
                                className="mt-0.5 min-h-[40px]"
                                value={dialogDraftInputs[key]?.quantity ?? ''}
                                onChange={(e) =>
                                  setDialogDraftInputs((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...(prev[key] ?? { name: '', quantity: '', unit: 'g' }),
                                      quantity: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <div className="w-20">
                              <Label className="text-xs text-text-muted">Unità</Label>
                              <select
                                className="mt-0.5 w-full min-h-[40px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                value={dialogDraftInputs[key]?.unit ?? 'g'}
                                onChange={(e) =>
                                  setDialogDraftInputs((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...(prev[key] ?? { name: '', quantity: '', unit: 'g' }),
                                      unit: e.target.value === 'pz' ? 'pz' : 'g',
                                    },
                                  }))
                                }
                              >
                                <option value="g">g</option>
                                <option value="pz">pz</option>
                              </select>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="min-h-[40px]"
                              onClick={() => {
                                const d = dialogDraftInputs[key]
                                const name = d?.name?.trim()
                                const qty = Number(d?.quantity) || 0
                                const unit = (d?.unit === 'pz' ? 'pz' : 'g') as 'g' | 'pz'
                                if (name && qty > 0) {
                                  setDayMealItems((prev) => ({
                                    ...prev,
                                    [key]: [...(prev[key] ?? []), { name, quantity: qty, unit }],
                                  }))
                                  setDialogDraftInputs((prev) => ({
                                    ...prev,
                                    [key]: { name: '', quantity: '', unit: 'g' },
                                  }))
                                }
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Aggiungi
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddProductsDayIndex(null)}
                  >
                    Chiudi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px]"
                onClick={() => setStep(4)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Indietro
              </Button>
              <Button type="button" className="min-h-[44px] px-6" onClick={() => setStep(6)}>
                Avanti <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-background-secondary/50 p-6">
            <h3 className="font-semibold text-lg mb-4">Conferma piano</h3>

            <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Atleta: {selectedAthleteName}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(0)}>
                  Cambia
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-2">Target nutrizionali</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Calorie target:</span>
                      <span className="font-semibold">{caloriesTarget} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calorie da macro:</span>
                      <span
                        className={`font-semibold ${
                          macroDeviation?.isAligned
                            ? 'text-emerald-400'
                            : macroDeviation?.isWarning
                              ? 'text-amber-400'
                              : macroDeviation?.isError
                                ? 'text-red-400'
                                : ''
                        }`}
                      >
                        {caloriesFromMacros} kcal
                      </span>
                    </div>
                    {macroDeviation && !macroDeviation.isAligned && (
                      <div className="text-xs text-amber-400">
                        Deviazione: {macroDeviation.percentDiff.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-2">Macronutrienti</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Proteine:</span>
                      <span className="font-semibold">{proteinTarget}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carboidrati:</span>
                      <span className="font-semibold">{carbTarget}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grassi:</span>
                      <span className="font-semibold">{fatTarget}g</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-2">Durata e struttura</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Inizio:</span>
                      <span className="font-mono text-sm">{dateRange.start}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fine:</span>
                      <span className="font-mono text-sm">{dateRange.end}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giorni totali:</span>
                      <span className="font-semibold">{numDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pasti/giorno:</span>
                      <span className="font-semibold">{numMeals}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span>Totale pasti:</span>
                      <span className="font-semibold text-primary">{numDays * numMeals}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text-muted mb-2">Pasti previsti</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeMeals.map((meal) => (
                      <span
                        key={meal}
                        className="text-xs px-2 py-1 rounded-full bg-background-secondary border border-border"
                      >
                        {meal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium text-text-muted mb-3">Lista della spesa</h4>
              <p className="text-xs text-text-muted mb-3">
                Totale per {numDays} giorni (grammi e pezzi sommati su tutti i pasti).
              </p>
              {shoppingList.length === 0 ? (
                <p className="text-sm text-text-muted py-2">Nessun prodotto aggiunto.</p>
              ) : (
                <ul className="rounded-lg border border-border divide-y divide-border bg-background-secondary/30 overflow-hidden">
                  {shoppingList.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="font-medium capitalize">{item.name}</span>
                      <span className="text-primary font-semibold">
                        {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-between gap-2 mt-8">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px]"
                onClick={() => setStep(5)}
                disabled={submitting}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Indietro
              </Button>
              <Button
                type="button"
                className="min-h-[44px] px-8"
                onClick={() => void handleCreate()}
                disabled={submitting || !selectedAthleteId}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                {submitting ? 'Creazione...' : 'Crea piano'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showMacroConfirmDialog} onOpenChange={setShowMacroConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conferma target e macro</DialogTitle>
            <DialogDescription>
              Le calorie da macro ({caloriesFromMacros} kcal) sono molto diverse dal target (
              {caloriesTarget} kcal). Vuoi creare il piano comunque? Potrai modificarlo dopo dalla
              sezione Struttura piano.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMacroConfirmDialog(false)}
              disabled={submitting}
            >
              Annulla
            </Button>
            <Button
              type="button"
              onClick={async () => {
                setShowMacroConfirmDialog(false)
                await executeCreate()
              }}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Crea comunque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffContentLayout>
  )
}
