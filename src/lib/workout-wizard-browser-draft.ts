/**
 * Bozza wizard nel browser: sopravvive a refresh/chiusura tab accidentale e idle lungo
 * (il contenuto non dipende dalla sessione Supabase finché non si salva).
 */
import type { WorkoutWizardData, WorkoutDayExerciseData } from '@/types/workout'

export const WIZARD_BROWSER_DRAFT_PREFIX = '22club-workout-wizard-draft:v1:'

export interface WizardBrowserDraftPayload {
  v: 1
  wizardData: WorkoutWizardData
  circuitList: Array<{ id: string; params: WorkoutDayExerciseData[] }>
  currentStep: number
  savedAt: string
}

const MAX_DRAFT_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function wizardDraftStorageKey(scope: string): string {
  return `${WIZARD_BROWSER_DRAFT_PREFIX}${scope}`
}

export function hasMeaningfulWizardDraft(
  wizardData: WorkoutWizardData,
  circuitList: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
): boolean {
  if (circuitList.length > 0) return true
  if ((wizardData.days?.length ?? 0) > 0) return true
  if (wizardData.title?.trim()) return true
  if (wizardData.objective?.trim()) return true
  if (wizardData.notes?.trim()) return true
  return false
}

function parseDraft(raw: string | null): WizardBrowserDraftPayload | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as WizardBrowserDraftPayload
    if (parsed?.v !== 1 || !parsed.wizardData || !Array.isArray(parsed.circuitList)) return null
    if (typeof parsed.currentStep !== 'number' || typeof parsed.savedAt !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function loadWizardBrowserDraft(scope: string): WizardBrowserDraftPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed = parseDraft(localStorage.getItem(wizardDraftStorageKey(scope)))
    if (!parsed) return null
    const age = Date.now() - new Date(parsed.savedAt).getTime()
    if (!Number.isFinite(age) || age > MAX_DRAFT_AGE_MS) {
      clearWizardBrowserDraft(scope)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveWizardBrowserDraft(
  scope: string,
  payload: Omit<WizardBrowserDraftPayload, 'v'>,
): boolean {
  if (typeof window === 'undefined') return false
  if (!hasMeaningfulWizardDraft(payload.wizardData, payload.circuitList)) return false
  try {
    const full: WizardBrowserDraftPayload = { v: 1, ...payload }
    localStorage.setItem(wizardDraftStorageKey(scope), JSON.stringify(full))
    return true
  } catch {
    return false
  }
}

/** Salvataggio sincrono per `beforeunload` (nessun debounce). */
export function saveWizardBrowserDraftSync(
  scope: string,
  payload: Omit<WizardBrowserDraftPayload, 'v'>,
): void {
  if (typeof window === 'undefined') return
  if (!hasMeaningfulWizardDraft(payload.wizardData, payload.circuitList)) return
  try {
    const full: WizardBrowserDraftPayload = { v: 1, ...payload }
    localStorage.setItem(wizardDraftStorageKey(scope), JSON.stringify(full))
  } catch {
    /* quota / privato */
  }
}

export function clearWizardBrowserDraft(scope: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(wizardDraftStorageKey(scope))
  } catch {
    /* ignore */
  }
}

/** Nuova scheda: ripristina se esiste bozza non troppo vecchia. */
export function shouldRestoreWizardDraftNuova(draft: WizardBrowserDraftPayload): boolean {
  return hasMeaningfulWizardDraft(draft.wizardData, draft.circuitList)
}

/**
 * Modifica scheda: ripristina solo se la bozza locale è più recente dell’ultimo aggiornamento noto sul server.
 */
export function shouldRestoreWizardDraftEdit(
  draft: WizardBrowserDraftPayload,
  planServerUpdatedAtIso: string | null | undefined,
): boolean {
  if (!planServerUpdatedAtIso?.trim()) return false
  if (!shouldRestoreWizardDraftNuova(draft)) return false
  const serverMs = new Date(planServerUpdatedAtIso).getTime()
  const draftMs = new Date(draft.savedAt).getTime()
  if (!Number.isFinite(serverMs) || !Number.isFinite(draftMs)) return false
  return draftMs > serverMs
}
