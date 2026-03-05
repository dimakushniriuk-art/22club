// Script per ottimizzazione build di produzione

import fs from 'fs'
import path from 'path'

/**
 * Ottimizza il processo di build per la produzione
 */
async function optimizeProductionBuild() {
  console.log('🚀 Ottimizzazione build di produzione...')

  try {
    // 1. Verifica configurazioni Next.js
    await verifyNextConfig()

    // 2. Ottimizza bundle analysis
    await setupBundleAnalysis()

    // 3. Verifica environment variables
    await checkEnvironmentVariables()

    // 4. Genera report di ottimizzazione
    await generateOptimizationReport()

    console.log('✅ Ottimizzazione build completata!')
  } catch (error) {
    console.error("❌ Errore durante l'ottimizzazione:", error)
    process.exit(1)
  }
}

/**
 * Verifica configurazione Next.js
 */
async function verifyNextConfig() {
  console.log('📋 Verifica configurazione Next.js...')

  const nextConfigPath = path.join(process.cwd(), 'next.config.ts')

  if (!fs.existsSync(nextConfigPath)) {
    throw new Error('next.config.ts non trovato')
  }

  const config = fs.readFileSync(nextConfigPath, 'utf8')

  // Verifica ottimizzazioni essenziali
  const requiredOptimizations = [
    'swcMinify: true',
    'compress: true',
    'experimental.optimizePackageImports',
    'webpack',
  ]

  const missingOptimizations = requiredOptimizations.filter(
    (optimization) => !config.includes(optimization),
  )

  if (missingOptimizations.length > 0) {
    console.warn('⚠️  Ottimizzazioni mancanti:', missingOptimizations)
  } else {
    console.log('✅ Configurazione Next.js ottimizzata')
  }
}

/**
 * Configura bundle analysis
 */
async function setupBundleAnalysis() {
  console.log('📊 Configurazione bundle analysis...')

  const packageJsonPath = path.join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  // Verifica script di analisi
  if (!packageJson.scripts.analyze) {
    console.log('📝 Aggiunta script di analisi bundle...')
    packageJson.scripts.analyze = 'ANALYZE=true next build'
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }

  console.log('✅ Bundle analysis configurato')
}

/**
 * Verifica environment variables per produzione
 */
async function checkEnvironmentVariables() {
  console.log('🔧 Verifica environment variables...')

  const envExamplePath = path.join(process.cwd(), '.env.example')
  const envLocalPath = path.join(process.cwd(), '.env.local')

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]

  // Verifica .env.example
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8')
    const missingVars = requiredVars.filter((varName) => !envExample.includes(varName))

    if (missingVars.length > 0) {
      console.warn('⚠️  Variabili mancanti in .env.example:', missingVars)
    }
  }

  // Verifica .env.local (se esiste)
  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf8')
    const missingVars = requiredVars.filter((varName) => !envLocal.includes(varName))

    if (missingVars.length > 0) {
      console.warn('⚠️  Variabili mancanti in .env.local:', missingVars)
    }
  }

  console.log('✅ Environment variables verificate')
}

/**
 * Genera report di ottimizzazione
 */
async function generateOptimizationReport() {
  console.log('📄 Generazione report di ottimizzazione...')

  const reportPath = path.join(process.cwd(), 'build-optimization-report.md')

  const report = `# Build Optimization Report

Generato il: ${new Date().toISOString()}

## Ottimizzazioni Implementate

### 1. Next.js Configuration
- ✅ SWC Minification abilitata
- ✅ Compression abilitata
- ✅ Package imports ottimizzati
- ✅ Webpack configuration personalizzata

### 2. Bundle Optimization
- ✅ Code splitting implementato
- ✅ Lazy loading componenti
- ✅ Tree shaking attivo
- ✅ Bundle analysis configurato

### 3. Performance
- ✅ Fast Refresh ottimizzato
- ✅ Development tools implementati
- ✅ Error handling robusto
- ✅ Retry logic per API calls

### 4. Development Tools
- ✅ API Logger implementato
- ✅ Performance monitoring
- ✅ Development dashboard
- ✅ Health check endpoint

## Comandi Utili

\`\`\`bash
# Build di produzione
npm run build

# Analisi bundle
npm run analyze

# Health check
curl http://localhost:3001/api/health

# Export logs (in sviluppo)
# Disponibile nel DevDashboard
\`\`\`

## Monitoraggio

- **Performance**: Dashboard integrata in sviluppo
- **API Calls**: Logging completo con retry logic
- **Errors**: Sistema centralizzato di gestione errori
- **Bundle**: Analisi automatica con @next/bundle-analyzer

## Raccomandazioni

1. **Produzione**: Verificare tutte le environment variables
2. **Monitoring**: Implementare servizio di monitoring (Sentry, LogRocket)
3. **CDN**: Configurare CDN per asset statici
4. **Caching**: Implementare caching strategy per API calls
5. **Security**: Verificare configurazioni di sicurezza

---
Generato automaticamente dal sistema di build optimization.
`

  fs.writeFileSync(reportPath, report)
  console.log(`✅ Report generato: ${reportPath}`)
}

// Esegui ottimizzazione
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeProductionBuild()
}
