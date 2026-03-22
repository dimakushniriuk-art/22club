#!/usr/bin/env node

/**
 * Script di verifica build Capacitor
 * Verifica che il build sia stato completato correttamente
 */

import fs from 'fs'
import path from 'path'

const checks = []
let hasErrors = false

console.log('🔍 Verifica build Capacitor...\n')

// 1. Verifica cartella out/
const outDir = path.join(process.cwd(), 'out')
if (fs.existsSync(outDir)) {
  const files = fs.readdirSync(outDir)
  if (files.length > 0) {
    checks.push({
      name: 'Cartella out/ creata',
      status: '✅',
      details: `${files.length} file/cartelle`,
    })
  } else {
    checks.push({ name: 'Cartella out/ creata', status: '⚠️', details: 'Cartella vuota' })
    hasErrors = true
  }
} else {
  checks.push({ name: 'Cartella out/ creata', status: '❌', details: 'Cartella non trovata' })
  hasErrors = true
}

// 2. Verifica index.html
const indexHtml = path.join(outDir, 'index.html')
if (fs.existsSync(indexHtml)) {
  const content = fs.readFileSync(indexHtml, 'utf-8')
  if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
    checks.push({ name: 'index.html presente', status: '✅', details: 'File HTML valido' })
  } else {
    checks.push({ name: 'index.html presente', status: '⚠️', details: 'File HTML non valido' })
    hasErrors = true
  }
} else {
  checks.push({ name: 'index.html presente', status: '❌', details: 'File non trovato' })
  hasErrors = true
}

// 3. Verifica cartelle statiche
const staticDirs = ['_next', 'dashboard', 'home', 'login']
staticDirs.forEach((dir) => {
  const dirPath = path.join(outDir, dir)
  if (fs.existsSync(dirPath)) {
    checks.push({ name: `Cartella ${dir}/ presente`, status: '✅', details: 'OK' })
  } else {
    checks.push({
      name: `Cartella ${dir}/ presente`,
      status: '⚠️',
      details: 'Non trovata (potrebbe essere normale)',
    })
  }
})

// 4. Verifica che le API routes siano state ripristinate
const apiDir = path.join(process.cwd(), 'src/app/api')
const apiBackupDir = path.join(process.cwd(), '.api-backup')
if (fs.existsSync(apiDir)) {
  checks.push({
    name: 'API routes ripristinate',
    status: '✅',
    details: 'Cartella src/app/api presente',
  })
} else if (fs.existsSync(apiBackupDir)) {
  checks.push({
    name: 'API routes ripristinate',
    status: '❌',
    details: 'API routes ancora in backup!',
  })
  hasErrors = true
} else {
  checks.push({
    name: 'API routes ripristinate',
    status: '⚠️',
    details: 'Nessuna API route trovata',
  })
}

// 5. Verifica capacitor.config.ts
const capacitorConfig = path.join(process.cwd(), 'capacitor.config.ts')
if (fs.existsSync(capacitorConfig)) {
  const content = fs.readFileSync(capacitorConfig, 'utf-8')
  if (content.includes('webDir') && content.includes('out')) {
    checks.push({ name: 'capacitor.config.ts configurato', status: '✅', details: 'webDir: out' })
  } else {
    checks.push({
      name: 'capacitor.config.ts configurato',
      status: '⚠️',
      details: 'webDir potrebbe non essere "out"',
    })
  }
} else {
  checks.push({
    name: 'capacitor.config.ts configurato',
    status: '❌',
    details: 'File non trovato',
  })
  hasErrors = true
}

// 6. Verifica piattaforme (opzionale)
const iosDir = path.join(process.cwd(), 'ios')
const androidDir = path.join(process.cwd(), 'android')
if (fs.existsSync(iosDir)) {
  checks.push({ name: 'Piattaforma iOS aggiunta', status: '✅', details: 'Cartella ios/ presente' })
} else {
  checks.push({
    name: 'Piattaforma iOS aggiunta',
    status: 'ℹ️',
    details: 'Non aggiunta (normale se non su macOS)',
  })
}

if (fs.existsSync(androidDir)) {
  checks.push({
    name: 'Piattaforma Android aggiunta',
    status: '✅',
    details: 'Cartella android/ presente',
  })
} else {
  checks.push({
    name: 'Piattaforma Android aggiunta',
    status: 'ℹ️',
    details: 'Non aggiunta (normale se non configurato)',
  })
}

// 7. Verifica dimensione bundle (se _next esiste)
const nextDir = path.join(outDir, '_next')
if (fs.existsSync(nextDir)) {
  const getDirSize = (dirPath) => {
    let totalSize = 0
    const files = fs.readdirSync(dirPath)
    files.forEach((file) => {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        totalSize += getDirSize(filePath)
      } else {
        totalSize += stats.size
      }
    })
    return totalSize
  }
  const size = getDirSize(nextDir)
  const sizeMB = (size / 1024 / 1024).toFixed(2)
  checks.push({ name: 'Dimensione bundle', status: '✅', details: `${sizeMB} MB` })
}

// Stampa risultati
console.log('Risultati verifica:\n')
checks.forEach((check) => {
  console.log(`${check.status} ${check.name}: ${check.details}`)
})

console.log('\n' + '='.repeat(50))

if (hasErrors) {
  console.log('\n❌ Verifica completata con errori!')
  console.log('Esegui: npm run build:capacitor')
  process.exit(1)
} else {
  console.log('\n✅ Verifica completata con successo!')
  console.log('\nProssimi passi:')
  console.log('1. Testa su simulatore/emulatore:')
  console.log('   - iOS: npm run capacitor:open:ios')
  console.log('   - Android: npm run capacitor:open:android')
  console.log('2. Verifica funzionalità core (login, navigazione, ecc.)')
  console.log('3. Testa su dispositivo reale se possibile')
  process.exit(0)
}
