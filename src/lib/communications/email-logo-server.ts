// ============================================================
// Logo email: lettura da filesystem (solo server).
// Usato da email.ts per iniettare il logo nelle email.
// ============================================================

import 'server-only'
import path from 'path'
import fs from 'fs'

/** Restituisce il logo public/logo.png come data URI, o null se non disponibile. */
export function getEmbeddedLogoDataUri(): string | null {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    if (!fs.existsSync(logoPath)) return null
    const buf = fs.readFileSync(logoPath)
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}
