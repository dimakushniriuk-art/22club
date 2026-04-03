/**
 * Genera icone PWA / shortcut / badge da public/logo-classic-b.png.
 * Se il file manca, scarica da PWA_LOGO_URL o dall'URL pubblico Supabase di default.
 *
 * Uso: npm run pwa:assets
 */
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pub = join(root, 'public')
const logoPath = join(pub, 'logo-classic-b.png')

const DEFAULT_LOGO_URL =
  'https://icibqnmtacibgnhaidlz.supabase.co/storage/v1/object/public/logo/logo-classic-b.png'

/** Sfondo maskable allineato a manifest background_color #0A0F12 */
const BG = { r: 10, g: 15, b: 18, alpha: 1 }

async function ensureSourceLogo() {
  if (existsSync(logoPath)) return
  await mkdir(pub, { recursive: true })
  const url = process.env.PWA_LOGO_URL || DEFAULT_LOGO_URL
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Impossibile scaricare logo (${res.status}): ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(logoPath, buf)
  console.log('Scaricato logo in public/logo-classic-b.png')
}

async function main() {
  await ensureSourceLogo()

  const sizes = [
    ['icon-144x144.png', 144],
    ['icon-152x152.png', 152],
    ['icon-180x180.png', 180],
    ['icon-192x192.png', 192],
    ['icon-512x512.png', 512],
  ]

  for (const [name, s] of sizes) {
    await sharp(logoPath).resize(s, s, { fit: 'cover' }).png().toFile(join(pub, name))
    console.log('OK', name)
  }

  const inner = Math.round(512 * 0.8)
  const pad = Math.round((512 - inner) / 2)
  await sharp(logoPath)
    .resize(inner, inner, { fit: 'cover' })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: BG })
    .png()
    .toFile(join(pub, 'icon-maskable-512x512.png'))
  console.log('OK icon-maskable-512x512.png')

  await sharp(logoPath).resize(72, 72, { fit: 'cover' }).png().toFile(join(pub, 'badge-72x72.png'))
  console.log('OK badge-72x72.png')

  const shortcuts = [
    'shortcut-workouts.png',
    'shortcut-progress.png',
    'shortcut-documents.png',
    'shortcut-chat.png',
  ]
  for (const name of shortcuts) {
    await sharp(logoPath).resize(96, 96, { fit: 'cover' }).png().toFile(join(pub, name))
    console.log('OK', name)
  }

  console.log('PWA assets completati.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
