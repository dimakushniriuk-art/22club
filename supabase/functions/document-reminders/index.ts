// =====================================================
// SUPABASE EDGE FUNCTION: DOCUMENT REMINDERS
// =====================================================
// Questa funzione viene chiamata ogni notte per creare
// reminder automatici per documenti in scadenza

// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @deno-types="https://esm.sh/@supabase/supabase-js@2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inizializza Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting document reminders job...')

    // 1. Aggiorna stati documenti
    console.log('Updating document statuses...')
    const { error: updateError } = await supabase.rpc('update_document_statuses')

    if (updateError) {
      console.error('Error updating document statuses:', updateError)
      throw updateError
    }

    // 2. Crea reminder per documenti in scadenza
    console.log('Creating document reminders...')
    const { error: reminderError } = await supabase.rpc('create_document_reminders')

    if (reminderError) {
      console.error('Error creating document reminders:', reminderError)
      throw reminderError
    }

    // 3. Verifica documenti scaduti da più di 30 giorni
    console.log('Checking for expired documents...')
    const { data: expiredDocs, error: expiredError } = await supabase
      .from('documents')
      .select('id, athlete_id, category, file_name, expires_at')
      .eq('status', 'scaduto')
      .lt('expires_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (expiredError) {
      console.error('Error fetching expired documents:', expiredError)
    } else if (expiredDocs && expiredDocs.length > 0) {
      console.log(`Found ${expiredDocs.length} documents expired for more than 30 days`)

      // Crea notifica per documenti scaduti da molto tempo
      for (const doc of expiredDocs) {
        const { error: notificationError } = await supabase.from('notifications').insert({
          user_id: doc.athlete_id,
          type: 'documento',
          title: 'Documento scaduto da tempo ⏰',
          body: `Il tuo ${doc.category} è scaduto da più di 30 giorni • Carica un nuovo file`,
          link: '/documenti',
          scheduled_for: new Date().toISOString(),
        })

        if (notificationError) {
          console.error('Error creating expired document notification:', notificationError)
        }
      }
    }

    // 4. Statistiche
    const { data: stats, error: statsError } = await supabase
      .from('documents')
      .select('status')
      .not('status', 'is', null)

    if (!statsError && stats) {
      type DocumentStatusRow = { status: string | null }
      const typedStats = stats as DocumentStatusRow[]
      const statusCounts = typedStats.reduce<Record<string, number>>((acc, doc) => {
        const key = doc.status ?? 'unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

      console.log('Document status counts:', statusCounts)
    }

    console.log('Document reminders job completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document reminders job completed successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in document reminders job:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// =====================================================
// CONFIGURAZIONE CRON JOB
// =====================================================
// Per configurare questo job come cron job in Supabase:
//
// 1. Vai su Supabase Dashboard > Database > Functions
// 2. Crea una nuova Edge Function chiamata "document-reminders"
// 3. Copia questo codice nella function
// 4. Vai su Database > Cron Jobs
// 5. Crea un nuovo cron job:
//    - Name: "document-reminders-daily"
//    - Schedule: "0 2 * * *" (ogni giorno alle 2:00)
//    - Function: "document-reminders"
//    - Method: POST
//
// Oppure usa il comando SQL:
// SELECT cron.schedule('document-reminders-daily', '0 2 * * *', 'SELECT net.http_post(url:=''https://your-project.supabase.co/functions/v1/document-reminders'', headers:=''{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'');');
