/**
 * Barrel export per retrocompatibilità
 * I nuovi file dovrebbero importare direttamente da '@/lib/supabase/client' o '@/lib/supabase/server'
 * @deprecated Usa '@/lib/supabase/client' per client-side e '@/lib/supabase/server' per server-side
 */
'use client'
export {
  createClient,
  supabase,
  setSupabaseContext,
  getSupabaseContext,
  checkResourceAccess,
} from './supabase/client'
