import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { globSync } from 'glob'
import { join } from 'path'

/**
 * Test che verifica che gli hook client-side non usino fetchWithCache
 * (fetchWithCache è inteso solo per uso server-side)
 *
 * Gli hook client-side dovrebbero usare React Query come single source of truth
 * per la gestione della cache dei dati.
 */
describe('Cache Strategy Coerenza', () => {
  const hooksDir = join(process.cwd(), 'src/hooks')
  const files = globSync('**/*.{ts,tsx}', { cwd: hooksDir })

  it('should not use fetchWithCache in client-side hooks', () => {
    const violations: string[] = []

    files.forEach((file) => {
      const fullPath = join(hooksDir, file)
      const content = readFileSync(fullPath, 'utf-8')

      // Verifica se il file usa fetchWithCache o le funzioni wrapper
      const usesFetchWithCache =
        content.includes('fetchWithCache') ||
        content.includes('getAppointmentsCached') ||
        content.includes('getClientiStatsCached') ||
        content.includes('getDocumentsCached')

      // Escludi se:
      // 1. È un commento che spiega che fetchWithCache è deprecato
      // 2. È un import che viene usato solo per documentazione
      // 3. Il file contiene "// Server-side only" o "@deprecated"
      const isAllowed =
        content.includes('// Server-side only') ||
        content.includes('@deprecated') ||
        content.includes('// Deprecated') ||
        (content.includes('fetchWithCache') &&
          content.includes('// NOT USED') &&
          content.includes('// DEPRECATED'))

      if (usesFetchWithCache && !isAllowed) {
        violations.push(file)
      }
    })

    expect(violations).toEqual([])
  })

  it('should not import fetchWithCache module in client-side hooks', () => {
    const violations: string[] = []

    files.forEach((file) => {
      const fullPath = join(hooksDir, file)
      const content = readFileSync(fullPath, 'utf-8')

      // Verifica se il file importa fetchWithCache
      const importsFetchWithCache =
        content.match(/import.*from.*['"]@\/lib\/fetchWithCache['"]/) ||
        content.match(/import.*from.*['"]\.\.\/lib\/fetchWithCache['"]/) ||
        content.match(/import.*from.*['"]\.\.\/\.\.\/lib\/fetchWithCache['"]/)

      // Escludi se è un commento o documentazione
      const isAllowed =
        content.includes('// Server-side only') ||
        content.includes('@deprecated') ||
        content.includes('// Deprecated') ||
        content.includes('// NOT USED')

      if (importsFetchWithCache && !isAllowed) {
        violations.push(file)
      }
    })

    expect(violations).toEqual([])
  })

  it('should use React Query (useQuery/useMutation) in client-side hooks for data fetching', () => {
    // Verifica che gli hook principali usino React Query
    const mainHooks = [
      'use-appointments.ts',
      'use-documents.ts',
      'use-allenamenti.ts',
      'use-clienti.ts',
    ]

    const violations: string[] = []

    mainHooks.forEach((hookFile) => {
      const fullPath = join(hooksDir, hookFile)

      // Se il file esiste, verifica che usi React Query
      if (globSync(`**/${hookFile}`, { cwd: hooksDir }).length > 0) {
        const content = readFileSync(fullPath, 'utf-8')

        // Verifica che usi useQuery o useMutation (React Query)
        // Escludi hook che sono in fase di migrazione (hanno commento TODO con React Query)
        const isMigrating = content.includes('TODO') && content.includes('React Query')

        const usesReactQuery =
          content.includes('useQuery') ||
          content.includes('useMutation') ||
          content.includes('@tanstack/react-query')

        if (!usesReactQuery && !isMigrating) {
          violations.push(hookFile)
        }
      }
    })

    // Non è un errore se alcuni hook non esistono ancora
    // Questo test verifica solo che gli hook esistenti usino React Query
    expect(violations.length).toBeLessThanOrEqual(0)
  })
})
