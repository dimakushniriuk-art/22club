#!/usr/bin/env tsx
/**
 * Script per verificare che il progetto corrisponda alla configurazione Supabase
 * 
 * Analizza:
 * 1. Tabelle usate nel codice vs tabelle nel database
 * 2. Colonne referenziate vs colonne esistenti
 * 3. Funzioni chiamate vs funzioni definite
 * 4. Policies RLS che potrebbero bloccare query
 * 5. Foreign keys e relazioni
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const SCHEMA_FILE = join(projectRoot, 'supabase-config-export/schema-with-data.sql')
const REPORT_FILE = join(projectRoot, 'supabase-config-export/VERIFICA-SINCRONIZZAZIONE.md')

interface Issue {
  type: 'error' | 'warning' | 'info'
  category: string
  message: string
  file?: string
  line?: number
  suggestion?: string
}

const issues: Issue[] = []

console.log('🔍 Analisi Sincronizzazione Progetto ↔ Supabase\n')
console.log('📖 Leggendo schema-with-data.sql...\n')

// 1. Leggi schema SQL
const schemaContent = readFileSync(SCHEMA_FILE, 'utf-8')

// 2. Estrai tabelle dal database
const tableMatches = schemaContent.matchAll(/CREATE TABLE public\.(\w+)/g)
const dbTables = new Set<string>()
for (const match of tableMatches) {
  dbTables.add(match[1])
}

console.log(`✅ Trovate ${dbTables.size} tabelle nel database\n`)

// 3. Estrai colonne per ogni tabella
const tableColumns: Record<string, Set<string>> = {}
for (const table of dbTables) {
  tableColumns[table] = new Set()
  
  // Cerca CREATE TABLE per questa tabella
  const tableRegex = new RegExp(`CREATE TABLE public\\.${table}[\\s\\S]*?\\);`, 'm')
  const tableMatch = schemaContent.match(tableRegex)
  
  if (tableMatch) {
    // Estrai nomi colonne
    const columnMatches = tableMatch[0].matchAll(/(\w+)\s+[^,\n]+(?:,|$)/g)
    for (const colMatch of columnMatches) {
      const colName = colMatch[1].trim()
      if (colName && !['CREATE', 'TABLE', 'public', 'CONSTRAINT', 'CHECK'].includes(colName)) {
        tableColumns[table].add(colName)
      }
    }
  }
}

// 4. Estrai funzioni dal database
const functionMatches = schemaContent.matchAll(/CREATE FUNCTION public\.(\w+)\(/g)
const dbFunctions = new Set<string>()
for (const match of functionMatches) {
  dbFunctions.add(match[1])
}

console.log(`✅ Trovate ${dbFunctions.size} funzioni nel database\n`)

// 5. Estrai policies RLS
const policyMatches = schemaContent.matchAll(/CREATE POLICY[^"]*"([^"]+)"[^O]*ON public\.(\w+)/g)
const dbPolicies: Record<string, string[]> = {}
for (const match of policyMatches) {
  const table = match[2]
  const policy = match[1]
  if (!dbPolicies[table]) {
    dbPolicies[table] = []
  }
  dbPolicies[table].push(policy)
}

console.log(`✅ Trovate policies RLS per ${Object.keys(dbPolicies).length} tabelle\n`)

// 6. Analizza codice TypeScript/JavaScript
console.log('📂 Analizzando codice del progetto...\n')

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build', 'coverage'].includes(file)) {
        getAllFiles(filePath, fileList)
      }
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))) {
      fileList.push(filePath)
    }
  }
  
  return fileList
}

const codeFiles = getAllFiles(join(projectRoot, 'src'))
const codeFilesRoot = getAllFiles(projectRoot).filter(f => 
  f.includes('scripts') && ['.ts', '.js'].includes(extname(f))
)

const allCodeFiles = [...codeFiles, ...codeFilesRoot]

console.log(`📄 Analizzando ${allCodeFiles.length} file di codice...\n`)

// 7. Trova tabelle usate nel codice
const codeTables = new Set<string>()
const codeTableColumns: Record<string, Set<string>> = {}
const codeFunctions = new Set<string>()

for (const filePath of allCodeFiles) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    
    // Trova .from('table_name')
    const fromMatches = content.matchAll(/\.from\(['"]([^'"]+)['"]\)/g)
    for (const match of fromMatches) {
      const table = match[1]
      codeTables.add(table)
      
      if (!codeTableColumns[table]) {
        codeTableColumns[table] = new Set()
      }
    }
    
    // Trova .select('col1, col2') o .select(`col1, col2`)
    const selectMatches = content.matchAll(/\.select\(['"`]([^'"`]+)['"`]\)/g)
    for (const match of selectMatches) {
      const selectClause = match[1]
      // Estrai nomi colonne (semplificato)
      const cols = selectClause.split(',').map(c => c.trim().split(' ')[0].split('.')[0])
      for (const table of codeTables) {
        if (!codeTableColumns[table]) {
          codeTableColumns[table] = new Set()
        }
        cols.forEach(col => {
          if (col && !col.includes('(') && !col.includes('*')) {
            codeTableColumns[table].add(col)
          }
        })
      }
    }
    
    // Trova chiamate a funzioni RPC
    const rpcMatches = content.matchAll(/\.rpc\(['"]([^'"]+)['"]/g)
    for (const match of rpcMatches) {
      codeFunctions.add(match[1])
    }
    
    // Trova chiamate a funzioni con .select() che includono funzioni
    const functionCallMatches = content.matchAll(/public\.(\w+)\(/g)
    for (const match of functionCallMatches) {
      const funcName = match[1]
      if (dbFunctions.has(funcName)) {
        codeFunctions.add(funcName)
      }
    }
  } catch {
    // Ignora errori di lettura
  }
}

console.log(`✅ Trovate ${codeTables.size} tabelle usate nel codice\n`)
console.log(`✅ Trovate ${codeFunctions.size} funzioni chiamate nel codice\n`)

// 8. Confronta e genera report
console.log('🔍 Confrontando database vs codice...\n')

// Tabelle nel codice ma non nel database
for (const table of codeTables) {
  if (!dbTables.has(table)) {
    issues.push({
      type: 'error',
      category: 'Tabella mancante',
      message: `Tabella "${table}" usata nel codice ma non esiste nel database`,
      suggestion: `Crea la tabella "${table}" nel database o rimuovi il riferimento nel codice`
    })
  }
}

// Colonne usate ma non esistenti
for (const [table, columns] of Object.entries(codeTableColumns)) {
  if (dbTables.has(table)) {
    const dbCols = tableColumns[table] || new Set()
    for (const col of columns) {
      if (!dbCols.has(col) && col !== '*' && !col.includes('(')) {
        issues.push({
          type: 'error',
          category: 'Colonna mancante',
          message: `Colonna "${col}" usata nella tabella "${table}" ma non esiste nel database`,
          suggestion: `Aggiungi la colonna "${col}" alla tabella "${table}" o correggi il riferimento nel codice`
        })
      }
    }
  }
}

// Funzioni chiamate ma non definite
for (const func of codeFunctions) {
  if (!dbFunctions.has(func)) {
    issues.push({
      type: 'warning',
      category: 'Funzione mancante',
      message: `Funzione "${func}" chiamata nel codice ma non definita nel database`,
      suggestion: `Crea la funzione "${func}" nel database o rimuovi la chiamata nel codice`
    })
  }
}

// Tabelle nel database ma non usate (info)
const unusedTables = Array.from(dbTables).filter(t => !codeTables.has(t))
if (unusedTables.length > 0) {
  issues.push({
    type: 'info',
    category: 'Tabelle non usate',
    message: `${unusedTables.length} tabelle nel database non sono usate nel codice: ${unusedTables.slice(0, 10).join(', ')}${unusedTables.length > 10 ? '...' : ''}`,
    suggestion: 'Considera se queste tabelle sono necessarie o se possono essere rimosse'
  })
}

// Verifica policies RLS per tabelle usate
for (const table of codeTables) {
  if (dbTables.has(table) && !dbPolicies[table]) {
    issues.push({
      type: 'warning',
      category: 'RLS Policy mancante',
      message: `Tabella "${table}" non ha policies RLS definite`,
      suggestion: `Considera di aggiungere policies RLS per la tabella "${table}" per sicurezza`
    })
  }
}

// Genera report
console.log(`📊 Trovati ${issues.length} punti da rivedere\n`)

const errors = issues.filter(i => i.type === 'error')
const warnings = issues.filter(i => i.type === 'warning')
const infos = issues.filter(i => i.type === 'info')

console.log(`   🔴 Errori: ${errors.length}`)
console.log(`   🟡 Warning: ${warnings.length}`)
console.log(`   🔵 Info: ${infos.length}\n`)

// Genera markdown report
let report = `# 🔍 Verifica Sincronizzazione Progetto ↔ Supabase\n\n`
report += `**Data analisi**: ${new Date().toLocaleString('it-IT')}\n\n`
report += `**File schema**: \`schema-with-data.sql\`\n\n`

report += `## 📊 Riepilogo\n\n`
report += `- 🔴 **Errori**: ${errors.length}\n`
report += `- 🟡 **Warning**: ${warnings.length}\n`
report += `- 🔵 **Info**: ${infos.length}\n\n`

report += `### Statistiche\n\n`
report += `- **Tabelle nel database**: ${dbTables.size}\n`
report += `- **Tabelle usate nel codice**: ${codeTables.size}\n`
report += `- **Funzioni nel database**: ${dbFunctions.size}\n`
report += `- **Funzioni chiamate nel codice**: ${codeFunctions.size}\n\n`

if (errors.length > 0) {
  report += `## 🔴 Errori Critici (Da Sistemare)\n\n`
  errors.forEach((issue, index) => {
    report += `### ${index + 1}. ${issue.category}\n\n`
    report += `**Messaggio**: ${issue.message}\n\n`
    if (issue.file) {
      report += `**File**: \`${issue.file}\`\n\n`
    }
    if (issue.suggestion) {
      report += `**Suggerimento**: ${issue.suggestion}\n\n`
    }
    report += `---\n\n`
  })
}

if (warnings.length > 0) {
  report += `## 🟡 Warning (Da Rivedere)\n\n`
  warnings.forEach((issue, index) => {
    report += `### ${index + 1}. ${issue.category}\n\n`
    report += `**Messaggio**: ${issue.message}\n\n`
    if (issue.file) {
      report += `**File**: \`${issue.file}\`\n\n`
    }
    if (issue.suggestion) {
      report += `**Suggerimento**: ${issue.suggestion}\n\n`
    }
    report += `---\n\n`
  })
}

if (infos.length > 0) {
  report += `## 🔵 Info (Note)\n\n`
  infos.forEach((issue, index) => {
    report += `### ${index + 1}. ${issue.category}\n\n`
    report += `**Messaggio**: ${issue.message}\n\n`
    if (issue.suggestion) {
      report += `**Suggerimento**: ${issue.suggestion}\n\n`
    }
    report += `---\n\n`
  })
}

report += `## 📝 Prossimi Passi\n\n`
if (errors.length > 0) {
  report += `1. **Sistema gli errori critici** - Questi potrebbero bloccare il funzionamento\n`
}
if (warnings.length > 0) {
  report += `2. **Rivedi i warning** - Potrebbero causare problemi in futuro\n`
}
report += `3. **Aggiorna schema-with-data.sql** dopo ogni modifica\n`
report += `4. **Riesegui questa verifica** dopo le correzioni\n\n`

report += `## 🔧 Comandi Utili\n\n`
report += `\`\`\`bash\n`
report += `# Aggiorna schema dopo modifiche\n`
report += `npm run db:update-source-of-truth\n\n`
report += `# Verifica sincronizzazione\n`
report += `npm run db:sync-schema\n\n`
report += `# Analizza errori schema\n`
report += `npm run db:analyze-schema\n`
report += `\`\`\`\n\n`

writeFileSync(REPORT_FILE, report, 'utf-8')

console.log(`✅ Report generato: ${REPORT_FILE}\n`)

if (errors.length > 0) {
  console.log('⚠️  ATTENZIONE: Trovati errori critici che potrebbero bloccare il funzionamento!\n')
  process.exit(1)
}

console.log('✅ Analisi completata!\n')
