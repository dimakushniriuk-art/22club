/**
 * Setup file per intercettare os.tmpdir() su Windows
 * Deve essere importato PRIMA di qualsiasi altro modulo che usa os.tmpdir()
 */

import os from 'os'
import path from 'path'
import { mkdirSync } from 'fs'

if (process.platform === 'win32') {
  // Configura directory temporanea nel progetto
  const projectRoot = process.cwd()
  const projectTempDir = path.resolve(projectRoot, 'node_modules', '.vitest', 'tmp')

  // Crea directory se non esiste
  try {
    mkdirSync(projectTempDir, { recursive: true })
  } catch {
    // Ignora se esiste già
  }

  // Override os.tmpdir() per questa sessione
  const originalTmpdir = os.tmpdir.bind(os)
  os.tmpdir = () => {
    // Verifica che la directory esista ancora
    try {
      mkdirSync(projectTempDir, { recursive: true })
    } catch {
      // Se fallisce, usa la directory originale
      return originalTmpdir()
    }
    return projectTempDir
  }

  // Imposta anche le variabili d'ambiente
  process.env.TMP = projectTempDir
  process.env.TEMP = projectTempDir
  process.env.TMPDIR = projectTempDir
}
