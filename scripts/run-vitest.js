#!/usr/bin/env node

/**
 * Script helper per eseguire Vitest con configurazione corretta per Windows
 * Risolve problemi con percorsi temporanei e caratteri speciali
 */

import { spawn } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')

// Configura directory temporanea nel progetto per evitare problemi Windows
const projectTempDir = resolve(projectRoot, 'node_modules', '.vitest', 'tmp')

// Crea directory se non esiste
try {
  mkdirSync(projectTempDir, { recursive: true })
} catch {
  // Ignora se esiste già
}

// Su Windows, imposta TMP e TEMP alla directory del progetto
// Questo deve essere fatto PRIMA che qualsiasi modulo usi os.tmpdir()
if (process.platform === 'win32') {
  // Imposta tutte le variabili d'ambiente possibili
  process.env.TMP = projectTempDir
  process.env.TEMP = projectTempDir
  process.env.TMPDIR = projectTempDir

  // Override os.tmpdir() per questa sessione
  // Nota: questo funziona solo se fatto prima che altri moduli importino os
  os.tmpdir = () => projectTempDir

  console.log(`[Vitest] Directory temporanea configurata: ${projectTempDir}`)
}

// Esegui Vitest via `node …/vitest.mjs` (niente shell: evita DEP0190 e PATH fragile su Windows)
const vitestArgs = process.argv.slice(2)
const vitestMain = join(projectRoot, 'node_modules', 'vitest', 'vitest.mjs')
if (!existsSync(vitestMain)) {
  console.error(
    `[Vitest] File non trovato: ${vitestMain}\nEsegui npm install dalla root del progetto.`,
  )
  process.exit(1)
}
const vitestProcess = spawn(process.execPath, [vitestMain, ...vitestArgs], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
  shell: false,
})

vitestProcess.on('exit', (code) => {
  process.exit(code || 0)
})

vitestProcess.on('error', (error) => {
  console.error("Errore nell'esecuzione di Vitest:", error)
  process.exit(1)
})
