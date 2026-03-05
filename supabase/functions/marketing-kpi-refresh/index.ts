// ============================================================================
// SUPABASE EDGE FUNCTION: MARKETING KPI REFRESH
// ============================================================================
// Chiamata periodica (es. ogni 2 ore) per aggiornare i KPI marketing.
// Usa service role per bypassare RLS su athlete_marketing_kpis.
// Non esporre questa function al client: solo scheduler o chiamate server-side.

// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @deno-types="https://esm.sh/@supabase/supabase-js@2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ ok: false, error: 'unauthorized' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    },
  )
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startedAt = Date.now()
  console.log('[marketing-kpi-refresh] Starting job at', new Date().toISOString())

  const secret = Deno.env.get('MARKETING_KPI_REFRESH_SECRET')
  const headerSecret = req.headers.get('x-cron-secret')
  if (!secret || headerSecret !== secret) {
    console.warn('[marketing-kpi-refresh] Unauthorized: missing or invalid x-cron-secret')
    return unauthorizedResponse()
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[marketing-kpi-refresh] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    const body = {
      ok: false,
      error: 'Missing environment: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      duration_ms: Date.now() - startedAt,
    }
    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.rpc('run_marketing_kpi_refresh')

    const durationMs = Date.now() - startedAt
    console.log('[marketing-kpi-refresh] RPC finished in', durationMs, 'ms', error ? `error: ${error.message}` : 'ok')

    if (error) {
      console.error('[marketing-kpi-refresh] RPC error:', error)
      return new Response(
        JSON.stringify({
          ok: false,
          error: error.message,
          code: error.code,
          details: error.details,
          duration_ms: durationMs,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    console.log('[marketing-kpi-refresh] Job completed successfully at', new Date().toISOString())
    return new Response(
      JSON.stringify({
        ok: true,
        data: data ?? null,
        duration_ms: durationMs,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (err) {
    const durationMs = Date.now() - startedAt
    console.error('[marketing-kpi-refresh] Unexpected error:', err)
    return new Response(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        duration_ms: durationMs,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
