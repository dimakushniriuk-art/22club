'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Settings,
  Save,
  RotateCcw,
  Copy,
  AlertCircle,
  UtensilsCrossed,
  Target,
  Loader2,
} from 'lucide-react'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'

const logger = createLogger('app:dashboard:nutrizionista:impostazioni')
const LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

const MACRO_DISTRIBUTION_OPTIONS = [
  { value: 'equal', label: 'Uguale' },
  { value: 'breakfast_heavy', label: 'Colazione pesante' },
  { value: 'dinner_heavy', label: 'Cena pesante' },
  { value: 'training_day_bias', label: 'Giorno allenamento' },
  { value: 'custom', label: 'Personalizzato' },
] as const

const GOAL_TYPE_OPTIONS = [
  { value: 'cut', label: 'Cut' },
  { value: 'maintain', label: 'Mantenimento' },
  { value: 'bulk', label: 'Bulk' },
  { value: 'recomp', label: 'Ricomposizione' },
] as const

const DEFAULT_AUTO_CONFIG = {
  meals_per_day: 5,
  macro_distribution_mode: 'equal' as const,
  carb_cycling: false,
}

const DEFAULT_ADAPTIVE_SETTINGS = {
  goal_type: 'maintain' as const,
  weekly_target_percent: 0.5,
  tolerance_percent: 0.2,
  min_calorie_adjustment: -150,
  max_calorie_adjustment: 150,
  protein_floor_per_kg: 1.8,
  adjust_frequency_days: 7,
}

type AutoConfig = {
  meals_per_day: number
  macro_distribution_mode: string
  carb_cycling: boolean
}

type AdaptiveSettings = {
  goal_type: string
  weekly_target_percent: number
  tolerance_percent: number
  min_calorie_adjustment: number
  max_calorie_adjustment: number
  protein_floor_per_kg: number
  adjust_frequency_days: number
}

