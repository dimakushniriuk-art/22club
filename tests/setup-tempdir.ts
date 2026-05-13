/**
 * Setup file per intercettare os.tmpdir() su Windows
 * Deve essere importato PRIMA di qualsiasi altro modulo che usa os.tmpdir()
 */

import { mkdirSync } from 'fs'
import { JSDOM } from 'jsdom'
import os from 'os'
import path from 'path'

/**
 * Con `pool: 'forks'` su Windows, Node può esporre un `localStorage` globale non funzionante
 * (warning: `--localstorage-file` was provided without a valid path) → `getItem`/`clear` assenti.
 * Sostituiamo con uno Storage reale da jsdom così i test che usano localStorage restano stabili.
 */
;(function ensureWorkingLocalStorage() {
  try {
    const ls = globalThis.localStorage as Storage | null | undefined
    if (
      ls &&
      typeof ls.getItem === 'function' &&
      typeof ls.setItem === 'function' &&
      typeof ls.removeItem === 'function' &&
      typeof ls.clear === 'function'
    ) {
      return
    }
  } catch {
    /* ignore */
  }
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost/' })
  const { localStorage } = dom.window
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorage,
    configurable: true,
    writable: true,
  })
  if (typeof globalThis.window !== 'undefined') {
    try {
      Object.defineProperty(globalThis.window, 'localStorage', {
        value: localStorage,
        configurable: true,
        writable: true,
      })
    } catch {
      /* descriptor non sovrascrivibile */
    }
  }
})()

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
