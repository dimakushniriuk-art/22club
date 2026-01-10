import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { mkdirSync } from 'fs'

// Configurazione per gestire percorsi temporanei su Windows
// Usa una directory nel progetto invece della temp di sistema per evitare problemi con percorsi lunghi
const projectTempDir = path.resolve(process.cwd(), 'node_modules', '.vitest', 'tmp')

// Crea la directory se non esiste
try {
  mkdirSync(projectTempDir, { recursive: true })
} catch {
  // Ignora errori se la directory esiste già
}

// Imposta variabili d'ambiente per i file temporanei su Windows
if (process.platform === 'win32') {
  // Usa la directory del progetto per i file temporanei
  process.env.TMP = projectTempDir
  process.env.TEMP = projectTempDir
}

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup-tempdir.ts', './tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e/**'],
    // Configurazione per evitare problemi con path lunghi su Windows
    cache: {
      dir: './node_modules/.vitest',
    },
    // Configurazione pool per gestire meglio i file temporanei su Windows
    // Su Windows usa 'forks' invece di 'threads' per evitare problemi con percorsi temporanei
    pool: process.platform === 'win32' ? 'forks' : 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        // Riduce l'uso di file temporanei evitando atomics
        useAtomics: false,
      },
      forks: {
        // Su Windows, forks gestisce meglio i percorsi lunghi
        singleFork: false,
        // Disabilita isolate per ridurre uso file temporanei
        isolate: false,
      },
    },
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/__mocks__/**',
        '**/.next/**',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/playwright.config.*',
        '**/vitest.config.*',
      ],
      // Threshold per coverage (obiettivo >70%)
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
      // Report coverage anche se sotto threshold (non blocca build)
      reportOnFailure: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
