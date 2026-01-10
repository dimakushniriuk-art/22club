// ============================================================
// FASE 7: Email Open Tracking (Pixel Tracking)
// ============================================================
// Endpoint per tracciare apertura email tramite pixel invisibile
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'
import { updateRecipientStatus, updateCommunicationStats } from '@/lib/communications/service'

const logger = createLogger('api:track:email-open')

function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  )
}

/**
 * GET /api/track/email-open/[id]
 *
 * Traccia l'apertura di un'email tramite pixel tracking.
 * Restituisce un'immagine 1x1 pixel trasparente.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let recipientId: string | null = null

  try {
    const { id } = await params
    recipientId = id

    if (!recipientId) {
      return new NextResponse(null, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Trova il recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('communication_recipients')
      .select('*, communications(id)')
      .eq('id', recipientId)
      .eq('recipient_type', 'email')
      .single()

    if (recipientError || !recipient) {
      // Anche se non trovato, restituisci pixel (per privacy)
      return getTransparentPixel()
    }

    type RecipientData = {
      id: string
      opened_at?: string | null
      communications?: { id: string } | null
      [key: string]: unknown
    }

    type CommunicationRef = {
      id: string
    }

    const recipientData = recipient as RecipientData

    // Se già aperto, non fare nulla (evita doppi tracking)
    if (recipientData.opened_at) {
      return getTransparentPixel()
    }

    // Aggiorna status a "opened"
    await updateRecipientStatus(recipientId, 'opened', {
      opened_at: new Date().toISOString(),
    })

    // Aggiorna statistiche comunicazione
    if (recipientData.communications && !Array.isArray(recipientData.communications)) {
      const commRef = recipientData.communications as CommunicationRef
      await updateCommunicationStats(commRef.id)
    }

    // Restituisci pixel trasparente 1x1
    return getTransparentPixel()
  } catch (error) {
    logger.error('Error tracking email open', error, { recipientId })
    // Anche in caso di errore, restituisci pixel (per non rompere l'email)
    return getTransparentPixel()
  }
}

/**
 * Restituisce un'immagine PNG trasparente 1x1 pixel
 */
function getTransparentPixel(): NextResponse {
  // PNG trasparente 1x1 pixel in base64
  const transparentPixel =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  return new NextResponse(Buffer.from(transparentPixel, 'base64'), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
