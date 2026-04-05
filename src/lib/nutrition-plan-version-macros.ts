import type { Json } from '@/types/supabase'

/**
 * Su `nutrition_plan_versions` i target P/C/F sono spesso in `macros` (jsonb).
 * `nutrition_plan_versions_legacy` ha invece colonne dedicate.
 */
export function macroTargetsFromPlanMacros(macros: Json | null | undefined): {
  protein_target: number | null
  carb_target: number | null
  fat_target: number | null
} {
  const empty = { protein_target: null, carb_target: null, fat_target: null }
  if (macros == null || typeof macros !== 'object' || Array.isArray(macros)) return empty
  const o = macros as Record<string, unknown>
  const pickNum = (...keys: string[]): number | null => {
    for (const k of keys) {
      const v = o[k]
      if (typeof v === 'number' && Number.isFinite(v)) return v
      if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v)
        if (Number.isFinite(n)) return n
      }
    }
    return null
  }
  return {
    protein_target: pickNum('protein', 'protein_g', 'protein_target', 'p'),
    carb_target: pickNum('carbs', 'carbohydrates', 'carb', 'carb_g', 'carb_target', 'c'),
    fat_target: pickNum('fat', 'fats', 'fat_g', 'fat_target', 'f'),
  }
}

/** Valori da salvare in `nutrition_plan_versions.macros` al posto di colonne legacy. */
export function buildPlanVersionMacrosPayload(p: {
  protein: number
  carbs: number
  fat: number
}): Json {
  return { protein: p.protein, carbs: p.carbs, fat: p.fat }
}