export default function NutrizionistaImpostazioniPage() {
  const { showLoader } = useStaffDashboardGuard('nutrizionista')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const profileId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignedAthletes, setAssignedAthletes] = useState<
    { id: string; name: string; email: string | null }[]
  >([])
  const [plans, setPlans] = useState<
    { id: string; athlete_id: string; created_at: string | null }[]
  >([])
  const [versions, setVersions] = useState<
    {
      id: string
      plan_id: string
      version_number: number | null
      status: string | null
      created_at: string | null
    }[]
  >([])

  const [selectedAthleteId, setSelectedAthleteId] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [selectedVersionId, setSelectedVersionId] = useState('')
  const [versionLoading, setVersionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'structure' | 'adaptive'>('structure')
  const [saving, setSaving] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)

  const [autoConfig, setAutoConfig] = useState<AutoConfig>(DEFAULT_AUTO_CONFIG)
  const [adaptiveSettings, setAdaptiveSettings] =
    useState<AdaptiveSettings>(DEFAULT_ADAPTIVE_SETTINGS)
  const [autoConfigLoaded, setAutoConfigLoaded] = useState(false)
  const [adaptiveLoaded, setAdaptiveLoaded] = useState(false)

  const loadAthletesAndPlans = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    setError(null)
    try {
      const { data: staffData, error: staffErr } = await supabase
        .from('staff_atleti')
        .select('atleta_id')
        .eq('staff_id', profileId)
        .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
        .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
      if (staffErr) throw staffErr
      const athleteIds = (staffData ?? [])
        .map((r) => (r as { atleta_id: string }).atleta_id)
        .filter(Boolean)
      if (athleteIds.length === 0) {
        setAssignedAthletes([])
        setPlans([])
        setLoading(false)
        return
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email')
        .in('id', athleteIds)
      const profilesMap = new Map(
        (profilesData ?? []).map(
          (p: {
            id: string
            nome: string | null
            cognome: string | null
            email: string | null
          }) => [
            p.id,
            {
              name: [p.nome, p.cognome].filter(Boolean).join(' ') || p.id.slice(0, 8),
              email: p.email ?? null,
            },
          ],
        ),
      )
      setAssignedAthletes(
        athleteIds.map((id) => ({
          id,
          name: profilesMap.get(id)?.name ?? id.slice(0, 8),
          email: profilesMap.get(id)?.email ?? null,
        })),
      )

      const groupsRes = await nutritionFrom(supabase, NUTRITION_TABLES.planGroups)
        .select('id, athlete_id, created_at')
        .in('athlete_id', athleteIds)
      setPlans((groupsRes.data ?? []) as typeof plans)
    } catch (e) {
      logger.error('Caricamento atleti/piani', e)
      setError(e instanceof Error ? e.message : 'Errore caricamento')
    } finally {
      setLoading(false)
    }
  }, [profileId, supabase])

  useEffect(() => {
    void loadAthletesAndPlans()
  }, [loadAthletesAndPlans])

  const plansForAthlete = useMemo(
    () => plans.filter((p) => p.athlete_id === selectedAthleteId),
    [plans, selectedAthleteId],
  )

  const loadVersions = useCallback(
    async (planId: string) => {
      if (!planId) {
        setVersions([])
        return
      }
      const { data } = await nutritionFrom(supabase, NUTRITION_TABLES.planVersions)
        .select('id, plan_id, version_number, status, created_at')
        .eq('plan_id', planId)
        .order('version_number', { ascending: false })
      setVersions((data ?? []) as typeof versions)
    },
    [supabase],
  )

  useEffect(() => {
    if (selectedPlanId) void loadVersions(selectedPlanId)
    else setVersions([])
  }, [selectedPlanId, loadVersions])

  const loadConfigForVersion = useCallback(
    async (versionId: string) => {
      if (!versionId) {
        setAutoConfig(DEFAULT_AUTO_CONFIG)
        setAdaptiveSettings(DEFAULT_ADAPTIVE_SETTINGS)
        setAutoConfigLoaded(false)
        setAdaptiveLoaded(false)
        return
      }
      setVersionLoading(true)
      try {
        const [configRes, settingsRes] = await Promise.all([
          nutritionFrom(supabase, NUTRITION_TABLES.autoConfig)
            .select('*')
            .eq('version_id', versionId)
            .maybeSingle(),
          nutritionFrom(supabase, NUTRITION_TABLES.adaptiveSettings)
            .select('*')
            .eq('version_id', versionId)
            .maybeSingle(),
        ])
        const config = configRes.data as {
          meals_per_day?: number
          macro_distribution_mode?: string
          carb_cycling?: boolean
        } | null
        const settings = settingsRes.data as {
          goal_type?: string
          weekly_target_percent?: number
          tolerance_percent?: number
          min_calorie_adjustment?: number
          max_calorie_adjustment?: number
          protein_floor_per_kg?: number
          adjust_frequency_days?: number
        } | null
        setAutoConfig(
          config
            ? {
                meals_per_day: config.meals_per_day ?? DEFAULT_AUTO_CONFIG.meals_per_day,
                macro_distribution_mode:
                  config.macro_distribution_mode ?? DEFAULT_AUTO_CONFIG.macro_distribution_mode,
                carb_cycling: config.carb_cycling ?? DEFAULT_AUTO_CONFIG.carb_cycling,
              }
            : DEFAULT_AUTO_CONFIG,
        )
        setAdaptiveSettings(
          settings
            ? {
                goal_type: settings.goal_type ?? DEFAULT_ADAPTIVE_SETTINGS.goal_type,
                weekly_target_percent:
                  settings.weekly_target_percent ?? DEFAULT_ADAPTIVE_SETTINGS.weekly_target_percent,
                tolerance_percent:
                  settings.tolerance_percent ?? DEFAULT_ADAPTIVE_SETTINGS.tolerance_percent,
                min_calorie_adjustment:
                  settings.min_calorie_adjustment ??
                  DEFAULT_ADAPTIVE_SETTINGS.min_calorie_adjustment,
                max_calorie_adjustment:
                  settings.max_calorie_adjustment ??
                  DEFAULT_ADAPTIVE_SETTINGS.max_calorie_adjustment,
                protein_floor_per_kg:
                  settings.protein_floor_per_kg ?? DEFAULT_ADAPTIVE_SETTINGS.protein_floor_per_kg,
                adjust_frequency_days:
                  settings.adjust_frequency_days ?? DEFAULT_ADAPTIVE_SETTINGS.adjust_frequency_days,
              }
            : DEFAULT_ADAPTIVE_SETTINGS,
        )
        setAutoConfigLoaded(!!config)
        setAdaptiveLoaded(!!settings)
      } catch (e) {
        logger.error('Caricamento config versione', e)
        setError(e instanceof Error ? e.message : 'Errore')
      } finally {
        setVersionLoading(false)
      }
    },
    [supabase],
  )

  useEffect(() => {
    if (selectedVersionId) void loadConfigForVersion(selectedVersionId)
    else {
      setAutoConfig(DEFAULT_AUTO_CONFIG)
      setAdaptiveSettings(DEFAULT_ADAPTIVE_SETTINGS)
      setAutoConfigLoaded(false)
      setAdaptiveLoaded(false)
    }
  }, [selectedVersionId, loadConfigForVersion])

  const handleAthleteChange = (athleteId: string) => {
    setSelectedAthleteId(athleteId)
    setSelectedPlanId('')
    setSelectedVersionId('')
  }
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId)
    setSelectedVersionId('')
  }

  const handleSave = useCallback(async () => {
    if (!selectedVersionId || !profileId) return
    setSaving(true)
    setError(null)
    try {
      const [configErr, settingsErr] = await Promise.all([
        nutritionFrom(supabase, NUTRITION_TABLES.autoConfig)
          .upsert(
            {
              version_id: selectedVersionId,
              meals_per_day: autoConfig.meals_per_day,
              macro_distribution_mode: autoConfig.macro_distribution_mode,
              carb_cycling: autoConfig.carb_cycling,
            },
            { onConflict: 'version_id' },
          )
          .select()
          .single()
          .then((r) => r.error),
        nutritionFrom(supabase, NUTRITION_TABLES.adaptiveSettings)
          .upsert(
            {
              version_id: selectedVersionId,
              goal_type: adaptiveSettings.goal_type,
              weekly_target_percent: adaptiveSettings.weekly_target_percent,
              tolerance_percent: adaptiveSettings.tolerance_percent,
              min_calorie_adjustment: adaptiveSettings.min_calorie_adjustment,
              max_calorie_adjustment: adaptiveSettings.max_calorie_adjustment,
              protein_floor_per_kg: adaptiveSettings.protein_floor_per_kg,
              adjust_frequency_days: adaptiveSettings.adjust_frequency_days,
            },
            { onConflict: 'version_id' },
          )
          .select()
          .single()
          .then((r) => r.error),
      ])
      if (configErr) throw configErr
      if (settingsErr) throw settingsErr
      setAutoConfigLoaded(true)
      setAdaptiveLoaded(true)
      void loadConfigForVersion(selectedVersionId)
    } catch (e) {
      logger.error('Salvataggio impostazioni', e)
      setError(e instanceof Error ? e.message : 'Errore salvataggio')
    } finally {
      setSaving(false)
    }
  }, [selectedVersionId, profileId, autoConfig, adaptiveSettings, supabase, loadConfigForVersion])

  const handleResetDefaults = useCallback(() => {
    setAutoConfig(DEFAULT_AUTO_CONFIG)
    setAdaptiveSettings(DEFAULT_ADAPTIVE_SETTINGS)
  }, [])

  const _handleDuplicateFromPrevious = useCallback(() => {
    const prevVersion = versions.find((v) => v.id !== selectedVersionId)
    if (!prevVersion) return
    void loadConfigForVersion(prevVersion.id).then(() => setDuplicateModalOpen(false))
  }, [versions, selectedVersionId, loadConfigForVersion])

  const validationWarnings = useMemo(() => {
    const w: string[] = []
    if (adaptiveSettings.min_calorie_adjustment > adaptiveSettings.max_calorie_adjustment) {
      w.push('Min aggiustamento kcal non può essere maggiore del max.')
    }
    if (
      adaptiveSettings.tolerance_percent > adaptiveSettings.weekly_target_percent &&
      adaptiveSettings.weekly_target_percent > 0
    ) {
      w.push('Tolleranza superiore al target settimanale.')
    }
    if (adaptiveSettings.weekly_target_percent > 2) w.push('Target settimanale molto alto (>2%).')
    return w
  }, [adaptiveSettings])

  if (showLoader) {
    return (
      <div className={LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <StaffContentLayout
      title="Impostazioni"
      description="Configurazione versione piano: struttura pasti e regole adattive"
      icon={<Settings className="w-6 h-6" />}
      theme="teal"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={!selectedVersionId}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Ripristina default
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDuplicateModalOpen(true)}
            disabled={!selectedVersionId || versions.length < 2}
          >
            <Copy className="h-4 w-4 mr-1.5" />
            Duplica da versione
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedVersionId || saving}
            className="bg-teal-600 hover:bg-teal-500 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Salva
          </Button>
        </>
      }
    >
      {error && (
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="underline shrink-0 min-h-[44px] touch-manipulation flex items-center"
          >
            Chiudi
          </button>
        </div>
      )}

      <section className="rounded-xl border border-border p-3 sm:p-4 space-y-4">
        <h2 className="text-sm font-semibold text-text-secondary">
          Contesto (Atleta → Piano → Versione)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Atleta</Label>
            <select
              value={selectedAthleteId}
              onChange={(e) => handleAthleteChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm min-h-[44px]"
            >
              <option value="">— Seleziona atleta</option>
              {assignedAthletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.email ? `(${a.email})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Piano</Label>
            <select
              value={selectedPlanId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm min-h-[44px]"
              disabled={!selectedAthleteId}
            >
              <option value="">— Seleziona piano</option>
              {plansForAthlete.map((p) => (
                <option key={p.id} value={p.id}>
                  Piano {p.id.slice(0, 8)}{' '}
                  {p.created_at ? new Date(p.created_at).toLocaleDateString('it-IT') : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Versione</Label>
            <select
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm min-h-[44px]"
              disabled={!selectedPlanId}
            >
              <option value="">— Seleziona versione</option>
              {versions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version_number ?? '?'} · {v.status ?? '—'}{' '}
                  {v.created_at ? new Date(v.created_at).toLocaleDateString('it-IT') : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedAthleteId && plansForAthlete.length === 0 && !loading && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
            Nessun piano per questo atleta.{' '}
            <Link
              href={`/dashboard/nutrizionista/piani/nuovo?atleta=${selectedAthleteId}`}
              className="underline font-medium"
            >
              Crea nuovo piano
            </Link>
          </div>
        )}
      </section>

      {!selectedVersionId && selectedPlanId && versions.length === 0 && !loading && (
        <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-8 text-center text-text-secondary text-sm">
          Nessuna versione per questo piano. Crea una versione dalla scheda Piani dell&apos;atleta.
        </div>
      )}

      {selectedVersionId && (
        <>
          {versionLoading ? (
            <div className={LOADING_CLASS}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="flex gap-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('structure')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'structure' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-text-muted'}`}
                >
                  <UtensilsCrossed className="h-4 w-4 inline mr-1.5" />
                  Struttura & Automazioni
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('adaptive')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'adaptive' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-text-muted'}`}
                >
                  <Target className="h-4 w-4 inline mr-1.5" />
                  Regole adattive
                </button>
              </div>

              {activeTab === 'structure' && (
                <section className="rounded-xl border border-border p-6 space-y-4">
                  {!autoConfigLoaded && (
                    <p className="text-sm text-text-muted">
                      Nessuna configurazione salvata per questa versione. Compila e salva.
                    </p>
                  )}
                  <div className="grid gap-4 max-w-md">
                    <div>
                      <Label>Pasti al giorno (3–8)</Label>
                      <Input
                        type="number"
                        min={3}
                        max={8}
                        value={autoConfig.meals_per_day}
                        onChange={(e) =>
                          setAutoConfig((c) => ({
                            ...c,
                            meals_per_day: Math.min(8, Math.max(3, Number(e.target.value) || 3)),
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Modalità distribuzione macro</Label>
                      <select
                        value={autoConfig.macro_distribution_mode}
                        onChange={(e) =>
                          setAutoConfig((c) => ({ ...c, macro_distribution_mode: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
                      >
                        {MACRO_DISTRIBUTION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="carb_cycling"
                        checked={autoConfig.carb_cycling}
                        onChange={(e) =>
                          setAutoConfig((c) => ({ ...c, carb_cycling: e.target.checked }))
                        }
                        className="rounded border-border"
                      />
                      <Label htmlFor="carb_cycling">Carb cycling</Label>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'adaptive' && (
                <section className="rounded-xl border border-border p-6 space-y-4">
                  {!adaptiveLoaded && (
                    <p className="text-sm text-text-muted">
                      Nessuna regola adattiva salvata. Compila e salva.
                    </p>
                  )}
                  {validationWarnings.length > 0 && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <ul className="list-disc list-inside">
                        {validationWarnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid gap-4 max-w-md">
                    <div>
                      <Label>Goal type</Label>
                      <select
                        value={adaptiveSettings.goal_type}
                        onChange={(e) =>
                          setAdaptiveSettings((s) => ({ ...s, goal_type: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm"
                      >
                        {GOAL_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Target settimanale % (es. 0.5)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={adaptiveSettings.weekly_target_percent}
                        onChange={(e) =>
                          setAdaptiveSettings((s) => ({
                            ...s,
                            weekly_target_percent: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Tolleranza % (es. 0.2)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={adaptiveSettings.tolerance_percent}
                        onChange={(e) =>
                          setAdaptiveSettings((s) => ({
                            ...s,
                            tolerance_percent: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Min aggiustamento kcal</Label>
                      <Input
                        type="number"
                        value={adaptiveSettings.min_calorie_adjustment}
                        onChange={(e) =>
                          setAdaptiveSettings((s) => ({
                            ...s,
                            min_calorie_adjustment: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Max aggiustamento kcal</Label>
                      <Input
                        type="number"
                        value={adaptiveSettings.max_calorie_adjustment}
                        onChange={(e) =>
                          setAdaptiveSettings((s) => ({
                            ...s,
                            max_calorie_adjustment: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Proteine min per kg (es. 1.8)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={adaptiveSettings.protein_floor_per_kg}
                        onChange={(e) =>
                          setAdaptiveSettings((s) => ({
                            ...s,
                            protein_floor_per_kg: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Frequenza aggiustamenti (giorni)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={adaptiveSettings.adjust_frequency_days}
                        onChange={(e) =>
                          setAdaptiveSettings((s) => ({
                            ...s,
                            adjust_frequency_days: Math.max(1, Number(e.target.value) || 7),
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {!selectedAthleteId && !loading && (
        <div className="rounded-xl border border-border bg-background-secondary/50 px-4 py-8 text-center text-text-secondary text-sm">
          Seleziona atleta, piano e versione per configurare le impostazioni.
        </div>
      )}

      <Dialog open={duplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Duplica da versione precedente</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            Carica config e regole adattive da un&apos;altra versione di questo piano. Poi salva per
            applicarle alla versione corrente.
          </p>
          <div className="space-y-2">
            {versions
              .filter((v) => v.id !== selectedVersionId)
              .map((v) => (
                <Button
                  key={v.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    void loadConfigForVersion(v.id)
                    setDuplicateModalOpen(false)
                  }}
                >
                  v{v.version_number ?? '?'} · {v.status ?? '—'}
                </Button>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateModalOpen(false)}>
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffContentLayout>
  )
}
